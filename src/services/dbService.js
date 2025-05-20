// src/services/dbService.js
import { db } from "../firebase/firebase.js";

const ofertasRef = db.collection("ofertas");

/**
 * Guarda una oferta si no existe ya
 */
export async function guardarOferta(oferta) {
  const appid = oferta.url.match(/app\/(\d+)/)?.[1];
  if (!appid) throw new Error("No se pudo extraer el appid de la URL: " + oferta.url);

  const docRef = ofertasRef.doc(appid);
  const doc = await docRef.get();

  const dataToSave = {
    ...oferta,
    appid: appid, // ✅ Garantiza que siempre se guarda como campo
  };

  if (doc.exists) {
    const datos = doc.data();

    // Verifica si hay cambios en precio o fecha
    const sinCambios =
      datos.precioNuevo === oferta.precioNuevo &&
      datos.hasta === oferta.hasta;

    if (sinCambios) return false; // No actualizar

    await docRef.set({
      ...dataToSave,
      actualizada: new Date().toISOString(),
    });
    return true;
  }

  await docRef.set({
    ...dataToSave,
    registrada: new Date().toISOString(),
  });

  return true;
}

/**
 * Elimina una oferta que ya no esté activa
 */
export async function eliminarOferta(url) {
  const docId = encodeURIComponent(url);
  await ofertasRef.doc(docId).delete();
}

/**
 * Devuelve todas las URLs actualmente registradas
 */
export async function obtenerUrlsRegistradas() {
  const snapshot = await ofertasRef.get();
  return snapshot.docs.map(doc => doc.data().url);
}
