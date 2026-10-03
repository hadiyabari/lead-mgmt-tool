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

  const items = await prisma.campaign.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { outbox: true, sent: true } },
      playbook: { select: { id: true, name: true, offerName: true } },
    },
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().min(1).max(160),
  playbookId: z.string().optional().nullable(),
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

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  if (parsed.data.playbookId) {
    const pb = await prisma.playbook.findFirst({
      where: {
        id: parsed.data.playbookId,
        workspaceId: session.user.workspaceId,
        deletedAt: null,
      },
    });
    if (!pb) return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
  }

  const item = await prisma.campaign.create({
    data: {
      workspaceId: session.user.workspaceId,
      name: parsed.data.name,
      playbookId: parsed.data.playbookId || null,
      isSimulation: parsed.data.isSimulation ?? process.env.SIMULATION_MODE !== 'false',
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
