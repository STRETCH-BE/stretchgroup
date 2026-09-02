// Consent Mode v2 defaults. Renders an INLINE, synchronous <script> into
// <head> so it runs before any analytics loads. Sets everything to denied,
// then immediately re-applies any stored preference. GA still loads (gated by
// consent mode) and sends cookieless modelled hits until consent is granted —
// recovering ~30–50% of EU attribution. NOT next/script: must be synchronous.
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from '@/lib/consent';

const SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments)}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
try {
  var raw = window.localStorage.getItem('${CONSENT_STORAGE_KEY}');
  if (raw) {
    var prefs = JSON.parse(raw);
    if (prefs && prefs.version === ${CONSENT_VERSION}) {
      gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
        ad_user_data: prefs.marketing ? 'granted' : 'denied',
        ad_personalization: prefs.marketing ? 'granted' : 'denied'
      });
    }
  }
} catch (e) {}
`.trim();

export default function ConsentModeDefaults() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
