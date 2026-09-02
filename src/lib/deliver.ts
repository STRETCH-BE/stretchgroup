// ============================================================================
// LEAD DELIVERY — graceful, zero-config multi-method send.
// Tries, in order: Microsoft 365 Graph (MS_* vars) → generic webhook
// (LEAD_WEBHOOK_URL — a Power Automate flow into leads@stretchgroup.be is the
// fastest production path, see README) → SMTP/Nodemailer (SMTP_HOST) →
// log-only. The site works with no env vars at all (log-only), so it never
// hard-fails. PII is never logged — only the lead source, the destination
// and the submitter's email domain — with ONE deliberate exception: when a
// transport IS configured and every configured transport fails, the message
// would otherwise exist nowhere (this site has no lead database), so the
// payload is written to the server log as `[lead] UNDELIVERED` and the route
// answers 502 so the visitor sees the error state and the e-mail address.
// [TO CONFIRM] which delivery method production uses (README → env table).
// ============================================================================
import { buildLeadEmail, type LeadPayload, type SpamNote } from '@/lib/email';
import { contact } from '@/lib/site-config';
import { isGraphMailConfigured, sendGraphMail } from '@/lib/msgraph-mail';

export type DeliveryResult = { ok: true; method: 'graph' | 'webhook' | 'smtp' | 'log' };

function emailDomain(payload: LeadPayload): string {
  const e = typeof payload.email === 'string' ? payload.email : '';
  const at = e.lastIndexOf('@');
  return at > -1 ? e.slice(at + 1) : 'n/a';
}

function logIssue(method: string, err: unknown) {
  // Log the failure WITHOUT any submitted personal data.
  console.error(`[lead] ${method} delivery failed: ${err instanceof Error ? err.message : 'unknown error'}`);
}

export async function deliverLead(payload: LeadPayload, spam?: SpamNote): Promise<DeliveryResult> {
  const built = buildLeadEmail(payload, spam);
  const to = contact.leadDestination;
  const from =
    process.env.LEAD_FROM_EMAIL ||
    `STRETCH Group Website <website@${contact.email.split('@')[1] || 'stretchgroup.be'}>`;
  // Reply-To only for one syntactically valid address (the route validates
  // too; header injection via a crafted address is impossible either way).
  const replyTo =
    typeof payload.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email) ? payload.email : undefined;
  let configured = 0;

  // 0) Microsoft 365 (Graph) — the company's own mailbox, preferred ---------
  if (isGraphMailConfigured()) {
    configured++;
    try {
      await sendGraphMail({ to, replyTo, subject: built.subject, html: built.html });
      return { ok: true, method: 'graph' };
    } catch (err) {
      logIssue('graph', err);
    }
  }

  // 1) Generic webhook (Power Automate / Zapier / Make) ----------------------
  if (process.env.LEAD_WEBHOOK_URL) {
    configured++;
    try {
      const res = await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: built.subject,
          body: built.html,
          text: built.text,
          isHtml: true,
          to,
          meta: payload,
          ...(spam ? { spam } : {}),
        }),
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
      return { ok: true, method: 'webhook' };
    } catch (err) {
      logIssue('webhook', err);
    }
  }

  // 2) SMTP via Nodemailer (optional dependency, loaded only when set) -------
  if (process.env.SMTP_HOST) {
    configured++;
    try {
      const nodemailer = await import('nodemailer');
      const port = Number(process.env.SMTP_PORT || 587);
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      });
      await transport.sendMail({
        from: process.env.SMTP_FROM || from,
        to,
        replyTo,
        subject: built.subject,
        html: built.html,
        text: built.text,
      });
      return { ok: true, method: 'smtp' };
    } catch (err) {
      logIssue('smtp', err);
    }
  }

  // 3a) Every configured transport failed — do NOT pretend success ---------
  if (configured > 0) {
    console.error(
      `[lead] UNDELIVERED — all ${configured} configured delivery method(s) failed for "${String(payload.source)}" → ${to}. Recover the message from this line: ${JSON.stringify(payload)}`,
    );
    throw new Error('all configured delivery methods failed');
  }

  // 3b) Log-only (nothing configured) -------------------------------------
  console.info(
    `[lead] received "${String(payload.source)}" → ${to} (no delivery method configured; submitter domain: ${emailDomain(payload)}${spam ? `; flagged score ${spam.score}` : ''})`,
  );
  return { ok: true, method: 'log' };
}
