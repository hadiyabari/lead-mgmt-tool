import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';

export default async function LedgerPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Contact ledger"
      userEmail={session.user.email}
      userRole={session.user.role}
    >
      <div className="card">
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Contact-history ledger UI and imports arrive in Phases 6–7.
        </p>
      </div>
    </AppShell>
  );
}
