'use client';

// Sticky site header: black utility strip (group descriptor · the three
// company sites · phone · language) + a white nav row with four links and
// the contact CTA. No mega menu, no portal link — the group site is small.
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { contact, mainNav, companies } from '@/lib/site-config';
import { analytics } from '@/lib/analytics';
import Wordmark from '@/components/ui/Wordmark';
import ExternalLink from '@/components/ui/ExternalLink';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

export default function Header() {
  const t = useTranslations('common');
  const th = useTranslations('header');
  const pathname = usePathname();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'));

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: 'rgba(255,255,255,.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Utility strip */}
      <div style={{ background: 'var(--black)', color: '#fff' }}>
        <div className="container" style={{ height: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, background: 'var(--red)', display: 'inline-block' }} aria-hidden />
            <span>{th('strip')}</span>
          </div>
          <div className="only-desktop" style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>
            {/* The persistent router, in its most compact form: the three
                company sites, one click away on every page. */}
            {companies.map((c) => (
              <ExternalLink key={c.slug} href={c.url} company={c.slug} location="header_utility" className="lnk" style={{ color: 'rgba(255,255,255,.8)', display: 'inline-block', padding: '12px 0' }}>
                {c.urlLabel}
              </ExternalLink>
            ))}
            <span style={{ opacity: 0.4 }} aria-hidden>|</span>
            <a href={contact.phoneHref} className="lnk" style={{ color: 'var(--red-bright)', display: 'inline-block', padding: '12px 0' }} onClick={() => analytics.phoneClick('header_utility')}>
              {contact.phoneDisplay}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container" style={{ height: 'var(--header-h)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" aria-label={th('homeAria')} style={{ display: 'inline-flex' }}>
          <Wordmark size={26} />
        </Link>

        <nav className="only-desktop" aria-label={t('nav.primary')} style={{ display: 'flex', alignItems: 'center', gap: 30, fontSize: 13.5, fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase' }}>
          {mainNav.map((l) => (
            <Link key={l.href} href={l.href} className="lnk" aria-current={isActive(l.href) ? 'page' : undefined} style={{ color: isActive(l.href) ? 'var(--red)' : 'var(--black)' }}>
              {t(`nav.${l.key}`)}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/contact" className="btn btn--primary btn--sm only-desktop">
            {t('cta.contactGroup')} <ArrowUpRight size={14} />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
