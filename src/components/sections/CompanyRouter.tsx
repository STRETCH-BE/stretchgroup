// "Find the right company" — the persistent router. `full` renders the three
// question cards (home); `compact` renders one quiet row (footer). Every link
// is OUTBOUND: the group site routes, it doesn't sell.
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { routerItems, getCompany } from '@/lib/site-config';
import ExternalLink from '@/components/ui/ExternalLink';
import Eyebrow from '@/components/ui/Eyebrow';

export default function CompanyRouter({ variant = 'full', location }: { variant?: 'full' | 'compact'; location: string }) {
  const t = useTranslations('router');

  if (variant === 'compact') {
    return (
      <nav aria-label={t('footerTitle')} className="router-compact">
        <span className="router-compact__label">{t('footerTitle')}</span>
        {routerItems.map((item) => (
          <ExternalLink key={item.key} href={item.href} company={item.company} location={location} className="lnk router-compact__link">
            {t(`items.${item.key}.q`)} <strong>{item.label}</strong> <ArrowUpRight size={13} aria-hidden />
          </ExternalLink>
        ))}
        <style dangerouslySetInnerHTML={{ __html: `
          .router-compact { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px 22px; padding-top: 26px; border-top: 1px solid rgba(255,255,255,.12); }
          .router-compact__label { font-size: 11.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--on-dark-muted); }
          .router-compact__link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--on-dark-soft); padding: 5px 0; }
          .router-compact__link strong { color: #fff; font-weight: 700; }
          .router-compact__link svg { color: var(--red-bright); }
        `}} />
      </nav>
    );
  }

  return (
    <section className="container section" id="router" aria-labelledby="router-title">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(28px,4vw,48px)' }}>
        <div>
          <Eyebrow num="01" label={t('eyebrow')} />
          <h2 id="router-title" className="h2" style={{ maxWidth: '14ch' }}>{t('title')}</h2>
        </div>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 380, margin: 0 }}>{t('intro')}</p>
      </div>

      <div className="grid-lines router-grid">
        {routerItems.map((item, i) => {
          const company = getCompany(item.company);
          return (
            <div key={item.key} className="router-card">
              <div className="router-card__num">0{i + 1}</div>
              <h3 className="router-card__q">{t(`items.${item.key}.q`)}</h3>
              <p className="router-card__a">{t(`items.${item.key}.a`)}</p>
              <div className="router-card__links">
                {/* Visible label = the domain (never wraps at four-up width);
                    the accessible name keeps the verb: "Go to stretchplafond.be". */}
                <ExternalLink href={item.href} company={item.company} location={location} className="btn btn--dark router-card__btn" ariaLabel={t(`items.${item.key}.cta`)}>
                  <span>{item.label}</span> <ArrowUpRight size={15} aria-hidden />
                </ExternalLink>
                <div className="router-card__alt-slot">
                  {item.alt && (
                    <ExternalLink href={item.alt.href} company={item.company} location={`${location}_alt`} className="lnk router-card__alt">
                      {t(`items.${item.key}.altCta`)}
                    </ExternalLink>
                  )}
                </div>
              </div>
              {company && <div className="router-card__company">{company.name}</div>}
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .router-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 1100px) { .router-grid { grid-template-columns: repeat(2, 1fr); } }
        .router-card { background: #fff; padding: clamp(24px,2.6vw,36px); display: flex; flex-direction: column; gap: 12px; min-height: 300px; }
        .router-card__q { min-height: 3.15em; }
        .router-card__num { font-family: var(--font-display); font-weight: 800; color: var(--red); font-size: 13px; letter-spacing: .1em; }
        .router-card__q { font-family: var(--font-display); font-weight: 800; font-size: clamp(20px,1.9vw,26px); letter-spacing: -.01em; text-transform: uppercase; line-height: 1.05; margin: 0; }
        .router-card__a { font-size: 14.5px; line-height: 1.6; color: var(--text-muted); margin: 0; flex: 1 1 auto; }
        .router-card__links { display: flex; flex-direction: column; align-items: stretch; gap: 10px; margin-top: auto; }
        .router-card__btn { width: 100%; justify-content: space-between; white-space: nowrap; }
        .router-card__alt-slot { min-height: 22px; }
        .router-card__alt { font-size: 13px; font-weight: 600; color: var(--text-muted-2); }
        .router-card__company { font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--text-faint-2); margin-top: 8px; }
        @media (max-width: 640px) { .router-grid { grid-template-columns: 1fr; } .router-card { min-height: 0; } }
      `}} />
    </section>
  );
}
