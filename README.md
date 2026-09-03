# STRETCH Group — Corporate Website

Corporate group website for **STRETCH Group**, deployed on **stretchgroup.be** (replacing the legacy Magento shop on that domain). It presents the group and its three member companies — STRETCH, Stretch Sufit / Alto Design and Re-Sound — routes each visitor to the right company website in one click, and carries the group's schema.org identity (`https://stretchgroup.be/#organization`, the entity the product site's `parentOrganization` points at). It is a holding site: **no products, no prices, no portal**.

Built with Next.js 14 (App Router), TypeScript and `next-intl`, on the STRETCH design system inherited 1:1 from the product site (`STRETCH-BE/stretch_website`, cloned read-only into `reference/`). Deployed on Vercel.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (optional) configure environment
cp .env.example .env.local      # every variable is optional

# 3. Run the dev server
npm run dev                      # http://localhost:3000  (English) · /nl (Dutch)
```

The site runs with **zero configuration**: with no env vars, analytics no-op and contact-form submissions are logged to the server console instead of emailed.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`) — must pass clean |
| `npm run typecheck` | `tsc --noEmit` — must pass clean |
| `npm test` | Spam-score regression fixtures |
| `npm run verify:redirects` | **Launch gate** — proves every legacy URL resolves to 200 with zero 4xx/5xx (see below) |

---

## Environment variables

Every variable is **optional**. See `.env.example` for the annotated list.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute production URL (canonicals, sitemap, OG, JSON-LD `@id`). Default `https://stretchgroup.be`. |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 ID (`G-…`). Consent-gated (Consent Mode v2, default denied). |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID. Loaded only after analytics consent. |
| `LEAD_DESTINATION` | Inbox for every contact-form submission. Default `leads@stretchgroup.be`. |
| `LEAD_FROM_EMAIL` | From-address of the notification e-mail. |
| `LEAD_WEBHOOK_URL` | POST each message as JSON to a webhook. **Fastest production path:** the Power Automate flow that already delivers into leads@stretchgroup.be (the re-sound.be pattern) — paste its HTTP trigger URL here. |
| `MS_TENANT_ID` / `MS_CLIENT_ID` / `MS_CLIENT_SECRET` / `MS_GRAPH_SENDER` | Deliver via Microsoft 365 (Graph, app-only Mail.Send). Setup notes in `src/lib/msgraph-mail.ts`. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` / `SMTP_FROM` | Or send via SMTP (Nodemailer, optional dependency). |
| `FORM_SIGNING_SECRET` | HMAC secret for the signed time-to-submit form token (anti-bot). Unset = off. |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` / `TURNSTILE_SECRET` | Cloudflare Turnstile (one widget: stretchgroup.be, www, the Vercel preview host, localhost). Unset = no CAPTCHA. |

**Lead delivery** auto-selects a method at runtime, in priority order: Microsoft Graph → webhook → SMTP → log-only. The first one whose env vars are present wins. If a method is configured and every configured method fails, the form shows its error state (with the e-mail address) and the message is written to the server log as `[lead] UNDELIVERED` so it can be recovered — it is never silently lost.

**Anti-spam** on the contact form: honeypot, in-memory rate limiting (6 / 10 min per IP, 10 / day per e-mail — best-effort per serverless instance, keyed on the platform-set client IP, so only meaningful on Vercel; use a Vercel WAF rate-limit rule for a hard cap), optional signed form token, optional Turnstile (set **both** the sitekey and the secret — with only the sitekey the layer scores the submission instead of verifying it), disposable-e-mail detection and content-based spam scoring. Flagged messages are **still delivered**, with a `[REVIEW]` subject prefix and a banner — the group site has no lead database, so nothing is dropped silently. Only honeypot hits are.

---

## Zero-404 redirect coverage (launch requirement)

The old stretchgroup.be is a Magento shop with years of indexed URLs. After cutover **no legacy URL may return a 404, 410 or 5xx** — every one resolves via 301/308 to a working, relevant page. Five layers:

