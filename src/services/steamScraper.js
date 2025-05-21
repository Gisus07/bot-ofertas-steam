// src/services/steamScraper.js

import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import {
  convertirTiempoRestanteATimestamp,
  convertirFechaLiteralATimestamp,
} from "../utils/fechaHelper.js";

const URL =
  "https://store.steampowered.com/search/?supportedlang=spanish&category1=998&specials=1&ndl=1";

export async function obtenerFechaConFallback(url) {
  const fechaAxios = await obtenerFechaFinOferta(url);
  if (fechaAxios) return fechaAxios;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 Chrome/122.0.0.0");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    const ageCheck = await page.$("#ageYear");
    if (ageCheck) {
      await page.select("#ageDay", "1");
      await page.select("#ageMonth", "January");
      await page.select("#ageYear", "1995");
      await Promise.all([
        page.click(".btnv6_blue_hoverfade"),
        page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      ]);
    }

    const countdownElement = await page.$(".game_purchase_discount_countdown");

    if (countdownElement) {
      const texto = await page.evaluate(
        (el) => el.textContent.trim(),
        countdownElement
      );

      let fechaRelativa = convertirTiempoRestanteATimestamp(texto);
      if (!fechaRelativa && /\d{1,2}:\d{2}:\d{2}/.test(texto)) {
        const nuevoTexto = texto
          .replace(/.*?(dentro de|in|finaliza en|termina en)/i, "in")
          .trim();
        fechaRelativa = convertirTiempoRestanteATimestamp(nuevoTexto);
      }

      if (fechaRelativa) {
        await browser.close();
        return fechaRelativa;
      }

      const fechaLiteral = convertirFechaLiteralATimestamp(texto);
      if (fechaLiteral) {
        await browser.close();
        return fechaLiteral;
      }

      const match =
        texto.match(/Offer ends\s+(\d{1,2})\s+(\w+)/i) ||
        texto.match(/finaliza el\s+(\d{1,2})\s+de\s+(\w+)/i);

      if (match) {
        const textoCompuesto = `${match[1]} ${match[2]}`;
        const fechaFallback = convertirFechaLiteralATimestamp(textoCompuesto);
        await browser.close();
        return fechaFallback || null;
      }

      await browser.close();
      return null;
    } else {
      await browser.close();
      return null;
    }
  } catch (error) {
    console.error("❌ Error con Puppeteer:", error.message);
    return null;
  }
}

export async function obtenerFechaFinOferta(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 Chrome/122.0.0.0" },
    });

    const $ = cheerio.load(data);
    const contenedor = $(".game_purchase_discount_countdown");
    if (contenedor.length === 0) {
      console.log(`⚠️ No se encontró el contenedor de fecha en: ${url}`);
      return null;
    }

    const textoPlano = contenedor.text().trim();

    // 1. Intentamos con reloj regresivo (ej. "Finaliza en 05:48:12")
    let fechaRelativa = convertirTiempoRestanteATimestamp(textoPlano);
    if (fechaRelativa) return fechaRelativa;

    // 2. Intentamos con fecha literal (ej. "25 mayo" o "25 de mayo")
    const match = textoPlano.match(/(\d{1,2})\s*(?:de\s*)?(\w+)/i);
    if (match) {
      const fechaIso = convertirFechaLiteralATimestamp(
        `${match[1]} ${match[2]}`
      );
      if (fechaIso) return fechaIso;
    }

    console.log(`⚠️ No se encontró fecha con ningún patrón en: ${url}`);
    return null;
  } catch (err) {
    console.warn(`⚠️ Error al obtener la fecha de: ${url}`, err.message);
    return null;
  }
}

export async function obtenerOfertasSteam(descuentoMinimo = 10) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 Chrome/122.0.0.0");

  console.log("🎯 Aplicando filtro: solo juegos (category1=998)");
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  let scrollAttempts = 0;
  let maxScrolls = 40;

  while (scrollAttempts < maxScrolls) {
    const juegosAntes = await page.$$eval(".search_result_row", (rows) => rows.length);
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(resolve => setTimeout(resolve, 500));
    const juegosDespues = await page.$$eval(".search_result_row", (rows) => rows.length);

    if (juegosDespues === juegosAntes) {
      scrollAttempts++;
    } else {
      scrollAttempts = 0;
    }

    if (juegosDespues > 1500) break;
  }

  const content = await page.content();
  const $ = cheerio.load(content);
  const juegos = $(".search_result_row");

  const appidsProcesados = new Set();
  const ofertas = [];

  juegos.each((_, el) => {
    const urlJuego = $(el).attr("href");
    const appid = urlJuego.match(/app\/(\d+)/)?.[1];
    if (!appid || appidsProcesados.has(appid)) return;
    appidsProcesados.add(appid);

    const nombre = $(el).find(".title").text().trim();
    const descuentoTexto = $(el).find(".discount_pct").text().trim();
    const descuentoNumero = parseInt(
      descuentoTexto.replace("-", "").replace("%", "")
    );
    if (isNaN(descuentoNumero) || descuentoNumero < descuentoMinimo) return;

    const precioViejo = $(el).find(".discount_original_price").text().trim();
    const precioNuevo = $(el).find(".discount_final_price").text().trim();
    if (!precioNuevo) return;

    ofertas.push({
      appid,
      nombre,
      url: urlJuego,
      descuento: `-${descuentoNumero}%`,
      precioViejo: precioViejo ? `~${precioViejo}~` : "N/A",
      precioNuevo,
    });
  });

  await browser.close();

  console.log(`🏆 Total de juegos únicos detectados: ${ofertas.length}`);
  return ofertas;
}
