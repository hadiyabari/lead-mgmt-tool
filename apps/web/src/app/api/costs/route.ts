import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

  const items = await prisma.costLedger.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const totals = await prisma.costLedger.groupBy({
    by: ['category'],
    where: { workspaceId: session.user.workspaceId },
    _sum: { totalCost: true, units: true },
  });

  return NextResponse.json({
    items,
    totals: totals.map((t) => ({
      category: t.category,
      units: t._sum.units || 0,
      totalCost: t._sum.totalCost || 0,
    })),
  });
}

const createSchema = z.object({
  category: z.enum(['EMAIL_FINDER', 'ENRICHMENT', 'LLM', 'AUDIT', 'OTHER']),
  provider: z.string().max(80).optional(),
  units: z.number().positive().optional(),
  unitCost: z.number().optional(),
  totalCost: z.number().optional(),
  runId: z.string().optional().nullable(),
  meta: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const units = parsed.data.units ?? 1;
  const unitCost = parsed.data.unitCost ?? 0;
  const totalCost = parsed.data.totalCost ?? units * unitCost;

  const item = await prisma.costLedger.create({
    data: {
      workspaceId: session.user.workspaceId,
      category: parsed.data.category,
      provider: parsed.data.provider,
      units,
      unitCost,
      totalCost,
      runId: parsed.data.runId || null,
      meta: parsed.data.meta as object | undefined,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
