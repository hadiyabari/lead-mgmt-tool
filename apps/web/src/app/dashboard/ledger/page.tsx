import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { LedgerClient } from './LedgerClient';

export default async function LedgerPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Contact ledger"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <div style={{ marginBottom: 12 }}>
        <a
          href="/api/ledger/export"
          style={{
            display: 'inline-block',
            background: '#1a2d4a',
            border: '1px solid #2d3a4f',
            borderRadius: 8,
            padding: '6px 10px',
            color: '#e7ecf3',
            textDecoration: 'none',
          }}
        >
          Export CSV
        </a>
      </div>
      <LedgerClient />
    </AppShell>
  );
}
