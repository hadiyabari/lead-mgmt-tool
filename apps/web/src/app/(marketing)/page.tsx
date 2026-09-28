import Link from 'next/link';
import { SALES_PHONE } from '@/components/marketing/SiteChrome';

export default function HomePage() {
  return (
    <>
      {/* 1 Hero */}
      <section className="m-hero">
        <p className="m-pill">For growth-focused agencies</p>
        <h1>Find high-value local service clients. Reach only people you have never contacted.</h1>
        <p>
          LeadPilot discovers businesses from official registries, scores them with your audit data,
          and runs compliant outreach under a hard never-contacted ledger.
        </p>
        <div className="m-hero-cta">
          <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-primary">
            Contact Sales · {SALES_PHONE}
          </a>
          <Link href="/how-it-works" className="m-btn m-btn-ghost">
            How it works
          </Link>
        </div>
      </section>

      {/* 2 Trust strip */}
      <section className="m-section" style={{ paddingTop: 0 }}>
        <div className="m-logo-row">
          <span>US NPI Registry</span>
          <span>UK Companies House</span>
          <span>AU ABN Lookup</span>
          <span>CAN-SPAM · PECR · Spam Act</span>
        </div>
      </section>

      {/* 3 Problem */}
      <section className="m-section">
        <h2>Cold lists burn reputation</h2>
        <p className="lead">
          Scraped directories, recycled CSVs, and aggressive senders create complaints, blocks, and
          wasted credits. Agencies need provenance, audit truth, and a real contact ledger.
        </p>
        <div className="m-grid">
          <div className="m-card">
            <h3>Uncertain origin</h3>
            <p>Leads without a clear registry or license source are hard to defend in compliance reviews.</p>
          </div>
          <div className="m-card">
            <h3>Repeat contact</h3>
            <p>Without a normalized ledger, the same clinic receives another pitch six months later.</p>
          </div>
          <div className="m-card">
            <h3>Generic copy</h3>
            <p>Emails that ignore audit findings read like mass mail and underperform on replies.</p>
          </div>
        </div>
      </section>

      {/* 4 Solution pillars */}
      <section className="m-section m-band" style={{ maxWidth: '100%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <h2>Built around official data and your audit</h2>
          <p className="lead">Primary sources, enrichment, scoring, grounded email, and booking in one controlled pipeline.</p>
          <div className="m-grid">
            <div className="m-card">
              <h3>Registry discovery</h3>
              <p>US NPI, UK Ltd/LLP filings, AU ABN patterns. Provenance stored on every lead.</p>
            </div>
            <div className="m-card">
              <h3>Audit-backed scoring</h3>
              <p>Your audit tool maps URL to score and findings. Outreach references real gaps.</p>
            </div>
            <div className="m-card">
              <h3>Never-contacted gate</h3>
              <p>Four-point checks before enrich, score, write, and send against the contact ledger.</p>
            </div>
            <div className="m-card">
              <h3>Kill switch</h3>
              <p>Workspace owners can halt sending and enrichment immediately from the dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Verticals */}
      <section className="m-section">
        <h2>Verticals that convert for local retainers</h2>
        <p className="lead">Dental and orthodontic, home services, and aesthetic clinics across US, UK, and Australia.</p>
        <div className="m-grid">
          <div className="m-card"><h3>Dental and ortho</h3><p>License and NPI oriented discovery with local SEO and visibility offers.</p></div>
          <div className="m-card"><h3>Home services</h3><p>Growth signals and registry filters tuned for service businesses with websites.</p></div>
          <div className="m-card"><h3>Med-spa and aesthetic</h3><p>Clinic-focused enrichment and audit findings for conversion and presence gaps.</p></div>
        </div>
      </section>

      {/* 6 Stats band */}
      <section className="m-section">
        <div className="m-stats">
          <div className="m-stat"><strong>3</strong><span>Countries in scope</span></div>
          <div className="m-stat"><strong>4</strong><span>Contact gate points</span></div>
          <div className="m-stat"><strong>0</strong><span>Self-serve spam signups</span></div>
          <div className="m-stat"><strong>1</strong><span>Ledger of truth</span></div>
        </div>
      </section>

      {/* 7 How it works preview */}
      <section className="m-section">
        <h2>From registry to meeting</h2>
        <p className="lead">A controlled sequence your operators can run in simulation before going live.</p>
        <div className="m-steps">
          <div className="m-step"><div className="m-step-num">1</div><div><h3 style={{ margin: '0 0 .35rem' }}>Discover</h3><p style={{ margin: 0, color: 'var(--m-muted)' }}>Pull candidates from official registries with rate limits and simulation mode.</p></div></div>
          <div className="m-step"><div className="m-step-num">2</div><div><h3 style={{ margin: '0 0 .35rem' }}>Enrich and audit</h3><p style={{ margin: 0, color: 'var(--m-muted)' }}>Places, website contacts, and your audit score attach to each lead.</p></div></div>
          <div className="m-step"><div className="m-step-num">3</div><div><h3 style={{ margin: '0 0 .35rem' }}>Score and write</h3><p style={{ margin: 0, color: 'var(--m-muted)' }}>Rank by fit. Draft emails only from verified facts and findings.</p></div></div>
          <div className="m-step"><div className="m-step-num">4</div><div><h3 style={{ margin: '0 0 .35rem' }}>Send and book</h3><p style={{ margin: 0, color: 'var(--m-muted)' }}>Ledger-gated send, reply handling, and meeting capture.</p></div></div>
        </div>
        <p style={{ marginTop: '1.5rem' }}>
          <Link href="/how-it-works" className="m-btn m-btn-ghost">Full walkthrough</Link>
        </p>
      </section>

      {/* 8 Compliance */}
      <section className="m-section m-band" style={{ maxWidth: '100%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <h2>Compliance is a product feature</h2>
          <p className="lead">Secondary sending domains, footer requirements, suppression, and jurisdiction-aware rules.</p>
          <div className="m-grid">
            <div className="m-card"><h3>CAN-SPAM</h3><p>Physical address, clear identity, and unsubscribe handling for US sends.</p></div>
            <div className="m-card"><h3>PECR / UK</h3><p>Ltd and LLP focus for corporate recipients where appropriate.</p></div>
            <div className="m-card"><h3>Australian Spam Act</h3><p>Consent and identification requirements reflected in send paths.</p></div>
          </div>
        </div>
      </section>

      {/* 9 Pricing teaser */}
      <section className="m-section">
        <h2>Simple plans. Provisioned by sales.</h2>
        <p className="lead">No public self-serve signup. Every workspace is created after a sales conversation.</p>
        <div className="m-price-grid">
          <div className="m-price">
            <h3>Starter</h3>
            <div className="amount">$100 <small>/ month</small></div>
            <ul>
              <li>One workspace</li>
              <li>Core registry adapters</li>
              <li>Ledger and CSV import</li>
              <li>Simulation mode</li>
            </ul>
            <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-ghost">Contact Sales</a>
          </div>
          <div className="m-price featured">
            <h3>Growth</h3>
            <div className="amount">$300 <small>/ month</small></div>
            <ul>
              <li>Higher run limits</li>
              <li>Enrichment and audit hooks</li>
              <li>Operator seats</li>
              <li>Priority onboarding</li>
            </ul>
            <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-primary">Contact Sales</a>
          </div>
          <div className="m-price">
            <h3>Enterprise</h3>
            <div className="amount">Custom</div>
            <ul>
              <li>Multiple workspaces</li>
              <li>Custom source configs</li>
              <li>Security review support</li>
              <li>Dedicated success contact</li>
            </ul>
            <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-ghost">Contact Sales</a>
          </div>
        </div>
        <p style={{ marginTop: '1rem' }}>
          <Link href="/pricing">See full deliverables</Link>
        </p>
      </section>

      {/* 10 Quote */}
      <section className="m-section">
        <blockquote className="m-quote">
          "We needed a system that refuses to email anyone already in our history, and that starts from real registry data, not another scraped list."
          <cite>Agency operators evaluating LeadPilot</cite>
        </blockquote>
      </section>

      {/* 11 Final CTA */}
      <section className="m-section" style={{ textAlign: 'center' }}>
        <h2>Talk to sales</h2>
        <p className="lead" style={{ margin: '0 auto 1.5rem' }}>
          Call {SALES_PHONE} or send a message. We provision workspaces after we confirm fit.
        </p>
        <div className="m-hero-cta">
          <a href={`tel:${SALES_PHONE}`} className="m-btn m-btn-primary">Call {SALES_PHONE}</a>
          <Link href="/contact" className="m-btn m-btn-ghost">Contact form</Link>
        </div>
      </section>
    </>
  );
}
