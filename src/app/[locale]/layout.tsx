// ROOT + locale layout: all routes live under [locale], so this is the app's
// root layout — it owns <html lang> per locale, fonts and global styles.
// Validates the (live) locale, provides messages to client components, sets
// default metadata, and mounts the shared chrome: consent-mode defaults,
// analytics, scroll tracking, header, footer and the cookie banner.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { archivo } from '../fonts';
import '../globals.css';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { liveLocales, isValidLocale, localeFullCodes, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { buildCanonical, buildAlternates, buildOgLocales } from '@/lib/seo';
import { ConsentModeDefaults, ScrollTracker, AnalyticsScripts } from '@/components/analytics';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/layout/CookieConsent';

export function generateStaticParams() {
  return liveLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const { ogLocale, alternate } = buildOgLocales(locale);
  const og = `${siteUrl}/api/og`;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t('homeTitle'), template: `%s | ${brand.name}` },
    description: t('homeDescription'),
    applicationName: brand.name,
    robots: { index: true, follow: true },
    alternates: buildAlternates(locale, '/'),
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title: t('homeTitle'),
      description: t('homeDescription'),
      url: buildCanonical(locale, '/'),
      locale: ogLocale,
      alternateLocale: alternate,
      images: [{ url: og, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: { card: 'summary_large_image', title: t('homeTitle'), description: t('homeDescription'), images: [og] },
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('common');

  return (
    <html lang={localeFullCodes[locale]} className={archivo.variable} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Consent Mode v2 defaults — must run before analytics. */}
          <ConsentModeDefaults />
          <AnalyticsScripts />

          <a href="#main" className="skip-link">{t('skipToContent')}</a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CookieConsent />
          <ScrollTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
