// Terms (/terms). DRAFTED — flagged in CHANGES.md for legal review.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { pageMetadata } from '@/lib/page-meta';
import { buildCanonical } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import LegalPage from '@/components/sections/LegalPage';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/terms', titleKey: 'termsTitle', descKey: 'termsDescription' });
}

export default async function TermsPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const tc = await getTranslations('common');
  const t = await getTranslations('legal');
  const crumbs = breadcrumbSchema([
    { name: tc('nav.home'), url: buildCanonical(locale, '/') },
    { name: t('terms.title'), url: buildCanonical(locale, '/terms') },
  ]);
  return (
    <>
      <JsonLd data={crumbs} />
      <LegalPage kind="terms" />
    </>
  );
}
