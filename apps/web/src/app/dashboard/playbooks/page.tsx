import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PlaybooksClient } from './PlaybooksClient';

export default async function PlaybooksPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Playbooks"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <PlaybooksClient />
    </AppShell>
  );
}
