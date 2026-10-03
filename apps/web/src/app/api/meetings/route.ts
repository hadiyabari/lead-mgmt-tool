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
  const status = url.searchParams.get('status');
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

  const items = await prisma.meeting.findMany({
    where: {
      lead: { workspaceId: session.user.workspaceId },
      ...(status ? { status: status as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' } : {}),
    },
    orderBy: { startsAt: 'asc' },
    take: limit,
    include: {
      lead: {
        select: { id: true, companyName: true, primaryEmail: true, status: true },
      },
    },
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().max(200).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  meetingUrl: z.string().url().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
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

  const lead = await prisma.lead.findFirst({
    where: {
      id: parsed.data.leadId,
      workspaceId: session.user.workspaceId,
      deletedAt: null,
    },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = parsed.data.endsAt
    ? new Date(parsed.data.endsAt)
    : new Date(startsAt.getTime() + 30 * 60 * 1000);

  const meeting = await prisma.meeting.create({
    data: {
      leadId: lead.id,
      title: parsed.data.title || `Meeting · ${lead.companyName}`,
      startsAt,
      endsAt,
      meetingUrl: parsed.data.meetingUrl ?? null,
      notes: parsed.data.notes ?? null,
      status: 'SCHEDULED',
    },
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: 'MEETING_BOOKED' },
  });

  return NextResponse.json({ item: meeting }, { status: 201 });
}
