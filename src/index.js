import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';
import { startCommand } from './commands/start.js';

config(); // Cargar variables de entorno

const token = process.env.BOT_TOKEN; // Asegúrate de tener tu token en .env
const bot = new TelegramBot(token, { polling: true }); // Aquí creamos el bot

startCommand(bot); // Ahora sí el bot existe
