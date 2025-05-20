import fetch from "node-fetch";
import { config } from "dotenv";
config();
const API_KEY = process.env.IS_THERE_ANY_DEAL_API_KEY;

export async function buscarJuego(nombre) {
  const url = `https://api.isthereanydeal.com/v02/search/search/?key=${API_KEY}&q=${encodeURIComponent(nombre)}&limit=1`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    // DEBUG TEMPORAL
    console.log("Respuesta cruda de API:", JSON.stringify(json, null, 2));

    if (!json || !json.data || !json.data.results) {
      throw new Error("Estructura inesperada en la respuesta de la API");
    }

    const resultados = json.data.results;

    if (resultados.length === 0) return null;

    return {
      plain: resultados[0].plain,
      title: resultados[0].title,
    };

  } catch (err) {
    console.error("Error buscando juego:", err);
    return null;
  }
}
