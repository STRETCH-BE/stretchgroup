// Timeline — the group's dated milestones. `teaser` (home) shows years +
// titles in a horizontal strip with a link to /about; the full variant
// (about) adds the body copy. Every entry maps to a verified fact in
// site-config; entries marked `confirm` carry neutral wording pending
// confirmation (CHANGES.md).
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { timeline } from '@/lib/site-config';
import Eyebrow from '@/components/ui/Eyebrow';

export default function Timeline({ variant = 'full', num = '05' }: { variant?: 'teaser' | 'full'; num?: string }) {
  const t = useTranslations('home.timeline');
  const te = useTranslations('timeline');
  const teaser = variant === 'teaser';

  return (
    <section className="section--surface" id="timeline" aria-labelledby="timeline-title">
      <div className="container section">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(28px,4vw,48px)' }}>
          <div>
            <Eyebrow num={num} label={t('eyebrow')} />
            <h2 id="timeline-title" className="h2" style={{ maxWidth: '14ch' }}>{t('title')}</h2>
          </div>
          {teaser && (
            <Link href="/about" className="btn btn--ghost">
              {t('cta')} <ArrowRight size={16} className="btn__arrow" aria-hidden />
            </Link>
          )}
        </div>

        <ol className={`tl ${teaser ? 'tl--teaser' : 'tl--full'}`}>
          {timeline.map((e, i) => (
            <li key={e.key} className="tl__item">
              <div className="tl__year">
                {e.year}
                {i < timeline.length - 1 && <span className="tl__line" aria-hidden />}
              </div>
              <div className="tl__title">{te(`${e.key}.title`)}</div>
              {!teaser && <p className="tl__body">{te(`${e.key}.body`)}</p>}
            </li>
          ))}
        </ol>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .tl { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; background: var(--border); border: 1px solid var(--border); }
        .tl--teaser { grid-template-columns: repeat(5, 1fr); }
        .tl--full { grid-template-columns: 1fr; }
        .tl__item { background: #fff; padding: clamp(20px,2.2vw,30px); position: relative; }
        .tl--full .tl__item { display: grid; grid-template-columns: 140px 1fr; gap: 8px clamp(20px,3vw,48px); align-items: start; }
        .tl--full .tl__body { grid-column: 2; }
        .tl__year { font-family: var(--font-display); font-weight: 900; font-size: clamp(22px,2.2vw,30px); letter-spacing: -.02em; color: var(--red); line-height: 1; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
        .tl--full .tl__year { margin-bottom: 0; grid-row: 1 / span 2; }
        .tl__line { flex: 1 1 auto; height: 2px; background: var(--border-2); }
        .tl--full .tl__line { display: none; }
        .tl__title { font-family: var(--font-display); font-weight: 800; font-size: 15.5px; letter-spacing: -.01em; line-height: 1.3; }
        .tl__body { font-size: 14.5px; line-height: 1.65; color: var(--text-muted); margin: 8px 0 0; max-width: 62ch; }
        @media (max-width: 1000px) { .tl--teaser { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) { .tl--teaser { grid-template-columns: 1fr; } .tl--full .tl__item { grid-template-columns: 1fr; } .tl--full .tl__year { grid-row: auto; margin-bottom: 8px; } .tl--full .tl__body { grid-column: 1; } }
      `}} />
    </section>
  );
}
