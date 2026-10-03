import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canManageUsers, isSuperAdmin } from '@/lib/rbac';

function csvEscape(v: string | null | undefined): string {
  const s = v ?? '';
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const role = (session.user.role || 'VIEWER') as Role;
  if (!canManageUsers(role) && !isSuperAdmin(role)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get('days') || 30), 1), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.siteEvent.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take: 10000,
  });

  const header = [
    'id',
    'name',
    'path',
    'referrer',
    'utmSource',
    'utmMedium',
    'utmCampaign',
    'sessionId',
    'createdAt',
  ];
  const lines = [header.join(',')];
  for (const e of events) {
    lines.push(
      [
        csvEscape(e.id),
        csvEscape(e.name),
        csvEscape(e.path),
        csvEscape(e.referrer),
        csvEscape(e.utmSource),
        csvEscape(e.utmMedium),
        csvEscape(e.utmCampaign),
        csvEscape(e.sessionId),
        csvEscape(e.createdAt.toISOString()),
      ].join(',')
    );
  }

  return new Response(lines.join('\r\n') + '\r\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="site-analytics-${days}d.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
