'use client';

// Closing contact band (red). One CTA into /contact, the phone line beside it.
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { contact } from '@/lib/site-config';
import { analytics } from '@/lib/analytics';

export default function ContactBand({ titleKey = 'title' }: { titleKey?: string }) {
  const t = useTranslations('home.contactBand');
  return (
    <section className="section--red" aria-labelledby="contact-band-title">
      <div className="container section--sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h2 id="contact-band-title" className="h2 h2--sm" style={{ color: '#fff', margin: '0 0 8px', maxWidth: '18ch' }}>{t(titleKey)}</h2>
          <p style={{ color: '#fff', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>{t('body')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
          <Link href="/contact" className="btn btn--dark">
            {t('cta')} <ArrowRight size={16} aria-hidden />
          </Link>
          <p style={{ margin: 0, fontSize: 13.5, color: '#fff' }}>
            {t('or')}{' '}
            <a href={contact.phoneHref} style={{ fontWeight: 700, borderBottom: '2px solid #fff' }} onClick={() => analytics.phoneClick('contact_band')}>
              {contact.phoneDisplay}
            </a>{' '}
            · {contact.hoursDisplay}
          </p>
        </div>
      </div>
    </section>
  );
}
