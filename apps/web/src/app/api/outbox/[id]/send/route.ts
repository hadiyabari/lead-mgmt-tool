import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma, fourPointCheck, ledgerInsert } from '@leadpilot/db';
import { sendEmail } from '@leadpilot/email-send';
import type { Role } from '@leadpilot/db';
import { canApproveSends } from '@/lib/rbac';

/**
 * Phase 15 send path.
 * APPROVED → SENDING → SENT | FAILED | SIMULATED
 * Four-point check immediately before send. Ledger insert on success.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canApproveSends((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: session.user.workspaceId, deletedAt: null },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }
  if (workspace.killSwitch) {
    return NextResponse.json({ error: 'Kill switch is active' }, { status: 423 });
  }

  const { id } = await ctx.params;

  // Row lock pattern: claim only if still APPROVED
  const claimed = await prisma.emailOutbox.updateMany({
    where: {
      id,
      workspaceId: session.user.workspaceId,
      status: 'APPROVED',
      lockedAt: null,
    },
    data: {
      status: 'SENDING',
      lockedAt: new Date(),
      lockedBy: session.user.id,
      attemptCount: { increment: 1 },
    },
  });

  if (claimed.count === 0) {
    const existing = await prisma.emailOutbox.findFirst({
      where: { id, workspaceId: session.user.workspaceId },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(
      { error: 'Item not available for send', status: existing.status },
      { status: 409 }
    );
  }

  const item = await prisma.emailOutbox.findFirst({
    where: { id },
    include: { lead: true },
  });
  if (!item) {
    return NextResponse.json({ error: 'Not found after claim' }, { status: 404 });
  }

  const gate = await fourPointCheck(session.user.workspaceId, {
    email: item.toEmail,
    phone: item.lead.primaryPhone,
    domain: item.lead.domain,
    website: item.lead.website,
    checkSuppression: true,
  });

  if (!gate.allowed) {
    const failed = await prisma.emailOutbox.update({
      where: { id },
      data: {
        status: 'FAILED',
        lastError: `Blocked by compliance gate: ${gate.reason}`,
        lockedAt: null,
        lockedBy: null,
      },
    });
    return NextResponse.json({ error: 'Compliance gate blocked send', reason: gate.reason, item: failed }, { status: 409 });
  }

  const simulation =
    item.isSimulation || process.env.SIMULATION_MODE !== 'false';

  const result = await sendEmail({
    toEmail: item.toEmail,
    toName: item.toName,
    subject: item.subject,
    bodyHtml: item.bodyHtml,
    bodyText: item.bodyText,
    simulation,
  });

  if (!result.ok) {
    const failed = await prisma.emailOutbox.update({
      where: { id },
      data: {
        status: 'FAILED',
        lastError: result.error || 'Send failed',
        lockedAt: null,
        lockedBy: null,
      },
    });
    return NextResponse.json({ error: result.error || 'Send failed', item: failed }, { status: 502 });
  }

  const finalStatus = result.simulated ? 'SIMULATED' : 'SENT';

  const [outbox, sent] = await prisma.$transaction([
    prisma.emailOutbox.update({
      where: { id },
      data: {
        status: finalStatus,
        lockedAt: null,
        lockedBy: null,
        lastError: null,
        isSimulation: result.simulated,
      },
    }),
    prisma.emailSent.create({
      data: {
        leadId: item.leadId,
        campaignId: item.campaignId,
        outboxId: item.id,
        toEmail: item.toEmail,
        subject: item.subject,
        bodyHtml: item.bodyHtml,
        providerMessageId: result.messageId,
        isSimulation: result.simulated,
      },
    }),
    prisma.lead.update({
      where: { id: item.leadId },
      data: { status: 'CONTACTED' },
    }),
  ]);

  await ledgerInsert(session.user.workspaceId, {
    email: item.toEmail,
    phone: item.lead.primaryPhone,
    domain: item.lead.domain,
    website: item.lead.website,
    origin: 'OUTBOUND_SEND',
    channel: 'EMAIL',
    sourceOfTruth: result.simulated ? 'simulation-send' : 'outbound-send',
    notes: `outbox:${item.id}`,
  });

  return NextResponse.json({
    item: outbox,
    sent,
    provider: result.provider,
    simulated: result.simulated,
    messageId: result.messageId,
  });
}
