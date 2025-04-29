import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import { startCommand } from "./commands/start.js";
import { setupCommand } from "./commands/setup.js";

config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

startCommand(bot);
setupCommand(bot);
