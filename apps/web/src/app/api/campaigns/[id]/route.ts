import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

const patchSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  isSimulation: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const item = await prisma.campaign.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
    include: {
      outbox: { take: 20, orderBy: { updatedAt: 'desc' } },
      sent: { take: 20, orderBy: { sentAt: 'desc' } },
      playbook: true,
    },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.campaign.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  if (parsed.data.status === 'ACTIVE') {
    const ws = await prisma.workspace.findFirst({
      where: { id: session.user.workspaceId },
    });
    if (ws?.killSwitch) {
      return NextResponse.json({ error: 'Kill switch is active' }, { status: 423 });
    }
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ item: updated });
}
