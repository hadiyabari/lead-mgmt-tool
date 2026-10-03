import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma, fourPointCheck, ledgerInsert } from '@leadpilot/db';
import { sendEmail } from '@leadpilot/email-send';
import type { Role } from '@leadpilot/db';
import { canApproveSends } from '@/lib/rbac';

const bodySchema = z.object({
  action: z.enum(['submit', 'approve', 'reject', 'send']),
  ids: z.array(z.string()).min(1).max(50),
  reason: z.string().max(500).optional(),
});

/**
 * Phase 27 – bulk outbox transitions.
 * send: processes each APPROVED id with the same gates as single send.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canApproveSends((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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

  const { action, ids, reason } = parsed.data;
  const workspaceId = session.user.workspaceId;

  if (action === 'submit') {
    const r = await prisma.emailOutbox.updateMany({
      where: { id: { in: ids }, workspaceId, status: 'DRAFT' },
      data: { status: 'PENDING_REVIEW' },
    });
    return NextResponse.json({ action, updated: r.count });
  }

  if (action === 'approve') {
    const r = await prisma.emailOutbox.updateMany({
      where: {
        id: { in: ids },
        workspaceId,
        status: { in: ['DRAFT', 'PENDING_REVIEW'] },
      },
      data: { status: 'APPROVED' },
    });
    return NextResponse.json({ action, updated: r.count });
  }

  if (action === 'reject') {
    const r = await prisma.emailOutbox.updateMany({
      where: {
        id: { in: ids },
        workspaceId,
        status: { in: ['DRAFT', 'PENDING_REVIEW'] },
      },
      data: { status: 'CANCELLED', lastError: reason || 'Bulk rejected' },
    });
    return NextResponse.json({ action, updated: r.count });
  }

  // send
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, deletedAt: null },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }
  if (workspace.killSwitch || process.env.KILL_SWITCH === 'true') {
    return NextResponse.json({ error: 'Kill switch is active' }, { status: 423 });
  }

  const results: { id: string; ok: boolean; status?: string; error?: string }[] = [];

  for (const id of ids) {
    const claimed = await prisma.emailOutbox.updateMany({
      where: {
        id,
        workspaceId,
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
      results.push({ id, ok: false, error: 'not_available' });
      continue;
    }

    const item = await prisma.emailOutbox.findFirst({
      where: { id },
      include: { lead: true },
    });
    if (!item) {
      results.push({ id, ok: false, error: 'missing' });
      continue;
    }

    const gate = await fourPointCheck(workspaceId, {
      email: item.toEmail,
      phone: item.lead.primaryPhone,
      domain: item.lead.domain,
      website: item.lead.website,
      checkSuppression: true,
    });

    if (!gate.allowed) {
      await prisma.emailOutbox.update({
        where: { id },
        data: {
          status: 'FAILED',
          lastError: `Blocked: ${gate.reason}`,
          lockedAt: null,
          lockedBy: null,
        },
      });
      results.push({ id, ok: false, error: gate.reason });
      continue;
    }

    const simulation = item.isSimulation || process.env.SIMULATION_MODE !== 'false';
    const sendResult = await sendEmail({
      toEmail: item.toEmail,
      toName: item.toName,
      subject: item.subject,
      bodyHtml: item.bodyHtml,
      bodyText: item.bodyText,
      simulation,
    });

    if (!sendResult.ok) {
      await prisma.emailOutbox.update({
        where: { id },
        data: {
          status: 'FAILED',
          lastError: sendResult.error || 'Send failed',
          lockedAt: null,
          lockedBy: null,
        },
      });
      results.push({ id, ok: false, error: sendResult.error });
      continue;
    }

    const finalStatus = sendResult.simulated ? 'SIMULATED' : 'SENT';
    await prisma.$transaction([
      prisma.emailOutbox.update({
        where: { id },
        data: {
          status: finalStatus,
          lockedAt: null,
          lockedBy: null,
          lastError: null,
          isSimulation: sendResult.simulated,
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
          providerMessageId: sendResult.messageId,
          isSimulation: sendResult.simulated,
        },
      }),
      prisma.lead.update({
        where: { id: item.leadId },
        data: { status: 'CONTACTED' },
      }),
    ]);

    await ledgerInsert(workspaceId, {
      email: item.toEmail,
      phone: item.lead.primaryPhone,
      domain: item.lead.domain,
      website: item.lead.website,
      origin: 'OUTBOUND_SEND',
      channel: 'EMAIL',
      sourceOfTruth: sendResult.simulated ? 'simulation-bulk-send' : 'outbound-bulk-send',
      notes: `outbox:${item.id}`,
    });

    results.push({ id, ok: true, status: finalStatus });
  }

  return NextResponse.json({
    action: 'send',
    results,
    okCount: results.filter((r) => r.ok).length,
    failCount: results.filter((r) => !r.ok).length,
  });
}
