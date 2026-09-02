// /sitemap.xml — one domain, every LIVE locale × every static route, with
// hreflang alternates (BCP 47 keys + x-default) on each entry. Pending
// locales never appear. <lastmod> is the real per-route content date from
// site-config (staticRouteDates), never the build time.
import type { MetadataRoute } from 'next';
import { liveLocales, defaultLocale, localeFullCodes } from '@/i18n/config';
import { staticRoutes, staticRouteDates } from '@/lib/site-config';
import { buildCanonical } from '@/lib/seo';

function priorityFor(route: string): number {
  if (route === '/') return 1;
  if (route === '/companies' || route.startsWith('/companies/')) return 0.9;
  if (route === '/contact' || route === '/about') return 0.8;
  if (route === '/careers') return 0.6;
  return 0.3;
}

function changeFreqFor(route: string): MetadataRoute.Sitemap[number]['changeFrequency'] {
  if (route === '/') return 'weekly';
  if (route === '/privacy' || route === '/terms') return 'yearly';
  return 'monthly';
}

export default function sitemap(): MetadataRoute.Sitemap {
  return liveLocales.flatMap((locale) =>
    staticRoutes.map((route) => {
      const languages: Record<string, string> = {};
      for (const l of liveLocales) languages[localeFullCodes[l]] = buildCanonical(l, route);
      languages['x-default'] = buildCanonical(defaultLocale, route);
      return {
        url: buildCanonical(locale, route),
        lastModified: new Date(`${staticRouteDates[route] ?? '2026-09-02'}T00:00:00.000Z`),
        changeFrequency: changeFreqFor(route),
        priority: priorityFor(route),
        alternates: { languages },
      };
    }),
  );
}
