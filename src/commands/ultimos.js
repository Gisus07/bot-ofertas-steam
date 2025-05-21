import { db } from "../firebase/firebase.js";

// Corrige correctamente todos los caracteres reservados para MarkdownV2
export function escapeMarkdown(text) {
  return text
    .replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, "\\$1"); // escapamos todos estos
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const año = fecha.getFullYear();
  return `${dia}-${mes}-${año}`;
}

export const ultimosCommand = (bot) => {
  bot.onText(/\/ultimos/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const snapshot = await db
        .collection("ofertas")
        .orderBy("registrada", "desc")
        .limit(10)
        .get();

      if (snapshot.empty) {
        await bot.sendMessage(
          chatId,
          "❌ No hay ofertas recientes disponibles."
        );
        return;
      }

      for (const doc of snapshot.docs) {
        const oferta = doc.data();

        const precioViejo = `~${escapeMarkdown(oferta.precioViejo)}~`;
        const mensaje = `
🎮 *${escapeMarkdown(oferta.nombre)}*
${escapeMarkdown(oferta.url)}

💰 Precio: ${precioViejo} → *${escapeMarkdown(oferta.precioNuevo)}*
🔻 Descuento: *${escapeMarkdown(oferta.descuento)}*
📆 Disponible hasta: ${escapeMarkdown(formatearFecha(oferta.hasta))}
`.trim();

        await bot.sendMessage(chatId, mensaje, {
          parse_mode: "MarkdownV2",
        });
      }
    } catch (error) {
      console.error("❌ Error al obtener últimas ofertas:", error.message);
      await bot.sendMessage(
        chatId,
        "⚠️ Ocurrió un error al consultar las últimas ofertas."
      );
    }
  });
};
