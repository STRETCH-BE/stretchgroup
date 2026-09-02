'use client';

// Microsoft Clarity. Gated on the ANALYTICS consent category: only injects the
// script once analytics consent is granted. Listens for live consent changes.
// One domain → one project ID: NEXT_PUBLIC_CLARITY_ID. Unset → no-op.
import { useEffect, useState } from 'react';
import { getConsent, CONSENT_UPDATE_EVENT, type ConsentPreferences } from '@/lib/consent';

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function Clarity() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(Boolean(getConsent()?.analytics));
    sync();
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail;
      setAllowed(Boolean(detail?.analytics ?? getConsent()?.analytics));
    };
    window.addEventListener(CONSENT_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(CONSENT_UPDATE_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    if (!CLARITY_ID) return;
    if (!allowed) {
      // Consent revoked mid-session — stop the recording immediately.
      window.clarity?.('stop');
      return;
    }
    if (!document.getElementById('clarity-script')) {
      const s = document.createElement('script');
      s.id = 'clarity-script';
      s.type = 'text/javascript';
      s.async = true;
      s.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `;
      document.head.appendChild(s);
    }
    window.clarity?.('consent');
    window.clarity?.('start');
  }, [allowed]);

  return null;
}
