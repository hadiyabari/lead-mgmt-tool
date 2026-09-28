import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f1419',
        fontFamily: 'system-ui, sans-serif',
        color: '#e7ecf3',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          padding: '2rem',
          background: '#1a2332',
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginTop: 0 }}>Registration closed</h1>
        <p style={{ color: '#8b9bb4', lineHeight: 1.5 }}>
          LeadPilot workspaces are provisioned by sales only. Call 03293318181 or use the contact
          form.
        </p>
        <p>
          <Link href="/contact">Contact Sales</Link>
          {' · '}
          <Link href="/login">Client login</Link>
        </p>
      </div>
    </main>
  );
}
