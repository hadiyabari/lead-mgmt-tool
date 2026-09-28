/**
 * Cookie consent store (client-side).
 * Essential cookies do not require opt-in.
 * Analytics runs only when analytics === true.
 */

export const CONSENT_STORAGE_KEY = 'lp_cookie_consent_v2';
export const CONSENT_CHANGE_EVENT = 'lp-cookie-consent-change';

/** Bump when policy categories change so the banner is shown again. */
export const CONSENT_VERSION = 2;

export type CookieConsentState = {
  version: number;
  /** Always true; essential storage is required for the preference itself. */
  essential: true;
  /** Optional traffic analytics (page_view, UTM, etc.). */
  analytics: boolean;
  updatedAt: string;
};

export function defaultConsent(analytics: boolean): CookieConsentState {
  return {
    version: CONSENT_VERSION,
    essential: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
}

export function readConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      // Migrate legacy string values from v1 banner
      const legacy = localStorage.getItem('lp_cookie_consent');
      if (legacy === 'accepted') {
        const migrated = defaultConsent(true);
        writeConsent(migrated);
        return migrated;
      }
      if (legacy === 'rejected') {
        const migrated = defaultConsent(false);
        writeConsent(migrated);
        return migrated;
      }
      return null;
    }
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (!parsed || typeof parsed.analytics !== 'boolean') return null;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      version: CONSENT_VERSION,
      essential: true,
      analytics: parsed.analytics,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeConsent(state: CookieConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    // Clear legacy key after migration write
    localStorage.removeItem('lp_cookie_consent');
  } catch {
    /* private mode / blocked storage */
  }
  try {
    window.dispatchEvent(
      new CustomEvent(CONSENT_CHANGE_EVENT, { detail: state })
    );
  } catch {
    /* ignore */
  }
}

export function acceptAll(): CookieConsentState {
  const state = defaultConsent(true);
  writeConsent(state);
  return state;
}

export function rejectNonEssential(): CookieConsentState {
  const state = defaultConsent(false);
  writeConsent(state);
  return state;
}

export function hasAnalyticsConsent(): boolean {
  const c = readConsent();
  return c?.analytics === true;
}

/** True when the user has made any explicit choice for the current version. */
export function hasConsentDecision(): boolean {
  return readConsent() != null;
}

export function trackConsentEvent(name: 'cookie_accept' | 'cookie_reject'): void {
  if (typeof window === 'undefined') return;
  // Consent decision itself may be recorded once; analytics follow-up only if accepted
  if (name === 'cookie_reject') return;
  if (!hasAnalyticsConsent()) return;
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, path: window.location.pathname }),
    credentials: 'same-origin',
    keepalive: true,
  }).catch(() => {});
}
