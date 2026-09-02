// ============================================================================
// CONSENT — state, persistence and events for the cookie banner + Consent
// Mode v2. Stored in localStorage under `consent-preferences`. Bumping
// CONSENT_VERSION invalidates stored preferences and re-prompts everyone.
// ============================================================================

export const CONSENT_VERSION = 1 as const;
export const CONSENT_STORAGE_KEY = 'consent-preferences';

// Custom DOM events used to coordinate banner <-> analytics without a library.
export const CONSENT_UPDATE_EVENT = 'consent-update';
export const CONSENT_OPEN_BANNER_EVENT = 'consent-open-banner';

export type ConsentPreferences = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string; // ISO
};

export const DENIED_PREFERENCES: Omit<ConsentPreferences, 'timestamp'> = {
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
};

/** Read + validate stored preferences. Returns null if absent/stale/invalid. */
export function getConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persist preferences and broadcast a consent-update event. */
export function setConsent(prefs: { analytics: boolean; marketing: boolean }): ConsentPreferences {
  const full: ConsentPreferences = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    timestamp: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(full));
  } catch {
    /* storage may be unavailable (private mode) — still fire the event */
  }
  // Push the matching Consent Mode v2 update so GA reacts immediately.
  try {
    window.gtag?.('consent', 'update', {
      analytics_storage: full.analytics ? 'granted' : 'denied',
      ad_storage: full.marketing ? 'granted' : 'denied',
      ad_user_data: full.marketing ? 'granted' : 'denied',
      ad_personalization: full.marketing ? 'granted' : 'denied',
    });
  } catch {
    /* gtag may not be present */
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATE_EVENT, { detail: full }));
  } catch {
    /* no-op */
  }
  return full;
}

/** Has the user made any choice yet? */
export function hasConsentDecision(): boolean {
  return getConsent() !== null;
}
