import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role, Prisma } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

const patchSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  isActive: z.boolean().optional(),
  steps: z
    .array(
      z.object({
        dayOffset: z.number().int().min(0).max(365),
        subject: z.string().max(200).optional(),
        bodyHint: z.string().max(2000).optional(),
      })
    )
    .min(1)
    .max(20)
    .optional(),
});

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
  const existing = await prisma.sequence.findFirst({
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

  const data: Prisma.SequenceUpdateInput = {};
  if (parsed.data.name != null) data.name = parsed.data.name;
  if (parsed.data.isActive != null) data.isActive = parsed.data.isActive;
  if (parsed.data.steps != null) {
    data.steps = parsed.data.steps as unknown as Prisma.InputJsonValue;
  }

  const item = await prisma.sequence.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(
  _req: Request,
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
  const existing = await prisma.sequence.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.sequence.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
