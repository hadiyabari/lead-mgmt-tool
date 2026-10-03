import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { prisma, ledgerInsert } from '@leadpilot/db';
import { normalizeEmail } from '@leadpilot/shared';
import { classifyReply } from '@leadpilot/replies';
import type { Prisma } from '@leadpilot/db';

const bodySchema = z.object({
  fromEmail: z.string().email(),
  subject: z.string().max(500).optional().nullable(),
  bodyText: z.string().max(50000).optional().nullable(),
  /** Optional link to a prior outbound message */
  providerMessageId: z.string().max(200).optional().nullable(),
  toEmail: z.string().email().optional().nullable(),
  workspaceId: z.string().optional(),
  /** Shared secret header alternative: x-leadpilot-inbound-secret */
  raw: z.record(z.unknown()).optional().nullable(),
});

function authorizeInbound(req: Request): boolean {
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    // Dev / simulation: allow if not configured
    return process.env.NODE_ENV !== 'production' || process.env.SIMULATION_MODE === 'true';
  }
  const header = req.headers.get('x-leadpilot-inbound-secret') || '';
  return header === secret;
}

/**
 * Inbound reply webhook (Postmark/generic JSON).
 * Classifies, stores Reply, updates lead, suppresses on UNSUBSCRIBE.
 */
export async function POST(req: Request) {
  if (!authorizeInbound(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Normalize Postmark-style payload if present
  const raw = json as Record<string, unknown>;
  const normalized = {
    fromEmail:
      (raw.fromEmail as string) ||
      (raw.FromFull as { Email?: string } | undefined)?.Email ||
      (typeof raw.From === 'string' ? raw.From : '') ||
      '',
    subject: (raw.subject as string) || (raw.Subject as string) || null,
    bodyText:
      (raw.bodyText as string) ||
      (raw.TextBody as string) ||
      (raw.StrippedTextReply as string) ||
      null,
    providerMessageId:
      (raw.providerMessageId as string) || (raw.OriginalMessageID as string) || null,
    toEmail:
      (raw.toEmail as string) ||
      (raw.ToFull as Array<{ Email?: string }> | undefined)?.[0]?.Email ||
      null,
    workspaceId: raw.workspaceId as string | undefined,
    raw,
  };

  // Extract email from "Name <email@x.com>"
  const angle = normalized.fromEmail.match(/<([^>]+)>/);
  if (angle) normalized.fromEmail = angle[1];

  const parsed = bodySchema.safeParse(normalized);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const fromNorm = normalizeEmail(parsed.data.fromEmail);
  if (!fromNorm) {
    return NextResponse.json({ error: 'Invalid from email' }, { status: 400 });
  }

  // Find matching sent email or lead by workspace
  let emailSent = null as Awaited<ReturnType<typeof prisma.emailSent.findFirst>>;
  if (parsed.data.providerMessageId) {
    emailSent = await prisma.emailSent.findFirst({
      where: { providerMessageId: parsed.data.providerMessageId },
      include: { lead: true },
    });
  }
  if (!emailSent) {
    emailSent = await prisma.emailSent.findFirst({
      where: { toEmail: { equals: fromNorm, mode: 'insensitive' } },
      orderBy: { sentAt: 'desc' },
      include: { lead: true },
    });
  }

  // Fallback: lead by primary email across workspaces if workspaceId given
  let leadId = emailSent?.leadId;
  let workspaceId: string | null = null;

  if (emailSent) {
    const lead = await prisma.lead.findFirst({ where: { id: emailSent.leadId } });
    workspaceId = lead?.workspaceId ?? null;
    leadId = emailSent.leadId;
  }

  if (!leadId && parsed.data.workspaceId) {
    const lead = await prisma.lead.findFirst({
      where: {
        workspaceId: parsed.data.workspaceId,
        primaryEmail: { equals: fromNorm, mode: 'insensitive' },
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (lead) {
      leadId = lead.id;
      workspaceId = lead.workspaceId;
    }
  }

  if (!leadId || !workspaceId) {
    // Orphan inbound: still accept but return 202 without lead link
    return NextResponse.json(
      { ok: true, matched: false, reason: 'no_lead_match' },
      { status: 202 }
    );
  }

  const classification = classifyReply(parsed.data.subject, parsed.data.bodyText);

  const reply = await prisma.reply.create({
    data: {
      leadId,
      emailSentId: emailSent?.id ?? null,
      fromEmail: fromNorm,
      subject: parsed.data.subject ?? null,
      bodyText: parsed.data.bodyText ?? null,
      classification,
      raw: (parsed.data.raw || normalized) as Prisma.InputJsonValue,
    },
  });

  // Lead status updates
  if (classification === 'INTERESTED') {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'REPLIED' },
    });
  } else if (classification === 'OBJECTION') {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'REPLIED' },
    });
  } else if (classification === 'UNSUBSCRIBE') {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'SUPPRESSED' },
    });
    // Suppression list
    try {
      await prisma.suppressionList.create({
        data: {
          workspaceId,
          normalizedEmail: fromNorm,
          reason: 'unsubscribe_reply',
          source: 'inbound',
        },
      });
    } catch {
      // unique violation ok
    }
    await ledgerInsert(workspaceId, {
      email: fromNorm,
      origin: 'SUPPRESSION',
      channel: 'EMAIL',
      sourceOfTruth: 'inbound-unsubscribe',
      notes: `reply:${reply.id}`,
    });
  }

  return NextResponse.json({
    ok: true,
    matched: true,
    replyId: reply.id,
    classification,
    leadId,
  });
}
