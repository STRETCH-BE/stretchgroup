## 2026-09-02 (1) — Initial build: group site, zero-404 redirect layers, verification gate

First commit of the STRETCH Group corporate site (stretchgroup.be). Built on the
product site's architecture (`STRETCH-BE/stretch_website`, cloned read-only into
`reference/`): same stack, same design tokens 1:1, same i18n / SEO / lead-delivery
/ anti-spam modules, trimmed to what a holding site needs. Design rationale and
the two hero concepts: `docs/DESIGN-PLAN.md`.

### Decisions

- **Path-prefixed i18n on one domain.** `en` is the unprefixed default and
  hreflang x-default; `nl` lives at `/nl`. `fr`, `de`, `pl` are declared
  `pending` in `src/i18n/config.ts` — not routed, not in the sitemap, not in
  hreflang or the switcher — so enabling one is a one-line flip plus a
  `messages/<locale>.json`. **Locale detection is OFF** (`localeDetection:
  false`): no Accept-Language 307 on the homepage; deterministic URLs keep crawl
  paths and the redirect verification predictable. Visitors switch language in
  the header.
- **Default-locale flip is safe.** If the team prefers Dutch as the unprefixed
  default for the .be audience, change `defaultLocale` to `'nl'` in
  `src/i18n/config.ts`. Every helper (canonicals, hreflang, sitemap, middleware
  fallback, navigation) derives from it, and every redirect target in
  `redirects.mjs` is locale-agnostic (`/about`, never `/nl/about`).
- **Next.js 14.2.35 instead of the reference's 14.2.15** (only version
  deviation). 14.2.15 predates the middleware-bypass fix (CVE-2025-29927,
  `x-middleware-subrequest`) and later 14.2.x security patches; this site's
  zero-404 fallback lives in middleware, so it takes the patched line.
  `eslint` + `eslint-config-next` were added so `npm run lint` runs
  non-interactively (the reference had no ESLint config committed).
- **Hero: concept A, "The Index".** Full-black opening with the group wordmark
  and the three companies as a numbered list of real links; hover/focus swaps
  one image slot; one staggered entrance animation, collapsed under
  `prefers-reduced-motion`. Concept B (split-screen triptych) is documented and
  rejected for launch in `docs/DESIGN-PLAN.md`.
- **Zero-404 in five layers.** Layer 2 (`redirects.mjs`) maps every URL from
  the verified inventory exactly; cross-domain targets are **301** to the Dutch
  product site (old content is Dutch), on-site targets are **308**. Layer 3
  prefix catch-alls run after the explicit rules; the last rule
  `/:path(.*\.html)` → `/` sweeps any remaining Magento `.html` page. Layer 4
  (`src/middleware.ts`) 301s anything that is not one of the site's own routes
  (`staticRoutes` in `site-config.ts`, checked via the edge-safe
  `src/lib/routes.ts`) to the localized home — the matcher deliberately
  includes paths with a file extension so `.php` / `.jpg` / `.pdf` junk also
  lands on the homepage instead of a static 404. A branded `not-found.tsx`
  exists as belt-and-braces. **Deliberate trade-off:** strict SEO practice
  would 410 dead shop machinery (`/customer/**`, `/checkout/**`, `/media/**`);
  the business requirement is zero visible errors, and Google treats a redirect
  to the homepage as a soft 404 at worst — no penalty, no error page.
- **`/webshop/**` and `/catalog/**` → `https://stretchplafond.be/materials`.**
  The search-engine harvest surfaced indexed Magento webshop URLs (profiles,
  lighting, tools) that the brief's table did not list. They go to the product
  site's materials hub — the same target the product site chose for its own
  retired WooCommerce shop (`SHOP_TARGET` in `reference/redirects.mjs`) —
  rather than to the homepage.
- **English store-view paths** (`/professionals.html`, `/clipso-stretch-ceiling/…`)
  found on stretchgroup.net are mapped too, since the multistore 308 lands them
  on stretchgroup.be verbatim.
- **Old multistore domains** (`stretchgroup.fr/.de/.net/.es/.it` ± `www`) and
  `www.stretchgroup.be` are 308'd host-wide to `https://stretchgroup.be/:path*`
  in `redirects.mjs` (Vercel's own domain redirect, if configured, wins first —
  harmless twice). DNS steps are in the README cutover checklist.
- **Layer 5 verification (`npm run verify:redirects`).** Follows up to 5 hops,
  asserts 200 with zero 4xx/5xx, adds trailing-slash, query-string, www and
  http variants for one URL per URL family, and 13 invented junk paths that
  must land on the homepage. `--host-header` exercises the host-scoped rules
  locally; `--external stop` accepts a hop to an allow-listed https group
  domain without following it (needed in this build sandbox, which cannot
  reach any group domain). **The production run must use the default
  `--external follow`.** The verifier immediately earned its keep: an identity
  rule `/contact → /contact` (added for the legacy trailing-slash form, which
  Next already normalises itself) produced an infinite 308 loop that also broke
  `/contacts/`. Removed; 209 checks pass locally.
