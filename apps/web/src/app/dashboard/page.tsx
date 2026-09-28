import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@leadpilot/db';
import { AppShell } from '@/components/AppShell';
import { KillSwitch } from '@/components/KillSwitch';
import { canToggleKillSwitch } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    redirect('/login');
  }

  const workspaceId = session.user.workspaceId;
  const role = (session.user.role || 'VIEWER') as Role;

  const [workspace, leadCount, runCount, campaignCount] = await Promise.all([
    prisma.workspace.findFirst({
      where: { id: workspaceId, deletedAt: null },
      select: { killSwitch: true, name: true },
    }),
    prisma.lead.count({ where: { workspaceId, deletedAt: null } }),
    prisma.run.count({ where: { workspaceId } }),
    prisma.campaign.count({ where: { workspaceId } }),
  ]);

  const killActive = Boolean(workspace?.killSwitch) || process.env.KILL_SWITCH === 'true';
  const simulation = process.env.SIMULATION_MODE === 'true';

  return (
    <AppShell title="Dashboard" userEmail={session.user.email} userRole={role}>
      <KillSwitch initialActive={killActive} canToggle={canToggleKillSwitch(role)} />

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Leads</div>
          <div className="card-value">{leadCount}</div>
        </div>
        <div className="card">
          <div className="card-label">Runs</div>
          <div className="card-value">{runCount}</div>
        </div>
        <div className="card">
          <div className="card-label">Campaigns</div>
          <div className="card-value">{campaignCount}</div>
        </div>
        <div className="card">
          <div className="card-label">Mode</div>
          <div className="card-value" style={{ fontSize: '1.1rem' }}>
            {simulation ? (
              <span className="badge badge-muted">Simulation</span>
            ) : (
              <span className="badge badge-ok">Live</span>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-label">Workspace</div>
        <p style={{ margin: '0.35rem 0 0' }}>{workspace?.name ?? '—'}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
          Phase 5 shell is live. Pipeline features arrive in later phases.
        </p>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
          style={{ marginTop: '1rem' }}
        >
          <button type="submit" className="btn btn-ghost">
            Sign out
          </button>
        </form>
      </div>
    </AppShell>
  );
}
