import { getDiscountKeyboard } from "../keyboards/discountKeyboard.js";
import { getLocalizedText } from "../services/languageService.js";
import { saveUserPreference } from "../states/userStates.js";

const showDiscountSelection = async (bot, chatId, languageCode) => {
  const selectDiscountText = await getLocalizedText(
    languageCode,
    "select_discount",
  );

  await bot.sendMessage(chatId, selectDiscountText, {
    reply_markup: getDiscountKeyboard(),
  });
};

export const setupCommand = (bot) => {
  bot.onText(/\/setup/, async (msg) => {
    const chatId = msg.chat.id;
    const languageCode = msg.from.language_code || "en";

    await showDiscountSelection(bot, chatId, languageCode);
  });

  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const languageCode = query.from.language_code || "en";
    const data = query.data;

    if (data === "setup") {
      await showDiscountSelection(bot, chatId, languageCode);
      bot.answerCallbackQuery(query.id);
      return;
    }

    if (data.startsWith("discount_")) {
      const selectedDiscount = parseInt(data.split("_")[1]);

      saveUserPreference(chatId, { minDiscount: selectedDiscount });

      const confirmedText = await getLocalizedText(
        languageCode,
        "confirmed_discount",
        { discount: selectedDiscount },
      );

      bot.sendMessage(chatId, confirmedText);
      bot.answerCallbackQuery(query.id);
    }
  });
};
