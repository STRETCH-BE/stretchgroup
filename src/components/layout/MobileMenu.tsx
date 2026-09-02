'use client';

// Mobile navigation drawer (shown below 860px via the .only-mobile helper).
// Full-screen overlay with the four nav links, the three company sites, the
// contact CTA, the phone line and the language grid (the desktop switcher
// lives in the .only-desktop utility strip, so this is the ONLY way to
// change language on a phone).
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, usePathname } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { contact, mainNav, companies } from '@/lib/site-config';
import { liveLocales, localeNames, localeFlags, localeFullCodes, type Locale } from '@/i18n/config';
import { analytics } from '@/lib/analytics';
import Wordmark from '@/components/ui/Wordmark';
import ExternalLink from '@/components/ui/ExternalLink';

const drawerLinkStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 26,
  textTransform: 'uppercase',
  letterSpacing: '-.02em',
  padding: '13px 0',
  borderBottom: '1px solid var(--border)',
} as const;

const subHeadingStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: 'var(--text-faint-2)',
  margin: '26px 0 12px',
} as const;

export default function MobileMenu() {
  const t = useTranslations('common');
  const tc = useTranslations('companies');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    // No inline display here: it would override the .only-mobile media query.
    <div className="only-mobile">
      <button
        type="button"
        aria-label={t('openMenu')}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', color: 'var(--black)' }}
      >
        <Menu size={26} />
      </button>

      {/* Portal: the header's backdrop-filter makes it the containing block
          for fixed descendants — rendering on <body> escapes that. */}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('menu')}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
          >
            <div
              className="container"
              style={{ height: 'var(--header-h)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}
            >
              <Wordmark size={22} />
              <button
                type="button"
                aria-label={t('closeMenu')}
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}
              >
                <X size={26} />
              </button>
            </div>

            <nav className="container" aria-label={t('nav.primary')} style={{ paddingTop: 28, paddingBottom: 28, display: 'flex', flexDirection: 'column' }}>
              {mainNav.map((item) => (
                <Link key={item.href} href={item.href} style={drawerLinkStyle}>
                  {t(`nav.${item.key}`)}
                </Link>
              ))}

              <div style={subHeadingStyle}>{t('nav.companySites')}</div>
              {companies.map((c) => (
                <ExternalLink
                  key={c.slug}
                  href={c.url}
                  company={c.slug}
                  location="mobile_menu"
                  style={{ padding: '9px 0', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <span style={{ color: 'var(--text)' }}>{tc(`${c.slug}.name`)}</span>
                  <span style={{ color: 'var(--red)' }}>{c.urlLabel}</span>
                  <ArrowUpRight size={14} style={{ color: 'var(--red)' }} aria-hidden />
                </ExternalLink>
              ))}

              <Link href="/contact" className="btn btn--primary" style={{ marginTop: 28, justifyContent: 'center' }}>
                {t('cta.contactGroup')} <ArrowUpRight size={16} />
              </Link>
              <a
                href={contact.phoneHref}
                onClick={() => analytics.phoneClick('mobile_menu')}
                style={{ marginTop: 18, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--black)' }}
              >
                {contact.phoneDisplay}
              </a>

              <div style={{ ...subHeadingStyle, margin: '34px 0 12px' }}>{t('languageLabel')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
                {liveLocales.map((l) => (
                  <Link
                    key={l}
                    href={pathname}
                    locale={l}
                    hrefLang={localeFullCodes[l]}
                    aria-current={l === locale ? 'true' : undefined}
                    onClick={() => {
                      if (l !== locale) analytics.languageSwitch(locale, l, pathname);
                      setOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: l === locale ? 'var(--surface)' : '#fff',
                      padding: '12px 12px',
                      fontSize: 14,
                      fontWeight: l === locale ? 700 : 500,
                      color: l === locale ? 'var(--red)' : 'var(--text)',
                    }}
                  >
                    <span aria-hidden>{localeFlags[l]}</span>
                    {localeNames[l]}
                  </Link>
                ))}
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
