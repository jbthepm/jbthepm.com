/**
 * Cloudflare Pages Function — contact form handler
 * Route: POST /api/contact   (file path maps to the URL automatically)
 *
 * WHY RESEND AND NOT MAILCHANNELS
 * MailChannels used to offer free transactional sending from Cloudflare
 * Workers and every old tutorial still tells you to use it. That free tier
 * was retired, so this uses Resend instead: free tier covers a consulting
 * site comfortably, and setup is one API key.
 *
 * SETUP (5 minutes)
 *   1. Sign up at resend.com and verify the domain jbthepm.com.
 *   2. Create an API key.
 *   3. In the Cloudflare dashboard:
 *        Pages > jbthepm > Settings > Environment variables
 *      Add (encrypted):
 *        RESEND_API_KEY  = re_xxxxxxxxxxxx
 *        CONTACT_TO      = jb@jbthepm.com        (where you want leads)
 *        CONTACT_FROM    = website@jbthepm.com   (must be on the verified domain)
 *   4. Redeploy.
 *
 * Local dev:  npx wrangler pages dev .  (see README)
 */

const MAX_LEN = 5000;

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await readBody(request);

    /* ---- Honeypot: bots fill the hidden "website" field ----
       Return 200 so the bot thinks it worked and does not retry. */
    if (data.website) {
      return json({ ok: true }, 200);
    }

    /* ---- Server-side validation (never trust the client) ---- */
    const name    = str(data.name);
    const email   = str(data.email);
    const message = str(data.message);
    const company = str(data.company);
    const type    = str(data.type);

    const errors = [];
    if (!name)                                          errors.push('name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))      errors.push('email');
    if (message.length < 10)                            errors.push('message');

    if (errors.length) {
      return json({ error: 'Please check the ' + errors.join(', ') + ' field(s).' }, 400);
    }

    /* ---- Not configured yet? Log it and fail loudly but politely. ---- */
    if (!env.RESEND_API_KEY) {
      console.log('CONTACT FORM (unsent, RESEND_API_KEY missing):', { name, email, company, type, message });
      return json({ error: 'The contact form is not connected yet.' }, 503);
    }

    const to   = env.CONTACT_TO   || 'jb@jbthepm.com';
    const from = env.CONTACT_FROM || 'website@jbthepm.com';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `JB the PM website <${from}>`,
        to: [to],
        reply_to: email,
        subject: `New enquiry: ${type || 'Project'} — ${name}`,
        text: [
          `Name:    ${name}`,
          `Email:   ${email}`,
          `Company: ${company || '—'}`,
          `Needs:   ${type || '—'}`,
          '',
          message,
          '',
          '---',
          `Sent from jbthepm.com at ${new Date().toISOString()}`
        ].join('\n')
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Resend error', res.status, detail);
      return json({ error: 'Could not send the message right now.' }, 502);
    }

    return json({ ok: true }, 200);

  } catch (err) {
    console.error('Contact handler crashed', err);
    return json({ error: 'Unexpected error.' }, 500);
  }
}

/* Anything other than POST gets a clear 405 rather than a confusing 404. */
export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ error: 'Method not allowed.' }, 405);
}

/* ---------- helpers ---------- */

// Accepts JSON (from main.js) or urlencoded (no-JS form fallback).
async function readBody(request) {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) return await request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

function str(v) {
  return String(v == null ? '' : v).trim().slice(0, MAX_LEN);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
