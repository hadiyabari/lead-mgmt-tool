import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

/** DRAFT → PENDING_REVIEW */
export async function POST(
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
  const item = await prisma.emailOutbox.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (item.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Only DRAFT can be submitted' }, { status: 400 });
  }

  const updated = await prisma.emailOutbox.update({
    where: { id },
    data: { status: 'PENDING_REVIEW' },
  });
  return NextResponse.json({ item: updated });
}
