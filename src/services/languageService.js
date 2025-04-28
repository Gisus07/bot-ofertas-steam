import {readFile} from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loadLanguage = async (language) => {
    try {
        const filePath = path.join(__dirname, '..', 'locales', `${language}.json`)
        const data = await readFile(filePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        console.error(`Error loading language file: ${language}`, error)
    }
}


export const getLocalizedText = async (languageCode, key, variables = {}) => {
  const lang = languageCode.startsWith("en") ? "en" : "es";
  const messages = await loadLanguage(lang)

  let text = messages[key] || 'error'

  for (const [varName, value] of Object.entries(variables)) {
    text = text.replace(`{{${varName}}}`, value);
  }

  return text;
};
