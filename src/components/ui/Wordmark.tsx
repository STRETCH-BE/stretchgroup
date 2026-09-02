// Text wordmark for STRETCH Group — used in the header, footer and mobile
// menu until the real group logo asset arrives ([TO CONFIRM], CHANGES.md).
// Same construction as the product site's "STRETCH®" text mark, extended
// with the red "GROUP" so the two read as siblings.
type WordmarkProps = { size?: number; tone?: 'light' | 'dark' };

export default function Wordmark({ size = 26, tone = 'light' }: WordmarkProps) {
  const main = tone === 'dark' ? '#fff' : 'var(--black)';
  const accent = tone === 'dark' ? 'var(--red-bright)' : 'var(--red)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: Math.round(size * 0.28), whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: size, letterSpacing: '-.02em', color: main, lineHeight: 1 }}>
        STRETCH
      </span>{' '}
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: size * 0.72, letterSpacing: '.02em', color: accent, lineHeight: 1 }}>
        GROUP
      </span>
    </span>
  );
}
