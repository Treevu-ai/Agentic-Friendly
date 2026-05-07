// Agentic Friendly · Telegram Webhook
// Auto-reply al usuario + notifica a Ricardo en Telegram personal
// Env vars en Vercel: TELEGRAM_BOT_TOKEN, ADMIN_CHAT_ID

const BOT_TOKEN_FALLBACK = "8792020146:AAE2zxPS55i3WeeAgAlYLtXPPJwsQ4HQECg";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).json({ ok: true });

  const { message } = req.body || {};
  if (!message?.text) return res.status(200).json({ ok: true });

  const chatId    = message.chat.id;
  const text      = message.text.trim();
  const firstName = message.from?.first_name || "visitante";
  const username  = message.from?.username ? `@${message.from.username}` : "sin username";
  const TOKEN     = process.env.TELEGRAM_BOT_TOKEN || BOT_TOKEN_FALLBACK;
  const ADMIN     = process.env.ADMIN_CHAT_ID;

  const send = (to, msg) =>
    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: to, text: msg, parse_mode: "Markdown" }),
    });

  // Setup helper: /myid devuelve el chat_id del remitente
  if (text === "/myid" || text.startsWith("/myid@")) {
    await send(chatId,
      `🔧 *Setup · Agentic Friendly Bot*\n\nTu chat ID es:\n\`${chatId}\`\n\nCopia este número → agrégalo en Vercel como \`ADMIN_CHAT_ID\`.`
    );
    return res.status(200).json({ ok: true });
  }

  if (text.startsWith("/start geo_")) {
    const score = parseInt(text.replace("/start geo_", "")) || 0;

    // Auto-reply al usuario
    await send(chatId,
      `👋 Hola *${firstName}*!\n\nGracias por revisar tu GEO Score — *${score}/100* queda registrado. Ricardo lo revisará y te contactará pronto.\n\n¿Tienes alguna pregunta mientras tanto?`
    );

    // Notificación a Ricardo
    await send(ADMIN,
      `🎯 *Nuevo lead · Agentic Friendly*\n\nNombre: ${firstName}\nUsername: ${username}\nChat ID: \`${chatId}\`\nGEO Score: *${score}/100*`
    );

  } else {
    // Mensaje libre del usuario → reenvía a Ricardo
    await send(ADMIN,
      `📩 *Mensaje de ${firstName}* (${username}):\n\n${text}\n\nChat ID: \`${chatId}\``
    );
  }

  return res.status(200).json({ ok: true });
};
