'use client';

// Language switcher — PATH-PREFIX aware (one domain). Renders real, crawlable
// anchors to the same route in every live locale via the i18n Link, so
// "/about" ↔ "/nl/about". Pending locales never appear.
// Disclosure pattern (button + list of links), not ARIA menu roles: a menu
// would demand the full arrow-key protocol; a short list of links does not.
import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { ChevronDown } from 'lucide-react';
import { liveLocales, localeNames, localeFlags, localeFullCodes, type Locale } from '@/i18n/config';
import { analytics } from '@/lib/analytics';

export default function LanguageSwitcher({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const pathname = usePathname(); // locale-agnostic path, e.g. "/about"
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus the first language when the list opens.
  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
  }, [open]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const color = tone === 'dark' ? 'rgba(255,255,255,.7)' : 'var(--text-muted)';

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="language-list"
        aria-label={`${t('languageLabel')}: ${localeNames[locale]}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color,
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
        }}
      >
        {locale.toUpperCase()}
        <ChevronDown size={12} />
      </button>
      {open && (
        <ul
          id="language-list"
          aria-label={t('languageLabel')}
          style={{
            position: 'absolute',
            right: 0,
            top: '120%',
            background: '#fff',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            listStyle: 'none',
            margin: 0,
            padding: 6,
            minWidth: 190,
            zIndex: 80,
          }}
        >
          {liveLocales.map((l) => (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                hrefLang={localeFullCodes[l]}
                aria-current={l === locale ? 'true' : undefined}
                onClick={() => {
                  setOpen(false);
                  if (l !== locale) analytics.languageSwitch(locale, l, pathname);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  textDecoration: 'none',
                  background: l === locale ? 'var(--surface)' : 'none',
                  padding: '9px 12px',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              >
                <span aria-hidden>{localeFlags[l]}</span>
                {localeNames[l]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
