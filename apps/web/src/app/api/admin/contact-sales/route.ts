import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canManageUsers, isSuperAdmin } from '@/lib/rbac';

/** List contact_sales SiteEvent submissions. */
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
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

  const items = await prisma.siteEvent.findMany({
    where: { name: 'contact_sales' },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({
    items: items.map((e) => ({
      id: e.id,
      createdAt: e.createdAt,
      meta: e.meta,
    })),
  });
}
