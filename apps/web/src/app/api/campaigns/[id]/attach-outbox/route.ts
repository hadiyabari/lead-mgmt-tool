import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

const bodySchema = z.object({
  outboxIds: z.array(z.string()).min(1).max(100),
});

/** Attach existing outbox drafts to a campaign. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const result = await prisma.emailOutbox.updateMany({
    where: {
      id: { in: parsed.data.outboxIds },
      workspaceId: session.user.workspaceId,
      status: { in: ['DRAFT', 'PENDING_REVIEW', 'APPROVED'] },
    },
    data: { campaignId: campaign.id },
  });

  return NextResponse.json({ attached: result.count });
}
