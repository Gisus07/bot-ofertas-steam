export function formatearMensajeOferta(oferta) {
  return (
    `🎮 <b>${oferta.nombre}</b>\n` +
    `🔗 <a href="${oferta.url}">Ver en Steam</a>\n\n` +
    `${oferta.precioViejo !== "N/A" ? `💲 Precio anterior: <s>${oferta.precioViejo}</s>\n` : ""}` +
    `💵 Precio con descuento: ${oferta.precioNuevo}\n` +
    `📉 Descuento: ${oferta.descuento}\n` +
    `📅 Hasta: ${oferta.hasta}`
  );
}
