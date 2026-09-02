// About (/about): group story + full timeline + offices. Copy is group-level
// and drafted from the verified facts only (CHANGES.md lists what is open).
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { offices, companies } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { buildCanonical } from '@/lib/seo';
import { breadcrumbSchema, organizationSchema, officeSchemas } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import ExternalLink from '@/components/ui/ExternalLink';
import Timeline from '@/components/sections/home/Timeline';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/about', titleKey: 'aboutTitle', descKey: 'aboutDescription' });
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('aboutPage');
  const tc = await getTranslations('common');
  const to = await getTranslations('offices');
  const tcountry = await getTranslations('countries');

  const crumbs = breadcrumbSchema([
    { name: tc('nav.home'), url: buildCanonical(locale, '/') },
    { name: t('crumb'), url: buildCanonical(locale, '/about') },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <JsonLd data={organizationSchema()} />
      {officeSchemas().map((o) => (
        <JsonLd key={o['@id']} data={o} />
      ))}

      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(36px,4vw,56px)' }}>
        <div className="ab-hero">
          <div>
            <Eyebrow num="01" label={t('hero.eyebrow')} />
            <h1 className="h1" style={{ margin: '0 0 24px' }}>
              {t('hero.titleA')}
              <br />
              <span className="accent">{t('hero.titleB')}</span>
            </h1>
            <p className="lead" style={{ maxWidth: 520, margin: 0 }}>{t('hero.lead')}</p>
          </div>
          <div>
            <Placeholder label={t('hero.imageLabel')} ratio="4/3.2" />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section--surface">
        <div className="container section--sm">
          <div className="ab-story">
            <div>
              <Eyebrow num="02" label={t('story.eyebrow')} />
              <h2 className="h2 h2--sm" style={{ maxWidth: '14ch' }}>{t('story.title')}</h2>
            </div>
            <div className="prose" style={{ maxWidth: 680 }}>
              <p>{t('story.p1')}</p>
              <p>{t('story.p2')}</p>
              <p>{t('story.p3')}</p>
              <ul>
                {companies.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/companies/${c.slug}`}>{c.name}</Link> —{' '}
                    <ExternalLink href={c.url} company={c.slug} location="about_story">{c.urlLabel}</ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Full timeline */}
      <Timeline variant="full" num="03" />

      {/* Offices */}
      <section className="container section" aria-labelledby="offices-title">
        <Eyebrow num="04" label={t('offices.eyebrow')} />
        <h2 id="offices-title" className="h2 h2--sm" style={{ margin: '0 0 clamp(24px,3vw,36px)', maxWidth: '16ch' }}>{t('offices.title')}</h2>
        <div className="grid-lines ab-off">
          {offices.map((o) => (
            <div key={o.country} style={{ background: '#fff', padding: 'clamp(22px,2.4vw,30px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, color: 'var(--red)' }}>{o.country}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{to(`roles.${o.role}`)}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-.01em', marginBottom: 4 }}>{tcountry(o.country)}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>
                {o.url ? (
                  <ExternalLink href={o.url} company="stretch-sufit" location="about_offices" className="lnk" style={{ color: 'var(--red)' }}>{o.name}</ExternalLink>
                ) : (
                  o.name
                )}
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {o.addressLines.map((l) => <div key={l}>{l}</div>)}
              </div>
              {o.email && (
                <a href={`mailto:${o.email}`} className="lnk" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--red)' }}>{o.email}</a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section--red">
        <div className="container section--sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <h2 className="h2 h2--sm" style={{ color: '#fff', margin: 0, maxWidth: '18ch' }}>{t('cta.title')}</h2>
          <Link href="/contact" className="btn btn--dark">
            {t('cta.button')} <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .ab-hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(28px,4vw,64px); align-items: center; }
        .ab-story { display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(28px,4vw,64px); align-items: start; }
        .ab-off { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 860px) { .ab-hero, .ab-story { grid-template-columns: 1fr; } .ab-off { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .ab-off { grid-template-columns: 1fr; } }
      `}} />
    </>
  );
}
