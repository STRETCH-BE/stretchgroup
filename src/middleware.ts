import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing, defaultLocale, getLocaleFromPath, removeLocaleFromPath, localePath } from './i18n/config';
import { isKnownRoute } from './lib/routes';

// next-intl middleware in PATH-PREFIX mode on one domain: "/about" is the
// default locale (en), "/nl/about" is Dutch. Pending locales are not routed.
const intlMiddleware = createMiddleware(routing);

// ---------------------------------------------------------------------------
// LAYER 4 — ZERO-404 FALLBACK.
// next.config redirects (Layers 2–3) run BEFORE this middleware, so anything
// arriving here either is one of the new site's own routes or is a path
// nothing mapped: a mistyped link, a dead backlink, a legacy URL the crawl
// missed. Those get a 301 to the localized home instead of a 404. A global
// "/:path*" redirect in next.config would hijack the site's own pages — this
// is the only place with enough context to tell the two apart.
// The known-route list lives next to `staticRoutes` in src/lib/site-config.ts
// (re-exported through src/lib/routes.ts, which is edge-safe).
// ---------------------------------------------------------------------------
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const route = removeLocaleFromPath(pathname);

  if (!isKnownRoute(route)) {
    const locale = getLocaleFromPath(pathname);
    const home = new URL(localePath(locale === defaultLocale ? defaultLocale : locale, '/'), request.url);
    home.search = '';
    return NextResponse.redirect(home, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match everything except: API routes, Next internals, the site's own
  // static assets and the metadata route handlers. Deliberately NOT the usual
  // "anything with a dot" exclusion — legacy ".html/.php/.jpg" paths that no
  // redirect caught must still land on the homepage (Layer 4), never 404.
  matcher: [
    '/((?!api/|_next/|_vercel/|images/|favicon\\.ico|favicon\\.svg|apple-touch-icon\\.png|icon-512\\.png|robots\\.txt|sitemap\\.xml|llms\\.txt).*)',
  ],
};
