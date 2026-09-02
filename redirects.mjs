// ============================================================================
// LEGACY REDIRECT MAP — Magento (stretchgroup.be + old multistores) → the new
// group site / the Dutch product site. Imported by next.config.mjs:
//   async redirects() { return legacyRedirects; }
//
// ZERO-404 LAYERS (see CHANGES.md):
//   Layer 1  legacy/legacy-urls.txt  — the URL inventory (launch gate input)
//   Layer 2  EXPLICIT rules below     — every known URL, mapped exactly
//   Layer 3  PREFIX catch-alls below  — ordered AFTER the explicit rules
//   Layer 4  src/middleware.ts        — any page-like path that is not a route
//            301s to the localized home; Layer 4b: next.config `fallback`
//            rewrite → /api/legacy-fallback catches asset-like paths, stray
//            .html and unknown /api/* AFTER the filesystem (real files win)
//   Layer 5  scripts/verify-redirects.mjs — proves it (npm run verify:redirects)
//
// Rules:
//   • Sources match with AND without a trailing slash (Next normalises the
//     slash with its own 308 before these run) and ignore query strings.
//   • The old content is Dutch, so cross-domain targets are 301s to the
//     Dutch product site https://stretchplafond.be/... (X helper). Targets
//     that stay on the group site are 308s (R helper) and are LOCALE-AGNOSTIC
//     ("/about"), so flipping the default locale never breaks them.
//   • Misspelled legacy paths (proffessionals, akoestish) are kept verbatim.
//   • NO blanket "/:path*" fallback here — next.config redirects run BEFORE
//     the filesystem, so a catch-all would hijack the new site's own pages.
//     The middleware (Layer 4) is the only safe place for that.
//
// Modelled on reference/redirects.mjs (the product site's WordPress → Next
// migration): same helpers, same first-match-wins ordering discipline.
// ============================================================================

const BE = 'https://stretchplafond.be';

/** On-site redirect (308, locale-agnostic target). */
const R = (source, destination) => ({ source, destination, permanent: true });
/** Cross-domain redirect to the Dutch product site (301). */
const X = (source, path) => ({ source, destination: `${BE}${path}`, statusCode: 301 });

const host = (h) => [{ type: 'host', value: h }];

// ---------------------------------------------------------------------------
// OLD MULTISTORE DOMAINS — stretchgroup.fr / .de / .net / .es / .it were
// Magento store views of the same shop. Point their DNS at this project and
// 308 every path to stretchgroup.be/:path*, where the rules below take over,
// so those domains never error either. www.stretchgroup.be → apex likewise
// (Vercel's domain redirect normally handles it first; harmless twice).
// ---------------------------------------------------------------------------
const LEGACY_HOSTS = [
  'www.stretchgroup.be',
  'stretchgroup.fr', 'www.stretchgroup.fr',
  'stretchgroup.de', 'www.stretchgroup.de',
  'stretchgroup.net', 'www.stretchgroup.net',
  'stretchgroup.es', 'www.stretchgroup.es',
  'stretchgroup.it', 'www.stretchgroup.it',
];
const hostRules = LEGACY_HOSTS.map((h) => ({
  source: '/:path*',
  has: host(h),
  destination: 'https://stretchgroup.be/:path*',
  permanent: true,
}));

