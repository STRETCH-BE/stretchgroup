import createNextIntlPlugin from 'next-intl/plugin';
import { legacyRedirects } from './redirects.mjs';

// Point the plugin at the i18n request config (getMessages, etc.)
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // styled-jsx is bundled with Next.js — no extra config needed.
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
  },
  async headers() {
    return [
      {
        // Long-cache the immutable OG image responses.
        source: '/api/og/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return legacyRedirects;
  },
  async rewrites() {
    return {
      // LAYER 4b — checked AFTER public files, pages and dynamic routes, right
      // before the 404 page: whatever still matched nothing (a missing static
      // asset, a stray .html, an unknown /api/* path — the middleware's
      // matcher skips those on purpose) is handed to the fallback handler,
      // which 301s to the visitor's localized home. Real files in public/
      // (Search Console verification, manifest, fonts) are served untouched.
      // Unused source params are appended to the destination query by Next
      // (?path=…); the middleware also forwards the path as a request header.
      fallback: [{ source: '/:path*', destination: '/api/legacy-fallback' }],
    };
  },
};

export default withNextIntl(nextConfig);
