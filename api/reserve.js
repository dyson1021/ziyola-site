// POST /api/reserve — ticket hold (取り置き) request → LINE push message to the band.
// Env (Vercel project settings): LINE_CHANNEL_ACCESS_TOKEN (Messaging API long-lived token),
// LINE_TO (user ID "U…" or group ID "C…" that receives the notifications).

const MAX_TICKETS = 6;
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function clean(v, max) {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function validate(body) {
  const name = clean(body.name, 40);
  const date = clean(body.date, 10);
  const venue = clean(body.venue, 60);
  const count = Number(body.count);
  if (!name) return { error: '取り置き名を入力してください。' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date + 'T00:00:00Z'))) return { error: '公演日を選んでください。' };
  if (!venue) return { error: '会場名を入力してください。' };
  if (!Number.isInteger(count) || count < 1 || count > MAX_TICKETS) return { error: `枚数は1〜${MAX_TICKETS}枚で選んでください。` };
  return { name, date, venue, count };
}

function message(r) {
  const d = new Date(r.date + 'T00:00:00Z');
  const now = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ').replace(/-/g, '.');
  return [
    '【ZIYOLA 取り置き】',
    `取り置き名：${r.name}`,
    `公演日：${r.date.replace(/-/g, '.')}（${WEEKDAYS[d.getUTCDay()]}）`,
    `会場：${r.venue}`,
    `枚数：${r.count}枚`,
    `受付：${now}（JST）`,
  ].join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'POST only' });
  }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  // honeypot: real visitors never fill this hidden field
  if (body.website) return res.status(200).json({ ok: true });

  const r = validate(body);
  if (r.error) return res.status(400).json({ ok: false, error: r.error });

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TO;
  if (!token || !to) return res.status(503).json({ ok: false, error: 'not_configured' });

  try {
    const line = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to, messages: [{ type: 'text', text: message(r) }] }),
    });
    if (!line.ok) {
      console.error('LINE push failed', line.status, await line.text());
      return res.status(502).json({ ok: false, error: 'line_failed' });
    }
  } catch (e) {
    console.error('LINE push error', e);
    return res.status(502).json({ ok: false, error: 'line_failed' });
  }
  return res.status(200).json({ ok: true });
};

module.exports.validate = validate;
module.exports.message = message;
