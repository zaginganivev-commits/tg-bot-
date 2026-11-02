import { InlineKeyboard } from 'grammy';
import { memoryStorage } from '../services/storage.service.js';
import { sendSafeReply } from '../utils/text.utils.js';
import { config } from '../config.js';

export function registerCommands(bot) {
  // /start buyrug'i
  bot.command('start', async (ctx) => {
    const user = ctx.from;
    const name = user?.first_name || 'Do\'stim';

    const welcomeText = `
👋 **Assalomu alaykum, ${name}!**

Men sizning **Shaxsiy Sun'iy Intellekt Yordamchingizman** 🤖✨

Siz menga xohlagan sohangiz bo'yicha savol berishingiz mumkin:
💻 **Dasturlash:** Frontend, Backend, Database, xatoliklarni tuzatish
📚 **Fan va Ta'lim:** Matematika, Fizika, Tarix, Ingliz tili va boshqalar
💡 **G'oyalar va Rejalar:** Biznes, Startup, postlar, ma'ruzalar
✍️ **Tarjimalar va Matnlar:** Maqolalar, insholar, xatlar
❓ **Barcha kundalik savollar**

Muloqotni boshlash uchun shunchaki savolingizni yozib yuboring! 🚀
    `.trim();

    const keyboard = new InlineKeyboard()
      .text('🧹 Xotirani tozalash', 'cmd_clear')
      .text('📊 Statistika', 'cmd_stats')
      .row()
      .text('💡 Misol savollar', 'cmd_examples')
      .text('ℹ️ Yordam', 'cmd_help');

    // Agar WebApp URL mavjud bo'lsa, WebApp tugmasini qo'shish
    if (config.webAppUrl && (config.webAppUrl.startsWith('https://') || config.webAppUrl.startsWith('http://'))) {
      keyboard.row().webApp('🌐 WebApp interfeysi', config.webAppUrl);
    }

    await sendSafeReply(ctx, welcomeText, {
      reply_markup: keyboard,
    });
  });

  // /help buyrug'i
  bot.command('help', async (ctx) => {
    const helpText = `
📖 **Botdan foydalanish bo'yicha qo'llanma:**

• Shunchaki savolingizni xabar qilib yuboring — AI bir necha soniyada javob qaytaradi.
• Bot suhbat kontekstini eslab qoladi (oldingi xabarlaringizni hisobga oladi).

**Asosiy buyruqlar:**
/start - Botni qayta ishga tushirish va bosh menyu
/clear yoki /reset - Suhbat tarixini tozalash (yangi mavzu boshlash)
/stats - Foydalanish statistikasi
/help - Ushbu yordam xabari
/about - Bot haqida ma'lumot
    `.trim();

    await sendSafeReply(ctx, helpText);
  });

  // /clear yoki /reset buyrug'i
  bot.command(['clear', 'reset'], async (ctx) => {
    const userId = ctx.from.id;
    const hadHistory = memoryStorage.clearHistory(userId);

    if (hadHistory) {
      await ctx.reply('🧹 Suhbat xotirasi tozalandi! Endi yangi mavzu bo\'yicha toza suhbat boshlashingiz mumkin.');
    } else {
      await ctx.reply('✨ Xotira allaqachon toza. Savolingizni berishingiz mumkin!');
    }
  });

  // /stats buyrug'i
  bot.command('stats', async (ctx) => {
    const userId = ctx.from.id;
    const stats = memoryStorage.getStats(userId);
    const history = memoryStorage.getHistory(userId);

    const statsText = `
📊 **Sizning faollik statistikangiz:**

💬 Jami berilgan savollar: **${stats.messageCount}** ta
🧠 Xotiradagi faol xabarlar: **${history.length}** ta
⚙️ Ishlatilayotgan AI model: **${config.aiModel}**
⚡ Status: **Onlayn va tayyor**
    `.trim();

    await sendSafeReply(ctx, statsText);
  });

  // /about buyrug'i
  bot.command('about', async (ctx) => {
    const aboutText = `
🤖 **Shaxsiy AI Telegram Bot**
Bu bot Google Gemini sun'iy intellekti bazasida ishlovchi, Senior Fullstack arxitektura asosida yaratilgan shaxsiy yordamchidir.

⚡ **Xususiyatlari:**
- Kontekstni eslab qolish (Sliding Memory Window)
- Barcha tillarda va barcha sohalarda javob berish
- Kod yozish va xatoliklarni tahlil qilish
- WebApp (Mini App) integratsiyasi
- Xavfsiz xatoliklarni boshqarish va cheksiz matn bo'laklash
    `.trim();

    await sendSafeReply(ctx, aboutText);
  });

  // Inline tugmalar (Callback Queries)
  bot.callbackQuery('cmd_clear', async (ctx) => {
    const userId = ctx.from.id;
    memoryStorage.clearHistory(userId);
    await ctx.answerCallbackQuery({ text: '🧹 Xotira tozalandi!' });
    await ctx.reply('🧹 Suhbat xotirasi tozalandi. Yangi savolingizni yozavering!');
  });

  bot.callbackQuery('cmd_stats', async (ctx) => {
    const userId = ctx.from.id;
    const stats = memoryStorage.getStats(userId);
    const history = memoryStorage.getHistory(userId);

    await ctx.answerCallbackQuery();
    await ctx.reply(
      `📊 **Statistika:**\nSavollar: ${stats.messageCount} ta\nXotiradagi xabarlar: ${history.length} ta\nModel: ${config.aiModel}`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.callbackQuery('cmd_examples', async (ctx) => {
    await ctx.answerCallbackQuery();
    const examplesText = `
💡 **Misol savollar (shunchaki nusxa ko'chirib yuboring):**

1. "JavaScript da closure nima va u qanday ishlaydi? Misol bilan tushuntirib ber."
2. "Biznes reja tuzish uchun nimalarga e'tibor berishim kerak?"
3. "Ingliz tilini mustaqil 3 oyda qanday o'rgansam bo'ladi?"
4. "Telegram WebApp yaratish ketma-ketligini tushuntirib ber."
5. "Menga bugun kechki ovqat uchun tez tayyor bo'ladigan mazali retsept yoz."
    `.trim();

    await sendSafeReply(ctx, examplesText);
  });

  bot.callbackQuery('cmd_help', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      "Savolingizni shunchaki yozib yuboring! Yangi mavzu boshlash uchun /clear buyrug'ini bosing."
    );
  });
}
