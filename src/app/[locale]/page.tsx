// Homepage: hero (the index) → router → companies grid → group numbers →
// markets → timeline teaser → contact band. Emits the group Organization,
// the WebSite node and the HQ LocalBusiness JSON-LD.
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { defaultLocale, isValidLocale, type Locale } from '@/i18n/config';
import JsonLd from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema, localBusinessSchema } from '@/lib/structured-data';
import Hero from '@/components/sections/home/Hero';
import CompanyRouter from '@/components/sections/CompanyRouter';
import CompaniesGrid from '@/components/sections/home/CompaniesGrid';
import GroupNumbers from '@/components/sections/home/GroupNumbers';
import Markets from '@/components/sections/home/Markets';
import Timeline from '@/components/sections/home/Timeline';
import ContactBand from '@/components/sections/home/ContactBand';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale: Locale = isValidLocale(params.locale) ? (params.locale as Locale) : defaultLocale;
  setRequestLocale(locale);
  const t = await getTranslations('meta');

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema({ locale, description: t('homeDescription') })} />
      <JsonLd data={localBusinessSchema()} />

      <Hero />
      <CompanyRouter variant="full" location="home_router" />
      <CompaniesGrid location="home_companies" />
      <GroupNumbers />
      <Markets />
      <Timeline variant="teaser" />
      <ContactBand />
    </>
  );
}
