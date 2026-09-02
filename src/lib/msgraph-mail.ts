// ============================================================================
// MICROSOFT 365 MAIL — send e-mail via Microsoft Graph (client credentials).
//
// The preferred transport for a Microsoft-first organisation: mail goes out
// through the company's own Exchange Online mailbox — no third-party e-mail
// service, no extra npm dependency (plain fetch), full attachment + recipient
// support, and the message lands in the sender's Sent Items.
//
// SETUP (once, in Microsoft Entra admin center — entra.microsoft.com):
//   1. Identity → Applications → App registrations → New registration
//      (e.g. "STRETCH Website Mailer"; single tenant; no redirect URI).
//   2. API permissions → Add → Microsoft Graph → APPLICATION permissions →
//      Mail.Send → Add, then "Grant admin consent".
//   3. Certificates & secrets → New client secret → copy the VALUE.
//   4. Environment variables (Vercel):
//        MS_TENANT_ID     = Directory (tenant) ID from the app's Overview
//        MS_CLIENT_ID     = Application (client) ID
//        MS_CLIENT_SECRET = the secret value from step 3
//        MS_GRAPH_SENDER  = mailbox to send from, e.g. website@stretchgroup.be
//                           (a shared mailbox works and needs no licence)
//   Optional hardening: scope the app to that one mailbox with an
//   ApplicationAccessPolicy (Exchange Online PowerShell) so Mail.Send cannot
//   be used for any other mailbox.
// ============================================================================

export type GraphAttachment = { filename: string; content: Buffer };

export function isGraphMailConfigured(): boolean {
  return Boolean(
    process.env.MS_TENANT_ID &&
      process.env.MS_CLIENT_ID &&
      process.env.MS_CLIENT_SECRET &&
      process.env.MS_GRAPH_SENDER,
  );
}

// Token cache survives warm serverless invocations.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.token;
  const tenant = process.env.MS_TENANT_ID!;
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID!,
      client_secret: process.env.MS_CLIENT_SECRET!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  });
  if (!res.ok) throw new Error(`Graph token request failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

function mimeFor(filename: string): string {
  if (filename.endsWith('.pdf')) return 'application/pdf';
  if (filename.endsWith('.json')) return 'application/json';
  if (filename.endsWith('.dxf')) return 'application/dxf';
  if (filename.endsWith('.zip')) return 'application/zip';
  return 'application/octet-stream';
}

/** Send one e-mail via Graph as MS_GRAPH_SENDER. Throws on failure. */
export async function sendGraphMail(msg: {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: GraphAttachment[];
}): Promise<void> {
  const token = await getToken();
  const sender = process.env.MS_GRAPH_SENDER!;
  const body = {
    message: {
      subject: msg.subject,
      body: { contentType: 'HTML', content: msg.html },
      toRecipients: [{ emailAddress: { address: msg.to } }],
      ...(msg.replyTo ? { replyTo: [{ emailAddress: { address: msg.replyTo } }] } : {}),
      attachments: (msg.attachments ?? []).map((a) => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: a.filename,
        contentType: mimeFor(a.filename),
        contentBytes: a.content.toString('base64'),
      })),
    },
    saveToSentItems: true,
  };
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (res.status !== 202) {
    throw new Error(`Graph sendMail failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
}
