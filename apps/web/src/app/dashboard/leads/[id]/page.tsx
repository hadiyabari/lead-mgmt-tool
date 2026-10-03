import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { LeadDetailClient } from './LeadDetailClient';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const { id } = await params;

  return (
    <AppShell
      title="Lead"
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role}
    >
      <LeadDetailClient id={id} />
    </AppShell>
  );
}
