import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { CostsClient } from './CostsClient';

export default async function CostsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Costs"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <CostsClient />
    </AppShell>
  );
}
