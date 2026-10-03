import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { SourcesClient } from './SourcesClient';

export default async function SourcesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Sources"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <SourcesClient />
    </AppShell>
  );
}
