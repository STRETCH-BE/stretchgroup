// Image slot. When `src` is provided it renders a real photo via next/image
// (filling the slot, object-fit cover). When `src` is empty it falls back to the
// branded diagonal-hatch tile — so photos can be added one slot at a time
// without ever showing a broken image. See src/lib/images.ts.
import Image from 'next/image';

type PlaceholderProps = {
  label: string;
  /** Real photo path from /public, e.g. "/images/home/hero.jpg". Empty = tile. */
  src?: string;
  /** Accessible alt text for real photos (falls back to `label`). */
  alt?: string;
  /** Eager-load (use for above-the-fold images like the hero). */
  priority?: boolean;
  /** Responsive sizes hint for next/image (avoids oversized downloads). */
  sizes?: string;
  /** JPEG/WebP quality override for next/image (default 75). */
  quality?: number;
  /** object-fit for real photos. 'cover' fills+crops (photos); 'contain' shows
   *  the whole image without cropping (diagrams / infographics). */
  fit?: 'cover' | 'contain';
  /** Background behind a 'contain' image (fills any letterbox margin). */
  bg?: string;
  /** Light tile (on light sections) vs dark tile (default) — placeholder only. */
  light?: boolean;
  /** Optional aspect ratio, e.g. "16/10". When omitted, fills its container. */
  ratio?: string;
  rounded?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Marks the image/tile decorative for assistive tech. */
  decorative?: boolean;
};

export default function Placeholder({
  label,
  src,
  alt,
  priority,
  sizes,
  quality,
  fit = 'cover',
  bg,
  light = false,
  ratio,
  className,
  style,
  decorative = false,
}: PlaceholderProps) {
  // Real photo supplied → next/image filling the slot.
  if (src) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          height: ratio ? 'auto' : '100%',
          aspectRatio: ratio,
          overflow: 'hidden',
          background: bg,
          ...style,
        }}
      >
        <Image
          src={src}
          alt={decorative ? '' : alt ?? label}
          fill
          sizes={sizes ?? '100vw'}
          quality={quality}
          priority={priority}
          style={{ objectFit: fit }}
        />
      </div>
    );
  }

  // No photo yet → branded hatch placeholder.
  return (
    <div
      className={`img-ph${light ? ' img-ph--light' : ''}${className ? ' ' + className : ''}`}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : label}
      style={{
        width: '100%',
        height: ratio ? 'auto' : '100%',
        aspectRatio: ratio,
        ...style,
      }}
    >
      {label}
    </div>
  );
}
