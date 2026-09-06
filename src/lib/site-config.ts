// ============================================================================
// SITE CONFIG — single source of truth for group data (GROUP EDITION).
//
// Every fact below comes from the verified brief (2 Sep 2026) or from the
// founder's own account of the group's history (6 Sep 2026, CHANGES.md (5)).
// Nothing is invented: anything neither source verified is marked
// [TO CONFIRM] here and listed in CHANGES.md. Anything that varies by deploy (URLs, IDs) reads
// from env; everything brand-stable lives here.
// ============================================================================

// Primary origin. One domain for every locale (path-prefixed routing), so
// this is also the base for canonicals, sitemap, OG images and the JSON-LD
// Organization @id (https://stretchgroup.be/#organization) — the entity the
// product site's `parentOrganization: 'STRETCH Group'` points at.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://stretchgroup.be'
).replace(/\/$/, '');

export const brand = {
  // EXACT spelling — must match the `parentOrganization` name the product
  // site already emits (reference/src/lib/site-config.ts → brand.parentCompany).
  name: 'STRETCH Group',
  // [TO CONFIRM] the legal entity behind the group (holding name, VAT number).
  // Until confirmed, JSON-LD emits `name` only and no `legalName`.
  legalName: '',
  domain: 'stretchgroup.be',
  // Drafted group-level line — not a verified fact, plain description only.
  description:
    'STRETCH Group grew out of STRETCH, the Belgian stretch-ceiling brand Michael Nicasens founded in 2018, and today unites four companies: STRETCH (stretch ceilings and walls, Belgium), Stretch Sufit / Alto Design (PVC stretch-ceiling factory in Poland, bought in 2024), Re-Sound (circular acoustic panels made in Belgium, acquired end 2025) and Stretch Metal (the group\'s own metal workshop, opened in 2026).',
  // The product site carries a "Powered by STRETCH Media" credit.
  // [TO CONFIRM] whether STRETCH Media is listed as a group entity — until
  // then the credit is kept as a footer line only, not as an organisation.
  poweredBy: 'Powered by STRETCH Media',
  colors: {
    red: '#e00000', // WCAG-tuned signal red (see globals.css)
    black: '#0a0a0a',
    white: '#ffffff',
  },
} as const;

export const contact = {
  email: 'info@stretchgroup.be',
  leadDestination: process.env.LEAD_DESTINATION || 'leads@stretchgroup.be',
  phone: '+32474522090',
  phoneDisplay: '+32 474 52 20 90',
  phoneHref: 'tel:+32474522090',
  whatsapp: '+32474522090',
  whatsappHref: 'https://wa.me/32474522090',
  telegram: 'https://t.me/STRETCH_OFFICE',
  // Legacy office line found on the old Magento site. [TO CONFIRM] which
  // number(s) to display — NOT rendered anywhere until confirmed.
  legacyOfficePhone: '+32 3 284 68 18',
  hours: 'Mo-Fr 08:30-17:00', // machine-readable (JSON-LD); the display label is `common.hours` in messages
  address: {
    street: 'Gentseweg 309 A3',
    building: 'Beverpark',
    city: 'Beveren-Waas',
    postalCode: '9120',
    region: 'Oost-Vlaanderen',
    country: 'BE',
  },
  geo: { lat: 51.1953188, lng: 4.2239015 },
} as const;

// ---------------------------------------------------------------------------
// COMPANIES — the four member companies. Copy (what they do) lives in the
// message files under `companies.<slug>`; only facts live here.
// ---------------------------------------------------------------------------
export type CompanySlug = 'stretch' | 'stretch-sufit' | 're-sound' | 'stretch-metal';