// ---------------------------------------------------------------------------
// LAYER 2 — EXPLICIT MAP (verified navigation inventory + indexed URLs)
// ---------------------------------------------------------------------------
const explicitRules = [
  // --- group pages (stay here) ---
  R('/over-ons', '/about'),
  R('/jobs', '/careers'),
  R('/jobs/:path*', '/careers'),
  R('/contacts', '/contact'), // Magento 1 contact module
  R('/contacts/:path*', '/contact'),
  R('/general-terms-and-conditions', '/terms'),
  R('/index.php', '/'),
  // Magento served every page under /index.php/ too — strip the prefix and let
  // the rules re-evaluate the real path on the next hop (chains stay ≤ 5).
  R('/index.php/:path*', '/:path*'),
  // Magento 1 API endpoints (every Magento shop exposes these; crawlers keep
  // them). next.config redirects run BEFORE the filesystem, so a rule here
  // works even though the middleware matcher skips /api/.
  R('/api/rest', '/'),
  R('/api/rest/:path*', '/'),
  R('/api/soap', '/'),
  R('/api/soap/:path*', '/'),
  R('/api/v2_soap', '/'),
  R('/api/v2_soap/:path*', '/'),
  R('/api/xmlrpc', '/'),
  R('/api/xmlrpc/:path*', '/'),

  // --- product-site content (Dutch) ---
  X('/faq', '/faq'),
  X('/faq/:path*', '/faq'),
  X('/blog', '/blog'),
  X('/blog/:path*', '/blog'), // every /blog/<post-slug>, /blog/post/*, /blog/category/*, /blog/archive/*
  X('/portfolio.html', '/inspiration'),
  X('/performance-statements', '/datasheets'),
  X('/performance-statements/:path*', '/datasheets'),

  // --- clipso-spanplafonds: overview + concept pages → products ---
  X('/clipso-spanplafonds.html', '/products'),
  X('/clipso-spanplafonds/clipso.html', '/products'),
  X('/clipso-spanplafonds/clipso/spanplafond-concept.html', '/products'),
  X('/clipso-spanplafonds/clipso/spanplafond-voordelen.html', '/products'),
  X('/clipso-spanplafonds/clipso/stretch-standaard.html', '/products'),
  X('/clipso-spanplafonds/clipso/stretch-standaard/pvc-spanplafond.html', '/products/pvc-stretch-ceiling'),

  // --- acoustics → acoustic stretch system ---
  X('/clipso-spanplafonds/clipso/stretch-akoestiek.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/stretch/stretch-akoestiek/akoestische-panelen.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/stretch-akoestiek/akoestisch-plafond-wand.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/stretch-akoestiek/stretch-akoestische-baffle.html', '/products/acoustic-stretch-system'), // indexed, not in nav
  X('/proffessionals/akoestish-spanplafond.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/akoestiek-verbeteren.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/akoestiek-verbeteren/akoestiek-in-woning.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/akoestiek-verbeteren/akoestiek-horeca.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/akoestiek-verbeteren/akoestiek-op-kantoor.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/akoestiek-verbeteren/akoestiek-in-bedrijfsgebouwen.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/akoestiek-verbeteren/akoestiek-in-bioscoop.html', '/products/acoustic-stretch-system'),
  // the same six pages existed under both prefixes on the old tree
  X('/clipso-spanplafonds/clipso/akoestiek-verbeteren/akoestiek-in-woning.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/akoestiek-verbeteren/akoestiek-horeca.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/akoestiek-verbeteren/akoestiek-op-kantoor.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/akoestiek-verbeteren/akoestiek-in-bedrijfsgebouwen.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/akoestiek-verbeteren/akoestiek-in-bioscoop.html', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/akoestiek-verbeteren.html', '/products/acoustic-stretch-system'),

  // --- design / light → light & print ---
  X('/clipso-spanplafonds/clipso/stretch-design.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/clipso/stretch-licht.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/clipso/stretch-licht/stretch-lichtplafond.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/verlichting.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/verlichting/backlit-verlichting.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/verlichting/edgelit-verlichting.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/verlichting/lichtgevende-wand.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/verlichting/cognitieve-verlichting.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/verlichting/sterrenhemel.html', '/products/light-print-stretch-ceiling'),

  // --- antibacterial (no direct equivalent on the product site — CHANGES.md) ---
  X('/clipso-spanplafonds/clipso/stretch-antibacterieel.html', '/products'),
  X('/clipso-spanplafonds/clipso/stretch-antibacterieel/stretch-antibacterieel.html', '/products'),

  // --- room-by-room inspiration ---
  X('/clipso-spanplafonds/spanplafond-in-jouw-interieur.html', '/inspiration'),
  X('/clipso-spanplafonds/spanplafond-in-jouw-interieur/spanplafond-badkamer.html', '/inspiration'),
  X('/clipso-spanplafonds/spanplafond-in-jouw-interieur/spanplafond-keuken.html', '/inspiration'),
  X('/clipso-spanplafonds/spanplafond-in-jouw-interieur/voordelen-spanplafond-woonkamer.html', '/inspiration'),
  X('/clipso-spanplafonds/spanplafond-in-jouw-interieur/buiten-plafond.html', '/inspiration'),
  X('/clipso-spanplafonds/spanplafond-in-jouw-interieur/spanplafond-zwembad.html', '/inspiration'),

  // --- professionals (misspelled on the old site — keep verbatim) ---
  X('/proffessionals.html', '/partners'),
  X('/proffessionals/dealers/waarom-stretch-dealer-worden.html', '/partners'),
  X('/proffessionals/dealers/why-become-a-stretch-dealer.html', '/partners'),
  X('/proffessionals/dealers.html', '/dealers'),
  X('/proffessionals/dealers/stretch-training.html', '/installer-training'),
  X('/proffessionals/doe-het-zelf-spanplafond.html', '/kit'),
  // correctly spelled English store view (stretchgroup.net paths arrive here via the host 308)
  X('/professionals.html', '/partners'),
  X('/professionals/dealers.html', '/dealers'),
  X('/professionals/do-it-yourself-stretch-ceiling.html', '/kit'),

  // --- architects ---
  X('/architects/architects.html', '/architects'),
  X('/architects/architects/stretch-assists-you.html', '/architects'),
  X('/architects/architects/discover-our-stretch-walls-and-ceilings-solutions.html', '/architects'),
  X('/architects/sign-market.html', '/products/prefab-lighting-elements'),
  X('/architects/sign-market/stretch-sbl-backlit-led-modules.html', '/products/prefab-lighting-elements'),
  X('/architects/sign-market/de-stretch-spanplafond-ssl-side-lit-led-modules.html', '/products/prefab-lighting-elements'),
  X('/architects/sign-market/dynamische-led-panelen.html', '/products/prefab-lighting-elements'),

  // --- English store-view content paths (stretchgroup.net) ---
  X('/clipso-stretch-ceiling/clipso/stretch-light.html', '/products/light-print-stretch-ceiling'),
  X('/clipso-stretch-ceiling/clipso/stretch-standard-stretch-ceiling.html', '/products'),

  // --- shop machinery: accounts and carts don't carry over → home ---
  // [TO CONFIRM] whether /customer/account/login should point at the client
  // portal on stretch.mt instead (CHANGES.md).
  R('/customer', '/'),
  R('/customer/:path*', '/'),
  R('/checkout', '/'),
  R('/checkout/:path*', '/'),
  R('/catalogsearch', '/'),
  R('/catalogsearch/:path*', '/'),
  R('/wishlist', '/'),
  R('/wishlist/:path*', '/'),
  R('/newsletter', '/'),
  R('/newsletter/:path*', '/'),
  R('/sales', '/'),
  R('/sales/:path*', '/'),
  // old images may be hotlinked elsewhere
  R('/media', '/'),
  R('/media/:path*', '/'),
  R('/skin/:path*', '/'),
  R('/js/:path*', '/'),
  R('/static/:path*', '/'),
  R('/cms/:path*', '/'),
  R('/review/:path*', '/'),
  R('/rss/:path*', '/'),
  R('/downloader/:path*', '/'),
];

// ---------------------------------------------------------------------------
// LAYER 3 — PREFIX CATCH-ALLS (after the explicit rules; first match wins)
// Unknown deep pages the crawl missed still land somewhere sensible.
// ---------------------------------------------------------------------------
const prefixRules = [
  // sub-trees with a more specific home than /products
  X('/clipso-spanplafonds/clipso/stretch-akoestiek/:path*', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/stretch/stretch-akoestiek/:path*', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/akoestiek-verbeteren/:path*', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/akoestiek-verbeteren/:path*', '/products/acoustic-stretch-system'),
  X('/clipso-spanplafonds/clipso/stretch-licht/:path*', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/verlichting/:path*', '/products/light-print-stretch-ceiling'),
  X('/clipso-spanplafonds/spanplafond-in-jouw-interieur/:path*', '/inspiration'),
  // whole trees
  X('/clipso-spanplafonds/:path*', '/products'),
  X('/clipso-stretch-ceiling/:path*', '/products'),
  X('/portfolio/:path*', '/inspiration'),
  X('/architects/:path*', '/architects'),
  X('/proffessionals/:path*', '/partners'),
  X('/professionals/:path*', '/partners'),
  // the Magento webshop (indexed product + category URLs) → the product
  // site's materials hub, the same target the product site chose for its
  // own retired WooCommerce shop (reference/redirects.mjs SHOP_TARGET)
  X('/webshop', '/materials'),
  X('/webshop.html', '/materials'),
  X('/webshop/:path*', '/materials'),
  X('/catalog/:path*', '/materials'),
  // NOTE: no generic ".html → /" rule here. Redirects run BEFORE the
  // filesystem, so it would also hijack real files in public/ (a Search
  // Console verification .html, for instance) and it cannot see the locale.
  // Stray .html paths are handled by Layer 4b (the fallback rewrite in
  // next.config → /api/legacy-fallback), which runs AFTER the filesystem and
  // keeps the visitor's locale.
];

export const legacyRedirects = [...hostRules, ...explicitRules, ...prefixRules];

export default legacyRedirects;
