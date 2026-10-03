import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { OutboxStatus, Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status') as OutboxStatus | null;
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

  const where: {
    workspaceId: string;
    status?: OutboxStatus;
  } = { workspaceId: session.user.workspaceId };
  if (status) where.status = status;

  const items = await prisma.emailOutbox.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      lead: {
        select: {
          id: true,
          companyName: true,
          domain: true,
          primaryEmail: true,
        },
      },
    },
  });

  const counts = await prisma.emailOutbox.groupBy({
    by: ['status'],
    where: { workspaceId: session.user.workspaceId },
    _count: { status: true },
  });

  return NextResponse.json({
    items,
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count.status])),
  });
}
