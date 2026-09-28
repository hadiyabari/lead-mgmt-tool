import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { getAdapter } from '@leadpilot/sources';
import type { SourceProviderId } from '@leadpilot/sources';
import { canStartRuns } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';
import { normalizeDomain, normalizeCompanyName } from '@leadpilot/shared';

const bodySchema = z.object({
  provider: z.string(),
  vertical: z.enum(['DENTAL_ORTHO', 'HOME_SERVICES', 'AESTHETIC_MEDSPA', 'OTHER']).optional(),
  country: z.enum(['US', 'UK', 'AU']).optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  searchTerms: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  simulation: z.boolean().optional(),
  persist: z.boolean().optional(), // write discovered leads to DB
});

/**
 * Run discover on an adapter. Defaults to simulation unless explicitly disabled
 * and SIMULATION_MODE env is false.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user.role || 'VIEWER') as Role;
  if (!canStartRuns(role)) {
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

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const adapter = getAdapter(parsed.data.provider as SourceProviderId);
  if (!adapter) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 404 });
  }

  const simulation =
    parsed.data.simulation ??
    process.env.SIMULATION_MODE === 'true' ??
    true;

  const result = await adapter.discover(
    {
      vertical: parsed.data.vertical,
      country: parsed.data.country,
      region: parsed.data.region,
      city: parsed.data.city,
      searchTerms: parsed.data.searchTerms,
      limit: parsed.data.limit ?? 10,
      simulation,
    },
    { simulation }
  );

  let persisted = 0;
  if (parsed.data.persist && result.leads.length) {
    for (const lead of result.leads) {
      const domain = normalizeDomain(lead.domain || lead.website || null);
      await prisma.lead.create({
        data: {
          workspaceId: session.user.workspaceId,
          companyName: lead.companyName,
          normalizedName: normalizeCompanyName(lead.companyName),
          website: lead.website ?? null,
          domain,
          country: lead.country ?? null,
          region: lead.region ?? null,
          city: lead.city ?? null,
          postalCode: lead.postalCode ?? null,
          address: lead.address ?? null,
          vertical: lead.vertical ?? null,
          status: 'DISCOVERED',
          sourceProvider: lead.sourceProvider as never,
          sourceRef: lead.sourceRef ?? null,
          sourceMeta: lead.sourceMeta ?? undefined,
          primaryEmail: lead.primaryEmail ?? null,
          primaryPhone: lead.primaryPhone ?? null,
        },
      });
      persisted += 1;
    }
  }

  return NextResponse.json({
    provider: adapter.id,
    simulated: result.simulated ?? simulation,
    leads: result.leads,
    nextCursor: result.nextCursor,
    persisted,
  });
}
