// ============================================================================
// ANALYTICS — one track() that fires into every active platform, plus typed
// wrappers for the canonical event taxonomy. Consent-aware: GA4 is gated by
// Consent Mode v2 (so it always loads and sends modelled hits); Clarity is
// only injected after analytics consent (see components/analytics/Clarity).
// The group site runs GA4 + Clarity only (no Meta / Bing).
// ============================================================================

// Browser globals injected by third-party scripts. Typed loosely on purpose.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export type EventProps = Record<string, string | number | boolean | undefined>;

export function track(eventName: string, props?: EventProps): void {
  if (typeof window === 'undefined') return;

  // GA4 — Consent Mode handles gating, so always attempt to send.
  try {
    window.gtag?.('event', eventName, props || {});
  } catch {
    /* no-op */
  }

  // Clarity custom tags (Clarity itself is gated on the analytics category at
  // load time; setting tags is harmless if it never loaded).
  try {
    if (typeof window.clarity === 'function' && props) {
      for (const [k, v] of Object.entries(props)) {
        if (v != null) window.clarity('set', k, String(v));
      }
    }
  } catch {
    /* no-op */
  }
}

// ---------------------------------------------------------------------------
// Typed wrappers — the canonical events for a routing site: outbound clicks
// to the company sites are the conversion.
// ---------------------------------------------------------------------------
export const analytics = {
  submitContactForm(success: boolean, about?: string) {
    track('contact', { success, about });
  },
  outboundClick(company: string, location: string, url: string) {
    track('outbound_company_click', { company, location, url });
  },
  phoneClick(location: string) {
    track('phone_click', { location });
  },
  emailClick(location: string) {
    track('email_click', { location });
  },
  whatsappClick(location: string) {
    track('whatsapp_click', { location });
  },
  languageSwitch(from: string, to: string, path: string) {
    track('language_switch', { from, to, path });
  },
  scrollDepth(percent: number, page: string) {
    track('scroll_depth', { percent, page });
  },
};
