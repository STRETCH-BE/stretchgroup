#!/usr/bin/env node
// ============================================================================
// LAYER 5 — REDIRECT VERIFICATION (the launch gate).
//
//   npm run verify:redirects -- --base https://<preview>.vercel.app
//   npm run verify:redirects                       (production: URLs as listed)
//
// Reads legacy/legacy-urls.txt, requests every URL with redirects followed
// (max 5 hops) and asserts that every chain ends in HTTP 200 with ZERO
// 4xx/5xx anywhere in the chain. Also tests, for a sample of URLs, the
// http→https, www→apex, trailing-slash and query-string variants, plus a
// handful of invented junk paths that must land on the homepage (Layer 4).
// Prints a per-URL report and exits non-zero on any failure.
//
// Options
//   --base <origin>     Rewrite every inventory URL's origin to this base
//                       (a Vercel preview, or http://localhost:3000). Without
//                       it the URLs are requested exactly as listed
//                       (production, after DNS cutover).
//   --file <path>       Inventory file (default legacy/legacy-urls.txt).
//   --host-header       With --base: also send the ORIGINAL host as the Host
//                       header, so host-scoped rules (old multistore domains,
//                       www→apex) can be exercised against a local server.
//                       Never use this against a Vercel preview (its router
//                       needs the preview host).
//   --external <mode>   What to do when a chain leaves the base origin:
//                         follow (default) — keep following into the other
//                                            domain and require a final 200;
//                         stop             — accept the hop when it is a
//                                            301/308 to an https URL on an
//                                            allow-listed group domain (for
//                                            sandboxes that cannot reach the
//                                            other domains). The production
//                                            run must use `follow`.
//   --concurrency <n>   Parallel requests (default 8).
//   --json <path>       Also write the full report as JSON.
//   --no-variants       Skip the scheme/www/slash/query variant checks.
//   --no-junk           Skip the invented-path checks.
// ============================================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i > -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(name);

const BASE = (opt('--base', '') || '').replace(/\/$/, '');
const FILE = opt('--file', 'legacy/legacy-urls.txt');
const HOST_HEADER = flag('--host-header');
const EXTERNAL = opt('--external', 'follow');
const CONCURRENCY = Number(opt('--concurrency', '8')) || 8;
const JSON_OUT = opt('--json', '');
const MAX_HOPS = 5;

// Domains a chain may legitimately end on (or, in --external stop mode, hop
// to). Keep in sync with site-config markets + redirects.mjs targets.
const ALLOWED_HOSTS = new Set([
  'stretchgroup.be',
  'stretchplafond.be',
  'stretch.mt',
  'altodesign.pl',
  're-sound.be',
]);

const HOME_PATHS = new Set(['/', '/nl']); // localized homes (Layer 4 targets)

function readInventory(file) {
  const text = readFileSync(resolve(file), 'utf8');
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

function hostOf(u) {
  return new URL(u).host.toLowerCase();
}
function apexOf(host) {
  return host.replace(/^www\./, '').split(':')[0];
}
function baseHost() {
  return BASE ? hostOf(BASE) : null;
}

/** Map an inventory URL onto the request URL (+ optional Host header). */
function toRequest(url) {
  const u = new URL(url);
  if (!BASE) return { url: u.toString(), headers: {} };
  const target = new URL(BASE);
  target.pathname = u.pathname;
  target.search = u.search;
  const headers = HOST_HEADER ? { host: u.host } : {};
  return { url: target.toString(), headers };
}

async function fetchOnce(url, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: { 'user-agent': 'stretchgroup-verify-redirects/1.0', ...headers },
      signal: controller.signal,
    });
    // Drain the body so keep-alive sockets are reusable.
    try {
      await res.arrayBuffer();
    } catch {
      /* ignore */
    }
    return { status: res.status, location: res.headers.get('location') };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Follow a chain. Returns { ok, chain: [{url, status, location}], reason }.
 * A chain passes when it ends in 200 with no 4xx/5xx anywhere; an external
 * hop in `stop` mode passes when it is a permanent redirect to an allowed
 * https host.
 */
async function follow(startUrl, headers, expect = {}) {
  const chain = [];
  let current = startUrl;
  let currentHeaders = headers;
  const start = baseHost() ?? hostOf(startUrl);
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    let r;
    try {
      r = await fetchOnce(current, currentHeaders);
    } catch (err) {
      chain.push({ url: current, status: 0, error: err?.message || 'fetch failed' });
      return { ok: false, chain, reason: `request failed: ${err?.message || err}` };
    }
    chain.push({ url: current, status: r.status, location: r.location });
    if (r.status >= 400) return { ok: false, chain, reason: `HTTP ${r.status} in chain` };
    if (r.status >= 300 && r.status < 400) {
      if (!r.location) return { ok: false, chain, reason: `${r.status} without Location` };
      const next = new URL(r.location, current);
      const nextHost = apexOf(next.host.toLowerCase());
      const leavesBase = apexOf(start) !== nextHost && !(BASE && nextHost === apexOf(hostOf(BASE)));
      if (leavesBase) {
        // Host-header runs: the multistore 308 lands on stretchgroup.be — map
        // it back onto the base so the rest of the chain is exercised locally.
        if (BASE && HOST_HEADER && nextHost === 'stretchgroup.be') {
          const mapped = new URL(BASE);
          mapped.pathname = next.pathname;
          mapped.search = next.search;
          current = mapped.toString();
          currentHeaders = {}; // now a first-party request on the base host
          continue;
        }
        if (EXTERNAL === 'stop') {
          const permanent = r.status === 301 || r.status === 308;
          const allowed = next.protocol === 'https:' && ALLOWED_HOSTS.has(nextHost);
          if (permanent && allowed) {
            return { ok: true, chain, reason: `external ${r.status} → ${next.host} (not followed)` , external: next.toString() };
          }
          return { ok: false, chain, reason: `external hop to ${next.toString()} is not a permanent redirect to an allowed https host` };
        }
        currentHeaders = {};
      }
      current = next.toString();
      continue;
    }
    if (r.status === 200) {
      if (expect.home) {
        const finalPath = new URL(current).pathname.replace(/\/+$/, '') || '/';
        if (!HOME_PATHS.has(finalPath)) {
          return { ok: false, chain, reason: `expected the homepage, landed on ${finalPath}` };
        }
      }
      if (hop > MAX_HOPS) return { ok: false, chain, reason: 'too many hops' };
      return { ok: true, chain, reason: `200 after ${hop} hop(s)` };
    }
    return { ok: false, chain, reason: `unexpected HTTP ${r.status}` };
  }
  return { ok: false, chain, reason: `more than ${MAX_HOPS} hops` };
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, next));
  return results;
}

