'use client';

// GDPR consent banner + preference center. First-visit banner with Accept all /
// Reject all / Customize. Customize reveals three toggles (Necessary always on,
// Analytics, Marketing). Persists via setConsent (which also pushes the Consent
// Mode v2 update + fires consent-update). Reopens on the consent-open-banner
// event from the footer "Manage cookies" link.
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  getConsent,
  setConsent,
  hasConsentDecision,
  CONSENT_OPEN_BANNER_EVENT,
} from '@/lib/consent';

export default function CookieConsent() {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(true);
  const [marketingOn, setMarketingOn] = useState(true);

  useEffect(() => {
    if (!hasConsentDecision()) setVisible(true);
    const reopen = () => {
      const current = getConsent();
      setAnalyticsOn(current?.analytics ?? true);
      setMarketingOn(current?.marketing ?? true);
      setCustomizing(true);
      setVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_BANNER_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_BANNER_EVENT, reopen);
  }, []);

  function persist(analytics: boolean, marketing: boolean) {
    setConsent({ analytics, marketing });
    setVisible(false);
    setCustomizing(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      aria-live="polite"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 900,
        background: '#fff',
        borderTop: '2px solid var(--black)',
        boxShadow: '0 -20px 50px rgba(0,0,0,.16)',
      }}
    >
      <div
        className="container"
        style={{ paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div
          style={{
            display: 'flex',
            gap: 28,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <h2
              className="h2 h2--sm"
              style={{ fontSize: 20, marginBottom: 8 }}
            >
              {t('title')}
            </h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
              {t('body')}{' '}
              <Link href="/privacy" style={{ color: 'var(--red)', textDecoration: 'underline' }}>
                {t('privacyLink')}
              </Link>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {!customizing && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setCustomizing(true)}
              >
                {t('customize')}
              </button>
            )}
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => persist(false, false)}
            >
              {t('rejectAll')}
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => persist(true, true)}
            >
              {t('acceptAll')}
            </button>
          </div>
        </div>

        {customizing && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 1,
              background: 'var(--border)',
              border: '1px solid var(--border)',
            }}
          >
            <ToggleRow label={t('necessary')} desc={t('necessaryDesc')} state="locked" stateLabel={t('always')} />
            <ToggleRow
              label={t('analytics')}
              desc={t('analyticsDesc')}
              state={analyticsOn ? 'on' : 'off'}
              onToggle={() => setAnalyticsOn((v) => !v)}
            />
            <ToggleRow
              label={t('marketing')}
              desc={t('marketingDesc')}
              state={marketingOn ? 'on' : 'off'}
              onToggle={() => setMarketingOn((v) => !v)}
            />
            <div
              style={{
                background: '#fff',
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                className="btn btn--dark btn--sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => persist(analyticsOn, marketingOn)}
              >
                {t('save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  state,
  stateLabel,
  onToggle,
}: {
  label: string;
  desc: string;
  state: 'on' | 'off' | 'locked';
  stateLabel?: string;
  onToggle?: () => void;
}) {
  const on = state === 'on';
  const locked = state === 'locked';
  return (
    <div style={{ background: '#fff', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--text)',
          }}
        >
          {label}
        </span>
        {locked ? (
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--text-faint-2)',
            }}
          >
            {stateLabel}
          </span>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            onClick={onToggle}
            style={{
              width: 42,
              height: 24,
              border: 'none',
              cursor: 'pointer',
              background: on ? 'var(--red)' : '#cfccc6',
              position: 'relative',
              transition: 'background .2s',
              flex: '0 0 auto',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: on ? 21 : 3,
                width: 18,
                height: 18,
                background: '#fff',
                transition: 'left .2s',
              }}
            />
          </button>
        )}
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-faint)', margin: 0 }}>{desc}</p>
    </div>
  );
}
