// Careers (/careers) — replaces the old Magento /jobs page. Short intro + an
// open-application path (mailto + the contact form pre-set to "careers").
// Open roles are [TO CONFIRM]: the list is empty by design until supplied.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { contact, companies } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { buildCanonical } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import ExternalLink from '@/components/ui/ExternalLink';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/careers', titleKey: 'careersTitle', descKey: 'careersDescription' });
}

// Open roles — [TO CONFIRM]. Add entries here (title, location, company) when
// the team supplies them; the page renders the "no advertised roles" state
// while the list is empty.
const OPEN_ROLES: { title: string; location: string; company: string }[] = [];

export default async function CareersPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('careersPage');
  const tc = await getTranslations('common');
  const tco = await getTranslations('companies');

  const crumbs = breadcrumbSchema([
    { name: tc('nav.home'), url: buildCanonical(locale, '/') },
    { name: t('crumb'), url: buildCanonical(locale, '/careers') },
  ]);
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(t('mailSubject'))}`;

  return (
    <>
      <JsonLd data={crumbs} />

      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(36px,4vw,56px)' }}>
        <div className="cr-hero">
          <div>
            <Eyebrow num="01" label={t('eyebrow')} />
            <h1 className="h1" style={{ margin: '0 0 24px' }}>
              {t('titleA')}
              <br />
              <span className="accent">{t('titleB')}</span>
            </h1>
            <p className="lead" style={{ maxWidth: 520, margin: '0 0 18px' }}>{t('lead')}</p>
            <div className="prose">
              <p>{t('body1')}</p>
              <p>{t('body2')}</p>
            </div>
          </div>
          <div>
            <Placeholder label={t('imageLabel')} ratio="4/3.2" />
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="section--surface">
        <div className="container section--sm">
          <Eyebrow num="02" label={t('rolesTitle')} />
          {OPEN_ROLES.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: 'clamp(24px,3vw,40px)', maxWidth: 720 }}>
              <h2 className="h2 h2--sm" style={{ fontSize: 'clamp(22px,2.6vw,32px)', margin: '0 0 12px' }}>{t('rolesEmptyTitle')}</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.65 }}>{t('rolesEmpty')}</p>
            </div>
          ) : (
            <ul className="grid-lines" style={{ listStyle: 'none', margin: 0, padding: 1, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {OPEN_ROLES.map((r) => (
                <li key={r.title} style={{ background: '#fff', padding: 24 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>{r.title}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{r.location} · {r.company}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Open application */}
      <section className="container section" aria-labelledby="apply-title">
        <div className="cr-apply">
          <div>
            <Eyebrow num="03" label={t('applyTitle')} />
            <h2 id="apply-title" className="h2 h2--sm" style={{ margin: '0 0 16px', maxWidth: '16ch' }}>{t('applyHeading')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 520, margin: '0 0 24px' }}>{t('applyBody')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <a href={mailto} className="btn btn--primary">
                <Mail size={16} aria-hidden /> {t('applyCta')}
              </a>
              <Link href="/contact?about=careers" className="btn btn--ghost">
                {t('formCta')} <ArrowRight size={16} className="btn__arrow" aria-hidden />
              </Link>
            </div>
          </div>
          <div style={{ background: 'var(--black)', color: '#fff', padding: 'clamp(24px,3vw,40px)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--red-bright)', marginBottom: 14 }}>{t('companiesTitle')}</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--on-dark-muted-2)', margin: '0 0 18px' }}>{t('companiesBody')}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {companies.map((c) => (
                <li key={c.slug}>
                  <ExternalLink href={c.url} company={c.slug} location="careers_companies" className="lnk" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600 }}>
                    {tco(`${c.slug}.name`)} <span style={{ color: 'var(--on-dark-muted)', fontWeight: 400 }}>{c.urlLabel}</span> <ArrowUpRight size={14} style={{ color: 'var(--red-bright)' }} aria-hidden />
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .cr-hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(28px,4vw,64px); align-items: center; }
        .cr-apply { display: grid; grid-template-columns: 1.2fr .8fr; gap: clamp(28px,4vw,64px); align-items: start; }
        @media (max-width: 860px) { .cr-hero, .cr-apply { grid-template-columns: 1fr; } }
      `}} />
    </>
  );
}
