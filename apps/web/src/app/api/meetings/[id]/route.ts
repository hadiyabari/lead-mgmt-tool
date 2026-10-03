import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

const patchSchema = z.object({
  title: z.string().max(200).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional().nullable(),
  meetingUrl: z.string().url().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
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
  const existing = await prisma.meeting.findFirst({
    where: { id, lead: { workspaceId: session.user.workspaceId } },
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

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startsAt) data.startsAt = new Date(parsed.data.startsAt);
  if (parsed.data.endsAt) data.endsAt = new Date(parsed.data.endsAt);
  if (parsed.data.endsAt === null) data.endsAt = null;

  const updated = await prisma.meeting.update({ where: { id }, data });

  if (parsed.data.status === 'COMPLETED') {
    await prisma.lead.update({
      where: { id: existing.leadId },
      data: { status: 'WON' },
    });
  } else if (parsed.data.status === 'CANCELLED' || parsed.data.status === 'NO_SHOW') {
    await prisma.lead.update({
      where: { id: existing.leadId },
      data: { status: 'LOST' },
    });
  }

  return NextResponse.json({ item: updated });
}
