// POST /api/contact — the group contact form. Anti-spam chain: honeypot →
// rate limit → Turnstile → form token → spam score (src/lib/spam/guard.ts).
// Delivery via the Graph → webhook → SMTP → console chain (src/lib/deliver.ts).
// A flagged (suspected spam) message is still delivered, with a [REVIEW]
// banner — the group site has no lead database, so nothing is ever dropped
// silently; only honeypot hits are.
import { NextResponse } from 'next/server';
import { deliverLead } from '@/lib/deliver';
import { runLeadGuards } from '@/lib/spam/guard';
import type { LeadPayload } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_LEN = 5000;
const ABOUT = new Set(['group', 'stretch', 'stretch-sufit', 're-sound', 'stretch-metal', 'careers']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Strings only (anything else → ''), C0 control characters dropped — line
 *  breaks survive only in the multi-line message field, never in a value
 *  that ends up in an e-mail header (Reply-To, subject) — capped, trimmed. */
function clean(value: unknown, max = MAX_LEN, multiline = false): string {
  if (typeof value !== 'string') return '';
  let out = '';
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code < 32 && !(multiline && (code === 9 || code === 10 || code === 13))) continue;
    out += ch;
    if (out.length >= max) break;
  }
  return out.trim();
}

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  // Only a plain object of fields is a form submission (null, arrays and
  // scalars are rejected before anything reads a property).
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const body = parsed as Record<string, unknown>;

  const honeypot = clean(body._gotcha, 200);
  const name = clean(body.name, 200);
  const email = clean(body.email, 320);
  const message = clean(body.message, MAX_LEN, true);
  if (!honeypot && (!email || !name || !message)) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });
  }
  // Server-side e-mail check (the UI validates too): the address becomes the
  // notification's Reply-To, so it must be one syntactically valid address.
  if (!honeypot && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 422 });
  }
  const aboutRaw = clean(body.about, 40);
  const about = ABOUT.has(aboutRaw) ? aboutRaw : 'group';

  const payload: LeadPayload = {
    source: about === 'careers' ? 'careers' : 'contact',
    name,
    email,
    company: clean(body.company, 200),
    about,
    message,
    locale: clean(body.locale, 10),
  };

  const guard = await runLeadGuards({
    request,
    honeypot,
    fields: payload as Record<string, string>,
    routeKey: 'contact',
    ipLimit: [6, 10 * 60],
    emailLimit: [10, 24 * 60 * 60],
    formToken: body.formToken,
    turnstileToken: body.turnstileToken,
  });
  if (guard.kind === 'honeypot') return NextResponse.json({ ok: true });
  if (guard.kind === 'rate_limited') return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  if (guard.kind === 'captcha_fail') return NextResponse.json({ ok: false, error: 'captcha' }, { status: 400 });
  if (guard.kind === 'stale_token') return NextResponse.json({ ok: false, error: 'stale_token' }, { status: 400 });

  try {
    await deliverLead(payload, guard.spam.flagged ? { score: guard.spam.score, reasons: guard.spam.reasons } : undefined);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[contact] unexpected delivery error: ${err instanceof Error ? err.message : 'unknown'}`);
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }
}
