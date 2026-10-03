import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { LeadStatus, Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role) && session.user.role !== 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status') as LeadStatus | null;
  const q = url.searchParams.get('q')?.trim();
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

  const items = await prisma.lead.findMany({
    where: {
      workspaceId: session.user.workspaceId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { companyName: { contains: q, mode: 'insensitive' } },
              { domain: { contains: q, mode: 'insensitive' } },
              { primaryEmail: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      scores: { orderBy: { scoredAt: 'desc' }, take: 1 },
      auditResults: { orderBy: { auditedAt: 'desc' }, take: 1 },
    },
  });

  const counts = await prisma.lead.groupBy({
    by: ['status'],
    where: { workspaceId: session.user.workspaceId, deletedAt: null },
    _count: { status: true },
  });

  return NextResponse.json({
    items,
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count.status])),
  });
}
