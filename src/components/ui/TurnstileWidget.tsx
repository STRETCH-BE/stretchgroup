'use client';

// Cloudflare Turnstile widget — lazily loads the script ONLY when a form
// that needs it mounts (never globally), renders explicitly with the
// sitekey, 'interaction-only' appearance (invisible unless Cloudflare
// decides to challenge). Renders nothing when Turnstile is disabled (no
// NEXT_PUBLIC_TURNSTILE_SITEKEY → zero-config rule).
//
// EXECUTE-ON-SUBMIT: the challenge does NOT run at page load. The submit
// handler calls execute() (via useFormSecurity.waitForTurnstile) and a token
// is minted RIGHT THEN, seconds before the server verifies it — tokens are
// single-use and short-lived, so one minted at page load could expire while
// a visitor writes a long message.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { turnstileSiteKey, isTurnstileEnabled } from '@/lib/turnstile';
import { contact } from '@/lib/site-config';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
      execute: (id?: string, opts?: Record<string, unknown>) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null; // allow a retry on next mount
        reject(new Error('turnstile script failed'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

// Turnstile-supported language tags for our locales (unknown → 'auto').
const TURNSTILE_LANG: Record<string, string> = { en: 'en', nl: 'nl', fr: 'fr', de: 'de', pl: 'pl' };

export type TurnstileHandle = {
  reset: () => void;
  /** Start a FRESH challenge run (execute mode). Returns false when the
   *  widget is not ready (script blocked / not rendered yet). */
  execute: () => boolean;
};

const TurnstileWidget = forwardRef<TurnstileHandle, { onToken: (token: string | null) => void }>(
  function TurnstileWidget({ onToken }, ref) {
    const locale = useLocale();
    const t = useTranslations('security');
    const holder = useRef<HTMLDivElement | null>(null);
    const widgetId = useRef<string | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetId.current !== null) window.turnstile?.reset(widgetId.current);
        onTokenRef.current(null);
      },
      execute() {
        if (widgetId.current === null || !window.turnstile?.execute) return false;
        onTokenRef.current(null); // never reuse a previous run's token
        try {
          window.turnstile.reset(widgetId.current);
          window.turnstile.execute(widgetId.current);
          return true;
        } catch {
          return false;
        }
      },
    }));

    useEffect(() => {
      if (!isTurnstileEnabled() || !holder.current) return;
      let cancelled = false;
      loadScript()
        .then(() => {
          if (cancelled || !holder.current || !window.turnstile) return;
          widgetId.current = window.turnstile.render(holder.current, {
            sitekey: turnstileSiteKey(),
            appearance: 'interaction-only',
            execution: 'execute',
            'refresh-expired': 'auto',
            theme: 'light',
            language: TURNSTILE_LANG[locale] ?? 'auto',
            callback: (token: string) => onTokenRef.current(token),
            'expired-callback': () => onTokenRef.current(null),
            'error-callback': () => onTokenRef.current(null),
          });
        })
        .catch(() => {
          if (!cancelled) setLoadFailed(true);
        });
      return () => {
        cancelled = true;
        if (widgetId.current !== null) {
          try {
            window.turnstile?.remove(widgetId.current);
          } catch {
            /* already gone */
          }
          widgetId.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isTurnstileEnabled()) return null;

    return (
      <div>
        <div ref={holder} />
        {loadFailed && (
          <p style={{ fontSize: 12.5, color: 'var(--text-faint)', margin: '8px 0 0', lineHeight: 1.5 }} role="status">
            {t('captchaLoadFailed', { email: contact.email })}
          </p>
        )}
      </div>
    );
  },
);

export default TurnstileWidget;