| Layer | Where | What |
| --- | --- | --- |
| 1 | `legacy/legacy-urls.txt` | The committed URL inventory (see the file header for how it was built and the gap to close) |
| 2 | `redirects.mjs` → explicit rules | Every known URL mapped exactly; Dutch content → `https://stretchplafond.be/...` (301), group pages stay here (308) |
| 3 | `redirects.mjs` → prefix catch-alls | `/clipso-spanplafonds/:path*`, `/blog/:path*`, `/portfolio/:path*`, `/architects/:path*`, `/proffessionals/:path*`, `/webshop/:path*`; `/index.php/:path*` strips the prefix and re-evaluates the real path |
| 4 | `src/middleware.ts` | Any page-like path that is not one of the site's own routes (`staticRoutes` in `src/lib/site-config.ts`) 301s to the localized home — mistyped links, dead backlinks, whatever the crawl missed |
| 4b | `next.config.mjs` `rewrites.fallback` → `src/app/api/legacy-fallback` | Runs AFTER the filesystem: a missing static asset, a stray `.html`, an unknown `/api/*` path (Magento's `/api/soap`, `/api/rest`, …) is 301'd to the visitor's localized home. Real files in `public/` (Search Console verification, manifest, fonts) are served untouched |
| 5 | `scripts/verify-redirects.mjs` | Requests every inventory URL with redirects followed (max 5 hops), asserts 200 with zero 4xx/5xx, plus scheme/www/slash/query variants and junk paths that must land on the homepage |

Old multistore domains (`stretchgroup.fr` / `.de` / `.net` / `.es` / `.it`, with and without `www`) and `www.stretchgroup.be` are 308'd host-wide to `https://stretchgroup.be/:path*` by `redirects.mjs`, so they flow through the same layers.

```bash
# against a Vercel preview (before DNS cutover). Previews are protected by
# default: pass the project's "Protection Bypass for Automation" secret
# (or export VERCEL_AUTOMATION_BYPASS_SECRET) or every request answers 401.
npm run verify:redirects -- --base https://<preview>.vercel.app --bypass <secret>

# against production (after DNS cutover) — the final launch gate
npm run verify:redirects

# locally (sandbox without outbound access): host-scoped rules via Host header,
# external hops accepted when they are 301/308 to an allow-listed https domain
npm run verify:redirects -- --base http://localhost:3000 --host-header --external stop
```

Every on-site chain must also end in canonical form — https, apex host (no `www.`), no trailing slash — and junk paths under `/nl/` must land on `/nl`. The script exits non-zero on any failure and prints a per-URL chain report (`--json <file>` writes it out).

---

## Deploying to Vercel

1. The repository is linked to the Vercel project **`stretchgroup-website`** in team **STRETCH** (created 3 Sep 2026 from this session; production URL `https://stretchgroup-website.vercel.app`). If the Git connection shows as missing in *Project → Settings → Git*, connect `STRETCH-BE/stretchgroup` there; the production branch is the repository's default branch. The Next.js preset is detected automatically; no build-command changes.
2. Set environment variables in **Project → Settings → Environment Variables** (at minimum a lead-delivery method — `LEAD_WEBHOOK_URL` is the one-line option — plus `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_CLARITY_ID`).
3. Deploy. Every push produces a preview URL.
4. **Gate 1:** `npm run verify:redirects -- --base https://<preview>.vercel.app --bypass <secret>` must be green (Project → Settings → Deployment Protection → Protection Bypass for Automation).

### DNS cutover checklist — stretchgroup.be

- [ ] Export the URL list from **Google Search Console → Pages** and from **Magento admin → Marketing → SEO & Search → URL Rewrites**; merge any URL not yet in `legacy/legacy-urls.txt`, add rules to `redirects.mjs` where a better target than the catch-alls exists, re-run Gate 1.
- [ ] In Vercel → Project → Domains add `stretchgroup.be` (primary) and `www.stretchgroup.be` (redirect to apex, 308).
- [ ] At the registrar, point `stretchgroup.be` at Vercel (A `76.76.21.21` or the records shown in the Vercel domain panel — those take precedence) and `www` at `cname.vercel-dns.com`. Lower the TTL a day before.
- [ ] Wait for the certificates to issue; `https://stretchgroup.be/` and `https://www.stretchgroup.be/` both serve the new site.
- [ ] **Gate 2 (launch gate):** `npm run verify:redirects` against production — every legacy URL → 200 through the chain, zero 4xx/5xx, junk paths on the homepage.
- [ ] Verify `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/api/og`.
- [ ] Google Search Console: keep the existing property (same domain), submit the new sitemap, then watch the *Pages* report weekly and add any new 404 to `redirects.mjs`. There is no "change of address" (same domain).
- [ ] Keep the old Magento host reachable (on its old IP) for 30 days as a rollback; then decommission.

### DNS cutover checklist — old multistore domains

For each of `stretchgroup.fr`, `stretchgroup.de`, `stretchgroup.net`, `stretchgroup.es`, `stretchgroup.it`:

- [ ] Vercel → Project → Domains: add the apex **and** the `www` host to this project (no Vercel-side redirect needed — `redirects.mjs` 308s every path to `https://stretchgroup.be/:path*`; configuring the Vercel domain redirect to `stretchgroup.be` as well is fine, the rule then never fires).
- [ ] Registrar: apex A record → Vercel, `www` CNAME → `cname.vercel-dns.com`.
- [ ] After certificates: `curl -I https://www.stretchgroup.net/professionals.html` → `308` → `https://stretchgroup.be/professionals.html` → `301` → `https://stretchplafond.be/partners` → `200`.
- [ ] The multistore URLs in `legacy/legacy-urls.txt` are part of Gate 2 automatically.

### Post-deploy checklist

- [ ] Send one message through `/contact` and confirm it arrives at `LEAD_DESTINATION`.
- [ ] Accept cookies and confirm GA4 / Clarity fire; reject and confirm they do not.
- [ ] Replace every `Placeholder` slot with the real logo and photography (search for `Placeholder` and `logoSlot`).
- [ ] Resolve every `[TO CONFIRM]` in `CHANGES.md`; have legal review `/privacy` and `/terms`.
- [ ] Run Lighthouse on `/`, `/companies/stretch` and `/contact` (targets Perf ≥ 90 / A11y ≥ 95 / Best Practices ≥ 95 / SEO 100).

---

## Project structure

```
src/
  app/
    globals.css             # Design tokens (copied 1:1 from the product site)
    fonts.ts                # Self-hosted Archivo variable font (wdth 125 = display)
    sitemap.ts  robots.ts   # Metadata routes (one domain, live locales only)
    [locale]/
      layout.tsx            # Root layout: <html lang>, chrome, analytics, consent
      page.tsx              # Home: hero → router → companies → numbers → markets → timeline → contact
      companies/            # Overview + [slug] detail pages (stretch, stretch-sufit, re-sound)
      about/  careers/  contact/  privacy/  terms/  not-found.tsx
    api/
      contact/              # Form endpoint → guard chain → delivery chain
      form-token/           # Signed time-to-submit token
      legacy-fallback/      # Layer 4b: 301 to the localized home for whatever matched nothing
      og/  og/[slug]/       # Dynamic Open Graph images (edge)
  components/
    layout/                 # Header, Footer, MobileMenu, LanguageSwitcher, CookieConsent
    sections/               # CompanyRouter, CompanyPage, ContactForm, LegalPage, home/*
    analytics/              # GA4, Clarity, consent-mode defaults, scroll tracker
    seo/  ui/               # JsonLd · Placeholder, Reveal, Eyebrow, Wordmark, ExternalLink, TurnstileWidget
  lib/                      # site-config (single source of truth), routes, seo, page-meta,
                            # structured-data, deliver, email, msgraph-mail, consent, analytics,
                            # form-token, rate-limit, turnstile, use-form-security, spam/*
  i18n/                     # config (single source of truth), navigation, request
  middleware.ts             # next-intl routing + Layer-4 zero-404 fallback
messages/en.json  nl.json   # All UI copy (real Dutch, not machine-literal)
redirects.mjs               # Layers 2–3
legacy/legacy-urls.txt      # Layer 1 inventory
scripts/verify-redirects.mjs  # Layer 5 gate
docs/DESIGN-PLAN.md         # Palette roles, type scale, wireframe, hero concepts
```

---

## Key conventions

- **Facts live in one place.** `src/lib/site-config.ts` holds every verified fact (companies, offices, markets, timeline, contact). Copy lives in `messages/*.json`. Nothing is invented; open items are marked `[TO CONFIRM]` in code and listed in `CHANGES.md`.
- **Internationalisation.** Path-prefixed on one domain: `en` unprefixed (x-default), `nl` at `/nl`. `fr` / `de` / `pl` are declared `pending` in `src/i18n/config.ts` — enabling one is a one-line flip plus a message file. Locale detection is off (deterministic URLs). Always import `Link` from `@/i18n/navigation`, never `next/link`.
- **Styling.** `styled-jsx` + the token-driven `globals.css`. No Tailwind. Hard edges (`--radius: 0`), `--red: #e00000` for AA contrast.
- **Images.** `Placeholder` in every logo / photo slot until real assets are supplied — never a stock photo, never a generated logo.
- **Outbound links.** Every link that leaves the domain goes through `ExternalLink` (tracked `outbound_company_click`, `rel="noopener"`).
- **Structured data.** One `Organization` for the group with `subOrganization` entries for the four companies (each carrying its own site as `@id`/`url`), the HQ `LocalBusiness`, the offices, `WebSite`, `BreadcrumbList`. No ratings, prices or dates the brief did not verify.
- **Consent.** Custom banner → `localStorage`; Google Consent Mode v2 defaults to denied; Clarity loads only after analytics consent.

---

## Notes

- `reference/` is a read-only clone of the product site used as the architecture reference; it is git-ignored. Re-clone with `git clone --depth 1 https://github.com/STRETCH-BE/stretch_website.git reference`.
- See **`CHANGES.md`** for build decisions, deviations from the brief, every `[TO CONFIRM]` and the pre-launch content checklist.
