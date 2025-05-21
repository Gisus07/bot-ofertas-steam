// src/services/steamScraper.js

import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import {
  convertirTiempoRestanteATimestamp,
  convertirFechaLiteralATimestamp,
} from "../utils/fechaHelper.js";

const URL = "https://store.steampowered.com/search/?specials=1&category1=998";

/**
 * Intenta extraer la fecha con Puppeteer si Axios no lo logra
 */
export async function obtenerFechaConFallback(url) {
  const fechaAxios = await obtenerFechaFinOferta(url);
  if (fechaAxios) return fechaAxios;

  console.log("⚙️ Usando Puppeteer como fallback para:", url);
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 Chrome/122.0.0.0");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Si hay verificación de edad, completarla
    const ageCheck = await page.$("#ageYear");
    if (ageCheck) {
      console.log("🔞 Completando formulario de verificación de edad...");
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

      console.log("📄 Texto obtenido con Puppeteer:", texto);

      let fechaRelativa = convertirTiempoRestanteATimestamp(texto);

      // Compatibilidad adicional: si dice "finaliza en HH:MM:SS", lo reformatea
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

      // Fallback manual si el texto no encajó pero sí hay día y mes
      const match =
        texto.match(/Offer ends\s+(\d{1,2})\s+(\w+)/i) ||
        texto.match(/finaliza el\s+(\d{1,2})\s+de\s+(\w+)/i);

      if (match) {
        const textoCompuesto = `${match[1]} ${match[2]}`;
        const fechaFallback = convertirFechaLiteralATTimestamp(textoCompuesto);
        await browser.close();
        return fechaFallback || null;
      }

      await browser.close();
      console.log("⚠️ Puppeteer no encontró fecha.");
      return null;

      console.log("⚠️ Puppeteer no encontró fecha.");
      return null;
    } else {
      console.log(
        "⚠️ El elemento .game_purchase_discount_countdown no está presente en el DOM."
      );
      await browser.close();
      return null;
    }
  } catch (error) {
    console.error("❌ Error con Puppeteer:", error.message);
    return null;
  }
}

/**
 * Extrae la fecha de finalización desde HTML con Axios + Cheerio
 */
export async function obtenerFechaFinOferta(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 Chrome/122.0.0.0" },
    });

    const $ = cheerio.load(data);
    console.log(`📄 Verificando fecha en: ${url}`);

    const contenedor = $(".game_purchase_discount_countdown");
    if (contenedor.length === 0) {
      console.log(
        "❌ No se encontró el elemento .game_purchase_discount_countdown"
      );
      return null;
    }

    const html = contenedor.html()?.trim() || "";
    const textoPlano = contenedor.text().trim();

    console.log("📦 HTML bruto:", html);
    console.log("📦 Texto plano:", textoPlano);

    // Convertimos cualquier coincidencia de fecha literal a formato ISO
    const match = textoPlano.match(/(\d{1,2})\s*(?:de\s*)?(\w+)/i);
    if (match) {
      const fechaIso = convertirFechaLiteralATimestamp(
        `${match[1]} ${match[2]}`
      );
      if (fechaIso) return fechaIso;
    }

    console.log("⚠️ No se encontró fecha con ningún patrón.");
    return null;
  } catch (err) {
    console.warn("⚠️ Error al obtener la fecha:", url, err.message);
    return null;
  }
}

/**
 * Scrapea ofertas de Steam usando scroll infinito con Puppeteer
 */
export async function obtenerOfertasSteam(descuentoMinimo = 10) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 Chrome/122.0.0.0");

  console.log("🎯 Aplicando filtro: solo juegos (category1=998)");
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const ofertas = [];
  let previousHeight = 0;
  let retry = 0;

  while (retry < 5 && ofertas.length < 100) {
    const juegos = await page.$$(".search_result_row");

    for (const juego of juegos.slice(ofertas.length)) {
      try {
        const nombre = await juego.$eval(".title", (el) =>
          el.textContent.trim()
        );
        const urlJuego = await juego.evaluate((el) => el.href);
        const descuentoTexto = await juego
          .$eval(".discount_pct", (el) => el.textContent.trim())
          .catch(() => "");
        const descuentoNumero = parseInt(
          descuentoTexto.replace("-", "").replace("%", "")
        );

        if (isNaN(descuentoNumero) || descuentoNumero < descuentoMinimo)
          continue;

        const precioViejo = await juego
          .$eval(".discount_original_price", (el) => el.textContent.trim())
          .catch(() => "");
        const precioNuevo = await juego
          .$eval(".discount_final_price", (el) => el.textContent.trim())
          .catch(() => "");
        if (!precioNuevo) continue;

        const appid = urlJuego.match(/app\/(\d+)/)?.[1];
        if (!appid) continue;

        ofertas.push({
          appid,
          nombre,
          url: urlJuego,
          descuento: `-${descuentoNumero}%`,
          precioViejo: precioViejo ? `~${precioViejo}~` : "N/A",
          precioNuevo,
        });

        if (ofertas.length >= 100) break;
      } catch (error) {
        console.warn("⚠️ Error al procesar juego:", error.message);
      }
    }

    if (ofertas.length >= 100) break;

    const currentHeight = await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
      return document.body.scrollHeight;
    });

    if (currentHeight === previousHeight) {
      retry++;
    } else {
      retry = 0;
      previousHeight = currentHeight;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  await browser.close();

  console.log(`🏆 Total de juegos seleccionados: ${ofertas.length}`);
  return ofertas;
}
