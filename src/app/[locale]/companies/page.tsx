// Companies overview (/companies): the three companies + the router.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { pageMetadata } from '@/lib/page-meta';
import { buildCanonical } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import CompaniesGrid from '@/components/sections/home/CompaniesGrid';
import CompanyRouter from '@/components/sections/CompanyRouter';
import ContactBand from '@/components/sections/home/ContactBand';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/companies', titleKey: 'companiesTitle', descKey: 'companiesDescription' });
}

export default async function CompaniesPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('companies');
  const tc = await getTranslations('common');

  const crumbs = breadcrumbSchema([
    { name: tc('nav.home'), url: buildCanonical(locale, '/') },
    { name: t('eyebrow'), url: buildCanonical(locale, '/companies') },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(28px,4vw,48px)' }}>
        <Eyebrow num="01" label={t('eyebrow')} />
        <h1 className="h1" style={{ margin: '0 0 20px', maxWidth: '14ch' }}>{t('title')}</h1>
        <p className="lead" style={{ maxWidth: 560, margin: 0 }}>{t('intro')}</p>
      </section>
      <CompaniesGrid heading={false} location="companies_grid" />
      <CompanyRouter variant="full" location="companies_router" />
      <ContactBand />
    </>
  );
}
