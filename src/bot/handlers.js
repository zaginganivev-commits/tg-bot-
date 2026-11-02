import { aiService } from '../services/ai.service.js';
import { sendSafeReply } from '../utils/text.utils.js';

export function registerHandlers(bot) {
  // Matnli xabarlarni qayta ishlash
  bot.on('message:text', async (ctx) => {
    const userText = ctx.message.text.trim();
    const userId = ctx.from.id;

    // Buyruq bo'lsa (masalan /start), handlers aralashmasligi kerak
    if (userText.startsWith('/')) {
      return;
    }

    // "Typing..." (yozmoqda...) harakatini ko'rsatish
    let typingInterval = null;
    try {
      await ctx.replyWithChatAction('typing');
      typingInterval = setInterval(() => {
        ctx.replyWithChatAction('typing').catch(() => {});
      }, 4000);

      // AI ga so'rov yuborish
      const response = await aiService.askQuestion(userId, userText);

      // Xabarni xavfsiz jo'natish
      await sendSafeReply(ctx, response);
    } catch (err) {
      console.error('Xabarni qayta ishlashda xatolik:', err);
      await ctx.reply('⚠️ Kechirasiz, xabaringizni qayta ishlashda kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
    } finally {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    }
  });

  // Ovozli xabarlar uchun
  bot.on('message:voice', async (ctx) => {
    await ctx.reply(
      '🎙 Ovozli xabaringiz qabul qilindi! Hozircha AI matnli rejimda ishlaydi, iltimos savolingizni matn ko\'rinishida yozib yuboring.'
    );
  });

  // Rasmli xabarlar uchun
  bot.on('message:photo', async (ctx) => {
    await ctx.reply(
      '📸 Rasm qabul qilindi! Savolingizni matn orqali bersangiz, barcha savollaringizga batafsil javob beraman.'
    );
  });

  // Boshqa fayl va stikerlar uchun
  bot.on('message:sticker', async (ctx) => {
    await ctx.reply('😊 Ajoyib stiker! Biror mavzuda savolingiz bormi? Bemalol so\'rang!');
  });
}
