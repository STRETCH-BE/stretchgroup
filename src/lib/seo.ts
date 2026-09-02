// ============================================================================
// SEO helpers — ONE DOMAIN, PATH-PREFIXED locales.
//   canonical  → https://stretchgroup.be<route>        (default locale)
//              → https://stretchgroup.be/nl<route>     (other live locales)
//   hreflang   → one entry per LIVE locale + x-default (the default locale)
// Derives entirely from i18n/config: adding a locale needs no change here.
// ============================================================================
import type { Metadata } from 'next';
import { liveLocales, defaultLocale, localeFullCodes, localePath, localePrefix, type Locale, ogLocaleCodes } from '@/i18n/config';
import { siteUrl } from '@/lib/site-config';

/** Normalize a route to a clean, leading-slash path with no trailing slash. */
function normalizeRoute(route: string): string {
  if (!route || route === '/') return '/';
  return ('/' + route.replace(/^\/+|\/+$/g, '')).replace(/\/+/g, '/');
}

/** Absolute base URL of a locale (no trailing slash): "https://stretchgroup.be/nl". */
export function localeBase(locale: Locale): string {
  return `${siteUrl}${localePrefix(locale)}`;
}

/** Absolute URL for a (locale, route) pair, e.g. https://stretchgroup.be/nl/about. */
export function buildCanonical(locale: Locale, route: string): string {
  const path = localePath(locale, normalizeRoute(route));
  return path === '/' ? siteUrl : `${siteUrl}${path}`;
}

/** hreflang alternates: one per live locale (BCP 47 key) + x-default. */
export function buildAlternates(locale: Locale, route: string): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of liveLocales) languages[localeFullCodes[l]] = buildCanonical(l, route);
  languages['x-default'] = buildCanonical(defaultLocale, route);
  return { canonical: buildCanonical(locale, route), languages };
}

/** OG locale + alternateLocale for the active locale (nl_BE style). */
export function buildOgLocales(locale: Locale): { ogLocale: string; alternate: string[] } {
  const fmt = (code: string) => code.replace('-', '_');
  return {
    ogLocale: fmt(ogLocaleCodes[locale]),
    alternate: liveLocales.filter((l) => l !== locale).map((l) => fmt(ogLocaleCodes[l])),
  };
}
