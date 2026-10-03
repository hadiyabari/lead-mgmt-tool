import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await prisma.playbook.findMany({
    where: { workspaceId: session.user.workspaceId, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional().nullable(),
  offerName: z.string().max(200).optional().nullable(),
  offerSummary: z.string().max(4000).optional().nullable(),
  icpId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
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

  const item = await prisma.playbook.create({
    data: {
      workspaceId: session.user.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      offerName: parsed.data.offerName ?? null,
      offerSummary: parsed.data.offerSummary ?? null,
      icpId: parsed.data.icpId ?? null,
      isActive: parsed.data.isActive ?? true,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
