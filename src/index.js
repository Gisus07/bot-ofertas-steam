import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import cron from "node-cron";

import { startCommand } from "./commands/start.js";
import { stopCommand } from "./commands/stop.js";
import { ultimosCommand } from "./commands/ultimos.js";
import ejecutarSync from "./sync/steamSync.js";
import { limpiarHuerfanosCommand } from "./commands/limpiar.js";

config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const adminId = Number(process.env.ADMIN_ID);

// 📌 Comandos generales (para todos)
bot.setMyCommands([
  { command: "start", description: "Suscribirse a ofertas de Steam" },
  { command: "stop", description: "Cancelar suscripción" },
  { command: "ultimos", description: "Ver las 10 últimas ofertas" },
]);

// 👑 Comando especial solo para el administrador
bot.setMyCommands(
  [
    { command: "start", description: "Suscribirse a ofertas de Steam" },
    { command: "stop", description: "Cancelar suscripción" },
    { command: "ultimos", description: "Ver las 10 últimas ofertas" },
    { command: "limpiar_huerfanos", description: "🧹 Eliminar ofertas sin fecha" }
  ],
  {
    scope: {
      type: "chat",
      chat_id: adminId
    }
  }
);

// 🧠 Registro de comandos
startCommand(bot);
stopCommand(bot);
ultimosCommand(bot);
limpiarHuerfanosCommand(bot);

// ✅ Confirmación
console.log("🤖 Bot de ofertas Steam activo y escuchando comandos...");

// 🚀 Sincronización inicial
ejecutarSync(bot);

// ⏰ Sincronización automática cada 30 minutos
cron.schedule("*/30 * * * *", () => {
  console.log("⏰ Ejecutando sincronización automática...");
  ejecutarSync(bot);
});
