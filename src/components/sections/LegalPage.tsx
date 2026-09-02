// Legal pages (privacy, terms). DRAFTED content, flagged in CHANGES.md for
// review by the group's legal advisor before launch. Copy lives in messages
// under `legal.<kind>` as {h, p[]} sections so the Dutch version is real
// Dutch, not a machine mirror.
import { getTranslations } from 'next-intl/server';
import { contact } from '@/lib/site-config';

type Section = { h: string; p: string[] };

export default async function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const t = await getTranslations('legal');
  const sections = t.raw(`${kind}.sections`) as Section[];

  return (
    <section className="container section">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 16 }}>{t('eyebrow')}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,4.6vw,58px)', lineHeight: 0.98, letterSpacing: '-.03em', textTransform: 'uppercase', margin: '0 0 14px' }}>
          {t(`${kind}.title`)}
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-faint)', margin: '0 0 clamp(32px,4vw,48px)' }}>{t('updated', { date: t('updatedDate') })}</p>

        <div className="prose">
          <p>{t(`${kind}.intro`)}</p>
          {sections.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ))}
          <h2>{t('contactHeading')}</h2>
          <p>
            {t('contactBody')}{' '}
            <a href={`mailto:${contact.email}`} className="lnk">{contact.email}</a>
            {' — '}
            {contact.address.street} ({contact.address.building}), {contact.address.postalCode} {contact.address.city}, {t('belgium')}.
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--text-faint)', borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 32 }}>{t('reviewNote')}</p>
        </div>
      </div>
    </section>
  );
}
