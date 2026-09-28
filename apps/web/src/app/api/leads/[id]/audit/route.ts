import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { runAudit } from '@leadpilot/audit';
import { canStartRuns } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

export async function POST(
  _req: Request,
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
  if (workspace?.killSwitch) {
    return NextResponse.json({ error: 'Kill switch is active' }, { status: 423 });
  }

  const { id } = await ctx.params;
  const lead = await prisma.lead.findFirst({
    where: { id, workspaceId: session.user.workspaceId, deletedAt: null },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const url =
    lead.website ||
    (lead.domain ? `https://${lead.domain}` : null);
  if (!url) {
    return NextResponse.json({ error: 'Lead has no website/domain to audit' }, { status: 400 });
  }

  const simulation = process.env.SIMULATION_MODE !== 'false';
  const audit = await runAudit(url, { simulation });

  const saved = await prisma.auditResult.create({
    data: {
      leadId: lead.id,
      url: audit.url,
      score: audit.score,
      findings: audit.findings as object[],
      rawReport: audit.raw ?? undefined,
    },
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: 'SCORED' },
  });

  return NextResponse.json({ audit: saved, payload: audit });
}
