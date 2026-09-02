// Self-hosted Archivo variable font, subset in-repo (src/fonts/README.md has
// the rebuild recipe): wght 400-900 + wdth 100-125, covering every character
// the 12 locales use. One 77 KB preloaded file replaces the Google split of
// latin (90 KB, preloaded) + latin-ext (84 KB, discovered late via CSS — the
// footer's "Częstochowa" dragged it into the critical path on every page).
// The "expanded" display look stays the wdth axis driven to 125 in CSS
// (see globals.css). Exposed as the same --font-archivo variable.
import localFont from 'next/font/local';

export const archivo = localFont({
  src: '../fonts/archivo-var.woff2',
  weight: '400 900',
  variable: '--font-archivo',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});
