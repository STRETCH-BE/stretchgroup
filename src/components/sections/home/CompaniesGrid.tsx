// The three companies as cards: logo slot, kicker, name, legal entity,
// one-liner, a link to the detail page and the company's own site. Used on
// the home page and as the body of /companies.
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { companies } from '@/lib/site-config';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import ExternalLink from '@/components/ui/ExternalLink';

export default function CompaniesGrid({ num = '02', heading = true, location }: { num?: string; heading?: boolean; location: string }) {
  const t = useTranslations('companies');
  const tp = useTranslations('companyPage');
  // Without the section h2 (the /companies page has its own h1), the card
  // names become the h2 level so the outline never skips a level.
  const NameTag: 'h2' | 'h3' = heading ? 'h3' : 'h2';

  return (
    <section className="section--surface" id="companies" aria-labelledby={heading ? 'companies-title' : undefined}>
      <div className="container section">
        {heading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(28px,4vw,48px)' }}>
            <div>
              <Eyebrow num={num} label={t('eyebrow')} />
              <h2 id="companies-title" className="h2" style={{ maxWidth: '14ch' }}>{t('title')}</h2>
            </div>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 380, margin: 0 }}>{t('intro')}</p>
          </div>
        )}

        <div className="grid-lines cg-grid">
          {companies.map((c, i) => (
            <article key={c.slug} className="cg-card">
              <div className="cg-card__logo">
                <Placeholder label={tp('logoSlot', { name: c.name })} light ratio="16/9" />
              </div>
              <div className="cg-card__body">
                <div className="cg-card__kicker">
                  <span className="cg-card__num">0{i + 1}</span>
                  {t(`${c.slug}.kicker`)}
                </div>
                <NameTag className="cg-card__name">{t(`${c.slug}.name`)}</NameTag>
                {c.legalName && <div className="cg-card__legal">{c.legalName}</div>}
                <p className="cg-card__text">{t(`${c.slug}.oneLiner`)}</p>
                <div className="cg-card__links">
                  <Link href={`/companies/${c.slug}`} className="btn btn--ghost btn--sm">
                    {tp('readMore')} <ArrowRight size={14} className="btn__arrow" aria-hidden />
                  </Link>
                  <ExternalLink href={c.url} company={c.slug} location={location} className="lnk cg-card__site">
                    {c.urlLabel} <ArrowUpRight size={13} aria-hidden />
                  </ExternalLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cg-grid { grid-template-columns: repeat(3, 1fr); }
        .cg-card { background: #fff; display: flex; flex-direction: column; }
        .cg-card__logo { border-bottom: 1px solid var(--border); }
        .cg-card__body { padding: clamp(22px,2.4vw,32px); display: flex; flex-direction: column; gap: 10px; flex: 1 1 auto; }
        .cg-card__kicker { display: flex; align-items: center; gap: 10px; font-size: 11.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--text-faint-2); }
        .cg-card__num { color: var(--red); }
        .cg-card__name { font-family: var(--font-display); font-weight: 900; font-size: clamp(24px,2.2vw,32px); letter-spacing: -.02em; text-transform: uppercase; line-height: 1; margin: 4px 0 0; }
        .cg-card__legal { font-size: 12.5px; color: var(--text-faint); }
        .cg-card__text { font-size: 14.5px; line-height: 1.6; color: var(--text-muted); margin: 6px 0 0; flex: 1 1 auto; }
        .cg-card__links { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 14px; }
        .cg-card__site { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; color: var(--red); }
        @media (max-width: 900px) { .cg-grid { grid-template-columns: 1fr; } }
      `}} />
    </section>
  );
}
