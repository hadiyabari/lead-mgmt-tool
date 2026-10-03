import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import {
  getAdapter,
  listPrimaryAdapters,
  type DiscoveredLead,
  type SourceProviderId,
} from '@leadpilot/sources';
import type { Role, Prisma } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';
import { recordCost } from '@/lib/cost';

const bodySchema = z.object({
  country: z.enum(['US', 'UK', 'AU']).optional(),
  vertical: z.enum(['DENTAL_ORTHO', 'HOME_SERVICES', 'AESTHETIC_MEDSPA', 'OTHER']).optional(),
  region: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  searchTerms: z.array(z.string()).max(10).optional(),
  limitPerSource: z.number().int().min(1).max(25).optional(),
  simulation: z.boolean().optional(),
  persist: z.boolean().optional().default(true),
  providers: z.array(z.string()).max(20).optional(),
  runId: z.string().optional(),
});

/**
 * Phase 32 – run discover on all enabled primary sources (or a provided list).
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
  const limitPerSource = parsed.data.limitPerSource ?? 5;

  const configs = await prisma.sourceConfig.findMany({
    where: { workspaceId: session.user.workspaceId },
  });

  const primaryIds = new Set(listPrimaryAdapters().map((a) => a.id));

  let providerIds: SourceProviderId[];
  if (parsed.data.providers?.length) {
    providerIds = parsed.data.providers.filter((p) => primaryIds.has(p as SourceProviderId)) as SourceProviderId[];
  } else if (simulation) {
    // Simulation: all primary adapters matching country filter if any
    providerIds = listPrimaryAdapters()
      .filter((a) => {
        if (!parsed.data.country) return true;
        return a.countries.includes(parsed.data.country);
      })
      .map((a) => a.id);
  } else {
    providerIds = configs
      .filter((c) => c.isEnabled && primaryIds.has(c.provider as SourceProviderId))
      .map((c) => c.provider as SourceProviderId);
  }

  if (providerIds.length === 0) {
    return NextResponse.json(
      { error: 'No primary sources selected or enabled', providers: [] },
      { status: 400 }
    );
  }

  const perSource: {
    provider: string;
    discovered: number;
    created: number;
    simulated: boolean;
    error?: string;
  }[] = [];

  let totalDiscovered = 0;
  let totalCreated = 0;
  const createdLeads: { id: string; companyName: string; provider: string }[] = [];

  for (const providerId of providerIds) {
    const adapter = getAdapter(providerId);
    if (!adapter || adapter.kind !== 'primary') {
      perSource.push({
        provider: providerId,
        discovered: 0,
        created: 0,
        simulated: simulation,
        error: 'adapter_missing',
      });
      continue;
    }

    try {
      const result = await adapter.discover(
        {
          country: parsed.data.country,
          vertical: parsed.data.vertical,
          region: parsed.data.region,
          city: parsed.data.city,
          searchTerms: parsed.data.searchTerms,
          limit: limitPerSource,
          simulation,
        },
        { simulation }
      );

      await recordCost({
        workspaceId: session.user.workspaceId,
        category: 'ENRICHMENT',
        provider: providerId,
        units: result.leads.length || 1,
        unitCost: simulation ? 0 : 0.01,
        runId: parsed.data.runId || null,
        meta: { batch: true, simulated: result.simulated ?? simulation } as Prisma.InputJsonValue,
      });

      let created = 0;
      if (parsed.data.persist !== false) {
        for (const d of result.leads) {
          const row = await upsertLead(session.user.workspaceId, d, parsed.data.runId);
          if (row.created) {
            created += 1;
            createdLeads.push({
              id: row.id,
              companyName: row.companyName,
              provider: providerId,
            });
          }
        }
      }

      totalDiscovered += result.leads.length;
      totalCreated += created;
      perSource.push({
        provider: providerId,
        discovered: result.leads.length,
        created,
        simulated: result.simulated ?? simulation,
      });
    } catch (e) {
      perSource.push({
        provider: providerId,
        discovered: 0,
        created: 0,
        simulated: simulation,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    simulation,
    providers: providerIds,
    totalDiscovered,
    totalCreated,
    perSource,
    createdLeads: createdLeads.slice(0, 50),
  });
}

async function upsertLead(
  workspaceId: string,
  d: DiscoveredLead,
  runId?: string
): Promise<{ id: string; companyName: string; created: boolean }> {
  if (d.domain) {
    const existing = await prisma.lead.findFirst({
      where: { workspaceId, domain: d.domain, deletedAt: null },
    });
    if (existing) {
      return { id: existing.id, companyName: existing.companyName, created: false };
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
        batch: true,
      } as Prisma.InputJsonValue,
      status: 'DISCOVERED',
    },
  });

  return { id: lead.id, companyName: lead.companyName, created: true };
}
