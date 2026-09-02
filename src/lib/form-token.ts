// ============================================================================
// FORM TOKEN — a signed issue-timestamp every public form fetches on mount
// (GET /api/form-token) and posts back as `formToken`. It measures
// time-to-submit: bots post within milliseconds of "opening" a form.
//
//   token = base64url(issuedAtMs) + '.' + HMAC-SHA256(base64url(issuedAtMs))
//
// Secret: FORM_SIGNING_SECRET. Not
// set → the feature is OFF and routes accept a missing token (zero-config).
//
// Server rules (applied by the routes via checkFormToken):
//   missing/invalid while enabled → spam score +40
//   age < 3 s                     → spam score +60 (too fast for a human)
//   age > 6 h                     → 400 'stale_token'; the client silently
//                                   refetches a token and retries once.
// The datasheet one-click confirm for returning visitors is EXEMPT from the
// < 3 s rule — a real person legitimately clicks instantly.
// ============================================================================
import { createHmac, timingSafeEqual } from 'crypto';

const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

function secret(): string {
  return process.env.FORM_SIGNING_SECRET || '';
}

export function isFormTokenEnabled(): boolean {
  return Boolean(secret());
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function mintFormToken(): string {
  const payload = Buffer.from(String(Date.now()), 'utf8').toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export type FormTokenState = 'ok' | 'missing' | 'fast' | 'stale' | 'disabled';

/** minAgeMs = 0 exempts a flow from the too-fast rule (one-click confirm). */
export function checkFormToken(token: unknown, opts?: { minAgeMs?: number }): FormTokenState {
  if (!isFormTokenEnabled()) return 'disabled';
  if (typeof token !== 'string' || !token.includes('.')) return 'missing';
  const [payload, mac] = token.split('.', 2);
  const expected = sign(payload);
  const a = Buffer.from(mac ?? '', 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return 'missing'; // tampered = as-if absent
  const issuedAt = Number(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!Number.isFinite(issuedAt)) return 'missing';
  const age = Date.now() - issuedAt;
  if (age > MAX_AGE_MS) return 'stale';
  const minAge = opts?.minAgeMs ?? MIN_AGE_MS;
  if (age < minAge) return 'fast';
  return 'ok';
}
