// /robots.txt — search and AI crawlers explicitly welcome; only the API is
// disallowed, EXCEPT the Open Graph images under /api/og (og:image on every
// page — a blocked image is dropped by Facebook/LinkedIn/Google). The longer
// Allow rule wins over the shorter Disallow. Single domain → a static
// metadata route is enough.
import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-config';

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: ['/', '/api/og', '/api/og/'], disallow: ['/api/'] },
      ...AI_CRAWLERS.map((ua) => ({ userAgent: ua, allow: ['/', '/api/og', '/api/og/'] })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
