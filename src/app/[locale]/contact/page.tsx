// Contact (/contact): quick-contact cards, the group form (→ /api/contact)
// beside the HQ block, per-company contact routing and the offices grid.
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Phone, Mail, MessageCircle, ArrowUpRight } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { contact, companies, offices } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { buildCanonical } from '@/lib/seo';
import { breadcrumbSchema, localBusinessSchema, officeSchemas } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import ExternalLink from '@/components/ui/ExternalLink';
import ContactForm from '@/components/sections/ContactForm';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/contact', titleKey: 'contactTitle', descKey: 'contactDescription' });
}

export default async function ContactPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('contactPage');
  const tc = await getTranslations('common');
  const tco = await getTranslations('companies');
  const to = await getTranslations('offices');
  const tcountry = await getTranslations('countries');

  const cards = [
    { icon: Phone, label: t('cards.call.label'), value: contact.phoneDisplay, sub: contact.hoursDisplay, href: contact.phoneHref },
    { icon: Mail, label: t('cards.email.label'), value: contact.email, sub: t('cards.email.sub'), href: `mailto:${contact.email}` },
    { icon: MessageCircle, label: t('cards.chat.label'), value: t('cards.chat.value'), sub: t('cards.chat.sub'), href: contact.whatsappHref },
  ];

  const crumbs = breadcrumbSchema([
    { name: tc('nav.home'), url: buildCanonical(locale, '/') },
    { name: t('crumb'), url: buildCanonical(locale, '/contact') },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <JsonLd data={localBusinessSchema()} />
      {officeSchemas().map((o) => (
        <JsonLd key={o['@id']} data={o} />
      ))}

      {/* Hero + quick-contact cards */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(32px,4vw,56px)' }}>
        <Eyebrow num="01" label={t('eyebrow')} />
        <h1 className="h1" style={{ margin: '0 0 clamp(28px,3vw,40px)' }}>
          {t('titleA')}
          <br />
          <span className="accent">{t('titleB')}</span>
        </h1>
        <div className="qc-grid">
          {cards.map(({ icon: Icon, label, value, sub, href }) => (
            <a key={label} href={href} style={{ border: '1px solid var(--border)', background: '#fff', padding: 'clamp(22px,2.4vw,30px)', display: 'block' }}>
              <span style={{ display: 'inline-flex', width: 44, height: 44, background: 'var(--surface)', color: 'var(--red)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={20} aria-hidden />
              </span>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: 9 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-.01em', marginBottom: 6, wordBreak: 'break-word' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>{sub}</div>
            </a>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '14px 0 0' }}>
          {t('chatNote')}{' '}
          <a href={contact.telegram} className="lnk" style={{ color: 'var(--red)' }}>Telegram</a>
        </p>
      </section>

      {/* Form + HQ */}
      <section className="container" style={{ paddingBottom: 'clamp(50px,6vw,90px)' }}>
        <div className="ct-grid">
          <div>
            <h2 className="h2 h2--sm" style={{ margin: '0 0 8px' }}>{t('formTitle')}</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 28px', maxWidth: 480 }}>{t('formLead')}</p>
            <Suspense fallback={null}>
              <ContactForm />
            </Suspense>
          </div>
          <div style={{ position: 'relative', minHeight: 380, height: '100%' }}>
            <Placeholder label={t('mapLabel')} style={{ minHeight: 380 }} />
            <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, background: 'var(--black)', color: '#fff', padding: '20px 24px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--red-bright)', marginBottom: 8 }}>{t('hqKicker')}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{contact.address.building}, {contact.address.street}</div>
              <div style={{ fontSize: 15, color: 'var(--on-dark-soft)' }}>{contact.address.postalCode} {contact.address.city}, {tcountry('BE')}</div>
              <div style={{ fontSize: 13, color: 'var(--on-dark-muted)', marginTop: 8 }}>{contact.hoursDisplay}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Per-company routing */}
      <section className="section--dark" aria-labelledby="routing-title">
        <div className="container section--sm">
          <Eyebrow num="02" label={t('routingEyebrow')} tone="dark" />
          <h2 id="routing-title" className="h2 h2--sm" style={{ margin: '0 0 12px', maxWidth: '16ch' }}>{t('routingTitle')}</h2>
          <p style={{ color: 'var(--on-dark-muted-2)', margin: '0 0 clamp(24px,3vw,36px)', maxWidth: 520, lineHeight: 1.6 }}>{t('routingBody')}</p>
          <div className="grid-lines grid-lines--dark rt-grid">
            {companies.map((c) => (
              <div key={c.slug} style={{ background: 'var(--black)', padding: 'clamp(22px,2.4vw,30px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--on-dark-faint)' }}>{tco(`${c.slug}.kicker`)}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px,2.2vw,28px)', textTransform: 'uppercase', letterSpacing: '-.02em', lineHeight: 1 }}>{tco(`${c.slug}.name`)}</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--on-dark-muted)', margin: '4px 0 8px', flex: '1 1 auto' }}>{tco(`${c.slug}.oneLiner`)}</p>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="lnk" style={{ fontSize: 14, color: 'var(--red-bright)', alignSelf: 'flex-start' }}>{c.email}</a>
                )}
                {c.phone && c.phoneHref && (
                  <a href={c.phoneHref} className="lnk" style={{ fontSize: 14, color: '#fff', alignSelf: 'flex-start' }}>{c.phone}</a>
                )}
                <ExternalLink href={c.url} company={c.slug} location="contact_routing" className="btn btn--ghost-light btn--sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  {c.urlLabel} <ArrowUpRight size={14} aria-hidden />
                </ExternalLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="section--surface">
        <div className="container section--sm">
          <Eyebrow num="03" label={t('officesEyebrow')} />
          <div className="grid-lines off-grid">
            {offices.map((o) => (
              <div key={o.country} style={{ background: '#fff', padding: 'clamp(22px,2.4vw,30px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, color: 'var(--red)' }}>{o.country}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{to(`roles.${o.role}`)}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-.01em', marginBottom: 4 }}>{tcountry(o.country)}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>{o.name}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                  {o.addressLines.map((l) => <div key={l}>{l}</div>)}
                </div>
                {o.email && (
                  <a href={`mailto:${o.email}`} className="lnk" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--red)' }}>{o.email}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .qc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .ct-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(28px,4vw,56px); align-items: start; }
        .rt-grid { grid-template-columns: repeat(3, 1fr); }
        .off-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 860px) { .qc-grid, .ct-grid, .rt-grid { grid-template-columns: 1fr; } .off-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .off-grid { grid-template-columns: 1fr; } }
      `}} />
    </>
  );
}
