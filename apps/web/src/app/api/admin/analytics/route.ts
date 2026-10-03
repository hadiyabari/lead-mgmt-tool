import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canManageUsers, isSuperAdmin } from '@/lib/rbac';

/**
 * Marketing site analytics summary (first-party SiteEvent table).
 * OWNER/ADMIN of any workspace or SUPER_ADMIN.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user.role || 'VIEWER') as Role;
  if (!canManageUsers(role) && !isSuperAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get('days') || 30), 1), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [total, byName, byPath, bySource, recent] = await Promise.all([
    prisma.siteEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.siteEvent.groupBy({
      by: ['name'],
      where: { createdAt: { gte: since } },
      _count: { name: true },
      orderBy: { _count: { name: 'desc' } },
      take: 20,
    }),
    prisma.siteEvent.groupBy({
      by: ['path'],
      where: { createdAt: { gte: since }, path: { not: null } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 20,
    }),
    prisma.siteEvent.groupBy({
      by: ['utmSource'],
      where: { createdAt: { gte: since }, utmSource: { not: null } },
      _count: { utmSource: true },
      orderBy: { _count: { utmSource: 'desc' } },
      take: 15,
    }),
    prisma.siteEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: {
        id: true,
        name: true,
        path: true,
        referrer: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        createdAt: true,
      },
    }),
  ]);

  // Unique sessions (approx by sessionId)
  const sessions = await prisma.siteEvent.findMany({
    where: { createdAt: { gte: since }, sessionId: { not: null } },
    distinct: ['sessionId'],
    select: { sessionId: true },
  });

  return NextResponse.json({
    days,
    since: since.toISOString(),
    totalEvents: total,
    uniqueSessions: sessions.length,
    byName: byName.map((r) => ({ name: r.name, count: r._count.name })),
    byPath: byPath.map((r) => ({ path: r.path, count: r._count.path })),
    bySource: bySource.map((r) => ({ source: r.utmSource, count: r._count.utmSource })),
    recent,
  });
}
