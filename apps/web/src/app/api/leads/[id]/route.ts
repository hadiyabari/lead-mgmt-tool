import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const lead = await prisma.lead.findFirst({
    where: { id, workspaceId: session.user.workspaceId, deletedAt: null },
    include: {
      scores: { orderBy: { scoredAt: 'desc' }, take: 5 },
      auditResults: { orderBy: { auditedAt: 'desc' }, take: 5 },
      enrichments: { orderBy: { createdAt: 'desc' }, take: 10 },
      outbox: { orderBy: { updatedAt: 'desc' }, take: 10 },
      sentEmails: { orderBy: { sentAt: 'desc' }, take: 10 },
      replies: { orderBy: { receivedAt: 'desc' }, take: 10 },
      meetings: { orderBy: { startsAt: 'desc' }, take: 10 },
    },
  });

  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ lead });
}
