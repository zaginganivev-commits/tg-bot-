import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { memoryStorage } from './storage.service.js';

const SYSTEM_INSTRUCTION = `
Siz professional va yuqori intellektga ega shaxsiy sun'iy intellekt (AI) yordamchisisiz.
Siz Senior Dasturchi, maslahatchi va ko'p sohalar bo'yicha ekspert bilimlarga egasiz.

QOIDALAR VA USLUB:
1. Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob bering (asosan O'zbek tili, shuningdek Rus yoki Ingliz tillarida).
2. O'zbek tilida gaplashganda hurmat bilan, aniq, lo'nda va ravon tilda javob bering.
3. Dasturlash (Frontend, Backend, DevOps, Data Science va boshqalar), fan, ta'lim, kundalik hayot, biznes, falsafa, tillar va barcha savollarga to'liq va tushunarli javob bering.
4. Kod yozganda eng yaxshi amaliyotlar (Clean Code, Best Practices, xavfsizlik) ga amal qiling va kodni tushuntirib bering.
5. Telegram xabarlariga mos chiroyli formatlashdan foydalaning (sarlavhalar, bullet points, qalin harflar, kod bloklari).
6. Suhbat kontekstini eslab qoling va oldingi savollar bilan bog'liq bo'lsa, uni inobatga olgan holda javob bering.
`.trim();

class AiService {
  constructor() {
    this.genAI = null;
    this.primaryModel = null;
    this.fallbackModel = null;
    this.init();
  }

  init() {
    if (config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
        this.primaryModel = this.genAI.getGenerativeModel({
          model: config.aiModel || 'gemini-2.0-flash',
          systemInstruction: SYSTEM_INSTRUCTION,
        });
        this.fallbackModel = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: SYSTEM_INSTRUCTION,
        });
      } catch (err) {
        console.error('Gemini AI initsializatsiyasida xatolik:', err.message);
      }
    }
  }

  async askQuestion(userId, questionText) {
    if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
      return (
        "⚠️ **Gemini API Kaliti kiritilmagan!**\n\n" +
        "Bot barcha savollaringizga AI orqali javob bera olishi uchun `.env` fayliga `GEMINI_API_KEY` ni kiritishingiz kerak.\n\n" +
        "🔑 **API kalitni qanday olish mumkin?**\n" +
        "1. https://aistudio.google.com/ saytiga kiring (Google hisobingiz bilan).\n" +
        "2. **Get API key** tugmasini bosing va kalit yarating (butunlay bepul).\n" +
        "3. Loyihaning `.env` faylidagi `GEMINI_API_KEY=` qatoriga kalitingizni qo'ying va botni qayta ishga tushiring."
      );
    }

    if (!this.genAI) {
      this.init();
    }

    const history = memoryStorage.getHistory(userId);

    // Format history specifically for Gemini SDK
    // Gemini SDK expects: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const formattedHistory = history.map((item) => ({
      role: item.role,
      parts: item.parts.map((p) => ({ text: p.text })),
    }));

    try {
      // Birinchi navbatda asosiy model bilan urinib ko'rish
      const chat = this.primaryModel.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(questionText);
      const reply = result.response.text();

      // Muvaffaqiyatli javobni xotiraga saqlash
      memoryStorage.addMessage(userId, 'user', questionText);
      memoryStorage.addMessage(userId, 'model', reply);

      return reply;
    } catch (primaryError) {
      console.warn(`Asosiy model (${config.aiModel}) xatosi:`, primaryError.message);
      console.log("Fallback model (gemini-1.5-flash) orqali urinib ko'rilmoqda...");

      try {
        const fallbackChat = this.fallbackModel.startChat({
          history: formattedHistory,
        });

        const fallbackResult = await fallbackChat.sendMessage(questionText);
        const fallbackReply = fallbackResult.response.text();

        memoryStorage.addMessage(userId, 'user', questionText);
        memoryStorage.addMessage(userId, 'model', fallbackReply);

        return fallbackReply;
      } catch (fallbackError) {
        console.error("AI xizmatida xatolik:", fallbackError);

        if (fallbackError.message?.includes('API_KEY_INVALID')) {
          return "❌ **Kiritilgan Gemini API kaliti yaroqsiz!** Iltimos, https://aistudio.google.com/ orqali yangi kalit oling va `.env` faylini tekshiring.";
        }

        if (fallbackError.message?.includes('QUOTA_EXCEEDED')) {
          return "⏳ **API so'rovlar limiti tugadi.** Biroz kuting va qayta urinib ko'ring.";
        }

        return `⚠️ Kechirasiz, savolingizga javob tayyorlashda xatolik yuz berdi: ${fallbackError.message || 'Noma\'lum xatolik'}. Iltimos, qaytadan urinib ko'ring.`;
      }
    }
  }
}

export const aiService = new AiService();