export type Company = {
  slug: CompanySlug;
  /** Display name (also the logo's alt-text subject). */
  name: string;
  /** Registered company name — empty when [TO CONFIRM]. */
  legalName: string;
  /** Founding year of the company (not of group membership). */
  founded?: number;
  /** Year the company joined the group — undefined when [TO CONFIRM]. */
  memberSince?: number;
  /** The company the group grew out of (rendered as "founding company"
   *  instead of "part of the group since"). */
  founding?: boolean;
  /** Named founder (only where verified). */
  founder?: string;
  country: string; // ISO 3166-1 alpha-2
  city: string;
  /** Street + postal lines when verified; empty when [TO CONFIRM]. */
  addressLines: string[];
  /** The company's own website — the PRIMARY CTA on its page. */
  url: string;
  urlLabel: string;
  /** Secondary site (e.g. the international x-default domain). */
  altUrl?: { url: string; label: string };
  email?: string;
  phone?: string;
  phoneHref?: string;
  /** Brand accent from the company's own identity. Only STRETCH is verified;
   *  the others stay undefined ([TO CONFIRM] — pull from the real logo). */
  accent?: string;
  /** Verified, company-specific claims rendered ONLY on that company's page.
   *  `value` is the canonical (English) fact for reference; the DISPLAYED
   *  value is localized in messages under `companyPage.factValues.<slug>.<key>`. */
  facts: { key: string; value: string }[];
};

export const companies: Company[] = [
  {
    slug: 'stretch',
    name: 'STRETCH',
    legalName: 'Stretch Productions BV',
    founded: 2018,
    // Founder + founding-company role: from the founder's account (6 Sep
    // 2026). The group grew out of this company — no `memberSince`, it IS
    // the origin. [TO CONFIRM] the founder calls the entity "Stretch BV";
    // the verified legal name stays "Stretch Productions BV" until confirmed.
    founder: 'Michael Nicasens',
    founding: true,
    country: 'BE',
    city: 'Beveren-Waas',
    addressLines: ['Gentseweg 309 A3 (Beverpark)', '9120 Beveren-Waas'],
    url: 'https://stretchplafond.be',
    urlLabel: 'stretchplafond.be',
    altUrl: { url: 'https://stretch.mt', label: 'stretch.mt' },
    email: 'info@stretchgroup.be',
    phone: contact.phoneDisplay,
    phoneHref: contact.phoneHref,
    accent: '#e00000',
    facts: [
      { key: 'founded', value: '2018' },
      { key: 'origin', value: 'Beveren-Waas, BE' },
      { key: 'install', value: '1 day' },
    ],
  },
  {
    slug: 'stretch-sufit',
    name: 'Stretch Sufit',
    legalName: 'Alto Design Sp. z o.o.',
    founded: 2016,
    memberSince: 2024,
    country: 'PL',
    city: 'Częstochowa',
    addressLines: ['ul. Legionów 59', '42-200 Częstochowa'],
    url: 'https://altodesign.pl',
    urlLabel: 'altodesign.pl',
    email: 'info@stretch-sufit.pl',
    phone: '+48 730 700 333',
    phoneHref: 'tel:+48730700333',
    facts: [
      { key: 'factorySince', value: '2016' },
      { key: 'seamless', value: '6.50 m' },
      { key: 'cities', value: '17' },
      { key: 'projects', value: '4,000+' },
    ],
  },
  {
    slug: 're-sound',
    name: 'Re-Sound',
    // Acquired by the group at the end of 2025 (founder's account, 6 Sep 2026).
    // [TO CONFIRM] legal entity name and address.
    legalName: '',
    founder: 'Aaron Thierens',
    memberSince: 2025,
    country: 'BE',
    city: '', // [TO CONFIRM]
    addressLines: [],
    url: 'https://re-sound.be',
    urlLabel: 're-sound.be',
    facts: [
      { key: 'origin', value: '2020' },
      { key: 'madeIn', value: 'Belgium' },
      { key: 'takeBack', value: '100%' },
    ],
  },
  {
    slug: 'stretch-metal',
    // Facts from the team (2 + 6 Sep 2026): the group's own metal workshop,
    // opened in 2026 in Poland (stretchmetal.pl). It started out of necessity
    // for the group's own prefab elements and the big structures its projects
    // need; as the business scaled it took on jobs from other companies too.
    // Reference work named by the founder: metal ceilings at Spa-Francorchamps,
    // balustrades, hall structures, generator panels, stainless-steel kitchen
    // elements.
    // [TO CONFIRM] legal entity, city/address, e-mail, phone — the site is
    // unreachable from the build environment.
    name: 'Stretch Metal',
    legalName: '',
    founded: 2026,
    memberSince: 2026,
    country: 'PL',
    city: '',
    addressLines: [],
    url: 'https://stretchmetal.pl',
    urlLabel: 'stretchmetal.pl',
    facts: [
      { key: 'founded', value: '2026' },
      { key: 'origin', value: 'Poland' },
      { key: 'clients', value: 'Group + external' },
    ],
  },
];