- **No Supabase, by design.** The product site's Postgres-backed rate limiter,
  lead store and admin blocklist are not carried over. Rate limiting is an
  in-memory sliding window per warm instance (polite 429s only; a Vercel WAF
  rule is the hard cap). Because there is no lead table, **flagged (suspected
  spam) messages are still delivered**, with a `[REVIEW]` subject prefix and a
  banner listing score and reasons — the reference's "store but don't deliver"
  would become "drop silently" here, which the reference's own philosophy
  forbids. Only honeypot hits are silently accepted.
- **Turnstile: one widget** (`NEXT_PUBLIC_TURNSTILE_SITEKEY` / `TURNSTILE_SECRET`)
  instead of the reference's two hostname groups — one domain fits within the
  10-hostname limit. `*.vercel.app` preview hosts are accepted at verification.
- **Analytics: GA4 + Clarity only**, single IDs (one domain). Meta Pixel and
  Bing UET are not carried over (off in the reference too). Canonical events
  for a routing site: `outbound_company_click` (the conversion), `contact`,
  `phone_click`, `email_click`, `language_switch`, `scroll_depth`.
- **Sitemap and robots** use `app/sitemap.ts` / `app/robots.ts` (one domain →
  no host-aware route handler needed). Every entry carries hreflang alternates
  + x-default; `<lastmod>` is the per-route content date from
  `staticRouteDates`, never build time.
- **Structured data.** One `Organization` `@id https://stretchgroup.be/#organization`,
  `name: 'STRETCH Group'` (exact match with the product site's
  `parentOrganization`), with `subOrganization` nodes for the three companies.
  STRETCH's node reuses the product site's existing entity id
  `https://stretch.mt/#organization` so the two graphs join on one node; Alto
  Design and Re-Sound carry their own site as `@id`/`url`. Offices are emitted
  as `LocalBusiness` nodes with `parentOrganization`, as the reference does.
  **Omitted on purpose:** a group `foundingDate` (not a verified fact), `logo`
  (no asset yet — a URL to a missing file is worse than none) and `legalName`
  (see [TO CONFIRM]).
- **Wordmark.** Until the real group logo arrives, the header/footer carry a
  text mark built like the product site's "STRETCH®" mark, extended with a red
  "GROUP". Company logos are `Placeholder` tiles — nothing is generated.
