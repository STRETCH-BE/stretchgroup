// ============================================================================
// CLOUDFLARE TURNSTILE — sitekey/secret resolution + server-side verification.
// One widget (one domain + previews + localhost fits within Turnstile's
// 10-hostname limit, unlike the 13-domain product site).
//
// ZERO-CONFIG RULE: with no TURNSTILE env vars set, isTurnstileEnabled() is
// false, no widget renders and no verification happens.
//
// This module is imported by BOTH the client widget (sitekey only —
// NEXT_PUBLIC vars are inlined at build) and the server route (the secret is
// read lazily inside the server-only function, so it never reaches a bundle).
// ============================================================================

/** Hostnames the Turnstile widget is registered for (Cloudflare dashboard). */
export const TURNSTILE_HOSTS = ['stretchgroup.be', 'www.stretchgroup.be', 'localhost'] as const;

function normalizeHost(host: string | null | undefined): string {
  return (host ?? '').toLowerCase().split(':')[0];
}

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY);
}

/** Sitekey (client-safe). Empty string when Turnstile is disabled. */
export function turnstileSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || '';
}

export type TurnstileVerdict = 'pass' | 'fail' | 'unavailable';

let warnedMissingSecret = false;

/**
 * Verify a Turnstile token with Cloudflare. 'unavailable' (network error /
 * 5xx / timeout) lets callers continue with a score penalty instead of
 * dropping a possibly-real lead.
 */
export async function verifyTurnstile(opts: { token: string; ip?: string | null }): Promise<TurnstileVerdict> {
  const secret = process.env.TURNSTILE_SECRET || '';
  if (!secret) {
    // Half-configured (sitekey set, secret missing): the widget renders and a
    // token arrives, but nothing can verify it. Never wave it through — treat
    // it like a siteverify outage (spam score +40) and say so once.
    if (!warnedMissingSecret) {
      console.warn('[turnstile] NEXT_PUBLIC_TURNSTILE_SITEKEY is set but TURNSTILE_SECRET is not — tokens cannot be verified; submissions are scored instead. Set both or neither.');
      warnedMissingSecret = true;
    }
    return 'unavailable';
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const body = new URLSearchParams({ secret, response: opts.token });
    if (opts.ip) body.set('remoteip', opts.ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });
    if (!res.ok) return res.status >= 500 ? 'unavailable' : 'fail';
    const json = (await res.json()) as { success?: boolean; hostname?: string };
    if (!json.success) return 'fail';
    // A valid token minted on a hostname that is not ours = replayed from
    // elsewhere → fail. Vercel previews are allowed for QA.
    const tokenHost = normalizeHost(json.hostname);
    const known = (TURNSTILE_HOSTS as readonly string[]).includes(tokenHost) || tokenHost.endsWith('.vercel.app');
    if (tokenHost && !known) return 'fail';
    return 'pass';
  } catch {
    return 'unavailable';
  } finally {
    clearTimeout(timer);
  }
}
