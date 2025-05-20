import { obtenerOfertasSteam, obtenerFechaConFallback } from "./src/services/steamScraper.js";
import { guardarOferta } from "./src/services/dbService.js";
import { verificarDescuentoSteam } from "./src/services/steamApiHelper.js";
import {
  obtenerAppIDsFirebase,
  filtrarOfertasNuevasPorAppID,
  eliminarOfertasVencidas
} from "./src/services/firebaseHelpers.js";
import pLimit from "p-limit";

const MAX_CONCURRENT = 5;
const limit = pLimit(MAX_CONCURRENT);

async function main() {
  console.log("🔎 Obteniendo ofertas desde Steam...");
  const ofertas = await obtenerOfertasSteam(10);
  const total = ofertas.length;
  console.log(`🎮 Total juegos detectados: ${total}`);

  // 🔍 Cargar AppIDs ya registrados en Firestore
  const appIDsExistentes = await obtenerAppIDsFirebase();

  // ✂️ Filtrar las ofertas que aún no están en la DB
  const nuevasOfertas = filtrarOfertasNuevasPorAppID(ofertas, appIDsExistentes);
  console.log(`📌 Ofertas nuevas (no registradas aún): ${nuevasOfertas.length}`);

  let procesadas = 0;

  const tareas = nuevasOfertas.map((oferta) =>
    limit(async () => {
      try {
        const appid = oferta.appid;
        const datosSteam = await verificarDescuentoSteam(appid);

        if (!datosSteam || !datosSteam.descuento) {
          console.log(`❌ Sin descuento válido en API para ${oferta.url}`);
          return;
        }

        // 🗓️ Obtener fecha de finalización de oferta (solo si pasa la validación de descuento)
        const hasta = await obtenerFechaConFallback(oferta.url);
        if (!hasta) {
          console.log(`⚠️ No se pudo obtener la fecha para ${oferta.url}`);
          return;
        }

        console.log(
          `✅ Descuento API: ${datosSteam.descuento_porcentaje}% - ${datosSteam.precio_actual} USD en ${oferta.url}`
        );

        const nueva = await guardarOferta({
          ...oferta,
          appid,
          hasta
        });

        procesadas++;
        process.stdout.write(`\r📦 Procesando ${procesadas}/${nuevasOfertas.length}...`);
      } catch (err) {
        console.error(`❌ Error al procesar ${oferta.url}:`, err.message);
      }
    })
  );

  await Promise.all(tareas);
  console.log("\n✅ Nuevas ofertas registradas:", procesadas);

  // 🧹 Limpieza de ofertas vencidas
  await eliminarOfertasVencidas();
}

main();
