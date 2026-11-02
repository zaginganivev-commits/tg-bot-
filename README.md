# 🤖 Shaxsiy AI Telegram Bot va WebApp (Senior Fullstack Architecture)

Ushbu loyiha **barcha savollaringizga (dasturlash, fan, ta'lim, biznes, tillar va kundalik masalalar) professional darajada javob bera oluvchi** shaxsiy sun'iy intellekt (AI) Telegram boti va zamonaviy WebApp (Mini App) interfeysidir.

Loyiha eng so'nggi **Node.js (ES Modules)**, **grammY** va **Google Gemini AI (2.0 Flash / 1.5 Flash)** asosida Senior darajadagi xavfsiz va modulli arxitektura bilan yaratilgan.

---

## ✨ Asosiy Xususiyatlar

1. **🧠 Har qanday savolga aqlli javob:**
   - Dasturlash (Frontend, Backend, DevOps, Algoritmlar, xatoliklarni topish va tuzatish).
   - Fan va texnologiya, matematika, fizika, tarix.
   - Xorijiy tillar (Ingliz, Rus, Nemis va b.), matnlarni tarjima qilish va tahrirlash.
   - Biznes g'oyalar, rejalar, esse va maqolalar yozish.
2. **💾 Kontekst xotirasi (Conversation Memory):**
   - Bot oldingi bergan savollaringizni eslab qoladi va mantiqiy davomiy suhbat yurita oladi.
   - `/clear` yoki `/reset` buyrug'i orqali xotirani istalgan paytda tozalash mumkin.
3. **🌐 Telegram Mini App (WebApp):**
   - Telegram ichida yoki brauzerda to'g'ridan-to'g'ri ochiluvchi, Telegram mavzulariga avtomatik moslashuvchi zamonaviy Glassmorphism chat interfeysi.
4. **🛡 Senior-darajadagi xavfsizlik va barqarorlik:**
   - Telegramning 4096 belgilik cheklovini avtomatik inobatga oluvchi xavfsiz xabarlar bo'laklash (`splitMessage`).
   - Markdown xatolariga qarshi avtomatik fallback.
   - AI o'ylayotgan vaqtda real vaqtli `typing...` animatsiyasi.
   - Global xatolik ushlovchi va avtomatik model fallback (`gemini-2.0-flash` -> `gemini-1.5-flash`).

---

## 🚀 Qadam-baqadam Ishga Tushirish

### 1-Qadam: Telegram Bot Tokenini olish (1 daqiqa)
1. Telegramda [@BotFather](https://t.me/BotFather) botiga kiring.
2. `/newbot` buyrug'ini yuboring.
3. Botingizga nom (masalan: `Mening Shaxsiy AI Botim`) va username (masalan: `my_ai_super_bot`) bering.
4. BotFather sizga **HTTP API Token** beradi (masalan: `7123456789:AAH...`).

### 2-Qadam: Google Gemini API kalitini olish (Mutlaqo bepul, 1 daqiqa)
1. Brauzeringizda **[Google AI Studio](https://aistudio.google.com/)** saytiga kiring.
2. Google hisobingiz orqali kiring.
3. **"Get API key"** tugmasini bosing va **"Create API key"** ni tanlang.
4. Chiqqan kalitni nusxalab oling.

### 3-Qadam: `.env` Faylini to'ldirish
Loyiha papkasidagi `.env` faylini oching va kalitlaringizni joylashtiring:

```env
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx
AI_MODEL=gemini-2.0-flash
PORT=3000
WEBAPP_URL=http://localhost:3000
```

### 4-Qadam: Botni ishga tushirish
Terminalda quyidagi buyruqni bajaring:

```bash
npm start
```
*(Dasturchilar uchun avtomatik qayta yuklanuvchi rejim: `npm run dev`)*

---

## 📱 Telegram WebApp (Mini App) ni ulash (Ixtiyoriy)
Agar Telegram botingiz ichida veb interfeysni ochmoqchi bo'lsangiz:
1. [@BotFather](https://t.me/BotFather) ga kiring.
2. `/mybots` buyrug'ini yozib botingizni tanlang.
3. **Bot Settings** -> **Menu Button** -> **Configure menu button** ni bosing.
4. WebApp manzilingizni kiriting (masalan, loyihangizni internetga joylaganingizdan so'ng HTTPS havola yoki ngrok havolasi).

---

## 📁 Loyiha Tuzilishi

```
tg bot/
│
├── .env                      # API tokenlar (maxfiy fayl)
├── .env.example              # Namuna konfiguratsiya
├── package.json              # Loyiha kutubxonalari
│
├── public/                   # Frontend (Telegram WebApp)
│   ├── index.html            # WebApp asosiy interfeysi
│   ├── style.css             # Glassmorphism & Telegram mavzusi uslublari
│   └── app.js                # Frontend mantiq va API integratsiyasi
│
└── src/                      # Backend (Node.js ES Modules)
    ├── index.js              # Asosiy kirish nuqtasi
    ├── config.js             # Konfiguratsiya va validatsiya
    ├── server.js             # Express veb-server va REST API
    ├── bot/
    │   ├── bot.js            # grammY bot yaratish va menyular
    │   ├── commands.js       # /start, /help, /clear, /stats buyruqlari
    │   └── handlers.js       # Matn va boshqa xabarlar qayta ishlovchisi
    ├── services/
    │   ├── ai.service.js     # Google Gemini AI xizmati va tizim prompti
    │   └── storage.service.js# Suhbatlar xotirasi (Memory window)
    └── utils/
        └── text.utils.js     # Xavfsiz xabarlar bo'laklash va Markdown yordamchisi
```

---

## 🎮 Telegram Buyruqlari

| Buyruq | Vazifasi |
|--------|----------|
| `/start` | Botni boshlash, kutib olish xabari va interaktiv tugmalar |
| `/clear` | Suhbat xotirasini tozalash (yangi mavzu boshlash) |
| `/stats` | Berilgan savollar soni va bot holati |
| `/help` | Botdan foydalanish bo'yicha yo'riqnoma |
| `/about` | Bot imkoniyatlari haqida ma'lumot |
