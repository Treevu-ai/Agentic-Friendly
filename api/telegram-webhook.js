// Agentic Friendly · Telegram Webhook
// Auto-reply al usuario + notifica a Ricardo en Telegram personal
// Env vars requeridas en Vercel: TELEGRAM_BOT_TOKEN, ADMIN_CHAT_ID

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).json({ ok: true });

  const { message } = req.body || {};
  if (!message?.text) return res.status(200).json({ ok: true });

  const chatId    = message.chat.id;
  const text      = message.text;
  const firstName = message.from?.first_name || "visitante";
  const username  = message.from?.username ? `@${message.from.username}` : "sin username";
  const TOKEN     = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN     = process.env.ADMIN_CHAT_ID;

  const send = (to, msg) =>
    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: to, text: msg, parse_mode: "Markdown" }),
    });

  if (text.startsWith("/start geo_")) {
    const score = parseInt(text.replace("/start geo_", "")) || 0;

    // Auto-reply al usuario
    await send(chatId,
      `👋 Hola *${firstName}*\\!\n\nGracias por revisar tu GEO Score — *${score}/100* queda registrado\\. Ricardo lo revisará y te contactará pronto\\.\n\n¿Tienes alguna pregunta mientras tanto?`
    );

    // Notificación a Ricardo
    await send(ADMIN,
      `🎯 *Nuevo lead · Agentic Friendly*\n\nNombre: ${firstName}\nUsername: ${username}\nChat ID: \`${chatId}\`\nGEO Score: *${score}/100*\n\n[→ Respóndele aquí](tg://user?id=${chatId})`
    );

  } else {
    // Mensaje libre del usuario → reenvía a Ricardo
    await send(ADMIN,
      `📩 *${firstName}* (${username}) dice:\n\n_${text}_\n\n[→ Respóndele](tg://user?id=${chatId})`
    );
  }

  return res.status(200).json({ ok: true });
}
