import { config } from '../config.js';

class MemoryStorage {
  constructor() {
    // Map: userId -> Array of { role: 'user' | 'model', parts: [{ text }] }
    this.userHistories = new Map();
    // Foydalanuvchi ma'lumotlari: oxirgi faollik, savollar soni
    this.userStats = new Map();
  }

  getHistory(userId) {
    const key = String(userId);
    if (!this.userHistories.has(key)) {
      this.userHistories.set(key, []);
    }
    return this.userHistories.get(key);
  }

  addMessage(userId, role, text) {
    const key = String(userId);
    const history = this.getHistory(key);

    history.push({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text }],
    });

    // Xotirani cheklash (masalan, oxirgi 20 ta xabar)
    if (history.length > config.maxHistoryLength) {
      // Birinchi ikkitasini (bitta savol-javob juftligini) o'chirish
      history.splice(0, history.length - config.maxHistoryLength);
    }

    // Statistikani yangilash
    const stats = this.userStats.get(key) || { messageCount: 0, lastActive: null };
    stats.messageCount += 1;
    stats.lastActive = new Date();
    this.userStats.set(key, stats);

    return history;
  }

  clearHistory(userId) {
    const key = String(userId);
    const hadHistory = this.userHistories.has(key) && this.userHistories.get(key).length > 0;
    this.userHistories.set(key, []);
    return hadHistory;
  }

  getStats(userId) {
    const key = String(userId);
    return this.userStats.get(key) || { messageCount: 0, lastActive: null };
  }
}

export const memoryStorage = new MemoryStorage();
