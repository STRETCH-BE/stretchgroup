// Markets — the live domain portfolio grouped by company. Pending domains
// (no DNS yet) are excluded by `status` in site-config: flip the flag to
// list one. Every entry is a real, followed outbound anchor, which also
// gives Google a crawl path from the group entity into each market site.
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { companies, liveMarkets } from '@/lib/site-config';
import Eyebrow from '@/components/ui/Eyebrow';
import ExternalLink from '@/components/ui/ExternalLink';

export default function Markets({ num = '04' }: { num?: string }) {
  const t = useTranslations('home.markets');
  const tc = useTranslations('companies');
  const tcountry = useTranslations('countries');

  return (
    <section className="container section" id="markets" aria-labelledby="markets-title">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(28px,4vw,48px)' }}>
        <div>
          <Eyebrow num={num} label={t('eyebrow')} />
          <h2 id="markets-title" className="h2" style={{ maxWidth: '14ch' }}>{t('title')}</h2>
        </div>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 380, margin: 0 }}>{t('intro', { count: liveMarkets.length })}</p>
      </div>

      <div className="mk-groups">
        {companies.map((c) => {
          const sites = liveMarkets.filter((m) => m.company === c.slug);
          if (sites.length === 0) return null;
          return (
            <div key={c.slug} className="mk-group">
              <h3 className="mk-group__title">{t('byCompany', { name: tc(`${c.slug}.name`) })}</h3>
              <ul className="grid-lines mk-list" role="list" aria-label={t('byCompany', { name: tc(`${c.slug}.name`) })}>
                {sites.map((m) => (
                  <li key={m.domain}>
                    <ExternalLink href={`https://${m.domain}`} company={c.slug} location="home_markets" className="mk-item">
                      <span className="mk-item__country">{tcountry(m.country)}</span>
                      <span className="mk-item__domain">{m.domain}</span>
                      <ArrowUpRight size={14} className="mk-item__arrow" aria-hidden />
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mk-groups { display: flex; flex-direction: column; gap: clamp(28px,3vw,40px); }
        .mk-group__title { font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--text-faint-2); margin: 0 0 12px; }
        .mk-list { list-style: none; margin: 0; padding: 1px; grid-template-columns: repeat(4, 1fr); background: transparent; border: 0; }
        .mk-list > li { box-shadow: 0 0 0 1px var(--border); }
        .mk-item { display: flex; align-items: center; gap: 10px; background: #fff; padding: 16px 18px; transition: background .15s ease; }
        .mk-item:hover { background: var(--surface); }
        .mk-item__country { font-size: 12.5px; color: var(--text-muted); flex: 1 1 auto; }
        .mk-item__domain { font-family: var(--font-display); font-weight: 800; font-size: 13.5px; letter-spacing: -.01em; }
        .mk-item__arrow { color: var(--red); flex-shrink: 0; }
        @media (max-width: 1000px) { .mk-list { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 720px) { .mk-list { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 460px) { .mk-list { grid-template-columns: 1fr; } }
      `}} />
    </section>
  );
}
