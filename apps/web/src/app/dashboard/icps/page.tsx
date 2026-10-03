import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { IcpsClient } from './IcpsClient';

export default async function IcpsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="ICPs"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <IcpsClient />
    </AppShell>
  );
}
