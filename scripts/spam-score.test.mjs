// Spam-score regression tests — `npm test`. Same contract as the product
// site (docs there: reference/docs/ANTI-SPAM.md):
//   • a known spam row scores >= HARD_THRESHOLD;
//   • anonymised legitimate submissions score < FLAG_THRESHOLD;
//   • the name heuristics keep passing real-world capitalisation and
//     consonant-heavy Polish names (the group has a Polish company);
//   • canonicalEmail collapses the Gmail dot/plus tricks.
// Loads the TypeScript sources directly via ts.transpileModule — no build step.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);

function loadTs(relPath, extraModules = {}) {
  const path = fileURLToPath(new URL(relPath, import.meta.url));
  const js = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  const localRequire = (id) => (id in extraModules ? extraModules[id] : require(id));
  new Function('require', 'module', 'exports', js)(localRequire, mod, mod.exports);
  return mod.exports;
}

const email = loadTs('../src/lib/spam/email.ts');
const { scoreSubmission, hasRandomCaseWord, FLAG_THRESHOLD, HARD_THRESHOLD } = loadTs(
  '../src/lib/spam/score.ts',
  { './email': email },
);

let failures = 0;
function check(label, ok, detail = '') {
  if (ok) {
    console.log(`  ok  ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

// --- 1. A known spam row must hard-fail --------------------------------------
{
  const { score, reasons } = scoreSubmission({
    fields: {
      name: 'lQazfcnPUfNaTSBCmjtARCKr',
      company: 'clijtFrEseYMSzYhHMkCb',
      email: 'j.eq.u.xa.nole9.0@gmail.com',
      message: 'Dear website owner, boost your ranking with our SEO services http://a.io http://b.io http://c.io',
    },
  });
  check(`spam row scores ${score} >= ${HARD_THRESHOLD}`, score >= HARD_THRESHOLD, reasons.join(', '));
}

// --- 2. Legitimate group-site submissions stay below the flag threshold -----
const LEGIT = [
  {
    label: 'BE architect asking which company',
    fields: {
      name: 'Jan Peeters',
      company: 'Peeters Architecten BV',
      email: 'jan.peeters@peetersarchitecten.be',
      about: 'group',
      message: 'Wij zoeken akoestische panelen én een spanplafond voor een kantoorproject in Gent. Welk bedrijf contacteren we best?',
    },
  },
  {
    label: 'PL consonant-heavy name (Stretch Sufit quote)',
    fields: {
      name: 'Krzysztof Szczepański',
      company: 'Sufity Chrzanowski',
      email: 'biuro@sufity-pszczyna.pl',
      about: 'stretch-sufit',
      message: 'Proszę o wycenę sufitu napinanego, ok. 60 m2 w Pszczynie.',
    },
  },
  {
    label: 'Open application from gmail with capitalised surname',
    fields: {
      name: 'Anne VanDenBroucke',
      company: '',
      email: 'anne.vdb.studio@gmail.com',
      about: 'careers',
      message: 'Spontane sollicitatie: projectleider plaatsing, regio Waasland. Zie www.linkedin.com/in/annevdb.',
    },
  },
];
for (const row of LEGIT) {
  const { score, reasons } = scoreSubmission({ fields: row.fields });
  check(`${row.label} scores ${score} < ${FLAG_THRESHOLD}`, score < FLAG_THRESHOLD, reasons.join(', '));
}

// --- 3. Case heuristics: real names pass, gibberish does not ---------------
for (const good of ['McDonald', 'iPhone', 'VanDenBroucke', 'Verbandsgemeinde', 'Szczepański', 'Częstochowa']) {
  check(`hasRandomCaseWord('${good}') is false`, !hasRandomCaseWord(good));
}
for (const bad of ['clijtFrEseYMSzYhHMkCb', 'lQazfcnPUfNaTSBCmjtARCKr']) {
  check(`hasRandomCaseWord('${bad}') is true`, hasRandomCaseWord(bad));
}

// --- 4. Meta signals stack the way the route relies on ---------------------
{
  const missing = scoreSubmission({ fields: { email: 'a@b.co' }, meta: { formToken: 'missing' } });
  check(`missing form token adds 40 (got ${missing.score})`, missing.score === 40);
  const fast = scoreSubmission({ fields: { email: 'a@b.co' }, meta: { formToken: 'fast' } });
  check(`sub-3s form token adds 60 (got ${fast.score})`, fast.score === 60);
  const honeypot = scoreSubmission({ fields: {}, meta: { honeypot: true } });
  check(`honeypot alone hard-fails (got ${honeypot.score})`, honeypot.score >= HARD_THRESHOLD);
}

// --- 5. canonicalEmail collapses the alias tricks ---------------------------
{
  const { canonicalEmail, gmailDotCount, isFreemail, isDisposable } = email;
  check("canonicalEmail('j.eq.u.xa.nole9.0@gmail.com') = 'jequxanole90@gmail.com'", canonicalEmail('j.eq.u.xa.nole9.0@gmail.com') === 'jequxanole90@gmail.com');
  check("canonicalEmail('Jan.Peeters+offerte@Gmail.com') = 'janpeeters@gmail.com'", canonicalEmail('Jan.Peeters+offerte@Gmail.com') === 'janpeeters@gmail.com');
  check("canonicalEmail keeps dots outside gmail ('a.b@firma.be')", canonicalEmail('a.b@firma.be') === 'a.b@firma.be');
  check("gmailDotCount('a.b@firma.be') = 0", gmailDotCount('a.b@firma.be') === 0);
  check("isFreemail('telenet.be')", isFreemail('telenet.be'));
  check("!isFreemail('stretchgroup.be')", !isFreemail('stretchgroup.be'));
  check("isDisposable('mailinator.com')", isDisposable('mailinator.com'));
  check("!isDisposable('stretchgroup.be')", !isDisposable('stretchgroup.be'));
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nAll spam-score checks passed');
