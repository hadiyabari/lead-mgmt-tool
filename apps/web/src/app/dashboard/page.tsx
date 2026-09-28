import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 720, margin: '0 auto' }}>
      <h1>Dashboard</h1>
      <p>
        Signed in as <strong>{session.user.email}</strong>
        {session.user.role ? ` · ${session.user.role}` : ''}
      </p>
      <p style={{ color: '#666' }}>Phase 4 auth is live. Shell UI arrives in Phase 5.</p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}
      >
        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Sign out
        </button>
      </form>
    </main>
  );
}
