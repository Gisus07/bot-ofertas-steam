import { db } from "../firebase/firebase.js";

export async function agregarJuegoASeguimiento(userId, plain) {
  const ref = db.collection("users").doc(String(userId));
  const doc = await ref.get();

  if (!doc.exists) {
    await ref.set({ juegos: [plain] });
  } else {
    const juegos = doc.data().juegos || [];
    if (!juegos.includes(plain)) {
      juegos.push(plain);
      await ref.update({ juegos });
    }
  }
}

export async function obtenerJuegosDeUsuario(userId) {
  const doc = await db.collection("users").doc(String(userId)).get();
  return doc.exists ? doc.data().juegos : [];
}

export async function obtenerTodosUsuariosYJuegos() {
  const snapshot = await db.collection("users").get();
  const usuarios = {};
  snapshot.forEach(doc => {
    usuarios[doc.id] = doc.data().juegos || [];
  });
  return usuarios;
}
