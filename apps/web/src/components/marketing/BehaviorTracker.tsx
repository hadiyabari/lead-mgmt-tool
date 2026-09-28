'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';
import { AnalyticsEventName } from '@/lib/analytics-events';
import { hasAnalyticsConsent, CONSENT_CHANGE_EVENT } from '@/lib/cookie-consent';

/** Scroll depth milestones + optional web vitals when consent allows. */
export function BehaviorTracker() {
  useEffect(() => {
    const marks = new Set<number>();

    function onScroll() {
      if (!hasAnalyticsConsent()) return;
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      if (height <= 0) return;
      const pct = Math.round((scrolled / height) * 100);
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !marks.has(m)) {
          marks.add(m);
          track(AnalyticsEventName.SCROLL_DEPTH, { percent: m });
        }
      }
    }

    function onClick(e: MouseEvent) {
      if (!hasAnalyticsConsent()) return;
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.('a,button') as HTMLElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('tel:')) {
        track(AnalyticsEventName.PHONE_CLICK, { href });
        return;
      }
      if (a.dataset.trackCta || a.classList.contains('m-btn-primary')) {
        track(AnalyticsEventName.CTA_CLICK, {
          text: (a.textContent || '').trim().slice(0, 80),
          href: href.slice(0, 200),
        });
      }
    }

    function attach() {
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('click', onClick);
    }
    function detach() {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
    }

    if (hasAnalyticsConsent()) attach();
    const onConsent = () => {
      detach();
      if (hasAnalyticsConsent()) attach();
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsent);
    return () => {
      detach();
      window.removeEventListener(CONSENT_CHANGE_EVENT, onConsent);
    };
  }, []);

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    // Lightweight performance snapshot (not full RUM suite)
    try {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (nav) {
        track(AnalyticsEventName.WEB_VITAL, {
          metric: 'navigation',
          duration: Math.round(nav.duration),
          ttfb: Math.round(nav.responseStart),
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
