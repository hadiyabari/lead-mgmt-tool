import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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

  const [
    workspace,
    leadCount,
    qualifiedCount,
    outboxDrafts,
    sentCount,
    replyCount,
    meetingCount,
    runCount,
  ] = await Promise.all([
    prisma.workspace.findFirst({
      where: { id: workspaceId, deletedAt: null },
      select: { killSwitch: true, name: true, legalAddress: true },
    }),
    prisma.lead.count({ where: { workspaceId, deletedAt: null } }),
    prisma.lead.count({ where: { workspaceId, deletedAt: null, status: 'QUALIFIED' } }),
    prisma.emailOutbox.count({
      where: { workspaceId, status: { in: ['DRAFT', 'PENDING_REVIEW', 'APPROVED'] } },
    }),
    prisma.emailSent.count({ where: { lead: { workspaceId } } }),
    prisma.reply.count({ where: { lead: { workspaceId } } }),
    prisma.meeting.count({ where: { lead: { workspaceId }, status: 'SCHEDULED' } }),
    prisma.run.count({ where: { workspaceId } }),
  ]);

  const killActive = Boolean(workspace?.killSwitch) || process.env.KILL_SWITCH === 'true';
  const simulation = process.env.SIMULATION_MODE !== 'false';

  return (
    <AppShell title="Dashboard" userEmail={session.user.email} userRole={role}>
      <KillSwitch initialActive={killActive} canToggle={canToggleKillSwitch(role)} />

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Leads</div>
          <div className="card-value">{leadCount}</div>
        </div>
        <div className="card">
          <div className="card-label">Qualified</div>
          <div className="card-value">{qualifiedCount}</div>
        </div>
        <div className="card">
          <div className="card-label">Outbox queue</div>
          <div className="card-value">{outboxDrafts}</div>
        </div>
        <div className="card">
          <div className="card-label">Sent</div>
          <div className="card-value">{sentCount}</div>
        </div>
        <div className="card">
          <div className="card-label">Replies</div>
          <div className="card-value">{replyCount}</div>
        </div>
        <div className="card">
          <div className="card-label">Meetings</div>
          <div className="card-value">{meetingCount}</div>
        </div>
        <div className="card">
          <div className="card-label">Runs</div>
          <div className="card-value">{runCount}</div>
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

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-label">Workspace</div>
        <p style={{ margin: '0.35rem 0 0' }}>{workspace?.name ?? '—'}</p>
        {workspace?.legalAddress && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
            {workspace.legalAddress}
          </p>
        )}
        <p style={{ marginTop: 12 }}>
          <Link href="/dashboard/runs">Start a simulation run</Link>
          {' · '}
          <Link href="/dashboard/outbox">Review outbox</Link>
          {' · '}
          <Link href="/dashboard/leads">View leads</Link>
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
