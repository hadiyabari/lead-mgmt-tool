import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { SourcesClient } from './SourcesClient';

export default async function SourcesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell title="Sources" userEmail={session.user.email} userRole={session.user.role}>
      <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Official registry adapters. Enable sources, then run a simulated discover. Live calls need
        API keys in env (Companies House, ABN GUID).
      </p>
      <SourcesClient />
    </AppShell>
  );
}
