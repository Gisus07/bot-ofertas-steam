// src/services/filtroFirebase.js

import { db } from "../firebase/firebase.js";

/**
 * Filtra ofertas que no están en Firebase o que cambiaron respecto a las guardadas.
 * @param {Array} ofertas - Lista de ofertas nuevas detectadas (con campo .url).
 * @returns {Array} - Lista de ofertas que son realmente nuevas o actualizadas.
 */
export async function filtrarOfertasNuevas(ofertas) {
  const snapshot = await db.collection("ofertas").get();

  const mapaFirebase = new Map();
  snapshot.forEach(doc => mapaFirebase.set(doc.id, doc.data()));

  const ofertasFiltradas = [];

  for (const oferta of ofertas) {
    const appid = oferta.url.match(/app\/(\d+)/)?.[1];
    if (!appid) continue;

    const existente = mapaFirebase.get(appid);
    if (!existente) {
      ofertasFiltradas.push({ ...oferta, appid }); // Nueva
      continue;
    }

    const cambio =
      existente.precioNuevo !== oferta.precioNuevo ||
      existente.hasta !== oferta.hasta;

    if (cambio) {
      ofertasFiltradas.push({ ...oferta, appid }); // Actualizada
    }
  }

  return ofertasFiltradas;
}
