const userPreferences = {};

export const saveUserPreference = (chatId, preference) => {
  userPreferences[chatId] = {
    ...userPreferences[chatId],
    ...preference,
  };
};

export const getUserPreference = (chatId) => {
  return userPreferences[chatId] || null;
};
