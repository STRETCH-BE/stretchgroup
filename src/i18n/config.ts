// ============================================================================
// i18n — SINGLE SOURCE OF TRUTH (group edition)
//
// ONE DOMAIN, PATH-PREFIXED ROUTING. Unlike the product site (one locale per
// domain), the group has a single domain, so locales live under a path
// prefix. The default locale is unprefixed and is the hreflang x-default:
//
//   stretchgroup.be/about      → locale "en" (default, x-default)
//   stretchgroup.be/nl/about   → locale "nl" (Dutch, Belgium — nl-BE)
//
// PENDING LOCALES: fr / de / pl are declared here but `pending`. A pending
// locale is not routed, not in the sitemap, not in hreflang and not in the
// language switcher. Enabling one is a one-line flip below (`'pending'` →
// `'live'`) plus a `messages/<locale>.json` file. Nothing else changes.
//
// DEFAULT-LOCALE FLIP: if the team prefers Dutch as the unprefixed default
// for the .be audience, change `defaultLocale` to 'nl' — every helper here
// (paths, canonicals, hreflang, sitemap, middleware) derives from it. The
// redirect targets in redirects.mjs are locale-agnostic ("/about"), so the
// flip is safe (documented in CHANGES.md).
//
// Everything else — middleware, navigation, sitemap, <html lang>, canonical
// URLs, OG locales, robots — derives from this file.
// ============================================================================
import { defineRouting } from 'next-intl/routing';

export const locales = [
  'en', // English — default, unprefixed, x-default
  'nl', // Dutch (Belgium) — /nl
  'fr', // French — pending
  'de', // German — pending
  'pl', // Polish — pending
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// ---------------------------------------------------------------------------
// LIVENESS — 'live' = routed and advertised. 'pending' = declared only.
// ---------------------------------------------------------------------------
export const localeStatus: Record<Locale, 'live' | 'pending'> = {
  en: 'live',
  nl: 'live',
  fr: 'pending', // add messages/fr.json, then flip
  de: 'pending', // add messages/de.json, then flip
  pl: 'pending', // add messages/pl.json, then flip
};

export const liveLocales = locales.filter((l) => localeStatus[l] === 'live');

// next-intl routing definition (consumed by middleware + navigation helpers).
// Only LIVE locales are routed; the default locale carries no prefix.
// localeDetection is OFF on purpose: URLs are deterministic (no
// Accept-Language 307 on the homepage), which keeps crawl paths and the
// redirect verification predictable. Visitors pick a language in the header.
export const routing = defineRouting({
  locales: liveLocales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
  alternateLinks: false, // hreflang ships in <head> + sitemap (single source)
});

// Native-language display names (language switcher).
export const localeNames: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
  fr: 'Français',
  de: 'Deutsch',
  pl: 'Polski',
};

export const localeFlags: Record<Locale, string> = {
  en: '🌐',
  nl: '🇧🇪',
  fr: '🇫🇷',
  de: '🇩🇪',
  pl: '🇵🇱',
};

// BCP 47 codes — <html lang>, OG locale, hreflang. The ONLY codes exposed to
// browsers and search engines.
export const localeFullCodes: Record<Locale, string> = {
  en: 'en',
  nl: 'nl-BE',
  fr: 'fr-BE',
  de: 'de',
  pl: 'pl-PL',
};

// Open Graph locales — og:locale wants language_TERRITORY (Facebook rejects a
// bare "en"); hreflang / <html lang> keep the BCP 47 codes above.
export const ogLocaleCodes: Record<Locale, string> = {
  en: 'en_GB',
  nl: 'nl_BE',
  fr: 'fr_BE',
  de: 'de_DE',
  pl: 'pl_PL',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** True for a LIVE locale code (pending locales are not valid routes). */
export function isValidLocale(value: string): value is Locale {
  return (liveLocales as readonly string[]).includes(value);
}

/** Path prefix for a locale: '' for the default locale, '/nl' otherwise. */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? '' : `/${locale}`;
}

/** Locale-prefixed path for a route, e.g. ('nl', '/about') → '/nl/about'. */
export function localePath(locale: Locale, route: string = '/'): string {
  const clean = route === '/' ? '' : route.replace(/\/+$/, '');
  const prefixed = `${localePrefix(locale)}${clean}`;
  return prefixed === '' ? '/' : prefixed;
}

/** Pull the leading locale segment from a pathname, or the default locale. */
export function getLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg && isValidLocale(seg) ? seg : defaultLocale;
}

/** Strip the leading (live) locale segment, returning the remaining path. */
export function removeLocaleFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] && isValidLocale(parts[0])) parts.shift();
  return '/' + parts.join('/');
}
