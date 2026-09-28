import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@leadpilot/db';
import { AppShell } from '@/components/AppShell';
import { KillSwitch } from '@/components/KillSwitch';
import { canToggleKillSwitch } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.workspaceId) redirect('/login');

  const role = (session.user.role || 'VIEWER') as Role;
  const workspace = await prisma.workspace.findFirst({
    where: { id: session.user.workspaceId, deletedAt: null },
    select: { killSwitch: true, name: true, primaryDomain: true, legalAddress: true },
  });

  const killActive = Boolean(workspace?.killSwitch) || process.env.KILL_SWITCH === 'true';

  return (
    <AppShell title="Settings" userEmail={session.user.email} userRole={role}>
      <KillSwitch initialActive={killActive} canToggle={canToggleKillSwitch(role)} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-label">Workspace</div>
        <p style={{ margin: '0.25rem 0' }}>
          <strong>{workspace?.name}</strong>
        </p>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Domain: {workspace?.primaryDomain ?? '—'} · MFA:{' '}
          {session.user.mfaEnabled ? 'enabled' : 'not enabled'}
        </p>
        {workspace?.legalAddress && (
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Legal footer: {workspace.legalAddress}
          </p>
        )}
      </div>

      <div className="card">
        <div className="card-label">Security</div>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          MFA enrollment UI can call <code>/api/auth/mfa/setup</code> and{' '}
          <code>/api/auth/mfa/confirm</code> (Phase 4 APIs).
        </p>
      </div>
    </AppShell>
  );
}
