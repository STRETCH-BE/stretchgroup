// ============================================================================
// SPAM SCORING — one pure function, no I/O. Callers compute the I/O-derived
// facts (disposable domain, form-token state, Turnstile verdict) and pass
// them in `meta`; everything else is derived from the submitted fields.
//
// Threshold contract (used by the routes):
//   score >= FLAG_THRESHOLD (60)  → flagged: stored but not delivered.
//   score >= HARD_THRESHOLD (100) → hard: signups are refused outright.
//
// The weights live in one place below. Tests: scripts/spam-score.test.mjs
// (run with `npm test`) pins the real spam row ≥ 100 and three anonymised
// legitimate submissions < 60.
// ============================================================================
import { gmailDotCount } from './email';

export const WEIGHTS = {
  honeypot: 100,
  invalidEmail: 100,
  disposableDomain: 60,
  gmailDots: 30, // local part with >= 3 dots
  randomCaseField: 50, // per field, capped
  randomCaseCap: 100,
  consonantRun: 20, // >= 7 consonants in a name-like field
  badPhone: 20,
  manyUrls: 50, // >= 3 URLs in the message
  spamLexicon: 30,
  identicalFields: 30, // name/company/city pairwise identical non-words
  tokenMissing: 40,
  tokenTooFast: 60,
  turnstileUnavailable: 40,
} as const;

export const FLAG_THRESHOLD = 60;
export const HARD_THRESHOLD = 100;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+0-9][0-9 ()./-]{6,19}$/;
// Name-like fields checked for consonant runs (Szczepański, Chrzanowski and
// Pszczyna must pass — their runs stay under 7; 'y' counts as a vowel here
// precisely so Polish and Czech names survive).
const NAMEISH = ['name', 'fullName', 'contactName', 'company', 'city', 'office', 'location'];
const CONSONANT_RUN = /[bcdfghjklmnpqrstvwxzßçñ]{7,}/i;
const SPAM_LEXICON = [
  'seo service', 'seo services', 'backlink', 'guest post', 'casino', 'crypto',
  'viagra', 'cialis', 'dear website owner', 'dear site owner',
  'increase your ranking', 'boost your ranking', 'web traffic', 'buy followers',
  'loan offer', 'binary options', 'adult content', 'escort',
];

/** One whitespace-free run of letters, >= 8 chars, with >= 3 lowercase→
 *  uppercase switches inside it. McDonald (1), iPhone (1), VanDenBroucke (2)
 *  and Verbandsgemeinde (0) pass; clijtFrEseYMSzYhHMkCb does not. */
export function hasRandomCaseWord(value: string): boolean {
  for (const run of value.split(/\s+/)) {
    const letters = run.replace(/[^\p{L}]/gu, '');
    if (letters.length < 8) continue;
    const switches = (letters.match(/\p{Ll}\p{Lu}/gu) ?? []).length;
    if (switches >= 3) return true;
  }
  return false;
}

function looksNonDictionary(value: string): boolean {
  if (/\s/.test(value) || value.length < 8) return false;
  if (hasRandomCaseWord(value)) return true;
  const letters = value.replace(/[^\p{L}]/gu, '');
  if (!letters) return false;
  const vowels = (letters.match(/[aeiouyàáâäåæèéêëìíîïòóôöøùúûüœ]/gi) ?? []).length;
  return vowels / letters.length < 0.25;
}

export type SpamMeta = {
  honeypot?: boolean;
  disposable?: boolean;
  /** 'ok' | 'missing' | 'fast' — computed by the route from the form token. */
  formToken?: 'ok' | 'missing' | 'fast';
  turnstileUnavailable?: boolean;
};

export function scoreSubmission({
  fields,
  meta,
}: {
  fields: Record<string, string>;
  meta?: SpamMeta;
}): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(`${reason} (+${points})`);
  };

  if (meta?.honeypot) add(WEIGHTS.honeypot, 'honeypot');

  const email = fields.email ?? '';
  if (email && !EMAIL_RE.test(email)) add(WEIGHTS.invalidEmail, 'invalid_email');
  if (meta?.disposable) add(WEIGHTS.disposableDomain, 'disposable_domain');
  if (gmailDotCount(email) >= 3) add(WEIGHTS.gmailDots, 'gmail_dot_trick');

  // Random-case gibberish across every text field, capped.
  let randomCase = 0;
  for (const [key, value] of Object.entries(fields)) {
    if (key === 'email' || key === 'phone' || key === 'source') continue;
    if (typeof value === 'string' && hasRandomCaseWord(value)) {
      randomCase += WEIGHTS.randomCaseField;
      if (randomCase >= WEIGHTS.randomCaseCap) break;
    }
  }
  if (randomCase > 0) add(Math.min(randomCase, WEIGHTS.randomCaseCap), 'random_case');

  for (const key of NAMEISH) {
    const v = fields[key];
    if (v && CONSONANT_RUN.test(v)) {
      add(WEIGHTS.consonantRun, `consonant_run:${key}`);
      break; // one hit is signal enough
    }
  }

  const phone = fields.phone ?? '';
  if (phone && !PHONE_RE.test(phone)) add(WEIGHTS.badPhone, 'bad_phone');

  const message = fields.message ?? '';
  const urls = (message.match(/https?:\/\/|www\./gi) ?? []).length;
  if (urls >= 3) add(WEIGHTS.manyUrls, 'many_urls');
  const lower = message.toLowerCase();
  if (SPAM_LEXICON.some((term) => lower.includes(term))) add(WEIGHTS.spamLexicon, 'spam_lexicon');

  // name / company / city pairwise identical non-dictionary strings.
  const trio = [fields.name, fields.company, fields.city]
    .map((v) => (v ?? '').trim().toLowerCase())
    .filter(Boolean);
  outer: for (let i = 0; i < trio.length; i++) {
    for (let j = i + 1; j < trio.length; j++) {
      if (trio[i] === trio[j] && looksNonDictionary(trio[i])) {
        add(WEIGHTS.identicalFields, 'identical_fields');
        break outer;
      }
    }
  }

  if (meta?.formToken === 'missing') add(WEIGHTS.tokenMissing, 'form_token_missing');
  if (meta?.formToken === 'fast') add(WEIGHTS.tokenTooFast, 'form_token_fast');
  if (meta?.turnstileUnavailable) add(WEIGHTS.turnstileUnavailable, 'turnstile_unavailable');

  return { score, reasons };
}
