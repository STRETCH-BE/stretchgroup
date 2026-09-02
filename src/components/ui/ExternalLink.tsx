'use client';

// Outbound link to a company site — the group site's conversion. Real
// anchor (crawlable, followed), opens in a new tab, tracked. Use for EVERY
// link that leaves stretchgroup.be so the analytics stay consistent.
import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { analytics } from '@/lib/analytics';

type ExternalLinkProps = {
  href: string;
  company: string;
  location: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  ariaLabel?: string;
};

export default function ExternalLink({ href, company, location, className, style, children, ariaLabel }: ExternalLinkProps) {
  const t = useTranslations('common');
  return (
    <a
      href={href}
      className={className}
      style={style}
      target="_blank"
      rel="noopener"
      aria-label={ariaLabel}
      title={t('external')}
      onClick={() => analytics.outboundClick(company, location, href)}
    >
      {children}
    </a>
  );
}
