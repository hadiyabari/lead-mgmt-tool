import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { isSuperAdmin } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user.role || 'VIEWER') as Role;
  if (!isSuperAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalEvents, pageViews, contactSales, topPaths, recent] = await Promise.all([
    prisma.siteEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.siteEvent.count({ where: { name: 'page_view', createdAt: { gte: since } } }),
    prisma.siteEvent.count({ where: { name: 'contact_sales', createdAt: { gte: since } } }),
    prisma.siteEvent.groupBy({
      by: ['path'],
      where: { name: 'page_view', createdAt: { gte: since }, path: { not: null } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 15,
    }),
    prisma.siteEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const workspaceCount = await prisma.workspace.count({ where: { deletedAt: null } });
  const userCount = await prisma.user.count({ where: { deletedAt: null } });

  return NextResponse.json({
    windowDays: 30,
    totalEvents,
    pageViews,
    contactSales,
    workspaceCount,
    userCount,
    topPaths: topPaths.map((r) => ({ path: r.path, count: r._count.path })),
    recent,
  });
}
