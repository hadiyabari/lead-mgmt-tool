'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  acceptAll,
  hasConsentDecision,
  rejectNonEssential,
  trackConsentEvent,
  CONSENT_CHANGE_EVENT,
  type CookieConsentState,
} from '@/lib/cookie-consent';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  const syncVisibility = useCallback(() => {
    setShow(!hasConsentDecision());
  }, []);

  useEffect(() => {
    syncVisibility();
    const onChange = () => syncVisibility();
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, [syncVisibility]);

  function onAccept() {
    acceptAll();
    trackConsentEvent('cookie_accept');
    setShow(false);
  }

  function onReject() {
    rejectNonEssential();
    trackConsentEvent('cookie_reject');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="m-cookie" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <p>
        Essential cookies keep the site secure and remember this choice. Analytics cookies measure
        traffic only if you allow them. <Link href="/legal/cookies">Cookie Policy</Link>
      </p>
      <div className="m-cookie-actions">
        <button type="button" className="m-btn m-btn-primary" onClick={onAccept}>
          Accept all
        </button>
        <button type="button" className="m-btn m-btn-ghost" onClick={onReject}>
          Essential only
        </button>
      </div>
    </div>
  );
}

/** Footer control to change analytics preference after the first decision. */
export function CookiePreferencesLink() {
  function openBanner() {
    try {
      localStorage.removeItem('lp_cookie_consent_v2');
      localStorage.removeItem('lp_cookie_consent');
    } catch {
      /* ignore */
    }
    window.dispatchEvent(
      new CustomEvent(CONSENT_CHANGE_EVENT, {
        detail: null as unknown as CookieConsentState,
      })
    );
  }

  return (
    <button
      type="button"
      onClick={openBanner}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        color: 'var(--m-muted)',
        fontSize: '0.88rem',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      Cookie preferences
    </button>
  );
}
