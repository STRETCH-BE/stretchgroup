'use client';

// The group contact form: name, email, company, "which company is this
// about?", message. Honeypot + signed time-to-submit token + optional
// Turnstile, posting to /api/contact (rate-limited + spam-scored there).
// `?about=<key>` pre-selects the routing question (careers links use it).
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { analytics } from '@/lib/analytics';
import TurnstileWidget from '@/components/ui/TurnstileWidget';
import { useFormSecurity } from '@/lib/use-form-security';

type Status = 'idle' | 'sending' | 'sent' | 'error';

// Stable option values (posted to the API) → message keys for the labels.
export const ABOUT_OPTIONS = [
  { value: 'group', key: 'group' },
  { value: 'stretch', key: 'stretch' },
  { value: 'stretch-sufit', key: 'stretchSufit' },
  { value: 're-sound', key: 'reSound' },
  { value: 'careers', key: 'careers' },
] as const;

// Reads `?about=` on the client. Isolated in its own Suspense boundary so
// useSearchParams only bails THIS no-op child out of static rendering — the
// form itself stays in the server-rendered HTML.
function AboutFromQuery({ onSelect }: { onSelect: (value: string) => void }) {
  const params = useSearchParams();
  useEffect(() => {
    const wanted = params.get('about');
    if (wanted && ABOUT_OPTIONS.some((o) => o.value === wanted)) onSelect(wanted);
  }, [params, onSelect]);
  return null;
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ContactForm() {
  const t = useTranslations('forms');
  const tsec = useTranslations('security');
  const locale = useLocale();
  const security = useFormSecurity();
  const [about, setAbout] = useState<string>('group');
  const [status, setStatus] = useState<Status>('idle');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      company: String(fd.get('company') ?? '').trim(),
      about: String(fd.get('about') ?? 'group').trim(),
      message: String(fd.get('message') ?? '').trim(),
      locale,
      _gotcha: String(fd.get('_gotcha') ?? ''),
    };

    const next: Record<string, string> = {};
    if (!data.name) next.name = t('validation.required');
    if (!data.email) next.email = t('validation.required');
    else if (!isEmail(data.email)) next.email = t('validation.email');
    if (!data.message) next.message = t('validation.required');
    if (!consent) next.__consent = t('validation.consent');
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // Move focus to the first invalid control so keyboard and screen-reader
      // users land on the problem; the alert region below announces the list.
      const first = ['name', 'email', 'message', '__consent'].find((k) => next[k]);
      const id = first === '__consent' ? 'cf-consent' : `cf-${first}`;
      requestAnimationFrame(() => document.getElementById(id)?.focus());
      return;
    }

    setStatus('sending');
    // The token is passed explicitly: after a 'stale_token' refresh the closure's
    // `security.formToken` would still be the OLD value (state updates land on
    // the next render), so the retry must carry the freshly minted one.
    const post = async (retried: boolean, formToken: string | null = security.formToken): Promise<void> => {
      const turnstileToken = await security.waitForTurnstile();
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, formToken, turnstileToken }),
      });
      if (res.status === 429) {
        setErrors({ __captcha: tsec('tooManyRequests') });
        setStatus('idle');
        return;
      }
      if (res.status === 400) {
        const err = (await res.clone().json().catch(() => null)) as { error?: string } | null;
        if (err?.error === 'stale_token' && !retried) {
          const fresh = await security.refreshFormToken();
          return post(true, fresh);
        }
        if (err?.error === 'captcha') {
          security.resetTurnstile();
          setErrors({ __captcha: tsec('captchaFailed') });
          setStatus('idle');
          return;
        }
      }
      if (!res.ok) throw new Error('failed');
      analytics.submitContactForm(true, data.about);
      setStatus('sent');
    };
    try {
      await post(false);
    } catch {
      analytics.submitContactForm(false, data.about);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" style={{ border: '1px solid var(--border)', background: '#fff', padding: 'clamp(32px,4vw,52px)', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', width: 56, height: 56, background: 'var(--red)', color: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Check size={26} aria-hidden />
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, textTransform: 'uppercase', letterSpacing: '-.02em', margin: '0 0 10px' }}>{t('successTitle')}</h3>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('successMessage')}</p>
      </div>
    );
  }

  const errStyle: React.CSSProperties = { color: 'var(--red)', fontSize: 12, marginTop: 6 };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* One announcement per failed submit: the field errors themselves are
          tied to their inputs via aria-describedby. */}
      {Object.keys(errors).length > 0 && (
        <div role="alert" className="visually-hidden">
          {Object.values(errors).join('. ')}
        </div>
      )}
      <Suspense fallback={null}>
        <AboutFromQuery onSelect={setAbout} />
      </Suspense>
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <div className="cf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <label className="field-label" htmlFor="cf-name">{t('fields.name')} {t('required')}</label>
          <input id="cf-name" name="name" className="field" autoComplete="name" aria-required="true" placeholder={t('placeholders.name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-err' : undefined} />
          {errors.name && <div id="cf-name-err" style={errStyle}>{errors.name}</div>}
        </div>
        <div>
          <label className="field-label" htmlFor="cf-email">{t('fields.email')} {t('required')}</label>
          <input id="cf-email" name="email" type="email" className="field" autoComplete="email" aria-required="true" placeholder={t('placeholders.email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-err' : undefined} />
          {errors.email && <div id="cf-email-err" style={errStyle}>{errors.email}</div>}
        </div>
        <div>
          <label className="field-label" htmlFor="cf-company">{t('fields.company')}</label>
          <input id="cf-company" name="company" className="field" autoComplete="organization" placeholder={t('placeholders.company')} />
        </div>
        <div>
          <label className="field-label" htmlFor="cf-about">{t('fields.about')}</label>
          <select id="cf-about" name="about" className="field" value={about} onChange={(e) => setAbout(e.target.value)}>
            {ABOUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{t(`aboutOptions.${o.key}`)}</option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="field-label" htmlFor="cf-message">{t('fields.message')} {t('required')}</label>
          <textarea id="cf-message" name="message" className="field" rows={6} aria-required="true" placeholder={t('placeholders.message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-message-err' : undefined} style={{ resize: 'vertical' }} />
          {errors.message && <div id="cf-message-err" style={errStyle}>{errors.message}</div>}
        </div>
      </div>

      <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 18, cursor: 'pointer', fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
        <input id="cf-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errors.__consent} aria-required="true" aria-describedby={errors.__consent ? 'cf-consent-err' : undefined} style={{ marginTop: 3, accentColor: 'var(--red)', width: 16, height: 16, flexShrink: 0 }} />
        <span>
          {t('consentPrefix')}{' '}
          <Link href="/privacy" className="lnk" style={{ color: 'var(--red)' }}>{t('consentPrivacy')}</Link>.
        </span>
      </label>
      {errors.__consent && <div id="cf-consent-err" style={errStyle}>{errors.__consent}</div>}
      <TurnstileWidget ref={security.widgetRef} onToken={security.setTurnstileToken} />
      {errors.__captcha && <div style={errStyle} role="alert">{errors.__captcha}</div>}

      {status === 'error' && (
        <div role="alert" style={{ marginTop: 16, padding: '12px 16px', background: '#fff', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 13.5 }}>
          {t('errorMessage')}
        </div>
      )}

      <button type="submit" className="btn btn--primary" disabled={status === 'sending'} style={{ marginTop: 22, width: '100%', justifyContent: 'center', opacity: status === 'sending' ? 0.7 : 1 }}>
        {status === 'sending' ? t('sending') : <>{t('submit')} <ArrowRight size={16} aria-hidden /></>}
      </button>
      <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-faint)', textAlign: 'center' }}>{t('reassurance')}</p>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 560px){ .cf-grid { grid-template-columns: 1fr !important; } }` }} />
    </form>
  );
}