export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

export const companySlugs = companies.map((c) => c.slug);

// ---------------------------------------------------------------------------
// LOGOS — the official company logo files (supplied 6 Sep 2026, kept under
// public/images/logos with their original names). Every logo is a wide
// transparent banner; `onLight` is the variant for light backgrounds,
// `onDark` the one for dark. Intrinsic pixel size feeds next/image.
// ---------------------------------------------------------------------------
export type CompanyLogoAsset = { onLight: string; onDark: string; width: number; height: number };

export const logos: Record<CompanySlug, CompanyLogoAsset> = {
  stretch: { onLight: '/images/logos/stretch-logo.png', onDark: '/images/logos/stretch-logo-white.png', width: 3386, height: 555 },
  'stretch-sufit': { onLight: '/images/logos/stretchsufit-logo-dark.png', onDark: '/images/logos/stretchsufit-logo.png', width: 2803, height: 551 },
  're-sound': { onLight: '/images/logos/re-sound-logo.png', onDark: '/images/logos/re-sound-logo-white.png', width: 4478, height: 603 },
  'stretch-metal': { onLight: '/images/logos/stretchmetal-logo-dark.png', onDark: '/images/logos/stretchmetal-logo.png', width: 5400, height: 555 },
};

// ---------------------------------------------------------------------------
// MARKETS — live domain portfolio. Same live/pending discipline as the
// product site's `localeStatus`: a pending domain is never linked, listed or
// counted until it resolves. Flip one flag to include it.
// ---------------------------------------------------------------------------
export type Market = {
  domain: string;
  /** Owning member company. Omitted = a group website whose owner is still
   *  [TO CONFIRM]; rendered under "Other group websites", never as a company. */
  company?: CompanySlug;
  /** ISO 3166-1 alpha-2, or 'INT' for the international x-default domain. */
  country: string;
  lang: string; // BCP 47
  status: 'live' | 'pending';
};

export const markets: Market[] = [
  { domain: 'stretch.mt', company: 'stretch', country: 'INT', lang: 'en', status: 'live' },
  { domain: 'stretchplafond.be', company: 'stretch', country: 'BE', lang: 'nl-BE', status: 'live' },
  { domain: 'stretchplafond.nl', company: 'stretch', country: 'NL', lang: 'nl-NL', status: 'live' },
  { domain: 'stretchplafond.fr', company: 'stretch', country: 'FR', lang: 'fr-FR', status: 'live' },
  { domain: 'stretch-sufit.pl', company: 'stretch', country: 'PL', lang: 'pl-PL', status: 'live' },
  { domain: 'stretchdecken.de', company: 'stretch', country: 'DE', lang: 'de-DE', status: 'live' },
  { domain: 'stretchtecho.es', company: 'stretch', country: 'ES', lang: 'es-ES', status: 'live' },
  { domain: 'stretch-ceilings.uk', company: 'stretch', country: 'GB', lang: 'en-GB', status: 'live' },
  { domain: 'stretchceiling.us', company: 'stretch', country: 'US', lang: 'en-US', status: 'live' },
  { domain: 'straekloft.dk', company: 'stretch', country: 'DK', lang: 'da-DK', status: 'live' },
  { domain: 'stretchceilings.se', company: 'stretch', country: 'SE', lang: 'sv-SE', status: 'live' },
  { domain: 'stretch.is', company: 'stretch', country: 'IS', lang: 'is-IS', status: 'live' },
  { domain: 'stretchteto.pt', company: 'stretch', country: 'PT', lang: 'pt-PT', status: 'pending' }, // no DNS yet
  { domain: 'stretchtak.no', company: 'stretch', country: 'NO', lang: 'nb-NO', status: 'pending' }, // no DNS yet
  { domain: 'altodesign.pl', company: 'stretch-sufit', country: 'PL', lang: 'pl-PL', status: 'live' },
  { domain: 're-sound.be', company: 're-sound', country: 'BE', lang: 'nl-BE', status: 'live' },
  { domain: 'stretchmetal.pl', company: 'stretch-metal', country: 'PL', lang: 'pl-PL', status: 'live' },
];

