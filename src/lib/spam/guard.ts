// ============================================================================
// LEAD-ROUTE GUARD CHAIN — the one place the public contact endpoint runs its
// checks, in the agreed order: honeypot → rate limit → Turnstile → form
// token → spam score. Same chain as the product site, minus the two layers
// that need a database (admin blocklist, lead store).
//
// Outcomes:
//   honeypot     → the route responds { ok: true } and delivers NOTHING
//                  (a bot never learns it was caught).
//   rate_limited → 429 with the localized "too many requests" message.
//   captcha_fail → 400 'captcha' (Turnstile enabled and the token failed).
//   stale_token  → 400 'stale_token' — the client refetches and retries once.
//   ok           → proceed; `spam.flagged` says whether the message must be
//                  delivered with the [REVIEW] banner (never dropped silently).
// ============================================================================
import { verifyTurnstile, isTurnstileEnabled } from '@/lib/turnstile';
import { checkFormToken } from '@/lib/form-token';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { canonicalEmail, emailDomain, isDisposable } from '@/lib/spam/email';
import { scoreSubmission, FLAG_THRESHOLD, type SpamMeta } from '@/lib/spam/score';

export type LeadSpamMeta = {
  score: number;
  reasons: string[];
  flagged: boolean;
  ip?: string | null;
  host?: string | null;
  userAgent?: string | null;
};

export type LeadGuardResult =
  | { kind: 'honeypot' }
  | { kind: 'rate_limited' }
  | { kind: 'captcha_fail' }
  | { kind: 'stale_token' }
  | { kind: 'ok'; spam: LeadSpamMeta; disposable: boolean };

export async function runLeadGuards(opts: {
  request: Request;
  /** The cleaned honeypot field value ('' when untouched). */
  honeypot: string;
  /** Cleaned submitted fields, used for scoring. */
  fields: Record<string, string>;
  /** Route prefix for rate-limit keys, e.g. 'contact'. */
  routeKey: string;
  /** [limit, windowSeconds] per IP. */
  ipLimit: [number, number];
  /** [limit, windowSeconds] per canonical email (skipped when no email). */
  emailLimit?: [number, number];
  formToken: unknown;
  turnstileToken: unknown;
}): Promise<LeadGuardResult> {
  const { request, fields } = opts;
  const ip = getClientIp(request);
  const host = request.headers.get('host');
  const userAgent = request.headers.get('user-agent');

  // 1) Honeypot — silent accept, nothing delivered.
  if (opts.honeypot) return { kind: 'honeypot' };

  // 2) Rate limits (fail-open inside rateLimit).
  if (!(await rateLimit(`${opts.routeKey}:ip:${ip}`, opts.ipLimit[0], opts.ipLimit[1]))) {
    return { kind: 'rate_limited' };
  }
  const email = fields.email ?? '';
  if (email && opts.emailLimit) {
    const key = `${opts.routeKey}:email:${canonicalEmail(email)}`;
    if (!(await rateLimit(key, opts.emailLimit[0], opts.emailLimit[1]))) {
      return { kind: 'rate_limited' };
    }
  }

  // 3) Turnstile.
  let turnstileUnavailable = false;
  if (isTurnstileEnabled()) {
    const token = typeof opts.turnstileToken === 'string' ? opts.turnstileToken : '';
    if (!token) return { kind: 'captcha_fail' };
    const verdict = await verifyTurnstile({ token, ip });
    if (verdict === 'fail') return { kind: 'captcha_fail' };
    if (verdict === 'unavailable') turnstileUnavailable = true; // continue, scored below
  }

  // 4) Form token (time-to-submit).
  const tokenState = checkFormToken(opts.formToken);
  if (tokenState === 'stale') return { kind: 'stale_token' };

  // 5) Spam score.
  const disposable = email ? isDisposable(emailDomain(email)) : false;
  const meta: SpamMeta = {
    honeypot: false,
    disposable,
    formToken: tokenState === 'missing' ? 'missing' : tokenState === 'fast' ? 'fast' : 'ok',
    turnstileUnavailable,
  };
  const { score, reasons } = scoreSubmission({ fields, meta });

  return {
    kind: 'ok',
    disposable,
    spam: { score, reasons, flagged: score >= FLAG_THRESHOLD, ip, host, userAgent },
  };
}
