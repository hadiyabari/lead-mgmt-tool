'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  hasAnalyticsConsent,
  CONSENT_CHANGE_EVENT,
} from '@/lib/cookie-consent';

function sendPageView(pathname: string) {
  if (!hasAnalyticsConsent()) return;

  const params = new URLSearchParams(window.location.search);
  let sessionId: string | null = null;
  try {
    sessionId = sessionStorage.getItem('lp_sid');
    if (!sessionId) {
      sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem('lp_sid', sessionId);
    }
  } catch {
    sessionId = null;
  }

  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'page_view',
      path: pathname,
      referrer: document.referrer || null,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      sessionId,
    }),
    credentials: 'same-origin',
    keepalive: true,
  }).catch(() => {});
}

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    sendPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const onConsent = () => {
      if (hasAnalyticsConsent() && pathname) {
        sendPageView(pathname);
      }
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsent);
  }, [pathname]);

  return null;
}