// ---------------------------------------------------------------------------
// Test set
// ---------------------------------------------------------------------------
const inventory = readInventory(FILE);
const tests = [];

for (const url of inventory) tests.push({ group: 'inventory', label: url, ...toRequest(url) });

if (!flag('--no-variants')) {
  // A representative sample: one URL per top-level family.
  const seen = new Set();
  const sample = [];
  for (const url of inventory) {
    const u = new URL(url);
    if (!u.host.endsWith('stretchgroup.be')) continue;
    const family = u.pathname.split('/').filter(Boolean)[0] || '(root)';
    if (seen.has(family)) continue;
    seen.add(family);
    sample.push(url);
  }
  for (const url of sample) {
    const u = new URL(url);
    // trailing-slash toggle
    const toggled = new URL(url);
    toggled.pathname = u.pathname.endsWith('/') && u.pathname !== '/' ? u.pathname.slice(0, -1) : u.pathname + '/';
    tests.push({ group: 'variant:slash', label: toggled.toString(), ...toRequest(toggled.toString()) });
    // query string
    const q = new URL(url);
    q.searchParams.set('utm_source', 'verify');
    q.searchParams.set('gclid', 'abc123');
    tests.push({ group: 'variant:query', label: q.toString(), ...toRequest(q.toString()) });
    // www ↔ apex (production and --host-header runs only; a preview host
    // cannot serve the legacy hostnames)
    if (!BASE || HOST_HEADER) {
      const w = new URL(url);
      w.host = w.host.startsWith('www.') ? w.host.slice(4) : 'www.' + w.host;
      tests.push({ group: 'variant:www', label: w.toString(), ...toRequest(w.toString()) });
    }
    // http → https (production only: a preview/local base has one scheme)
    if (!BASE) {
      const h = new URL(url);
      h.protocol = 'http:';
      tests.push({ group: 'variant:http', label: h.toString(), url: h.toString(), headers: {} });
    }
  }
}

if (!flag('--no-junk')) {
  const junk = [
    '/this-page-does-not-exist',
    '/foo/bar/baz',
    '/nl/deze-pagina-bestaat-niet',
    '/fr/about', // pending locale
    '/wp-admin',
    '/wp-login.php',
    '/random-page.html',
    '/old-brochure.pdf',
    '/some/image.jpg',
    '/companies/unknown-company',
    '/about/extra',
    '/%E2%9C%93/unicode',
    '/customer/account/login/?referer=abc',
  ];
  for (const p of junk) {
    const u = (BASE || 'https://stretchgroup.be') + p;
    tests.push({ group: 'junk→home', label: u, url: u, headers: {}, expectHome: true });
  }
}

// ---------------------------------------------------------------------------
// Run + report
// ---------------------------------------------------------------------------
console.log(`verify-redirects — ${tests.length} checks · base=${BASE || '(as listed)'} · external=${EXTERNAL}${HOST_HEADER ? ' · host-header' : ''}`);
console.log('');

const results = await runPool(tests, async (t) => {
  const r = await follow(t.url, t.headers, { home: t.expectHome });
  return { ...t, ...r };
});

let failures = 0;
const byGroup = new Map();
for (const r of results) {
  const g = byGroup.get(r.group) ?? { pass: 0, fail: 0 };
  if (r.ok) g.pass++;
  else g.fail++;
  byGroup.set(r.group, g);
  const chain = r.chain.map((c) => `${c.status}${c.location ? ' → ' + c.location : ''}`).join(' | ');
  if (r.ok) {
    console.log(`  ok    ${r.label}\n        ${chain}`);
  } else {
    failures++;
    console.log(`  FAIL  ${r.label}\n        ${chain}\n        ${r.reason}`);
  }
}

console.log('');
for (const [g, c] of byGroup) console.log(`  ${g.padEnd(16)} ${String(c.pass).padStart(4)} pass ${String(c.fail).padStart(4)} fail`);
console.log('');

if (JSON_OUT) {
  writeFileSync(resolve(JSON_OUT), JSON.stringify({ base: BASE, external: EXTERNAL, hostHeader: HOST_HEADER, results }, null, 2));
  console.log(`report written to ${JSON_OUT}`);
}

if (failures > 0) {
  console.error(`\n${failures} of ${results.length} checks FAILED — the site is not ready to launch.`);
  process.exit(1);
}
console.log(`All ${results.length} checks passed — every legacy URL resolves to 200 with no 4xx/5xx.`);
