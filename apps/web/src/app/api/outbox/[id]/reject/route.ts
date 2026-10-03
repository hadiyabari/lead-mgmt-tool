import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canApproveSends } from '@/lib/rbac';

const bodySchema = z.object({
  reason: z.string().max(500).optional(),
});

/** PENDING_REVIEW → CANCELLED */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canApproveSends((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const item = await prisma.emailOutbox.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (item.status !== 'PENDING_REVIEW' && item.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Cannot reject from this status' }, { status: 400 });
  }

  let reason: string | undefined;
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (parsed.success) reason = parsed.data.reason;
  } catch {
    /* empty */
  }

  const updated = await prisma.emailOutbox.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      lastError: reason || 'Rejected in review',
    },
  });
  return NextResponse.json({ item: updated });
}
