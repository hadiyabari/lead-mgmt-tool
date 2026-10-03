import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma, ledgerIsContacted } from '@leadpilot/db';
import { generateEmail } from '@leadpilot/email-gen';
import { canStartRuns } from '@/lib/rbac';
import type { Role, Prisma } from '@leadpilot/db';

const bodySchema = z
  .object({
    campaignId: z.string().optional(),
    playbookId: z.string().optional(),
    simulation: z.boolean().optional(),
    toEmail: z.string().email().optional(),
    toName: z.string().max(120).optional(),
  })
  .optional();

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
  const lead = await prisma.lead.findFirst({
    where: { id, workspaceId: session.user.workspaceId, deletedAt: null },
    include: {
      auditResults: { orderBy: { auditedAt: 'desc' }, take: 1 },
      enrichments: { orderBy: { enrichedAt: 'desc' }, take: 5 },
      scores: { orderBy: { scoredAt: 'desc' }, take: 1 },
    },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  let body: z.infer<typeof bodySchema> = {};
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (parsed.success) body = parsed.data || {};
  } catch {
    /* empty ok */
  }

  const toEmail = body?.toEmail || lead.primaryEmail;
  if (!toEmail) {
    return NextResponse.json(
      { error: 'Lead has no primary email; resolve email first' },
      { status: 400 }
    );
  }

  // Never-contacted gate before writing
  const already = await ledgerIsContacted(session.user.workspaceId, {
    email: toEmail,
    phone: lead.primaryPhone,
    domain: lead.domain,
  });
  if (already) {
    return NextResponse.json(
      { error: 'Lead matches contact-history ledger; draft blocked' },
      { status: 409 }
    );
  }

  let offerName: string | null = null;
  let offerSummary: string | null = null;
  if (body?.playbookId) {
    const pb = await prisma.playbook.findFirst({
      where: {
        id: body.playbookId,
        workspaceId: session.user.workspaceId,
        deletedAt: null,
      },
    });
    offerName = pb?.offerName ?? null;
    offerSummary = pb?.offerSummary ?? null;
  } else {
    const pb = await prisma.playbook.findFirst({
      where: { workspaceId: session.user.workspaceId, isActive: true, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
    offerName = pb?.offerName ?? null;
    offerSummary = pb?.offerSummary ?? null;
  }

  const audit = lead.auditResults[0];
  const findings = Array.isArray(audit?.findings)
    ? (audit.findings as Array<{
        title?: string;
        severity?: string;
        category?: string;
        description?: string;
      }>).map((f) => ({
        title: f.title || 'Finding',
        severity: f.severity,
        category: f.category,
        description: f.description,
      }))
    : [];

  const rating = lead.enrichments.find((e) => e.rating != null)?.rating;
  const reviewCount = lead.enrichments.find((e) => e.reviewCount != null)?.reviewCount;

  const simulation =
    body?.simulation ??
    process.env.SIMULATION_MODE !== 'false';

  const generated = await generateEmail({
    companyName: lead.companyName,
    toName: body?.toName,
    website: lead.website,
    domain: lead.domain,
    city: lead.city,
    region: lead.region,
    country: lead.country,
    vertical: lead.vertical,
    auditScore: audit?.score ?? null,
    findings,
    rating: rating ?? null,
    reviewCount: reviewCount ?? null,
    offerName,
    offerSummary,
    senderName: session.user.name || null,
    agencyName: workspace.name,
    legalAddress: workspace.legalAddress,
    simulation,
  });

  const outbox = await prisma.emailOutbox.create({
    data: {
      workspaceId: session.user.workspaceId,
      leadId: lead.id,
      campaignId: body?.campaignId || null,
      toEmail,
      toName: body?.toName || null,
      subject: generated.subject,
      bodyHtml: generated.bodyHtml,
      bodyText: generated.bodyText,
      factsUsed: generated.factsUsed as unknown as Prisma.InputJsonValue,
      status: 'DRAFT',
      isSimulation: generated.simulated,
    },
  });

  return NextResponse.json({
    outbox,
    generated: {
      subject: generated.subject,
      simulated: generated.simulated,
      model: generated.model,
      factCount: generated.factsUsed.length,
    },
  });
}
