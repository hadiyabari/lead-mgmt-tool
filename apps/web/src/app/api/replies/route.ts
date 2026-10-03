import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { ReplyClassification, Role } from '@leadpilot/db';
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
  const classification = url.searchParams.get('classification') as ReplyClassification | null;
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

  const items = await prisma.reply.findMany({
    where: {
      lead: { workspaceId: session.user.workspaceId },
      ...(classification ? { classification } : {}),
    },
    orderBy: { receivedAt: 'desc' },
    take: limit,
    include: {
      lead: {
        select: { id: true, companyName: true, primaryEmail: true, status: true },
      },
    },
  });

  const counts = await prisma.reply.groupBy({
    by: ['classification'],
    where: { lead: { workspaceId: session.user.workspaceId } },
    _count: { classification: true },
  });

  return NextResponse.json({
    items,
    counts: Object.fromEntries(counts.map((c) => [c.classification, c._count.classification])),
  });
}
