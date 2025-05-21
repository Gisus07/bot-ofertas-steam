import {
  obtenerOfertasSteam,
  obtenerFechaConFallback,
} from "../services/steamScraper.js";
import { guardarOferta } from "../services/dbService.js";
import { verificarDescuentoSteam } from "../services/steamApiHelper.js";
import {
  obtenerAppIDsFirebase,
  filtrarOfertasNuevasPorAppID,
  eliminarOfertasVencidas,
} from "../services/firebaseHelpers.js";
import pLimit from "p-limit";
import { notificarEliminacion, notificarOferta } from "../services/notifier.js";

const MAX_CONCURRENT = 5;
const limit = pLimit(MAX_CONCURRENT);

// 🔁 Este será llamado desde index.js
export default async function ejecutarSync(bot) {
  console.log("🔎 Obteniendo ofertas desde Steam...");
  const ofertas = await obtenerOfertasSteam(10);
  const total = ofertas.length;
  console.log(`🎮 Total juegos detectados: ${total}`);

  const appIDsExistentes = await obtenerAppIDsFirebase();
  const nuevasOfertas = filtrarOfertasNuevasPorAppID(ofertas, appIDsExistentes);
  console.log(`📌 Ofertas nuevas (no registradas aún): ${nuevasOfertas.length}`);

  let procesadas = 0;
  const nuevasOfertasInvertidas = [...nuevasOfertas].reverse();

  const tareas = nuevasOfertasInvertidas.map((oferta) =>
    limit(async () => {
      try {
        const appid = oferta.appid;
        const datosSteam = await verificarDescuentoSteam(appid);

        if (!datosSteam || !datosSteam.descuento) return;

        const hasta = await obtenerFechaConFallback(oferta.url);
        if (!hasta) return;

        const fueGuardado = await guardarOferta({
          ...oferta,
          appid,
          hasta,
        });

        if (fueGuardado) {
          await notificarOferta(bot, {
            ...oferta,
            appid,
            hasta,
            registrada: new Date().toISOString(),
          });
        }

        procesadas++;
        process.stdout.write(
          `\r📦 Procesando ${procesadas}/${nuevasOfertas.length}...`
        );
      } catch (err) {
        console.error(`❌ Error al procesar ${oferta.url}:`, err.message);
      }
    })
  );

  await Promise.all(tareas);
  console.log("\n✅ Nuevas ofertas registradas:", procesadas);

  const eliminadas = await eliminarOfertasVencidas();
  for (const oferta of eliminadas) {
    await notificarEliminacion(bot, oferta);
  }
}
