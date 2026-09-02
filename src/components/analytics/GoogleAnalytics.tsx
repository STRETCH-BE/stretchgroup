'use client';

// GA4 loader. Loads gtag.js on EVERY page regardless of consent — Consent Mode
// v2 (set in ConsentModeDefaults) gates whether cookies/identifiers are used.
// One domain → one measurement ID: NEXT_PUBLIC_GA_ID. Unset → renders nothing.
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      {/* lazyOnload: gtag.js stays off the load-critical path so it never
          competes with the LCP; hits queue in dataLayer and are processed
          once the script arrives after the load event. */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments)}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
