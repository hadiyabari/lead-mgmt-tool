import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canApproveSends } from '@/lib/rbac';

/** PENDING_REVIEW → APPROVED (or DRAFT → APPROVED for operator shortcut). */
export async function POST(
  _req: Request,
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
    return NextResponse.json({ error: 'Cannot approve from this status' }, { status: 400 });
  }

  const updated = await prisma.emailOutbox.update({
    where: { id },
    data: { status: 'APPROVED' },
  });
  return NextResponse.json({ item: updated });
}
