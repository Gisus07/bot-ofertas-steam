import fetch from "node-fetch";

/**
 * Consulta la API oficial de Steam para verificar si un juego tiene descuento.
 * @param {string} appid - El ID de la app de Steam.
 * @returns {Promise<Object|null>} - Detalles del descuento o null si no aplica.
 */
export async function verificarDescuentoSteam(appid) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
    const res = await fetch(url);

    // Validar tipo de contenido antes de parsear
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`⚠️ Respuesta no JSON para AppID ${appid}`);
      return null;
    }

    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      console.warn(`⚠️ Error al parsear JSON de AppID ${appid}`);
      return null;
    }

    if (!data || typeof data[appid] !== "object") {
      console.warn(`⚠️ Respuesta inválida o nula para AppID ${appid}`);
      return null;
    }

    const juego = data[appid];
    if (!juego.success || !juego.data) {
      console.warn(`⚠️ API Steam no encontró datos válidos para AppID: ${appid}`);
      return null;
    }

    const info = juego.data;
    const precio = info.price_overview;

    if (!precio || precio.discount_percent === 0) {
      return { descuento: false };
    }

    return {
      descuento: true,
      nombre: info.name,
      descuento_porcentaje: precio.discount_percent,
      precio_original: precio.initial / 100,
      precio_actual: precio.final / 100,
      moneda: precio.currency,
    };
  } catch (error) {
    console.error(`❌ Error al consultar API Steam para AppID ${appid}:`, error.message);
    return null;
  }
}
