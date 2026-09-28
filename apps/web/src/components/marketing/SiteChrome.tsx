import Link from 'next/link';
import type { ReactNode } from 'react';
import { CookieBanner, CookiePreferencesLink } from './CookieBanner';
import { PageViewTracker } from './PageViewTracker';

const SALES_PHONE = '03293318181';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="m-wrap">
      <PageViewTracker />
      <header className="m-nav">
        <Link href="/" className="m-brand">
          Lead<span>Pilot</span>
        </Link>
        <nav className="m-nav-links">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
          <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-primary">
            Contact Sales
          </a>
        </nav>
      </header>
      {children}
      <footer className="m-footer">
        <div className="m-footer-inner">
          <div>
            <h4>Product</h4>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link href="/legal/privacy">Privacy Policy</Link>
            <Link href="/legal/cookies">Cookie Policy</Link>
            <Link href="/legal/terms">Terms of Service</Link>
            <Link href="/legal/refunds">Refund Policy</Link>
            <Link href="/legal/data-deletion">Data Deletion</Link>
            <CookiePreferencesLink />
          </div>
          <div>
            <h4>Sales</h4>
            <a href={`tel:${SALES_PHONE}`}>{SALES_PHONE}</a>
            <Link href="/contact">Contact form</Link>
            <Link href="/login">Client login</Link>
          </div>
          <div>
            <h4>LeadPilot</h4>
            <p style={{ color: 'var(--m-muted)', fontSize: '.88rem', margin: 0, lineHeight: 1.5 }}>
              Compliant lead generation and grounded outreach for local service agencies.
            </p>
          </div>
        </div>
      </footer>
      <CookieBanner />
    </div>
  );
}

export { SALES_PHONE };
