// Official company logo (public/images/logos, see `logos` in site-config).
// Every logo is a wide transparent banner, so it renders scaled to the box
// width inside a padded, centred frame; `tone` picks the variant made for
// a light or a dark background. `decorative` (alt="") is for slots where
// the name is already read out next to it (the hero index).
import Image from 'next/image';
import { logos, type CompanySlug } from '@/lib/site-config';

type CompanyLogoProps = {
  slug: CompanySlug;
  /** Alt text (e.g. "STRETCH logo"). Required unless `decorative`. */
  alt?: string;
  tone?: 'light' | 'dark';
  /** Frame aspect ratio, e.g. "16/7". Omit to fill the parent's height. */
  ratio?: string;
  /** Horizontal padding as a fraction of the frame width (0.14 = 14%). */
  pad?: number;
  /** Cap on the logo's rendered width inside the frame. */
  maxWidth?: number;
  /** next/image `sizes` hint — keep it close to the real rendered width. */
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function CompanyLogo({
  slug,
  alt,
  tone = 'light',
  ratio,
  pad = 0.14,
  maxWidth,
  sizes = '(max-width: 640px) 80vw, 360px',
  priority,
  decorative = false,
  className,
  style,
}: CompanyLogoProps) {
  const asset = logos[slug];
  const src = tone === 'dark' ? asset.onDark : asset.onLight;
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: ratio ? 'auto' : '100%',
        aspectRatio: ratio,
        padding: `${pad * 100}%`,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <Image
        src={src}
        alt={decorative ? '' : alt ?? ''}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        priority={priority}
        style={{ width: '100%', height: 'auto', maxWidth: maxWidth ? `${maxWidth}px` : undefined, objectFit: 'contain' }}
      />
    </div>
  );
}
