import { db } from "../firebase/firebase.js";

export const stopCommand = (bot) => {
  bot.onText(/\/stop/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      const docRef = db.collection("usuarios").doc(userId);
      const doc = await docRef.get();

      if (!doc.exists) {
        await bot.sendMessage(chatId, "📌 No estabas suscrito.");
        return;
      }

      await docRef.delete();
      await bot.sendMessage(chatId, "🛑 Te has desuscrito correctamente de las notificaciones.");
    } catch (error) {
      console.error("❌ Error al desuscribir usuario:", error.message);
      await bot.sendMessage(chatId, "⚠️ Ocurrió un error al intentar desuscribirte.");
    }
  });
};
