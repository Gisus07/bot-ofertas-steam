import { obtenerUsuariosSuscritos } from "./subsService.js";

export function escapeMarkdown(text) {
  return text
    .replace(/\\/g, "\\\\") // Escapa primero la barra invertida
    .replace(/([_\*\[\]\(\)~`>#+=|{}.!-])/g, "\\$1"); // Luego el resto (incluyendo punto)
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  if (isNaN(fecha)) return "?";
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const año = fecha.getFullYear();
  return `${dia}-${mes}-${año}`;
}

export async function notificarOferta(bot, oferta) {
  const usuarios = await obtenerUsuariosSuscritos();

  const mensaje = `
🎮 *${escapeMarkdown(oferta.nombre)}*
${escapeMarkdown(oferta.url)}

💰 Precio: ~${escapeMarkdown(oferta.precioViejo)}~ → *${escapeMarkdown(oferta.precioNuevo)}*
🔻 Descuento: *${escapeMarkdown(oferta.descuento)}*
📅 Fecha: ${escapeMarkdown(oferta.registrada?.split("T")[0].split("-").reverse().join("-") || "?")}
📆 Disponible hasta: ${escapeMarkdown(formatearFecha(oferta.hasta))}
`.trim();

  for (const userId of usuarios) {
    try {
      await bot.sendMessage(userId, mensaje, { parse_mode: "MarkdownV2" });
    } catch (err) {
      console.error(`❌ No se pudo enviar a ${userId}:`, err.message);
    }
  }
}

export async function notificarEliminacion(bot, oferta) {
  const usuarios = await obtenerUsuariosSuscritos();

  const mensaje = escapeMarkdown(`⚠️ La oferta de *${oferta.nombre}* ha finalizado.`);

  for (const userId of usuarios) {
    try {
      await bot.sendMessage(userId, mensaje, { parse_mode: "MarkdownV2" });
    } catch (err) {
      console.error(`❌ No se pudo enviar a ${userId}:`, err.message);
    }
  }
}
