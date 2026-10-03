import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma, ledgerInsert } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canApproveSends } from '@/lib/rbac';

const bodySchema = z.object({
  classification: z.enum([
    'INTERESTED',
    'OBJECTION',
    'UNSUBSCRIBE',
    'OUT_OF_OFFICE',
    'BOUNCE',
    'OTHER',
    'UNCLASSIFIED',
  ]),
});

/** Manual override of classification. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canApproveSends((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
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

  const existing = await prisma.reply.findFirst({
    where: { id, lead: { workspaceId: session.user.workspaceId } },
    include: { lead: true },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.reply.update({
    where: { id },
    data: { classification: parsed.data.classification },
  });

  if (parsed.data.classification === 'UNSUBSCRIBE') {
    await prisma.lead.update({
      where: { id: existing.leadId },
      data: { status: 'SUPPRESSED' },
    });
    try {
      await prisma.suppressionList.create({
        data: {
          workspaceId: session.user.workspaceId,
          normalizedEmail: existing.fromEmail.toLowerCase(),
          reason: 'unsubscribe_manual',
          source: 'operator',
        },
      });
    } catch {
      /* unique ok */
    }
    await ledgerInsert(session.user.workspaceId, {
      email: existing.fromEmail,
      origin: 'SUPPRESSION',
      channel: 'EMAIL',
      sourceOfTruth: 'manual-unsubscribe',
    });
  } else if (
    parsed.data.classification === 'INTERESTED' ||
    parsed.data.classification === 'OBJECTION'
  ) {
    await prisma.lead.update({
      where: { id: existing.leadId },
      data: { status: 'REPLIED' },
    });
  }

  return NextResponse.json({ item: updated });
}
