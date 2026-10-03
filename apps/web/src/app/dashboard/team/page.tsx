import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { canManageUsers } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';
import { TeamClient } from './TeamClient';

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const role = (session.user.role || 'VIEWER') as Role;
  if (!canManageUsers(role)) redirect('/dashboard');

  return (
    <AppShell title="Team" userEmail={session.user.email} userRole={role}>
      <TeamClient />
    </AppShell>
  );
}
