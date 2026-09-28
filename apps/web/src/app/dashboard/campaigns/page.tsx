import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell title="Campaigns" userEmail={session.user.email} userRole={session.user.role}>
      <div className="card">
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Campaign and review queue UI arrives in Phase 18.
        </p>
      </div>
    </AppShell>
  );
}
