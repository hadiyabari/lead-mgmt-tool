import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { LeadsClient } from './LeadsClient';

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Leads"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <LeadsClient />
    </AppShell>
  );
}
