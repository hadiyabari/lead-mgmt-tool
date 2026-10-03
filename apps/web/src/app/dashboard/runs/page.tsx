import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { RunsClient } from './RunsClient';

export default async function RunsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Runs"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <RunsClient />
    </AppShell>
  );
}
