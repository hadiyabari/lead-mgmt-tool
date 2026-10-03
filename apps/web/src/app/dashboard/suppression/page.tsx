import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { SuppressionClient } from './SuppressionClient';

export default async function SuppressionPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppShell
      title="Suppression"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <SuppressionClient />
    </AppShell>
  );
}
