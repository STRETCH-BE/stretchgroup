// ============================================================================
// EMAIL NORMALISATION + BLOCKLISTS — one list, one place.
//
// canonicalEmail() collapses the aliases bots use to look unique:
// '+' suffixes everywhere, and the Gmail dot-trick
// (j.eq.u.xa.nole9.0@gmail.com → jequxanole90@gmail.com). The canonical form
// is what portal signups deduplicate on (portal_users.canonical_email).
//
// isDisposable() is server-only: the `disposable-email-domains` list
// (~120k domains) must never reach a client bundle.
// ============================================================================

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

/** Free consumer mail providers relevant to our markets. Freemail is a
 *  review signal (architect signups), NEVER a rejection. */
const FREEMAIL = [
  'gmail.com', 'googlemail.com',
  'hotmail.com', 'hotmail.be', 'hotmail.nl', 'hotmail.fr', 'hotmail.de', 'hotmail.co.uk', 'hotmail.es', 'hotmail.it',
  'outlook.com', 'outlook.be', 'outlook.fr', 'outlook.de', 'outlook.es',
  'live.com', 'live.be', 'live.nl', 'live.fr', 'live.de',
  'msn.com',
  'yahoo.com', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.co.uk', 'yahoo.pl',
  'icloud.com', 'me.com',
  'proton.me', 'protonmail.com',
  'gmx.com', 'gmx.de', 'gmx.net', 'gmx.at', 'gmx.ch',
  'web.de', 'aol.com', 'mail.com', 'yandex.com', 'yandex.ru',
  'telenet.be', 'skynet.be', 'proximus.be',
];
const FREEMAIL_SET = new Set(FREEMAIL);

export function emailDomain(email: string): string {
  const at = email.lastIndexOf('@');
  return at > -1 ? email.slice(at + 1).toLowerCase().trim() : '';
}

/** Lowercase + trim; strip +suffix; collapse Gmail dots. */
export function canonicalEmail(email: string): string {
  const e = String(email ?? '').trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 1) return e;
  let local = e.slice(0, at);
  const domain = e.slice(at + 1);
  const plus = local.indexOf('+');
  if (plus > -1) local = local.slice(0, plus);
  if (GMAIL_DOMAINS.has(domain)) local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

export function isFreemail(domain: string): boolean {
  return FREEMAIL_SET.has(domain.toLowerCase());
}

/** Dots in the local part — the Gmail alias trick leaves a trail of them. */
export function gmailDotCount(email: string): number {
  const e = String(email ?? '').toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 1) return 0;
  if (!GMAIL_DOMAINS.has(e.slice(at + 1))) return 0;
  return (e.slice(0, at).match(/\./g) ?? []).length;
}

let disposableSet: Set<string> | null = null;

/** SERVER ONLY — lazily loads the disposable-domain list on first use. */
export function isDisposable(domain: string): boolean {
  if (!domain) return false;
  if (!disposableSet) {
    const list = require('disposable-email-domains') as string[];
    disposableSet = new Set(list);
  }
  return disposableSet.has(domain.toLowerCase());
}
