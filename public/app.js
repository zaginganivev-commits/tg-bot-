// Telegram WebApp SDK initsializatsiyasi
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Mavzu ranglarini Telegram bilan sinxronlash
  if (tg.themeParams) {
    const root = document.documentElement;
    if (tg.themeParams.bg_color) root.style.setProperty('--bg-color', tg.themeParams.bg_color);
    if (tg.themeParams.secondary_bg_color) root.style.setProperty('--secondary-bg', tg.themeParams.secondary_bg_color);
    if (tg.themeParams.text_color) root.style.setProperty('--text-color', tg.themeParams.text_color);
    if (tg.themeParams.hint_color) root.style.setProperty('--hint-color', tg.themeParams.hint_color);
    if (tg.themeParams.button_color) root.style.setProperty('--button-color', tg.themeParams.button_color);
    if (tg.themeParams.button_text_color) root.style.setProperty('--button-text-color', tg.themeParams.button_text_color);
  }
}

// Foydalanuvchi identifikatori (Telegram foydalanuvchisi yoki tasodifiy sessiya)
const userId = tg?.initDataUnsafe?.user?.id 
  ? `tg_${tg.initDataUnsafe.user.id}` 
  : (localStorage.getItem('chat_user_id') || (() => {
      const id = 'web_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chat_user_id', id);
      return id;
    })());

// DOM elementlari
const chatContainer = document.getElementById('chatContainer');
const messagesList = document.getElementById('messagesList');
const welcomeCard = document.getElementById('welcomeCard');
const typingIndicator = document.getElementById('typingIndicator');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const chips = document.querySelectorAll('.chip');

// Textarea balandligini avtomatik moslash
messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
});

// Shift+Enter bilan yangi qator, Enter bilan jo'natish
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// Oddiy va xavfsiz Markdown parslaydigan funksiya
function parseMarkdown(text) {
  if (!text) return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Kod bloklari: ```lang\ncode\n```
  html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
    return `<pre><code>${p1.trim()}</code></pre>`;
  });

  // Inline kod: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Qalin matn: **matn** yoki __matn__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Qiya matn: *matn* yoki _matn_
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Ro'yxat elementlari: • yoki -
  html = html.replace(/^\s*[-•*]\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Yangi qatorlar
  html = html.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

// Xabar qo'shish
function appendMessage(role, text) {
  if (welcomeCard && welcomeCard.style.display !== 'none') {
    welcomeCard.style.display = 'none';
  }

  const messageItem = document.createElement('div');
  messageItem.className = `message-item ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (role === 'ai') {
    bubble.innerHTML = parseMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  const timeEl = document.createElement('span');
  timeEl.className = 'message-time';
  const now = new Date();
  timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  messageItem.appendChild(bubble);
  messageItem.appendChild(timeEl);
  messagesList.appendChild(messageItem);

  // Pastga skroll qilish
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Haptic feedback (agar Telegram ichida bo'lsa)
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light');
  }
}

// Savol yuborish
async function sendMessage(question) {
  const text = (question || messageInput.value).trim();
  if (!text) return;

  // Inputni tozalash va balandligini tiklash
  messageInput.value = '';
  messageInput.style.height = 'auto';

  // Foydalanuvchi xabarini ko'rsatish
  appendMessage('user', text);

  // AI javobini kutish holati
  sendBtn.disabled = true;
  typingIndicator.classList.add('active');
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        userId: userId,
      }),
    });

    const data = await response.json();

    if (data.reply) {
      appendMessage('ai', data.reply);
    } else {
      appendMessage('ai', '⚠️ Javob olishda xatolik yuz berdi: ' + (data.error || 'Server javob bermadi'));
    }
  } catch (err) {
    console.error('So\'rovda xatolik:', err);
    appendMessage('ai', '⚠️ Server bilan aloqa uzildi. Iltimos, server ishlayotganini tekshiring.');
  } finally {
    sendBtn.disabled = false;
    typingIndicator.classList.remove('active');
    messageInput.focus();
  }
}

// Form submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Tavsiya etilgan savollarni bosganda yuborish
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const question = chip.getAttribute('data-question');
    if (question) {
      sendMessage(question);
    }
  });
});

// Suhbatni tozalash
clearChatBtn.addEventListener('click', async () => {
  if (messagesList.children.length === 0) return;

  try {
    await fetch('/api/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    messagesList.innerHTML = '';
    if (welcomeCard) {
      welcomeCard.style.display = 'block';
    }

    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  } catch (err) {
    console.error('Xotirani tozalashda xatolik:', err);
  }
});
