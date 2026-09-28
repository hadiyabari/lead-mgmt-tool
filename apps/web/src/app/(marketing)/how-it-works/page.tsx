import Link from 'next/link';
import { SALES_PHONE } from '@/components/marketing/SiteChrome';

const STEPS = [
  {
    n: '01',
    title: 'Workspace provisioned',
    body: 'Sales confirms fit. A SUPER_ADMIN creates your workspace and owner account. There is no public signup.',
  },
  {
    n: '02',
    title: 'Import contact history',
    body: 'Upload CSV or CRM exports into the contact-history ledger so prior recipients are blocked from day one.',
  },
  {
    n: '03',
    title: 'Configure ICP and sources',
    body: 'Choose verticals and countries. Enable official registry adapters such as NPI, Companies House, or ABN.',
  },
  {
    n: '04',
    title: 'Discover candidates',
    body: 'Runs pull leads with provenance. Simulation mode exercises the pipeline without live spend.',
  },
  {
    n: '05',
    title: 'Enrich and audit',
    body: 'Licensed enrichment and your audit tool attach ratings, contacts, scores, and findings to each lead.',
  },
  {
    n: '06',
    title: 'Score and qualify',
    body: 'Weighted scoring ranks fit. Low quality or suppressed identities never reach the send queue.',
  },
  {
    n: '07',
    title: 'Write grounded email',
    body: 'Messages reference audit findings and verified facts only. Templates stay under compliance constraints.',
  },
  {
    n: '08',
    title: 'Four-point send gate',
    body: 'Ledger and suppression checks run again immediately before send. Kill switch can stop all activity.',
  },
  {
    n: '09',
    title: 'Replies and meetings',
    body: 'Inbound classification and meeting capture close the loop for operators and account owners.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="m-hero" style={{ paddingBottom: '2rem' }}>
        <p className="m-pill">Product walkthrough</p>
        <h1>How LeadPilot works</h1>
        <p>
          A deliberate pipeline from official registries to booked conversations, with compliance checks
          at every stage.
        </p>
      </section>

      <section className="m-section" style={{ paddingTop: 0 }}>
        <div className="m-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="m-card" style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '1rem' }}>
              <div className="m-step-num" style={{ width: 56, height: 56, fontSize: '0.95rem' }}>
                {s.n}
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.4rem' }}>{s.title}</h3>
                <p style={{ margin: 0, color: 'var(--m-muted)', lineHeight: 1.55 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="m-section m-band" style={{ maxWidth: '100%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <h2>Ready to evaluate fit?</h2>
          <p className="lead" style={{ margin: '0 auto 1.25rem' }}>
            Call sales or open the contact form. Workspaces are opened only after onboarding.
          </p>
          <div className="m-hero-cta">
            <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-primary">
              Contact Sales · {SALES_PHONE}
            </a>
            <Link href="/pricing" className="m-btn m-btn-ghost">
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