export const liveMarkets = markets.filter((m) => m.status === 'live');

/** Countries the group operates in (schema.org areaServed) — derived from
 *  the live markets plus the office countries. ISO codes only. */
export const areaServed = Array.from(
  new Set([
    ...liveMarkets.map((m) => m.country).filter((c) => c !== 'INT'),
    'AT', // Vienna office
    'MT', // stretch.mt
  ]),
);

// ---------------------------------------------------------------------------
// OFFICES — footer / contact level entities (not full company pages).
// ---------------------------------------------------------------------------
export type Office = {
  /** messages key under `offices.roles` */
  role: 'headquarters' | 'sales' | 'branch';
  country: string;
  name: string;
  addressLines: string[];
  email?: string;
  /** The branch's own public website, when it operates under its own name. */
  url?: string;
  geo?: { lat: number; lng: number };
};

export const offices: Office[] = [
  {
    role: 'headquarters',
    country: 'BE',
    name: 'STRETCH Group',
    addressLines: ['Gentseweg 309 A3 (Beverpark)', '9120 Beveren-Waas'],
    email: contact.email,
    geo: contact.geo,
  },
  {
    role: 'sales',
    country: 'US',
    name: 'STRETCH US',
    addressLines: ['New York'],
    email: 'us@stretchgroup.be',
  },
  {
    role: 'branch',
    country: 'PL',
    name: 'Alto Design Sp. z o.o.',
    // Brief: 42-200 (the product site's footer shows 42-202 — [TO CONFIRM]).
    addressLines: ['ul. Legionów 59', '42-200 Częstochowa'],
    email: 'info@stretch-sufit.pl',
    url: 'https://altodesign.pl',
  },
  {
    role: 'branch',
    country: 'AT',
    name: 'STRETCH Austria',
    addressLines: ['Gertrude-Fröhlich-Sandner-Straße 2', '1100 Wien'], // native postal form (correct in every locale)
    email: 'info@stretchdecken.at',
  },
];

// ---------------------------------------------------------------------------
// TIMELINE — the group's history as told by its founder (6 Sep 2026; see
// CHANGES.md (5)). Copy is in messages (`timeline.<key>`). `teaser` marks
// the entries the home page strip shows; the About page shows them all.
// `outlook` marks the forward-looking goal (rendered as a goal, not a fact).
// ---------------------------------------------------------------------------
export type TimelineEntry = { year: string; key: string; company?: CompanySlug; teaser?: boolean; outlook?: boolean };

export const timeline: TimelineEntry[] = [
  { year: '2018', key: 'founded', company: 'stretch', teaser: true },
  { year: '2019', key: 'automation', company: 'stretch', teaser: true },
  { year: '2020', key: 'covid', company: 'stretch' },
  { year: '2021', key: 'pvcBelgium', company: 'stretch' },
  { year: '2022', key: 'austria', company: 'stretch', teaser: true },
  { year: '2024', key: 'altoDesign', company: 'stretch-sufit', teaser: true },
  { year: '2025', key: 'reSound', company: 're-sound', teaser: true },
  { year: '2026', key: 'stretchMetal', company: 'stretch-metal', teaser: true },
  { year: '2027', key: 'outlook', outlook: true },
];

