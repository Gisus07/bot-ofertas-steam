export const getDiscountKeyboard = () => {
  const discounts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const keyboard = discounts.map((discount) => [
    { text: `${discount}%`, callback_data: `discount_${discount}` },
  ]);

  return {
    inline_keyboard: keyboard,
  };
};
