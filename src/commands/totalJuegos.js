import { db } from "../firebase/firebase.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Comando de Telegram: /totaljuegos (solo admin)
 */
export function totalJuegosCommand(bot) {
  bot.onText(/\/totaljuegos/, async (msg) => {
    const chatId = msg.chat.id.toString();
    const adminId = process.env.ADMIN_ID;

    if (chatId !== adminId) {
      return bot.sendMessage(chatId, "🚫 Este comando está restringido.");
    }

    try {
      const snapshot = await db.collection("ofertas").get();
      const total = snapshot.size;

      await bot.sendMessage(chatId, `🎮 Total de juegos en Firebase: *${total}*`, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("❌ Error al contar juegos:", error);
      await bot.sendMessage(chatId, "⚠️ Ocurrió un error al contar los juegos.");
    }
  });
}
