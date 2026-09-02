// Numbered section label (e.g. "(01) — WHY STRETCH"). Matches the mockup
// eyebrow pattern. `num` is optional; when omitted, renders just the rule+label.
type EyebrowProps = {
  num?: string;
  label: string;
  /** Visual variant: 'dark' for black sections, 'red' for red sections. */
  tone?: 'light' | 'dark' | 'red';
};

export default function Eyebrow({ num, label, tone = 'light' }: EyebrowProps) {
  // WCAG AA per surface: 13px red text needs --red-bright on black, and
  // everything must be white on the red sections (red-on-red is invisible).
  const numColor =
    tone === 'red' ? '#fff' : tone === 'dark' ? 'var(--red-bright)' : 'var(--red)';
  const ruleColor = tone === 'red' ? '#fff' : 'var(--red)';
  const labelColor =
    tone === 'red' ? '#fff' : tone === 'dark' ? 'var(--on-dark-faint)' : 'var(--text-faint-2)';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        marginBottom: 18,
      }}
    >
      {num ? (
        <span
          style={{
            color: numColor,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '.16em',
          }}
        >
          ({num})
        </span>
      ) : (
        <span
          style={{ width: 34, height: 2, background: ruleColor, display: 'inline-block' }}
        />
      )}
      <span
        style={{
          fontSize: 'var(--fs-eyebrow)',
          fontWeight: 700,
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          color: labelColor,
        }}
      >
        {label}
      </span>
    </div>
  );
}
