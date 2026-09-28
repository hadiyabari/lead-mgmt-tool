'use client';

import { hasAnalyticsConsent } from '@/lib/cookie-consent';
import type { ClientAnalyticsPayload } from '@/lib/analytics-events';

function sessionId(): string | null {
  try {
    let id = sessionStorage.getItem('lp_sid');
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem('lp_sid', id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Fire a first-party analytics event when analytics consent is granted. */
export function track(name: string, meta?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;

  const params = new URLSearchParams(window.location.search);
  const payload: ClientAnalyticsPayload = {
    name,
    path: window.location.pathname,
    referrer: document.referrer || null,
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    sessionId: sessionId(),
    meta: meta ?? null,
  };

  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
    keepalive: true,
  }).catch(() => {});
}
