# STRETCH Group — design plan (one page)

Written before coding, sanity-checked against the product site
(`reference/`, stretchplafond.be / stretch.mt) so the two feel like siblings,
not clones. The group site is a **corporate/holding site**: it presents the
group, routes each visitor to the right company website in one click, and
carries the group's schema.org identity. It sells nothing.

## What makes this a *group* site, not a corporate template

1. **The three companies are the content.** The home hero is an index of the
   companies, not a slogan over a stock photo. Every page ends in an outbound
   link to a company site — the group site routes, it doesn't sell.
2. **Shared system, own wordmarks.** All three companies are rendered on the
   inherited STRETCH system (red / black / white, Archivo expanded, hard
   edges). Only the logo slot differs per company. Cohesion *is* the design
   statement: one system, three businesses.
3. **The router is persistent.** "Looking for a stretch ceiling / acoustic
   panels / a quote in Poland?" appears on the home page and in the footer of
   every page.
4. **Facts only.** Numbers on the page are verified facts (companies,
   offices, live market domains, factory year). No fabricated stats.

## Palette roles (inherited tokens, `src/app/globals.css`)

| Token | Role on the group site |
| --- | --- |
| `--black #0a0a0a` | Hero and "group numbers" sections, footer (`--pure-black`) |
| `--red #e00000` | One accent per section: eyebrow rule, index numerals, the primary CTA, the contact band |
| `--red-bright #ff1a1a` | Small red text on black only (AA) |
| `--white` / `--surface #f4f3f1` | Companies grid, markets, timeline (light → surface alternation) |
| `--text-muted / --on-dark-*` | Body copy per surface, AA-tuned in the reference |

Section rhythm (as the reference): **dark hero → light router → surface
companies → dark numbers → light markets → surface timeline → red contact band
→ black footer.**

Company accent colours: STRETCH keeps the system red; Stretch Sufit and
Re-Sound carry no invented accent — their logo slots are `Placeholder` tiles
until the real logo assets arrive (`[TO CONFIRM]` in CHANGES.md).

## Type scale (inherited)

| Use | Token | Notes |
| --- | --- | --- |
| Hero wordmark | `--fs-display` (52–164px) | Archivo wdth 125, weight 900, uppercase, line-height .86 |
| Page titles | `--fs-h1` | same treatment |
| Section titles | `--fs-h2` / `--fs-h2-sm` | |
| Company names in the index | `clamp(28px, 4.6vw, 64px)` | display, uppercase |
| Eyebrows | `--fs-eyebrow` 12.5px | inherited `.eyebrow` pattern only |
| Body / lead | `--fs-body` 15px / `--fs-lead` | |

## Home wireframe (desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ■ STRETCH GROUP · Beveren-Waas, Belgium         Companies About Careers Contact  EN ▾ │  header (white)
├──────────────────────────────────────────────────────────────────────┤
│ █████████████████████████  HERO — full black  ████████████████████████│
│  — ONE GROUP. THREE COMPANIES.                                        │
│  STRETCH                                                             │
│  GROUP.                     ┌───────────────────────┐                │
│  Ceilings, walls and         │  [logo / photo slot]   │  ← swaps with │
│  acoustics from Belgium      │   Placeholder          │    the row    │
│  and Poland.                 └───────────────────────┘    hovered/    │
│                                                             focused   │
│  01  STRETCH          Ceilings & walls · stretchplafond.be     ↗      │
│  02  STRETCH SUFIT    PVC factory, Poland · altodesign.pl      ↗      │
│  03  RE-SOUND         Circular acoustics · re-sound.be         ↗      │
├──────────────────────────────────────────────────────────────────────┤
│ ROUTER (white)  "Where do you need to be?"                            │
│ ┌ Stretch ceiling? ┐ ┌ Acoustic panels? ┐ ┌ A quote in Poland? ┐      │
│ │ stretchplafond.be│ │ re-sound.be      │ │ altodesign.pl      │      │
├──────────────────────────────────────────────────────────────────────┤
│ COMPANIES (surface)  three cards: [logo slot] name · legal · what · → │
├──────────────────────────────────────────────────────────────────────┤
│ NUMBERS (black)   3 companies · 4 offices · 12 market domains · 2016  │
├──────────────────────────────────────────────────────────────────────┤
│ MARKETS (white)   live domains grouped by company (pending excluded)  │
├──────────────────────────────────────────────────────────────────────┤
│ TIMELINE (surface)  2016 → 2018 → 2020* → 2024 → 2025–26*  (teaser)   │
├──────────────────────────────────────────────────────────────────────┤
│ CONTACT BAND (red)  "Talk to the group" · phone · email · → /contact  │
├──────────────────────────────────────────────────────────────────────┤
│ FOOTER (pure black)  brand · companies · group · offices · router row │
└──────────────────────────────────────────────────────────────────────┘
```

## Hero: two concepts, one chosen

**A — "The Index" (chosen).** A full-black opening. Left: the group wordmark
at display size and a two-line statement. Below it, the three companies as a
numbered list of real links (01/02/03). Hovering or keyboard-focusing a row
swaps the single image/logo slot on the right and reveals the row's
one-liner. One orchestrated entrance: wordmark, statement and the three rows
stagger in once (≈600 ms total); nothing else animates. Under
`prefers-reduced-motion` everything renders in its final state.

*Why:* it literally indexes the three companies (the site's whole job), it
is a semantic `<ul>` of links (accessible, crawlable), it collapses cleanly
on mobile (rows stack, image slot hides), and it spends the boldness in one
place without per-card hover theatrics.

**B — "The Triptych" (not chosen).** A split-screen of three vertical panels,
each carrying a company wordmark over a photo slot; the hovered panel grows.
Rejected for launch: three photo/logo slots would all be placeholders on day
one, the grow-on-hover interaction is exactly the scattered hover theatrics
the brief warns against, and the layout degrades into a plain stack on
phones, losing the concept. It remains a viable v2 once real photography
exists (the `Placeholder` slots are already in place).

## Sibling check against the reference

Same: tokens 1:1, Archivo wdth 125 display, `.eyebrow` / `.h1` / `.btn`
utilities, hairline `grid-lines`, the light→dark→red rhythm, the black
utility strip in the header, the pure-black footer with office chips.
Different on purpose: no photography-led carousel hero (group has no product
photography to lead with), no mega menu, no lead modal, no ticker of product
claims. Header nav is four items. The only red band is the contact band.

## Motion & accessibility

- One entrance animation (hero). `Reveal` is used sparingly for section
  headings only. All motion collapses under `prefers-reduced-motion` (global
  rule inherited from the reference CSS).
- Landmarks: `header`, `nav[aria-label]`, `main#main`, `footer`; skip link.
- Focus: inherited 3px red `:focus-visible` outline; hero rows are `<a>`.
- Contrast: only the AA-tuned tokens; small red text on black uses
  `--red-bright`.
