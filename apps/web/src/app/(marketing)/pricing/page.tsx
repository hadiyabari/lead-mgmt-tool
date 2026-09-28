import Link from 'next/link';
import { SALES_PHONE } from '@/components/marketing/SiteChrome';

export default function PricingPage() {
  return (
    <>
      <section className="m-hero" style={{ paddingBottom: '2rem' }}>
        <p className="m-pill">Pricing</p>
        <h1>Plans for agencies that want control</h1>
        <p>
          Every plan is sold through Contact Sales. There is no self-serve checkout. Deliverables below
          describe what is included once your workspace is provisioned.
        </p>
      </section>

      <section className="m-section" style={{ paddingTop: 0 }}>
        <div className="m-price-grid">
          <div className="m-price">
            <h3>Starter</h3>
            <div className="amount">
              $100 <small>/ month</small>
            </div>
            <p style={{ color: 'var(--m-muted)', fontSize: '.9rem', margin: '0 0 .5rem' }}>
              For a single team validating the pipeline.
            </p>
            <ul>
              <li>One workspace, up to 3 operator seats</li>
              <li>Official registry discovery (simulation and live where keyed)</li>
              <li>Contact-history ledger with CSV and CRM import</li>
              <li>Kill switch and role-based access</li>
              <li>Standard email compliance footers</li>
              <li>Email support during business hours</li>
            </ul>
            <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-ghost">
              Contact Sales
            </a>
          </div>

          <div className="m-price featured">
            <h3>Growth</h3>
            <div className="amount">
              $300 <small>/ month</small>
            </div>
            <p style={{ color: 'var(--m-muted)', fontSize: '.9rem', margin: '0 0 .5rem' }}>
              For agencies running weekly discovery and outreach.
            </p>
            <ul>
              <li>Everything in Starter</li>
              <li>Higher monthly run and credit ceilings</li>
              <li>Enrichment adapters and audit tool integration</li>
              <li>Up to 10 operator seats</li>
              <li>Priority onboarding call and playbook setup</li>
              <li>Shared Slack or chat channel during onboarding</li>
            </ul>
            <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-primary">
              Contact Sales
            </a>
          </div>

          <div className="m-price">
            <h3>Enterprise</h3>
            <div className="amount">Custom</div>
            <p style={{ color: 'var(--m-muted)', fontSize: '.9rem', margin: '0 0 .5rem' }}>
              For groups that need multiple brands or security review.
            </p>
            <ul>
              <li>Multiple workspaces under one commercial agreement</li>
              <li>Custom source configuration and rate limits</li>
              <li>Security questionnaire and DPA support</li>
              <li>Dedicated success contact</li>
              <li>Custom reporting exports</li>
              <li>Negotiated SLA</li>
            </ul>
            <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-ghost">
              Contact Sales
            </a>
          </div>
        </div>

        <div className="m-card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>How purchasing works</h3>
          <p style={{ color: 'var(--m-muted)', marginBottom: 0, lineHeight: 1.55 }}>
            Call {SALES_PHONE} or use the contact form. We confirm vertical fit, sending domains, and
            audit tool access. A platform SUPER_ADMIN creates your workspace and owner login. Billing
            terms are agreed in the order form. Public self-registration is not available.
          </p>
        </div>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/contact" className="m-btn m-btn-primary">
            Go to contact
          </Link>
        </p>
      </section>
    </>
  );
}
