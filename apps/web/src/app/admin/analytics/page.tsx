import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { isSuperAdmin } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';
import { AdminAnalyticsClient } from './AdminAnalyticsClient';

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!isSuperAdmin((session.user.role || 'VIEWER') as Role)) {
    redirect('/dashboard');
  }

  return (
    <main style={{ padding: '1.5rem', maxWidth: 960, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ marginTop: 0 }}>Site analytics</h1>
      <p style={{ color: '#8b9bb4' }}>SUPER_ADMIN · last 30 days</p>
      <AdminAnalyticsClient />
    </main>
  );
}
