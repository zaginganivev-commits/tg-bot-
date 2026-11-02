import { Bot } from 'grammy';
import { config } from '../config.js';
import { registerCommands } from './commands.js';
import { registerHandlers } from './handlers.js';

export function createBot() {
  if (!config.telegramToken || config.telegramToken === 'your_telegram_bot_token_here') {
    return null;
  }

  const bot = new Bot(config.telegramToken);

  // Global xatolik ushlovchi (Bot hech qachon to'xtab qolmasligi uchun)
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Xatolik yuz berdi (${ctx?.update?.update_id}):`, err.error);
  });

  // Buyruqlarni ro'yxatdan o'tkazish
  registerCommands(bot);

  // Xabar qayta ishlovchilarni ro'yxatdan o'tkazish
  registerHandlers(bot);

  return bot;
}

export async function setupBotCommands(bot) {
  try {
    await bot.api.setMyCommands([
      { command: 'start', description: 'Botni ishga tushirish va bosh menyu' },
      { command: 'clear', description: 'Suhbat xotirasini tozalash (yangi mavzu)' },
      { command: 'stats', description: 'Foydalanish statistikasi' },
      { command: 'help', description: 'Yordam va qo\'llanma' },
      { command: 'about', description: 'Bot haqida ma\'lumot' },
    ]);
  } catch (err) {
    console.warn('Bot buyruqlari menyusini o\'rnatishda xatolik:', err.message);
  }
}
