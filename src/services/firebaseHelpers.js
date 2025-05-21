// src/services/firebaseHelpers.js

import { db } from "../firebase/firebase.js";

/**
 * Obtiene todos los AppIDs registrados en la colección "ofertas" de Firestore.
 * @returns {Promise<Set<string>>} - Un Set con los AppIDs existentes.
 */
export async function obtenerAppIDsFirebase() {
  const snapshot = await db.collection("ofertas").get();
  const appIDs = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.appid) {
      appIDs.add(String(data.appid));
    } else {
      // Si no hay campo `appid`, usamos el ID del documento
      appIDs.add(doc.id);
    }
  });

  return appIDs;
}

/**
 * Filtra una lista de ofertas y retorna solo las que no están ya en Firebase.
 * @param {Array} ofertas - Lista de objetos con .url (donde extraeremos el appid).
 * @param {Set<string>} appIDsExistentes - Set de AppIDs ya presentes en Firestore.
 * @returns {Array} - Ofertas nuevas que aún no están registradas.
 */
export function filtrarOfertasNuevasPorAppID(ofertas, appIDsExistentes) {
  return ofertas.filter(oferta => {
    const appid = oferta.url.match(/app\/(\d+)/)?.[1];
    if (!appid) return false; // si no hay appid válido, la descartamos

    oferta.appid = appid; // lo adjuntamos para uso posterior
    return !appIDsExistentes.has(appid);
  });
}

/**
 * Elimina de Firestore las ofertas cuya fecha `hasta` ya ha pasado.
 * @returns {Array} - Ofertas eliminadas con appid y nombre.
 */
export async function eliminarOfertasVencidas() {
  const snapshot = await db.collection("ofertas").get();
  const ahora = Date.now(); // más preciso y directo

  const eliminadas = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.hasta) continue;

    const fechaHastaMs = Date.parse(data.hasta); // más robusto
    if (isNaN(fechaHastaMs)) continue;

    if (fechaHastaMs < ahora) {
      await db.collection("ofertas").doc(doc.id).delete();
      console.log(`🗑️ Oferta vencida eliminada: ${data.nombre} (AppID ${doc.id})`);
      eliminadas.push({ appid: doc.id, nombre: data.nombre });
    }
  }

  console.log(`\n✅ Ofertas vencidas eliminadas: ${eliminadas.length}`);
  return eliminadas;
}


