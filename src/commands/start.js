import { getLocalizedText } from "../services/languageService.js";

export const startCommand = (bot) => {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const languageCode = msg.from.language_code || "en";
    const firstName = msg.from.first_name || "";

    const welcomeMessage = await getLocalizedText(languageCode, 'start_message', { name: firstName });

    const buttonText = await getLocalizedText(languageCode, 'setup_button');

    bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [[{ text: buttonText, callback_data: "setup" }]],
      },
    });
  });
};
