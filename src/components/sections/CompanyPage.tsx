// Shared body for the company detail pages. Facts come from
// site-config (verified only); copy from messages `companies.<slug>`. The
// PRIMARY CTA is the outbound link to the company's own website — the
// group site routes, it doesn't sell.
import { getTranslations } from 'next-intl/server';
import { ArrowRight, ArrowUpRight, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { companies, type Company } from '@/lib/site-config';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import ExternalLink from '@/components/ui/ExternalLink';

export default async function CompanyPage({ company: c }: { company: Company }) {
  const t = await getTranslations('companies');
  const tp = await getTranslations('companyPage');
  const tcountry = await getTranslations('countries');
  const bullets = t.raw(`${c.slug}.bullets`) as string[];
  const others = companies.filter((o) => o.slug !== c.slug);
  const location = `company_${c.slug}`;

  return (
    <>
      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(36px,4vw,56px)' }}>
        <div className="cp-hero">
          <div>
            <Eyebrow num="01" label={t(`${c.slug}.kicker`)} />
            <h1 className="h1" style={{ margin: '0 0 20px' }}>{t(`${c.slug}.name`)}</h1>
            {c.legalName && <p style={{ fontSize: 13.5, color: 'var(--text-faint)', margin: '0 0 18px' }}>{c.legalName}</p>}
            <p className="lead" style={{ maxWidth: 520, margin: '0 0 28px' }}>{t(`${c.slug}.oneLiner`)}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
              <ExternalLink href={c.url} company={c.slug} location={`${location}_hero`} className="btn btn--primary btn--lg">
                {tp('visit', { site: c.urlLabel })} <ArrowUpRight size={16} aria-hidden />
              </ExternalLink>
              {c.altUrl && (
                <ExternalLink href={c.altUrl.url} company={c.slug} location={`${location}_hero_alt`} className="lnk" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-muted)' }}>
                  {tp('visitAlt', { site: c.altUrl.label })}
                </ExternalLink>
              )}
            </div>
          </div>
          <div>
            <Placeholder label={tp('logoSlot', { name: c.name })} light ratio="4/3" />
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="container" style={{ paddingBottom: 'clamp(40px,5vw,72px)' }}>
        <div className="grid-lines cp-facts">
          {c.facts.map((f) => (
            <div key={f.key} style={{ background: '#fff', padding: 'clamp(22px,2.4vw,32px)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px,3vw,42px)', lineHeight: 1, letterSpacing: '-.03em' }}>{tp(`factValues.${c.slug}.${f.key}`)}</div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--red)', marginTop: 12 }}>{tp(`facts.${f.key}`)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What they do */}
      <section className="section--surface">
        <div className="container section--sm">
          <div className="cp-what">
            <div>
              <Eyebrow num="02" label={tp('whatHeading')} />
              <h2 className="h2 h2--sm" style={{ margin: '0 0 20px', maxWidth: '16ch' }}>{t(`${c.slug}.whatTitle`)}</h2>
              <div className="prose">
                <p>{t(`${c.slug}.description`)}</p>
              </div>
              <ul role="list" style={{ listStyle: 'none', margin: '18px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bullets.map((b) => (
                  <li key={b} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.55, color: 'var(--text-body)' }}>
                    <span className="tick" style={{ marginTop: 7 }} aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Placeholder label={tp('imageSlot', { name: c.name })} ratio="4/3.2" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact + membership */}
      <section className="container section">
        <Eyebrow num="03" label={tp('contactHeading', { name: c.name })} />
        <div className="grid-lines cp-contact">
          <div style={{ background: '#fff', padding: 'clamp(22px,2.4vw,32px)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: 12 }}>{tp('membership')}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-.01em', marginBottom: 8 }}>
              {c.memberSince ? tp('partOfSince', { year: c.memberSince }) : tp('partOf')}
            </div>
            {c.legalName ? (
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{tp('legal')}: {c.legalName}</div>
            ) : null}
            {c.founded ? (
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{tp('facts.founded')}: {c.founded}</div>
            ) : null}
            {c.founder ? (
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{tp('founder')}: {c.founder}</div>
            ) : null}
          </div>
          <div style={{ background: '#fff', padding: 'clamp(22px,2.4vw,32px)', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14.5 }}>
            <ContactRow icon={<Globe size={16} aria-hidden />} label={tp('website')}>
              <ExternalLink href={c.url} company={c.slug} location={`${location}_contact`} className="lnk" style={{ color: 'var(--red)', fontWeight: 600 }}>
                {c.urlLabel}
              </ExternalLink>
            </ContactRow>
            {c.email && (
              <ContactRow icon={<Mail size={16} aria-hidden />} label={tp('email')}>
                <a href={`mailto:${c.email}`} className="lnk" style={{ color: 'var(--red)', fontWeight: 600 }}>{c.email}</a>
              </ContactRow>
            )}
            {c.phone && c.phoneHref && (
              <ContactRow icon={<Phone size={16} aria-hidden />} label={tp('phone')}>
                <a href={c.phoneHref} className="lnk" style={{ fontWeight: 600 }}>{c.phone}</a>
              </ContactRow>
            )}
            <ContactRow icon={<MapPin size={16} aria-hidden />} label={tp('address')}>
              {c.addressLines.length > 0 ? (
                <span>
                  {c.addressLines.map((l) => (
                    <span key={l} style={{ display: 'block' }}>{l}</span>
                  ))}
                  <span style={{ display: 'block' }}>{tcountry(c.country)}</span>
                </span>
              ) : (
                <span>{tcountry(c.country)}</span>
              )}
            </ContactRow>
          </div>
        </div>
      </section>

      {/* Other companies */}
      <section className="section--surface">
        <div className="container section--sm">
          <Eyebrow num="04" label={tp('otherCompanies')} />
          <div className="grid-lines cp-others">
            {others.map((o) => (
              <Link key={o.slug} href={`/companies/${o.slug}`} className="cp-other">
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t(`${o.slug}.kicker`)}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px,2.2vw,30px)', textTransform: 'uppercase', letterSpacing: '-.02em', lineHeight: 1 }}>{t(`${o.slug}.name`)}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--red)' }}>
                  {tp('readMore')} <ArrowRight size={14} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — outbound */}
      <section className="section--red">
        <div className="container section--sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h2 className="h2 h2--sm" style={{ color: '#fff', margin: '0 0 8px', maxWidth: '18ch' }}>{tp('ctaTitle', { name: c.name })}</h2>
            <p style={{ color: '#fff', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>{t(`${c.slug}.ctaBody`)}</p>
          </div>
          <ExternalLink href={c.url} company={c.slug} location={`${location}_cta`} className="btn btn--dark">
            {tp('visit', { site: c.urlLabel })} <ArrowUpRight size={16} aria-hidden />
          </ExternalLink>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .cp-hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(28px,4vw,64px); align-items: center; }
        .cp-facts { grid-template-columns: repeat(${Math.max(c.facts.length, 2)}, 1fr); }
        .cp-what { display: grid; grid-template-columns: 1.05fr .95fr; gap: clamp(28px,4vw,64px); align-items: start; }
        .cp-contact { grid-template-columns: 1fr 1fr; }
        .cp-others { grid-template-columns: repeat(3, 1fr); }
        .cp-other { background: #fff; padding: clamp(22px,2.4vw,32px); display: flex; flex-direction: column; gap: 12px; transition: background .15s ease; }
        .cp-other:hover { background: var(--surface); }
        @media (max-width: 860px) {
          .cp-hero, .cp-what, .cp-contact, .cp-others { grid-template-columns: 1fr; }
          .cp-facts { grid-template-columns: 1fr 1fr; }
        }
      `}} />
    </>
  );
}

function ContactRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 110px 1fr', gap: 12, alignItems: 'start' }}>
      <span style={{ color: 'var(--red)', marginTop: 2 }}>{icon}</span>
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginTop: 3 }}>{label}</span>
      <span style={{ lineHeight: 1.55 }}>{children}</span>
    </div>
  );
}
