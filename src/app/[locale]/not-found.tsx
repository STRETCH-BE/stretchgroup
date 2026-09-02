// Branded 404 (noindex, follow). With the middleware fallback (Layer 4)
// active this page is effectively unreachable for URL typos — it exists as
// belt-and-braces for notFound() calls. Short message + the three company
// sites, so even here nobody is stranded.
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { companies } from '@/lib/site-config';
import ExternalLink from '@/components/ui/ExternalLink';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: { absolute: t('notFoundTitle') },
    description: t('notFoundDescription'),
    robots: { index: false, follow: true },
  };
}

export default async function NotFound() {
  const t = await getTranslations('notFound');
  const tc = await getTranslations('companies');
  return (
    <section className="container section" style={{ textAlign: 'center', minHeight: '54vh' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(72px,16vw,180px)', lineHeight: 0.86, letterSpacing: '-.04em', color: 'var(--black)' }} aria-hidden>
        4<span style={{ color: 'var(--red)' }}>0</span>4
      </div>
      <h1 className="h2 h2--sm" style={{ margin: '20px 0 14px' }}>{t('title')}</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 30px' }}>{t('body')}</p>
      <Link href="/" className="btn btn--primary">{t('home')}</Link>
      <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)', margin: '40px 0 14px' }}>{t('companies')}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {companies.map((c) => (
          <ExternalLink key={c.slug} href={c.url} company={c.slug} location="not_found" className="btn btn--ghost btn--sm">
            {tc(`${c.slug}.name`)} · {c.urlLabel} <ArrowUpRight size={13} aria-hidden />
          </ExternalLink>
        ))}
      </div>
    </section>
  );
}
