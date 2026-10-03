import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { canProvisionTenants } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';
import { TenantsClient } from './TenantsClient';

export default async function TenantsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const role = (session.user.role || 'VIEWER') as Role;
  if (!canProvisionTenants(role)) redirect('/dashboard');

  return (
    <AppShell title="Tenants" userEmail={session.user.email} userRole={role}>
      <TenantsClient />
    </AppShell>
  );
}
