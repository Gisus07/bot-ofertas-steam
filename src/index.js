// Cargar variables del entorno (.env)
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

// Token de tu bot
const token = process.env.TELEGRAM_TOKEN;

// Crear el bot en modo polling
const bot = new TelegramBot(token, { polling: true });

// Responder al comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '¡Hola! 👋 Soy tu bot de ofertas de Steam.');
});
