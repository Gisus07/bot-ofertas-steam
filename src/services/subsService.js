import { db } from "../firebase/firebase.js";

/**
 * Obtiene la lista de IDs de usuarios suscritos al bot.
 * @returns {Promise<number[]>}
 */
export async function obtenerUsuariosSuscritos() {
  const snapshot = await db.collection("usuarios").get();
  return snapshot.docs.map(doc => doc.id).map(id => Number(id));
}
