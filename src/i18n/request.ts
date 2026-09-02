import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isValidLocale } from './config';

// Loads the message bundle for the active (live) locale. Wired into
// next.config.mjs via createNextIntlPlugin('./src/i18n/request.ts').
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isValidLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
