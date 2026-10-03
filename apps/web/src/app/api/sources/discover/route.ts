import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import {
  getAdapter,
  listPrimaryAdapters,
  type SourceProviderId,
  type DiscoveredLead,
} from '@leadpilot/sources';
import type { Role, Prisma } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';
import { recordCost } from '@/lib/cost';

const bodySchema = z.object({
  provider: z
    .enum([
      'NPI_US',
      'STATE_LICENSE_US',
      'COMPANIES_HOUSE_UK',
      'ABN_ASIC_AU',
      'HEALTH_REGISTER_AU',
      'JOB_BOARD',
      'DUMMY',
      'CUSTOM',
    ])
    .optional(),
  country: z.enum(['US', 'UK', 'AU']).optional(),
  vertical: z.enum(['DENTAL_ORTHO', 'HOME_SERVICES', 'AESTHETIC_MEDSPA', 'OTHER']).optional(),
  region: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  searchTerms: z.array(z.string()).max(10).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  simulation: z.boolean().optional(),
  runId: z.string().optional(),
  persist: z.boolean().optional().default(true),
});

/**
 * Phase 31 – discover leads via official registry adapters.
 * Uses simulation unless keys are present and simulation is false.
 */
export async function POST(req: Request) {
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
  if (workspace.killSwitch || process.env.KILL_SWITCH === 'true') {
    return NextResponse.json({ error: 'Kill switch is active' }, { status: 423 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    json = {};
  }
  const parsed = bodySchema.safeParse(json ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const simulation =
    parsed.data.simulation ?? process.env.SIMULATION_MODE !== 'false';

  const providerId = (parsed.data.provider ||
    (parsed.data.country === 'UK'
      ? 'COMPANIES_HOUSE_UK'
      : parsed.data.country === 'AU'
        ? 'ABN_ASIC_AU'
        : 'NPI_US')) as SourceProviderId;

  // Workspace source must be enabled for non-dummy when not simulating
  if (!simulation && providerId !== 'DUMMY') {
    const cfg = await prisma.sourceConfig.findFirst({
      where: {
        workspaceId: session.user.workspaceId,
        provider: providerId as never,
      },
    });
    if (!cfg?.isEnabled) {
      return NextResponse.json(
        {
          error: 'Source not enabled for workspace',
          provider: providerId,
          hint: 'Enable it under Sources or pass simulation: true',
        },
        { status: 400 }
      );
    }
  }

  const adapter = getAdapter(providerId);
  if (!adapter || adapter.kind !== 'primary') {
    const primaries = listPrimaryAdapters().map((a) => a.id);
    return NextResponse.json(
      { error: 'Unknown or non-primary provider', provider: providerId, primaries },
      { status: 400 }
    );
  }

  const result = await adapter.discover(
    {
      country: parsed.data.country,
      vertical: parsed.data.vertical,
      region: parsed.data.region,
      city: parsed.data.city,
      searchTerms: parsed.data.searchTerms,
      limit: parsed.data.limit ?? 10,
      simulation,
    },
    {
      simulation,
      log: (level, msg, meta) => {
        if (process.env.NODE_ENV === 'development') {
          console[level === 'error' ? 'error' : 'info'](`[discover:${providerId}]`, msg, meta);
        }
      },
    }
  );

  await recordCost({
    workspaceId: session.user.workspaceId,
    category: 'ENRICHMENT',
    provider: providerId,
    units: result.leads.length || 1,
    unitCost: simulation ? 0 : 0.01,
    runId: parsed.data.runId || null,
    meta: { simulated: result.simulated ?? simulation } as Prisma.InputJsonValue,
  });

  let created: { id: string; companyName: string }[] = [];

  if (parsed.data.persist !== false && result.leads.length > 0) {
    created = await persistLeads(session.user.workspaceId, result.leads, parsed.data.runId);
  }

  return NextResponse.json({
    provider: providerId,
    simulated: result.simulated ?? simulation,
    discovered: result.leads.length,
    created: created.length,
    leads: created.length
      ? created
      : result.leads.map((l) => ({
          companyName: l.companyName,
          domain: l.domain,
          country: l.country,
          sourceRef: l.sourceRef,
        })),
    nextCursor: result.nextCursor,
  });
}

async function persistLeads(
  workspaceId: string,
  leads: DiscoveredLead[],
  runId?: string
) {
  const out: { id: string; companyName: string }[] = [];

  for (const d of leads) {
    // Dedup by domain or company name within workspace
    if (d.domain) {
      const existing = await prisma.lead.findFirst({
        where: {
          workspaceId,
          domain: d.domain,
          deletedAt: null,
        },
      });
      if (existing) {
        out.push({ id: existing.id, companyName: existing.companyName });
        continue;
      }
    }

    const lead = await prisma.lead.create({
      data: {
        workspaceId,
        companyName: d.companyName,
        website: d.website ?? null,
        domain: d.domain ?? null,
        country: d.country ?? null,
        region: d.region ?? null,
        city: d.city ?? null,
        postalCode: d.postalCode ?? null,
        address: d.address ?? null,
        vertical: d.vertical ?? null,
        primaryEmail: d.primaryEmail ?? null,
        primaryPhone: d.primaryPhone ?? null,
        sourceProvider: d.sourceProvider as never,
        sourceRef: d.sourceRef ?? null,
        sourceMeta: {
          ...(d.sourceMeta || {}),
          runId: runId || null,
        } as Prisma.InputJsonValue,
        status: 'DISCOVERED',
      },
    });
    out.push({ id: lead.id, companyName: lead.companyName });
  }

  return out;
}
