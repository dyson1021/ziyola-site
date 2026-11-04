// POST /api/reserve — ticket hold (取り置き) request → notification mail to the band, sent through Gmail.
// Env (Vercel project settings → Environment Variables):
//   GMAIL_USER          the Gmail address that sends (ziyola2022@gmail.com)
//   GMAIL_APP_PASSWORD  a 16-character Google "app password" for that account (needs 2-step verification)
//   MAIL_TO             optional; where the notice goes (defaults to GMAIL_USER)

const nodemailer = require('nodemailer');

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

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function compose(r) {
  const day = WEEKDAYS[new Date(r.date + 'T00:00:00Z').getUTCDay()];
  const date = `${r.date.replace(/-/g, '.')}（${day}）`;
  const received = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ').replace(/-/g, '.');
  const rows = [['取り置き名', r.name], ['公演日', date], ['会場', r.venue], ['枚数', `${r.count}枚`], ['受付', `${received}（JST）`]];
  return {
    subject: `【ZIYOLA 取り置き】${r.date.replace(/-/g, '.')} ${r.venue} / ${r.name} ${r.count}枚`,
    text: rows.map(([k, v]) => `${k}：${v}`).join('\n'),
    html: '<table cellpadding="6" style="border-collapse:collapse;font-size:15px">' +
      rows.map(([k, v]) => `<tr><th align="left" style="border-bottom:1px solid #ddd;color:#555">${k}</th><td style="border-bottom:1px solid #ddd">${esc(v)}</td></tr>`).join('') +
      '</table>',
  };
}

// separate so tests can swap in a fake transport
function transport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '') },
  });
}

async function handler(req, res) {
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

  const user = process.env.GMAIL_USER;
  if (!user || !process.env.GMAIL_APP_PASSWORD) return res.status(503).json({ ok: false, error: 'not_configured' });

  try {
    const m = compose(r);
    await module.exports.transport().sendMail({
      from: `"ZIYOLA 取り置きフォーム" <${user}>`,
      to: process.env.MAIL_TO || user,
      subject: m.subject,
      text: m.text,
      html: m.html,
    });
  } catch (e) {
    console.error('mail failed', e && e.message);
    return res.status(502).json({ ok: false, error: 'mail_failed' });
  }
  return res.status(200).json({ ok: true });
}

module.exports = handler;
module.exports.validate = validate;
module.exports.compose = compose;
module.exports.transport = transport;
