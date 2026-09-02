// LAYER 4b — the end of the line. next.config's `fallback` rewrite sends every
// request that matched no public file, no page and no route here (missing
// asset, stray .html, unknown /api/* path). It answers with a permanent
// redirect to the visitor's localized home, so this domain never emits an
// error status. The original path arrives as the x-legacy-path request
// header (set by the middleware for asset-like paths) or as ?path=
// (appended by the rewrite for the /api/* paths the middleware skips).
import { NextResponse } from 'next/server';
import { getLocaleFromPath, localePath } from '@/i18n/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirectHome(request: Request) {
  const url = new URL(request.url);
  const fromHeader = request.headers.get('x-legacy-path') || '';
  const fromQuery = url.searchParams.get('path') || '';
  const raw = fromHeader || fromQuery || '/';
  const original = raw.startsWith('/') ? raw : `/${raw}`;
  const locale = getLocaleFromPath(original);
  const res = NextResponse.redirect(new URL(localePath(locale, '/'), url.origin), 301);
  // Diagnostic: which path the fallback saw (handy when tuning the rewrite).
  res.headers.set('x-legacy-fallback', original);
  return res;
}

export function GET(request: Request) {
  return redirectHome(request);
}
export function POST(request: Request) {
  return redirectHome(request);
}
