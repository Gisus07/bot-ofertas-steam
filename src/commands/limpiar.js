import { db } from "../firebase/firebase.js";
import { config } from "dotenv";
config();

const ADMIN_ID = parseInt(process.env.ADMIN_ID);

export const limpiarHuerfanosCommand = (bot) => {
  bot.onText(/\/limpiar_huerfanos/, async (msg) => {
    const chatId = msg.chat.id;

    if (chatId !== ADMIN_ID) return;

    const snapshot = await db.collection("ofertas").get();
    let eliminadas = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const sinFechaValida =
        !data.hasta || isNaN(new Date(data.hasta).getTime());

      if (sinFechaValida) {
        await db.collection("ofertas").doc(doc.id).delete();
        eliminadas++;
      }
    }

    await bot.sendMessage(chatId, `🧹 Se eliminaron ${eliminadas} ofertas sin fecha de vencimiento.`);
  });
};