import { SALES_PHONE } from '@/components/marketing/SiteChrome';
import { ContactForm } from './ContactForm';

export default function ContactPage() {
  return (
    <>
      <section className="m-hero" style={{ paddingBottom: '1.5rem' }}>
        <p className="m-pill">Contact Sales</p>
        <h1>Speak with the LeadPilot team</h1>
        <p>
          Workspaces are opened after a short fit call. Tell us about your agency, verticals, and
          target countries.
        </p>
      </section>

      <section className="m-section" style={{ paddingTop: 0 }}>
        <div className="m-contact-grid">
          <div className="m-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Direct line</h2>
            <p style={{ color: 'var(--m-muted)', marginBottom: '1.25rem' }}>
              Prefer a call? Reach sales on the number below.
            </p>
            <a
              href={`tel:${SALES_PHONE}`}
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--m-accent)',
                textDecoration: 'none',
                letterSpacing: '0.02em',
              }}
            >
              {SALES_PHONE}
            </a>
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>What to prepare</h3>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--m-muted)', lineHeight: 1.6 }}>
                <li>Agency name and primary domain</li>
                <li>Verticals: dental, home services, aesthetic, or mix</li>
                <li>Countries: US, UK, Australia</li>
                <li>Whether an audit tool API is already available</li>
                <li>Approximate monthly outreach volume</li>
              </ul>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Hours</h3>
              <p style={{ margin: 0, color: 'var(--m-muted)' }}>
                Sales responds on business days. Urgent provisioning requests should be stated in the
                message subject line.
              </p>
            </div>
          </div>

          <div className="m-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Message sales</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