- **Security headers** (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`) added in `next.config.mjs`; the
  reference has none. No CSP (Turnstile + GA make it brittle without nonces).
- **Legal pages** are drafted in both languages from the reference's texts,
  rewritten for a holding site that sells nothing. Copy lives in
  `messages/*.json` (`legal.privacy` / `legal.terms`) so the Dutch is real
  Dutch. **Flagged for legal review before launch** (a review note is rendered
  on both pages).
- **Copy discipline.** Group-level copy only; no long-form text copied from
  stretchplafond.be. Numbers on the page are computed from `site-config`
  (3 companies, 4 offices, 14 live market websites, first factory 2016) so
  they can never drift from the data. The "4,000+ projects" and "17 cities"
  claims appear only on the Stretch Sufit page, attributed to that company.

### Layer 1 — what could and could not be harvested

The build environment's egress policy blocked `stretchgroup.be` (and every
other group domain) outright — 403 on CONNECT for both `www` and apex — so the
`robots.txt` / `sitemap.xml` / `wget --spider` harvest in the brief could not
run here. `legacy/legacy-urls.txt` (112 URLs) was built instead from (a) the
verified navigation inventory in the brief, (b) search-engine `site:` harvests
of stretchgroup.be and stretchgroup.net (which surfaced the `/webshop/**`,
`/catalog/**`, `/blog/post|category|archive/**`, `/portfolio/**` and
`stretch-akoestische-baffle.html` families that the nav inventory lacked) and
(c) Magento 1 machinery paths. Layers 3 and 4 make the site safe regardless,
but the explicit map is only as good as the inventory:

- [ ] **Before cutover:** re-run the crawl commands from the brief on a machine
  that can reach the old site; export **Google Search Console → Pages** and
  **Magento admin → Marketing → SEO & Search → URL Rewrites**; merge into
  `legacy/legacy-urls.txt`; add explicit rules where a catch-all target is not
  the best one; re-run `npm run verify:redirects` against the preview.

### Deviations from the brief (all deliberate, all documented above)

1. Next.js 14.2.35 (security) instead of 14.2.15.
2. Layer 1 built without a live crawl (network policy) — gap flagged above.
3. `/webshop/**`, `/catalog/**` → `stretchplafond.be/materials` (not in the table).
4. Flagged spam is delivered with a review banner instead of stored-not-delivered.
5. `localeDetection: false` (the reference's domain mode never needed detection).
6. Rate limiting is in-memory (no database).

### [TO CONFIRM] — open items, each marked in code

1. **Group legal entity** (`brand.legalName`, JSON-LD `legalName`, the
   controller named in `/privacy` and `/terms`). Currently "STRETCH Group"
   with no legal suffix. → `src/lib/site-config.ts`, `messages/*.json` (`legal`).
2. **Phone numbers to display:** the mobile/WhatsApp line +32 474 52 20 90 is
   shown; the legacy office line +32 3 284 68 18 from the old site is kept in
   `contact.legacyOfficePhone` and rendered nowhere.
3. **Re-Sound:** legal entity name, address, the exact wording of its
   relationship to the group and since when, and its brand accent colour (pull
   from the real logo). Its page shows country only, no address, no
   "since" year. → `companies[2]` in `site-config.ts`.
4. **STRETCH's relationship framing** (founding company? member since?). No
   `memberSince` is claimed. → `companies[0]`.
5. **Re-Sound 2020 timeline entry** — exact framing ("origin: recycled jeans
   yarn, 2020" is what the brief verified). → `timeline[2]`, `messages` key
   `timeline.reSoundOrigin`.
6. **2025–26 domain rollout** — year framing. → `timeline[4]`, `timeline.rollout`.
7. **STRETCH Media:** the product site's "Powered by STRETCH Media" credit is
   kept as a footer line; it is NOT emitted as an organisation. Confirm whether
   it should be listed as a group entity.
8. **Alto Design postal code:** the brief says 42-200 Częstochowa, the product
   site's footer says 42-202. The brief's value is used.
9. **`/customer/account/login`** currently → `/` (shop accounts don't carry
   over). Confirm whether it should point at the client portal on stretch.mt
   instead. → `redirects.mjs`.
10. **Antibacterial pages** (`/clipso-spanplafonds/clipso/stretch-antibacterieel*`)
    → `stretchplafond.be/products` — no direct equivalent on the product site.
11. **Open roles** for `/careers` — the `OPEN_ROLES` list in
    `src/app/[locale]/careers/page.tsx` is empty; the page renders the
    "no advertised roles" state and the open-application path.
12. **Favicons** are the product site's mark (shared identity assumed). Replace
    if the group gets its own mark.
13. **Group logo + company logos + photography** — every slot is a
    `Placeholder` (search `Placeholder`, `logoSlot`, `imageSlot`, `imageLabel`).
14. **Lead delivery:** set `LEAD_WEBHOOK_URL` to the existing Power Automate
    flow into leads@stretchgroup.be (fastest), or the four `MS_*` Graph
    variables. Until then messages are console-logged only.

### Pre-launch content checklist

- [ ] Resolve the 14 `[TO CONFIRM]` items above.
- [ ] Legal review of `/privacy` and `/terms` (EN + NL); remove the review note
      (`legal.reviewNote`) once approved.
- [ ] Supply logo assets (group + 3 companies) and photography; wire them into
      the `Placeholder` slots (`src` prop) — no other code changes needed.
- [ ] Native-speaker read of `messages/nl.json` (written as Belgian Dutch,
      formal "u").
- [ ] Close the Layer-1 gap (GSC + Magento URL Rewrites export) and re-run the
      verifier against the preview.
- [ ] Set analytics IDs and a delivery method in Vercel; test one submission.
- [ ] DNS cutover per the README checklist (stretchgroup.be + the five
      multistore domains), then `npm run verify:redirects` against production
      (the launch gate).

### Visual + Lighthouse pass (same day)

- Playwright screenshots of every page at 1440 px and 390 px, plus the mobile
  drawer and the hero hover state: no console errors, layouts hold at both
  widths. Two fixes from the pass: the hero's image slot was a dark hatch on
  black (now a lighter hatch with a border), and the Markets grid showed empty
  hairline cells for the two single-site companies (hairline moved onto the
  items).
- Lighthouse (local production build, Chromium): three accessibility audits
  failed at first — white text at 92 % opacity on the red bands measured
  4.37:1 (now solid white, 4.53:1), the wordmark's two spans produced the
  accessible name "STRETCHGROUP" which did not match its aria-label (a real
  space added), and 12.5 px footer links were 14 px tall (padded to ≥ 24 px,
  same for the utility strip and legal row). After the fixes: **/ desktop
  100 / 100 / 100 / 100 · / mobile 96 / 100 / 100 / 100 · /companies/stretch
  mobile 96 / 100 / 100 / 100 · /contact desktop 100 / 100 / 100 / 100**
  (Performance / Accessibility / Best Practices / SEO).

### Verification record (this build)

- `npm run typecheck` clean · `npm run lint` clean · `npm run build` clean
  (25 static pages, 2 locales) · `npm test` 23/23.
- `npm run verify:redirects -- --base http://localhost:3000 --host-header
  --external stop`: 209 checks (112 inventory URLs, 78 slash/query/www
  variants, 13 junk paths), **0 failures** after the `/contact` loop fix.
- Contact API exercised: honeypot → silent 200; missing fields → 422; invalid
  JSON → 400; valid → 200 + console log; spam row → 200 + `[REVIEW]`
  (score 180); 7th POST in 10 min from one IP → 429; `/api/form-token` → `null`
  with no secret (zero-config).
- Rendered head verified: `<html lang>` per locale, canonical + hreflang
  (`en`, `nl-BE`, `x-default`) on every page, per-company OG image, three
  JSON-LD nodes on the home page (Organization with subOrganization, WebSite,
  LocalBusiness).
