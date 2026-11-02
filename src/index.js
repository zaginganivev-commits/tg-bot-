import { config, validateConfig } from './config.js';
import { createBot, setupBotCommands } from './bot/bot.js';
import { createServer } from './server.js';

async function bootstrap() {
  console.log('='.repeat(55));
  console.log('🚀 SHAXSIY AI TELEGRAM BOT VA WEBAPP TIZIMI');
  console.log('='.repeat(55));

  const validation = validateConfig();

  if (!validation.isValid) {
    console.log('\nDIQQAT! Quyidagi sozlamalarni to\'ldirishingiz kerak:\n');
    validation.warnings.forEach((w) => console.log(w));
    console.log('\n📝 Iltimos, loyiha ildizidagi .env faylini oching va kalitlarni kiriting.\n');
  }

  // 1. Web serverni ishga tushirish
  const app = createServer();
  const server = app.listen(config.port, () => {
    console.log(`🌐 WebApp va API server ishga tushdi: http://localhost:${config.port}`);
  });

  // 2. Telegram botni ishga tushirish
  const bot = createBot();

  if (bot) {
    try {
      console.log('🤖 Telegram bot ulanmoqda...');
      await setupBotCommands(bot);

      // Bot ma'lumotlarini olish
      const botInfo = await bot.api.getMe();
      console.log(`✅ Bot muvaffaqiyatli ulandi: @${botInfo.username} (${botInfo.first_name})`);
      console.log('⚡ Savollarni kutish rejimi (Polling) faollashtirildi.');
      console.log('='.repeat(55));

      bot.start({
        onStart: () => {
          console.log('🟢 Bot to\'liq ishlamoqda. Telegram orqali xabar yuborishingiz mumkin!');
        },
      });
    } catch (botError) {
      console.error('❌ Botni ishga tushirishda xatolik yuz berdi:', botError.message);
      console.log('👉 .env faylidagi TELEGRAM_BOT_TOKEN to\'g\'riligini tekshiring.');
    }
  } else {
    console.log('⚠️ Telegram bot ishga tushirilmadi, chunki TELEGRAM_BOT_TOKEN kiritilmagan.');
    console.log('👉 .env fayliga tokenni kiriting va botni qayta ishga tushiring: npm start');
  }

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n🛑 Server va Bot to\'xtatilmoqda...');
    server.close(() => {
      console.log('Server to\'xtatildi.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Boshlang\'ich xatolik:', err);
});
