import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiService } from './services/ai.service.js';
import { memoryStorage } from './services/storage.service.js';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Static fayllar (public papkasi va asosiy sahifa)
  app.use(express.static(path.join(rootDir, 'public')));

  // Healthcheck endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      model: config.aiModel,
    });
  });

  // WebApp / Veb chat uchun API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, userId = 'web_user' } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Xabar matni kiritilmagan' });
      }

      const reply = await aiService.askQuestion(userId, message.trim());
      res.json({ reply, userId });
    } catch (err) {
      console.error('API /api/chat xatoligi:', err);
      res.status(500).json({ error: 'Server xatoligi yuz berdi' });
    }
  });

  // Xotirani tozalash API
  app.post('/api/clear', (req, res) => {
    const { userId = 'web_user' } = req.body;
    memoryStorage.clearHistory(userId);
    res.json({ success: true, message: 'Xotira tozalandi' });
  });

  return app;
}