export const teaserTimeline = timeline.filter((e) => e.teaser);

// Social handles: only Telegram is public today (same as the product site).
export const social: { label: string; url: string }[] = [
  { label: 'Telegram', url: contact.telegram },
  { label: 'WhatsApp', url: contact.whatsappHref },
];

// ---------------------------------------------------------------------------
// "Find the right company" router — home + footer. Keys map to messages
// under `router.items.<key>`; hrefs are OUTBOUND (the group site routes).
// ---------------------------------------------------------------------------
export type RouterItem = { key: string; company: CompanySlug; href: string; label: string; alt?: { href: string; label: string } };

export const routerItems: RouterItem[] = [
  {
    key: 'ceiling',
    company: 'stretch',
    href: 'https://stretchplafond.be',
    label: 'stretchplafond.be',
    alt: { href: 'https://stretch.mt', label: 'stretch.mt' },
  },
  { key: 'acoustic', company: 're-sound', href: 'https://re-sound.be', label: 're-sound.be' },
  { key: 'poland', company: 'stretch-sufit', href: 'https://altodesign.pl', label: 'altodesign.pl' },
  { key: 'metal', company: 'stretch-metal', href: 'https://stretchmetal.pl', label: 'stretchmetal.pl' },
];

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
export type NavLink = { key: string; href: string };

export const mainNav: NavLink[] = [
  { key: 'companies', href: '/companies' },
  { key: 'about', href: '/about' },
  { key: 'careers', href: '/careers' },
  { key: 'contact', href: '/contact' },
];

export const footerNav = {
  companies: [
    { key: 'overview', href: '/companies' },
    { key: 'stretch', href: '/companies/stretch' },
    { key: 'stretchSufit', href: '/companies/stretch-sufit' },
    { key: 'reSound', href: '/companies/re-sound' },
    { key: 'stretchMetal', href: '/companies/stretch-metal' },
  ] as NavLink[],
  group: [
    { key: 'about', href: '/about' },
    { key: 'careers', href: '/careers' },
    { key: 'contact', href: '/contact' },
  ] as NavLink[],
  legal: [
    { key: 'privacy', href: '/privacy' },
    { key: 'terms', href: '/terms' },
  ] as NavLink[],
};

// ---------------------------------------------------------------------------
// ROUTES — every internal route. Used by the sitemap AND by the middleware's
// zero-404 fallback (Layer 4): a request whose locale-stripped path is not in
// this list 301s to the localized home. Add a route here when you add a page.
// ---------------------------------------------------------------------------
export const staticRoutes = [
  '/',
  '/companies',
  '/companies/stretch',
  '/companies/stretch-sufit',
  '/companies/re-sound',
  '/companies/stretch-metal',
  '/about',
  '/careers',
  '/contact',
  '/privacy',
  '/terms',
] as const;

// Route PREFIXES that may carry dynamic tails in the future (none today —
// the group site has no dynamic collections). Kept next to staticRoutes so
// the middleware list has one home.
export const knownRoutePrefixes: readonly string[] = [];

// Sitemap <lastmod> — the date each page's content last genuinely changed.
// Bump an entry when you materially change that page.
export const staticRouteDates: Record<string, string> = {
  '/': '2026-09-06',
  '/companies': '2026-09-06',
  '/companies/stretch': '2026-09-06',
  '/companies/stretch-sufit': '2026-09-06',
  '/companies/re-sound': '2026-09-06',
  '/companies/stretch-metal': '2026-09-06',
  '/about': '2026-09-06',
  '/careers': '2026-09-02',
  '/contact': '2026-09-02',
  '/privacy': '2026-09-02',
  '/terms': '2026-09-02',
};
