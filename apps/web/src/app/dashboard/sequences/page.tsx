import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { SequencesClient } from './SequencesClient';

export default async function SequencesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Sequences"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <SequencesClient />
    </AppShell>
  );
}
