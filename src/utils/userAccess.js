import { config } from "dotenv";
config();

const whitelist = process.env.USER_WHITELIST?.split(",").map((id) => Number(id.trim())) || [];

export const isUserAuthorized = (userId) => {
  return whitelist.includes(userId);
};
