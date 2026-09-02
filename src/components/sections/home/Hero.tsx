'use client';

// HOME HERO — "The Index" (docs/DESIGN-PLAN.md). A full-black opening: the
// group wordmark at display size, a two-line statement and the three
// companies as a numbered list of real links. Hovering or focusing a row
// swaps the single image/logo slot on the right. ONE orchestrated entrance
// (wordmark → statement → rows, ≈600 ms total); under prefers-reduced-motion
// the global rule zeroes every animation so it renders in its final state.
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { companies } from '@/lib/site-config';
import Placeholder from '@/components/ui/Placeholder';

export default function Hero() {
  const t = useTranslations('home.hero');
  const tc = useTranslations('companies');
  const [active, setActive] = useState(0);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-eyebrow hero-in" style={{ animationDelay: '0ms' }}>
            <span className="hero-eyebrow__rule" aria-hidden />
            {t('eyebrow')}
          </p>
          <h1 id="hero-title" className="h-display hero-title hero-in" style={{ animationDelay: '80ms' }}>
            {t('title1')}
            <br />
            <span className="accent">{t('title2')}</span>
          </h1>
          <p className="hero-statement hero-in" style={{ animationDelay: '180ms' }}>
            {t('statement')}
          </p>

          <p className="hero-hint hero-in" style={{ animationDelay: '260ms' }}>{t('hint')}</p>
          <ul className="hero-index" aria-label={t('indexAria')}>
            {companies.map((c, i) => (
              <li key={c.slug} className="hero-in" style={{ animationDelay: `${320 + i * 90}ms` }}>
                <Link
                  href={`/companies/${c.slug}`}
                  className={`hero-row${active === i ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span className="hero-row__num">0{i + 1}</span>
                  <span className="hero-row__name">{tc(`${c.slug}.name`)}</span>
                  <span className="hero-row__kicker">{tc(`${c.slug}.kicker`)}</span>
                  <span className="hero-row__url">{c.urlLabel}</span>
                  <ArrowRight size={18} className="hero-row__arrow" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Image / logo slot — swaps with the active row. Decorative: the row
            text carries the meaning. */}
        <div className="hero-slot hero-in" style={{ animationDelay: '200ms' }} aria-hidden="true">
          {companies.map((c, i) => (
            <div key={c.slug} className="hero-slot__layer" style={{ opacity: active === i ? 1 : 0 }}>
              <Placeholder label={t('slotLabel', { name: c.name })} decorative style={{ background: 'repeating-linear-gradient(135deg, #222, #222 12px, #1a1a1a 12px, #1a1a1a 24px)', color: '#8a867f' }} />
            </div>
          ))}
          <div className="hero-slot__caption">
            <span className="hero-slot__num">0{active + 1}</span>
            <span>{tc(`${companies[active].slug}.oneLiner`)}</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero { background: var(--black); color: #fff; overflow: hidden; }
        .hero-grid {
          display: grid; grid-template-columns: 1.15fr .85fr; gap: clamp(28px,4vw,64px); align-items: stretch;
          min-height: min(calc(100vh - var(--header-h) - 42px), 860px);
          padding-top: clamp(56px,8vw,110px); padding-bottom: clamp(48px,6vw,90px);
        }
        .hero-copy { display: flex; flex-direction: column; justify-content: center; }
        @keyframes hero-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .hero-in { animation: hero-in .6s cubic-bezier(.2,.7,.2,1) both; }
        .hero-eyebrow { display: flex; align-items: center; gap: 14px; margin: 0 0 clamp(18px,2.4vw,28px); font-size: 12.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #fff; }
        .hero-eyebrow__rule { width: 34px; height: 2px; background: var(--red); flex-shrink: 0; display: inline-block; }
        .hero-title { margin: 0; max-width: 12ch; }
        .hero-statement { font-size: clamp(16px,1.7vw,20px); line-height: 1.5; color: var(--on-dark-soft); max-width: 44ch; margin: clamp(20px,2.6vw,30px) 0 clamp(28px,3.6vw,44px); }
        .hero-hint { font-size: 11.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--on-dark-faint); margin: 0 0 6px; }
        .hero-index { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line-dark); }
        .hero-row {
          display: grid; grid-template-columns: 2.4rem 1fr auto auto; align-items: center; gap: 16px;
          padding: clamp(14px,1.8vw,22px) 0; border-bottom: 1px solid var(--line-dark); color: #fff;
          transition: background .2s ease, padding-left .2s ease;
        }
        .hero-row:hover, .hero-row.is-active { background: rgba(255,255,255,.04); padding-left: 10px; }
        .hero-row:focus-visible { outline-offset: -3px; }
        .hero-row__num { font-family: var(--font-display); font-weight: 800; font-size: 13px; letter-spacing: .1em; color: var(--red-bright); }
        .hero-row__name { font-family: var(--font-display); font-weight: 900; font-size: clamp(24px,3.6vw,48px); line-height: .95; letter-spacing: -.03em; text-transform: uppercase; }
        .hero-row__kicker { font-size: 12.5px; color: var(--on-dark-muted-2); text-align: right; max-width: 18ch; }
        .hero-row__url { font-size: 12.5px; font-weight: 600; color: var(--on-dark-faint); letter-spacing: .02em; }
        .hero-row__arrow { color: var(--red-bright); grid-column: 4; opacity: 0; transform: translateX(-6px); transition: opacity .2s, transform .2s; }
        .hero-row:hover .hero-row__arrow, .hero-row.is-active .hero-row__arrow { opacity: 1; transform: none; }
        .hero-row__url { grid-column: 3; }
        .hero-row { grid-template-columns: 2.4rem 1fr auto 20px; }
        .hero-row__kicker { grid-column: 1 / 3; grid-row: 2; text-align: left; max-width: none; }
        .hero-slot { position: relative; min-height: 420px; border: 1px solid #333; background: #141414; }
        .hero-slot__layer { position: absolute; inset: 0; transition: opacity .35s ease; }
        .hero-slot__layer > * { width: 100%; height: 100%; }
        .hero-slot__caption { position: absolute; left: 0; right: 0; bottom: 0; display: flex; gap: 14px; align-items: baseline; padding: 18px 22px; background: rgba(10,10,10,.82); font-size: 13.5px; line-height: 1.5; color: var(--on-dark-soft); border-top: 1px solid var(--line-dark); }
        .hero-slot__num { font-family: var(--font-display); font-weight: 800; font-size: 13px; color: var(--red-bright); letter-spacing: .1em; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; min-height: 0; }
          .hero-slot { display: none; }
          .hero-row { grid-template-columns: 2rem 1fr 20px; }
          .hero-row__url { display: none; }
          .hero-row__kicker { grid-column: 2; }
        }
      `}} />
    </section>
  );
}
