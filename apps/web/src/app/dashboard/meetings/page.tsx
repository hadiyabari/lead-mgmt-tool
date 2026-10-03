import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { MeetingsClient } from './MeetingsClient';

export default async function MeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Meetings"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <MeetingsClient />
    </AppShell>
  );
}
