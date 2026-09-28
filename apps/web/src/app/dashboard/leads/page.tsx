import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell title="Leads" userEmail={session.user.email} userRole={session.user.role}>
      <div className="card">
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Lead list UI arrives with source adapters and scoring (Phases 9–14).
        </p>
      </div>
    </AppShell>
  );
}
