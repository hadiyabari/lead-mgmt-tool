import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@leadpilot/db';
import { AppShell } from '@/components/AppShell';
import { KillSwitch } from '@/components/KillSwitch';
import { canToggleKillSwitch, canManageUsers } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';
import { PasswordForm } from './PasswordForm';
import { WorkspaceForm } from './WorkspaceForm';
import { MfaForm } from './MfaForm';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.workspaceId) redirect('/login');

  const role = (session.user.role || 'VIEWER') as Role;
  const workspace = await prisma.workspace.findFirst({
    where: { id: session.user.workspaceId, deletedAt: null },
  });

  const killActive = Boolean(workspace?.killSwitch) || process.env.KILL_SWITCH === 'true';
  const simulation = process.env.SIMULATION_MODE !== 'false';

  return (
    <AppShell title="Settings" userEmail={session.user.email} userRole={role}>
      <WorkspaceForm canEdit={canManageUsers(role)} />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-label">Runtime flags</div>
        <p style={{ marginTop: 8 }}>Simulation mode: {simulation ? 'ON' : 'OFF'}</p>
        <p>Anthropic key: {process.env.ANTHROPIC_API_KEY ? 'configured' : 'not set'}</p>
        <p>Postmark token: {process.env.POSTMARK_API_TOKEN ? 'configured' : 'not set'}</p>
        <p>Inbound secret: {process.env.INBOUND_WEBHOOK_SECRET ? 'configured' : 'not set'}</p>
      </div>

      <KillSwitch initialActive={killActive} canToggle={canToggleKillSwitch(role)} />

      <div className="card" style={{ marginTop: 16, marginBottom: 16 }}>
        <div className="card-label">Your account</div>
        <p style={{ marginTop: 8 }}>{session.user.email}</p>
        <p style={{ color: 'var(--text-muted)' }}>Role: {role}</p>
      </div>

      <PasswordForm />
      <MfaForm />
    </AppShell>
  );
}
