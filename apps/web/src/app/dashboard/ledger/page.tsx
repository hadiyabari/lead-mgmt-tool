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
      userRole={session.user.role}
    >
      <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Single source of truth for already-contacted people. Imports are deduplicated by normalized
        email and phone.
      </p>
      <LedgerClient />
    </AppShell>
  );
}
