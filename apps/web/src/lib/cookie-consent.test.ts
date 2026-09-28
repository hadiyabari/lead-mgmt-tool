import { describe, it, expect, beforeEach } from 'vitest';
import {
  CONSENT_STORAGE_KEY,
  defaultConsent,
  readConsent,
  writeConsent,
  hasAnalyticsConsent,
  hasConsentDecision,
  acceptAll,
  rejectNonEssential,
  CONSENT_VERSION,
} from './cookie-consent';

describe('cookie-consent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no decision until written', () => {
    expect(hasConsentDecision()).toBe(false);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('acceptAll enables analytics', () => {
    acceptAll();
    expect(hasConsentDecision()).toBe(true);
    expect(hasAnalyticsConsent()).toBe(true);
    const c = readConsent();
    expect(c?.version).toBe(CONSENT_VERSION);
    expect(c?.essential).toBe(true);
  });

  it('rejectNonEssential disables analytics', () => {
    rejectNonEssential();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('ignores wrong version', () => {
    writeConsent({ ...defaultConsent(true), version: 1 });
    // writeConsent always stamps current version; simulate stale manually
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: 1, essential: true, analytics: true, updatedAt: new Date().toISOString() })
    );
    expect(readConsent()).toBeNull();
    expect(hasConsentDecision()).toBe(false);
  });
});
