import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';

export default async function RunsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell title="Runs" userEmail={session.user.email} userRole={session.user.role}>
      <div className="card">
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Goal-based runs UI arrives in Phase 12.
        </p>
      </div>
    </AppShell>
  );
}
