'use client';

// Fires analytics.scrollDepth at 25/50/75/90% of page scroll. Resets on every
// route change. Passive listener, rAF-throttled.
import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';
import { analytics } from '@/lib/analytics';

const THRESHOLDS = [25, 50, 75, 90] as const;

export default function ScrollTracker() {
  const pathname = usePathname();
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    fired.current = new Set();
    let ticking = false;

    const measure = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const percent = (doc.scrollTop / scrollable) * 100;
      for (const t of THRESHOLDS) {
        if (percent >= t && !fired.current.has(t)) {
          fired.current.add(t);
          analytics.scrollDepth(t, pathname);
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}
