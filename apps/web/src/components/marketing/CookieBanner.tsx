'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'lp_cookie_consent';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setShow(false);
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'cookie_accept', path: window.location.pathname }),
    }).catch(() => {});
  }

  function reject() {
    try {
      localStorage.setItem(KEY, 'rejected');
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="m-cookie" role="dialog" aria-label="Cookie consent">
      <p>
        We use essential cookies to run the site and optional analytics cookies to understand traffic.
        See our <Link href="/legal/cookies">Cookie Policy</Link>.
      </p>
      <div className="m-cookie-actions">
        <button type="button" className="m-btn m-btn-primary" onClick={accept}>
          Accept
        </button>
        <button type="button" className="m-btn m-btn-ghost" onClick={reject}>
          Reject non-essential
        </button>
      </div>
    </div>
  );
}
