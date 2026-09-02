// Edge-safe route knowledge for the middleware (Layer 4 zero-404 fallback).
// Imports only site-config (pure data, no Node APIs).
import { staticRoutes, knownRoutePrefixes } from '@/lib/site-config';

const KNOWN = new Set<string>(staticRoutes);

/** Normalize a locale-stripped pathname: no trailing slash, no doubles. */
export function normalizePath(pathname: string): string {
  const cleaned = ('/' + pathname).replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return cleaned === '' ? '/' : cleaned;
}

/** True when the (locale-stripped) path is one of the new site's own routes. */
export function isKnownRoute(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (KNOWN.has(path)) return true;
  return knownRoutePrefixes.some((p) => path === p || path.startsWith(p + '/'));
}
