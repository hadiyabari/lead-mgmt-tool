import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role, Prisma } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await prisma.sequence.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { updatedAt: 'desc' },
    include: { campaign: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ items });
}

const stepSchema = z.object({
  dayOffset: z.number().int().min(0).max(365),
  subject: z.string().max(200).optional(),
  bodyHint: z.string().max(2000).optional(),
});

const createSchema = z.object({
  name: z.string().min(1).max(160),
  campaignId: z.string().optional().nullable(),
  steps: z.array(stepSchema).min(1).max(20),
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

  if (parsed.data.campaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: parsed.data.campaignId, workspaceId: session.user.workspaceId },
    });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
  }

  const item = await prisma.sequence.create({
    data: {
      workspaceId: session.user.workspaceId,
      name: parsed.data.name,
      campaignId: parsed.data.campaignId || null,
      steps: parsed.data.steps as unknown as Prisma.InputJsonValue,
      isActive: parsed.data.isActive ?? true,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
