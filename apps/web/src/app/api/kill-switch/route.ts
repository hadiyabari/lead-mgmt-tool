import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { canToggleKillSwitch } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

const bodySchema = z.object({
  enabled: z.boolean(),
});

/** GET current kill-switch state for the session workspace. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: session.user.workspaceId, deletedAt: null },
    select: { killSwitch: true, name: true },
  });

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Env override also forces active
  const envKill = process.env.KILL_SWITCH === 'true';

  return NextResponse.json({
    killSwitch: workspace.killSwitch || envKill,
    workspaceFlag: workspace.killSwitch,
    envFlag: envKill,
  });
}

/** POST toggle – OWNER/ADMIN only. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user.role || 'VIEWER') as Role;
  if (!canToggleKillSwitch(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const workspace = await prisma.workspace.update({
    where: { id: session.user.workspaceId },
    data: { killSwitch: parsed.data.enabled },
    select: { killSwitch: true },
  });

  return NextResponse.json({ killSwitch: workspace.killSwitch });
}
