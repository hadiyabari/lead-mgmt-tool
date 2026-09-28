import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { computeLeadScore, DEFAULT_WEIGHTS, type ScoreWeights } from '@leadpilot/scoring';
import { canStartRuns } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

const bodySchema = z
  .object({
    weights: z
      .object({
        auditScore: z.number().min(0).optional(),
        rating: z.number().min(0).optional(),
        reviewCount: z.number().min(0).optional(),
        hasWebsite: z.number().min(0).optional(),
        hasEmail: z.number().min(0).optional(),
        hasPhone: z.number().min(0).optional(),
        jobSignal: z.number().min(0).optional(),
        icpCountryFit: z.number().min(0).optional(),
        icpVerticalFit: z.number().min(0).optional(),
      })
      .optional(),
    threshold: z.number().min(0).max(100).optional(),
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

  const { id } = await ctx.params;
  const lead = await prisma.lead.findFirst({
    where: { id, workspaceId: session.user.workspaceId, deletedAt: null },
    include: {
      enrichments: { orderBy: { enrichedAt: 'desc' }, take: 10 },
      auditResults: { orderBy: { auditedAt: 'desc' }, take: 1 },
    },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  let weights: Partial<ScoreWeights> = {};
  let threshold: number | undefined;
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (parsed.success && parsed.data) {
      weights = parsed.data.weights || {};
      threshold = parsed.data.threshold;
    }
  } catch {
    /* empty body ok */
  }

  const latestAudit = lead.auditResults[0];
  const rating = lead.enrichments.find((e) => e.rating != null)?.rating;
  const reviewCount = lead.enrichments.find((e) => e.reviewCount != null)?.reviewCount;
  const jobSignal = lead.enrichments.some(
    (e) => e.provider === 'JOB_BOARD' || (e.raw as { hiringSignal?: boolean } | null)?.hiringSignal
  );

  const result = computeLeadScore(
    {
      auditScore: latestAudit?.score ?? null,
      rating: rating ?? null,
      reviewCount: reviewCount ?? null,
      hasWebsite: Boolean(lead.website || lead.domain),
      hasEmail: Boolean(lead.primaryEmail),
      hasPhone: Boolean(lead.primaryPhone),
      jobSignal,
      countryMatchesIcp: true,
      verticalMatchesIcp: true,
    },
    weights,
    threshold
  );

  const saved = await prisma.leadScore.create({
    data: {
      leadId: lead.id,
      totalScore: result.totalScore,
      breakdown: result.breakdown as object[],
      weightsUsed: result.weightsUsed as object,
    },
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: result.qualified ? 'QUALIFIED' : 'SCORED' },
  });

  return NextResponse.json({
    score: saved,
    result,
    defaults: DEFAULT_WEIGHTS,
  });
}
