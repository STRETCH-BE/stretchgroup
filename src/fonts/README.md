# Archivo — self-hosted variable subset

`archivo-var.woff2` (77 KB) replaces the two Google-split files next/font used
to emit (latin 90 KB preloaded + latin-ext 84 KB discovered late via CSS —
the footer's "Częstochowa" pulled the whole second file into the critical
path on every page). One file, preloaded, covers all 12 site locales.

- Axes kept: wght 400–900, wdth 100–125 (the display look is wdth 125,
  applied in globals.css via font-variation-settings).
- Coverage: Basic Latin, Latin-1, Latin Extended-A/B, Greek α, general
  punctuation, €, ™, →, −, ≈, ≥. Characters Archivo never contained
  (★ ▪ ↗) keep falling back to the system font, as before.
- Adding a locale outside Latin script (Greek, Cyrillic, Vietnamese)
  requires rebuilding the subset.

## Rebuild recipe

```bash
pip install fonttools brotli
curl -sSL -o archivo-full.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf"
python3 - <<'PY'
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
f = TTFont('archivo-full.ttf')
f = instancer.instantiateVariableFont(f, {'wght': (400, 900), 'wdth': (100, 125)})
f.save('archivo-trimmed.ttf')
subset.main([
    'archivo-trimmed.ttf',
    '--unicodes=U+0020-007E,U+00A0-024F,U+03B1,U+2000-206F,U+20AC,U+2122,U+2192,U+2212,U+2248,U+2264-2265',
    '--layout-features=kern,liga,ccmp,mark,mkmk,locl',
    '--no-hinting',
    '--flavor=woff2',
    '--output-file=archivo-var.woff2',
])
PY
```
