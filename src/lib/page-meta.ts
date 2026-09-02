// Builds <head> metadata for the static routes from the `meta` translation
// namespace + hreflang alternates. Titles in messages already include the
// "| STRETCH Group" suffix, so they are applied as absolute.
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { brand } from '@/lib/site-config';
import { buildCanonical, buildAlternates, buildOgLocales } from '@/lib/seo';
import { siteUrl } from '@/lib/site-config';

export async function pageMetadata(opts: {
  locale: string;
  route: string;
  titleKey: string;
  descKey: string;
  /** OG image path (default /api/og). Locale-independent, served from the apex. */
  ogPath?: string;
  index?: boolean;
  /** Override the title/description with already-resolved strings. */
  title?: string;
  description?: string;
}): Promise<Metadata> {
  if (!isValidLocale(opts.locale)) return {};
  const locale = opts.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const { ogLocale, alternate } = buildOgLocales(locale);
  const title = opts.title ?? t(opts.titleKey);
  const description = opts.description ?? t(opts.descKey);
  const ogImg = `${siteUrl}${opts.ogPath ?? '/api/og'}`;
  const url = buildCanonical(locale, opts.route);

  return {
    title: { absolute: title },
    description,
    robots: opts.index === false ? { index: false, follow: true } : { index: true, follow: true },
    alternates: buildAlternates(locale, opts.route),
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title,
      description,
      url,
      locale: ogLocale,
      alternateLocale: alternate,
      images: [{ url: ogImg, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImg] },
  };
}
