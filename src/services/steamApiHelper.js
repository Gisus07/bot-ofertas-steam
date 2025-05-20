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

    // Validar tipo de contenido antes del .json()
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.log(`⚠️ Respuesta no JSON para AppID ${appid}`);
      return null;
    }

    const data = await res.json();

    // Verificar si la respuesta contiene null (posible saturación o contenido bloqueado)
    if (!data[appid]) {
      console.log(`⚠️ API Steam devolvió null para AppID: ${appid}`);
      return null;
    }

    const juego = data[appid];

    // Verificación robusta de éxito
    if (!juego.success || !juego.data) {
      console.log(`⚠️ API Steam no encontró datos válidos para AppID: ${appid}`);
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
