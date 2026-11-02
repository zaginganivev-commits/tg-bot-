import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN?.trim() || '',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
  aiModel: process.env.AI_MODEL?.trim() || 'gemini-2.0-flash',
  port: parseInt(process.env.PORT || '3000', 10),
  webAppUrl: process.env.WEBAPP_URL?.trim() || 'http://localhost:3000',
  maxHistoryLength: 20, // Oxirgi 20 ta xabarni xotirada saqlash
};

export function validateConfig() {
  const warnings = [];

  if (!config.telegramToken || config.telegramToken === 'your_telegram_bot_token_here') {
    warnings.push('⚠️ TELEGRAM_BOT_TOKEN .env faylida ko\'rsatilmagan! Bot ishga tushishi uchun @BotFather orqali token oling.');
  }

  if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    warnings.push('⚠️ GEMINI_API_KEY .env faylida ko\'rsatilmagan! AI ishlashi uchun https://aistudio.google.com/ dan kalit oling.');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
