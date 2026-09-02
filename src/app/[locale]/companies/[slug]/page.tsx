// Company detail pages (/companies/stretch, /companies/stretch-sufit,
// /companies/re-sound). Statically generated for the three slugs only;
// anything else is caught by the middleware fallback long before this.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isValidLocale, liveLocales, type Locale } from '@/i18n/config';
import { companies, getCompany } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { buildCanonical } from '@/lib/seo';
import { breadcrumbSchema, companySchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import CompanyPage from '@/components/sections/CompanyPage';

export const dynamicParams = false;

export function generateStaticParams() {
  return liveLocales.flatMap((locale) => companies.map((c) => ({ locale, slug: c.slug })));
}

// meta key prefixes per slug (messages/meta.*)
const META_KEYS: Record<string, string> = { stretch: 'stretch', 'stretch-sufit': 'stretchSufit', 're-sound': 'reSound' };

export function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const key = META_KEYS[params.slug];
  if (!key) return Promise.resolve({});
  return pageMetadata({
    locale: params.locale,
    route: `/companies/${params.slug}`,
    titleKey: `${key}Title`,
    descKey: `${key}Description`,
    ogPath: `/api/og/${params.slug}`,
  });
}

export default async function CompanyDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const company = getCompany(params.slug);
  if (!company) notFound();
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('companies');
  const tc = await getTranslations('common');

  const crumbs = breadcrumbSchema([
    { name: tc('nav.home'), url: buildCanonical(locale, '/') },
    { name: t('eyebrow'), url: buildCanonical(locale, '/companies') },
    { name: t(`${company.slug}.name`), url: buildCanonical(locale, `/companies/${company.slug}`) },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <JsonLd data={companySchema(company)} />
      <CompanyPage company={company} />
    </>
  );
}
