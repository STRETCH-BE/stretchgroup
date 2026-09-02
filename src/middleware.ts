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
// Anything with a file extension is asset-like: let the filesystem decide. A
// real file in public/ is served; a missing one falls through to the
// `fallback` rewrite in next.config (Layer 4b) and still ends on the homepage.
const ASSET_LIKE = /\.[a-z0-9]{1,8}$/i;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ASSET_LIKE.test(pathname)) {
    // Forward the original path so the Layer 4b handler can keep the locale
    // ("/nl/foto.jpg" → "/nl") if the file turns out not to exist.
    const headers = new Headers(request.headers);
    headers.set('x-legacy-path', pathname);
    return NextResponse.next({ request: { headers } });
  }
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
  // Match everything except API routes and Next internals. Asset-like paths
  // (any file extension) pass straight through above; unknown ones are caught
  // by the next.config fallback rewrite, so nothing 404s either way.
  matcher: ['/((?!api/|_next/|_vercel/).*)'],
};
