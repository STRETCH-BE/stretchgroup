// ============================================================================
// EMAIL — builds the lead-notification email (HTML + plain text) from a
// submitted payload. All values are HTML-escaped before interpolation.
// Flagged (suspected spam) submissions are NOT dropped: the group site has
// no lead database, so instead of "store but don't deliver" they are
// delivered with a loud review banner and a [REVIEW] subject prefix.
// ============================================================================
import { brand } from '@/lib/site-config';

export type LeadPayload = {
  source: string;
  // Free-form: different forms submit different field sets. We render whatever
  // is present, in a stable order, with friendly labels.
  [key: string]: unknown;
};

export type SpamNote = { score: number; reasons: string[] };

/** Minimal HTML escaping for any string rendered into the email body. */
export function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Human labels for known field keys (anything else is title-cased).
const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  company: 'Company',
  email: 'Email',
  phone: 'Phone',
  about: 'About (company)',
  subject: 'Subject',
  message: 'Message',
  locale: 'Language',
};

const SOURCE_LABELS: Record<string, string> = {
  contact: 'Contact form',
  careers: 'Open application',
};

// Stable option keys posted by the "which company is this about?" select →
// readable labels for the internal email.
const ABOUT_LABELS: Record<string, string> = {
  group: 'STRETCH Group (general)',
  stretch: 'STRETCH — ceilings & walls (stretchplafond.be / stretch.mt)',
  'stretch-sufit': 'Stretch Sufit / Alto Design — Poland (altodesign.pl)',
  're-sound': 'Re-Sound — acoustics (re-sound.be)',
  'stretch-metal': 'Stretch Metal — metal fabrication (stretchmetal.pl)',
  careers: 'Careers / open application',
};

function displayValue(key: string, value: unknown): string {
  const v = String(value);
  if (key === 'about') return ABOUT_LABELS[v] ?? v;
  return v;
}

function labelFor(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

const ORDER = Object.keys(FIELD_LABELS);

function orderedEntries(payload: LeadPayload): [string, unknown][] {
  const skip = new Set(['source']);
  const keys = Object.keys(payload).filter((k) => !skip.has(k));
  keys.sort((a, b) => {
    const ia = ORDER.indexOf(a);
    const ib = ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return keys
    .map((k) => [k, payload[k]] as [string, unknown])
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
}

export type BuiltEmail = { subject: string; html: string; text: string };

export function buildLeadEmail(payload: LeadPayload, spam?: SpamNote): BuiltEmail {
  const sourceLabel = SOURCE_LABELS[payload.source as string] || 'Website message';
  const entries = orderedEntries(payload);
  const flagged = Boolean(spam);

  const subject = `${flagged ? '[REVIEW] ' : ''}New ${sourceLabel} — ${brand.name} website`;

  const spamBannerHtml = spam
    ? `<tr><td style="padding:0 24px;">
      <div style="background:#FFF3F3;border:1px solid #E00000;border-left:6px solid #E00000;padding:14px 16px;margin:20px 0 0;">
        <div style="font:800 13px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#B00000;">Suspected spam — review before replying</div>
        <div style="font:400 13.5px Arial,sans-serif;color:#54514B;margin-top:6px;">Score ${spam.score}: ${escapeHtml(spam.reasons.join(', '))}</div>
      </div>
    </td></tr>`
    : '';

  const rows = entries
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #ECEAE6;font:600 12px Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#6E6B66;white-space:nowrap;vertical-align:top;">${escapeHtml(
            labelFor(k),
          )}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #ECEAE6;font:400 15px Arial,sans-serif;color:#0A0A0A;">${escapeHtml(
            displayValue(k, v),
          ).replace(/\n/g, '<br>')}</td>
        </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;background:#F4F3F1;padding:24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #ECEAE6;">
    <tr><td style="background:#0A0A0A;padding:20px 24px;">
      <span style="font:900 22px Arial,sans-serif;letter-spacing:-.02em;color:#fff;">STRETCH</span><span style="font:900 22px Arial,sans-serif;letter-spacing:-.02em;color:#FF1A1A;"> GROUP</span>
      <div style="font:600 11px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#FF1A1A;margin-top:6px;">${escapeHtml(
        sourceLabel,
      )}</div>
    </td></tr>
    ${spamBannerHtml}
    <tr><td style="padding:24px;">
      <p style="font:400 15px Arial,sans-serif;color:#54514B;margin:0 0 18px;">A new message was submitted from the ${brand.name} website.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ECEAE6;border-collapse:collapse;">${rows}</table>
      <p style="font:400 12px Arial,sans-serif;color:#9A968F;margin:18px 0 0;">Source: ${escapeHtml(
        String(payload.source ?? 'unknown'),
      )} · Sent automatically by the website.</p>
    </td></tr>
  </table>
</body></html>`;

  const text =
    `${subject}\n\n` +
    (spam ? `SUSPECTED SPAM — score ${spam.score}: ${spam.reasons.join(', ')}\n\n` : '') +
    entries.map(([k, v]) => `${labelFor(k)}: ${displayValue(k, v)}`).join('\n') +
    `\n\nSource: ${String(payload.source ?? 'unknown')}`;

  return { subject, html, text };
}
