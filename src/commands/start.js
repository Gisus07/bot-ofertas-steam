import { db } from "../firebase/firebase.js";
import { config } from "dotenv";
config();

export const startCommand = (bot) => {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const ref = db.collection("usuarios").doc(userId.toString());
      const doc = await ref.get();

      if (doc.exists) {
        await bot.sendMessage(chatId, "📌 Ya estás suscrito para recibir ofertas de Steam.");
      } else {
        await ref.set({ chatId });
        await bot.sendMessage(chatId, "✅ Te has suscrito para recibir ofertas de Steam.");
      }

      const isAdmin = String(userId) === String(process.env.ADMIN_ID);

      const keyboard = isAdmin
        ? {
            keyboard: [
              [{ text: "/ultimos" }],
              [{ text: "/stop" }],
              [{ text: "/limpiar_huerfanos" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          }
        : {
            keyboard: [
              [{ text: "/ultimos" }],
              [{ text: "/stop" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          };

      await bot.sendMessage(chatId, "📋 Menú de comandos:", {
        reply_markup: keyboard
      });

    } catch (err) {
      console.error("❌ Error al registrar usuario:", err.message);
      await bot.sendMessage(chatId, "❌ Ocurrió un error al procesar tu suscripción.");
    }
  });
};
