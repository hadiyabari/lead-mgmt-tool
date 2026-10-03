import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { canManageUsers, isSuperAdmin } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';
import { ContactSalesClient } from './ContactSalesClient';

export default async function ContactSalesInboxPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const role = (session.user.role || 'VIEWER') as Role;
  if (!canManageUsers(role) && !isSuperAdmin(role)) redirect('/dashboard');

  return (
    <AppShell title="Contact sales" userEmail={session.user.email} userRole={role}>
      <ContactSalesClient />
    </AppShell>
  );
}
