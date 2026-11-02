/**
 * Xabarni Telegram limiti (4096 belgi) ga moslab xavfsiz bo'laklarga ajratish
 */
export function splitMessage(text, maxLength = 3800) {
  if (!text || text.length <= maxLength) {
    return [text || ''];
  }

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // So'z yoki qatordan bo'lish uchun qulay nuqtani topish
    let splitIndex = remaining.lastIndexOf('\n\n', maxLength);
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = remaining.lastIndexOf('\n', maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitIndex === -1) {
      splitIndex = maxLength;
    }

    chunks.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  return chunks;
}

/**
 * Xabarni xavfsiz yuborish (Markdown xatosi bo'lsa oddiy matn sifatida qayta urinadi)
 */
export async function sendSafeReply(ctx, text, extra = {}) {
  const chunks = splitMessage(text);

  for (const chunk of chunks) {
    try {
      await ctx.reply(chunk, {
        parse_mode: 'Markdown',
        ...extra,
      });
    } catch (markdownError) {
      // Agar markdown formati sababli xatolik bersa, oddiy matn sifatida yuborish
      console.warn('Markdown xatoligi yuz berdi, oddiy matn sifatida yuborilmoqda:', markdownError.message);
      await ctx.reply(chunk, {
        ...extra,
        parse_mode: undefined,
      });
    }
  }
}
