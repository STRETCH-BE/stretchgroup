'use client';

// Site footer (pure black). Brand + HQ · Companies · Group · Offices, then the
// compact company router on every page, then the legal row with a "Manage
// cookies" trigger that reopens the consent banner.
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { brand, contact, companies, offices, footerNav } from '@/lib/site-config';
import { CONSENT_OPEN_BANNER_EVENT } from '@/lib/consent';
import { analytics } from '@/lib/analytics';
import Wordmark from '@/components/ui/Wordmark';
import ExternalLink from '@/components/ui/ExternalLink';
import CompanyRouter from '@/components/sections/CompanyRouter';

export default function Footer() {
  const t = useTranslations('footer');
  const tc = useTranslations('cookies');
  const to = useTranslations('offices');
  const tcountry = useTranslations('countries');
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--pure-black)', color: '#fff' }}>
      <div className="container" style={{ paddingTop: 'clamp(52px,6vw,84px)', paddingBottom: 40 }}>
        <div className="footer-grid">
          {/* Brand + HQ */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <Wordmark size={24} tone="dark" />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--on-dark-muted)', maxWidth: 300, margin: '0 0 22px' }}>{t('tagline')}</p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-dark-soft)', margin: '0 0 12px' }}>
              {contact.address.building}, {contact.address.street}
              <br />
              {contact.address.postalCode} {contact.address.city}, {tcountry('BE')}
            </p>
            <a
              href={contact.phoneHref}
              onClick={() => analytics.phoneClick('footer')}
              style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: '#fff', marginBottom: 6 }}
            >
              {contact.phoneDisplay}
            </a>
            <a href={`mailto:${contact.email}`} className="lnk" style={{ fontSize: 14, color: 'var(--red-bright)' }} onClick={() => analytics.emailClick('footer')}>
              {contact.email}
            </a>
          </div>

          {/* Companies */}
          <FooterCol heading={t('companiesHeading')}>
            {footerNav.companies.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="lnk" style={{ color: 'var(--on-dark-soft)' }}>
                  {t(`links.${l.key}`)}
                </Link>
              </li>
            ))}
            <li style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {companies.map((c) => (
                <ExternalLink key={c.slug} href={c.url} company={c.slug} location="footer_companies" className="lnk" style={{ fontSize: 13, color: 'var(--on-dark-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {c.urlLabel} <ArrowUpRight size={12} aria-hidden />
                </ExternalLink>
              ))}
            </li>
          </FooterCol>

          {/* Group */}
          <FooterCol heading={t('groupHeading')}>
            {footerNav.group.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="lnk" style={{ color: 'var(--on-dark-soft)' }}>
                  {t(`links.${l.key}`)}
                </Link>
              </li>
            ))}
          </FooterCol>

          {/* Offices */}
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--red-bright)', margin: '0 0 18px' }}>
              {t('officesHeading')}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5, color: 'var(--on-dark-soft)' }}>
              {offices.map((o) => (
                <li key={o.country}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--on-dark-muted)' }}>
                    {o.country} · {to(`roles.${o.role}`)}
                  </div>
                  <div>
                    {/* The PL branch trades under its own name — a followed
                        link to the group-owned altodesign.pl on every page. */}
                    {o.url ? (
                      <ExternalLink href={o.url} company="stretch-sufit" location="footer_offices" className="lnk" style={{ color: '#fff' }}>
                        {o.name}
                      </ExternalLink>
                    ) : (
                      <span style={{ color: '#fff' }}>{o.name}</span>
                    )}
                    <span style={{ color: 'var(--on-dark-muted)' }}> — {o.addressLines[o.addressLines.length - 1]}</span>
                  </div>
                  {o.email && (
                    <a href={`mailto:${o.email}`} className="lnk" style={{ fontSize: 12.5, color: 'var(--on-dark-muted)' }} onClick={() => analytics.emailClick(`footer_office_${o.country.toLowerCase()}`)}>
                      {o.email}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Persistent router — one click to the right company site, on every page. */}
        <CompanyRouter variant="compact" location="footer_router" />

        {/* Legal row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingTop: 26, marginTop: 26, borderTop: '1px solid var(--line-footer)' }}>
          <p style={{ fontSize: 12.5, color: 'var(--on-dark-muted)', margin: 0, letterSpacing: '.04em' }}>
            © {year} {t('rights')} · {brand.poweredBy}
          </p>
          <div style={{ display: 'flex', gap: 22, fontSize: 12.5, color: 'var(--on-dark-muted)', flexWrap: 'wrap' }}>
            {footerNav.legal.map((l) => (
              <Link key={l.href} href={l.href} className="lnk">
                {l.key === 'privacy' ? t('privacy') : t('terms')}
              </Link>
            ))}
            <button
              type="button"
              className="lnk"
              onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_BANNER_EVENT))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'var(--on-dark-muted)', padding: 0 }}
            >
              {tc('manage')}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 0.8fr 1.3fr;
          gap: 40px;
          padding-bottom: 48px;
        }
        @media (max-width: 860px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--red-bright)', margin: '0 0 18px' }}>{heading}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14 }}>{children}</ul>
    </div>
  );
}
