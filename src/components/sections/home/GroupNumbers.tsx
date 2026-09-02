// Group numbers — VERIFIED facts only, derived from site-config so the tiles
// can never drift from the data: number of companies, offices, live market
// websites, and the year the first factory opened.
import { useTranslations } from 'next-intl';
import { companies, offices, liveMarkets, timeline } from '@/lib/site-config';
import Eyebrow from '@/components/ui/Eyebrow';

export default function GroupNumbers() {
  const t = useTranslations('home.numbers');
  const tiles = [
    { key: 'companies', value: String(companies.length) },
    { key: 'offices', value: String(offices.length) },
    { key: 'markets', value: String(liveMarkets.length) },
    { key: 'factory', value: timeline[0].year },
  ];

  return (
    <section className="section--dark" aria-labelledby="numbers-title">
      <div className="container section--sm" style={{ paddingTop: 'clamp(48px,6vw,90px)', paddingBottom: 'clamp(48px,6vw,90px)' }}>
        <Eyebrow num="03" label={t('eyebrow')} tone="dark" />
        <h2 id="numbers-title" className="visually-hidden">{t('eyebrow')}</h2>
        <div className="grid-lines grid-lines--dark gn-grid">
          {tiles.map((s) => (
            <div key={s.key} style={{ background: 'var(--black)', padding: 'clamp(24px,2.6vw,36px) 24px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: 1, letterSpacing: '-.03em' }}>
                {s.value}
                <span className="accent" style={{ color: 'var(--red-bright)' }}>.</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--on-dark-muted-2)', marginTop: 12 }}>
                {t(`items.${s.key}`)}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--on-dark-faint)', margin: '18px 0 0', maxWidth: 560, lineHeight: 1.6 }}>{t('note')}</p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .gn-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 720px) { .gn-grid { grid-template-columns: 1fr 1fr; } }
      `}} />
    </section>
  );
}
