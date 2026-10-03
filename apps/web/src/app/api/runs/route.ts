import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await prisma.run.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().max(160).optional(),
  icpId: z.string().optional().nullable(),
  goalLeadCount: z.number().int().positive().max(500).optional(),
  maxCredits: z.number().int().positive().max(10000).optional(),
  isSimulation: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: session.user.workspaceId, deletedAt: null },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }
  if (workspace.killSwitch || process.env.KILL_SWITCH === 'true') {
    return NextResponse.json({ error: 'Kill switch is active' }, { status: 423 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    json = {};
  }
  const parsed = createSchema.safeParse(json ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const item = await prisma.run.create({
    data: {
      workspaceId: session.user.workspaceId,
      name: parsed.data.name || `Run ${new Date().toISOString().slice(0, 16)}`,
      icpId: parsed.data.icpId || null,
      goalLeadCount: parsed.data.goalLeadCount ?? 10,
      maxCredits: parsed.data.maxCredits ?? Number(process.env.MAX_CREDITS_PER_RUN || 100),
      isSimulation: parsed.data.isSimulation ?? process.env.SIMULATION_MODE !== 'false',
      status: 'PENDING',
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
