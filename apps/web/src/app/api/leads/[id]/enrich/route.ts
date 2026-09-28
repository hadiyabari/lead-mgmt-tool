import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { enrichLead } from '@leadpilot/sources';
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

  const simulation = process.env.SIMULATION_MODE !== 'false';

  const { merged, byProvider } = await enrichLead(
    {
      companyName: lead.companyName,
      website: lead.website,
      domain: lead.domain,
      simulation,
    },
    { simulation }
  );

  // Persist each provider row
  for (const [provider, result] of Object.entries(byProvider)) {
    if (!result) continue;
    await prisma.leadEnrichment.create({
      data: {
        leadId: lead.id,
        provider,
        rating: result.rating ?? null,
        reviewCount: result.reviewCount ?? null,
        website: result.website ?? null,
        phone: result.phone ?? null,
        email: result.email ?? null,
        raw: result.raw ?? undefined,
      },
    });
  }

  // Patch lead with best-known contact fields
  const updated = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      status: 'ENRICHED',
      website: merged.website || lead.website,
      primaryPhone: merged.phone || lead.primaryPhone,
      primaryEmail: merged.email || lead.primaryEmail,
    },
  });

  return NextResponse.json({ lead: updated, merged, byProvider });
}
