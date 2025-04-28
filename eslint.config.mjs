import js from "@eslint/js";
import globals from "globals";
import prettierPlugin from "eslint-plugin-prettier"; // 👈 importa el plugin
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["eslint.config.mjs"],
    files: ["**/*.{js,cjs,mjs}"],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: globals.node,
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
    },
  },
]);
