import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { OutboxClient } from './OutboxClient';

export default async function OutboxPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Outbox"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <OutboxClient />
    </AppShell>
  );
}
