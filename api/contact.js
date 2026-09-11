/**
 * Esencore — inquiry delivery
 * Vercel Serverless Function, reachable at POST /api/contact
 *
 * Static files can't send mail, so the form posts here and this sends it on
 * to support@esencore.io. It works with either provider; set up whichever
 * you prefer and this picks it up:
 *
 *   Resend    →  env RESEND_API_KEY        (recommended)
 *   Formspree →  env FORMSPREE_ENDPOINT    (e.g. https://formspree.io/f/abcdwxyz)
 *
 * Optional overrides:
 *   CONTACT_TO    default support@esencore.io
 *   CONTACT_FROM  default "Esencore Website <onboarding@resend.dev>".
 *                 Change to a esencore.io address once the domain is
 *                 verified in Resend; until then Resend will only send
 *                 from its own onboarding domain.
 *
 * With neither set this returns 503 and the form shows the visitor the
 * support address instead of pretending the message went through.
 */
const TO = process.env.CONTACT_TO || 'support@esencore.io';
const FROM = process.env.CONTACT_FROM || 'Esencore Website <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  // Honeypot: real people leave this empty. Accept silently so bots learn nothing.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });

  const name    = clean(body.name, 200);
  const email   = clean(body.email, 320);
  const phone   = clean(body.phone, 60);
  const company = clean(body.company, 200);
  const inquiry = clean(body.details || body.inquiry, 5000);
  const interest = clean(body.interest, 120);
  const volume   = clean(body.volume, 120);

  if (!name || !email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A name and a valid email address are required.' });
  }

  const lines = [
    `Name:     ${name}`,
    company  ? `Company:  ${company}` : null,
    `Email:    ${email}`,
    phone    ? `Phone:    ${phone}` : null,
    interest ? `Looking for: ${interest}` : null,
    volume   ? `Estimated requirement: ${volume}` : null,
    '',
    inquiry ? inquiry : '(no message provided)',
    '',
    '—',
    'Sent from the inquiry form on esencore.io',
  ].filter(Boolean);
  const text = lines.join('\n');
  const subject = `Website inquiry — ${name}${company ? ' (' + company + ')' : ''}`;

  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to: [TO], reply_to: email, subject, text }),
      });
      if (!r.ok) {
        const detail = await r.text();
        console.error('Resend rejected the message:', r.status, detail);
        return res.status(502).json({ error: 'Delivery failed.' });
      }
      return res.status(200).json({ ok: true });
    }

    if (process.env.FORMSPREE_ENDPOINT) {
      const r = await fetch(process.env.FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, company, email, phone, interest, volume, message: inquiry, _subject: subject }),
      });
      if (!r.ok) {
        console.error('Formspree rejected the message:', r.status, await r.text());
        return res.status(502).json({ error: 'Delivery failed.' });
      }
      return res.status(200).json({ ok: true });
    }

    console.error('No delivery provider configured: set RESEND_API_KEY or FORMSPREE_ENDPOINT.');
    return res.status(503).json({ error: 'The form is not connected yet.' });
  } catch (err) {
    console.error('Inquiry delivery threw:', err);
    return res.status(502).json({ error: 'Delivery failed.' });
  }
};
