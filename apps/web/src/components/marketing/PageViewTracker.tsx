'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let consent = 'unknown';
    try {
      consent = localStorage.getItem('lp_cookie_consent') || 'unknown';
    } catch {
      /* ignore */
    }
    if (consent === 'rejected') return;

    const params = new URLSearchParams(window.location.search);
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
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
