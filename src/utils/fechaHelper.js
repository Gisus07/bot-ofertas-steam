const MESES_ES = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
};

/**
 * Convierte texto tipo "Finaliza dentro de 38:15:45" a un timestamp ISO.
 * Retorna null si no se detecta el formato esperado.
 */
export function convertirTiempoRestanteATimestamp(texto) {
  const match = texto.match(/(?:dentro de|in|finaliza en|termina en)\s*(\d{1,2}):(\d{2}):(\d{2})/i);
  if (!match) {
    console.log("⛔ No se detectó patrón de tiempo restante:", texto);
    return null;
  }

  const [, horasStr, minutosStr, segundosStr] = match;
  const horas = parseInt(horasStr);
  const minutos = parseInt(minutosStr);
  const segundos = parseInt(segundosStr);

  console.log(`⏱️ Tiempo detectado: ${horas}h ${minutos}m ${segundos}s`);

  const ahora = new Date();
  const fechaFinal = new Date(ahora.getTime() + ((horas * 3600 + minutos * 60 + segundos) * 1000));

  console.log(`🕒 Fecha actual: ${ahora.toISOString()}`);
  console.log(`📆 Fecha calculada: ${fechaFinal.toISOString()}`);

  return fechaFinal.toISOString();
}


/**
 * Convierte "25 mayo" o "25 de mayo" a fecha ISO usando el año actual (o el siguiente si ya pasó).
 */
export function convertirFechaLiteralATimestamp(texto) {
  const match = texto.match(/(\d{1,2})\s*(?:de\s*)?(\w+)/i);
  if (!match) return null;

  const dia = parseInt(match[1]);
  const mesNombre = match[2].toLowerCase();
  const mes = MESES_ES[mesNombre];
  if (mes === undefined) return null;

  const ahora = new Date();
  let año = ahora.getFullYear();
  const fecha = new Date(año, mes, dia);

  // Si la fecha ya pasó este año, usar el año siguiente
  if (fecha < ahora) {
    fecha.setFullYear(año + 1);
  }

  return fecha.toISOString();
}
