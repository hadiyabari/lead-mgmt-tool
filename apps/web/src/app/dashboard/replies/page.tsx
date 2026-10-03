import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { RepliesClient } from './RepliesClient';

export default async function RepliesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Replies"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <RepliesClient />
    </AppShell>
  );
}
