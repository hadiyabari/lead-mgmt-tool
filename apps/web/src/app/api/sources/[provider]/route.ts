import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

const bodySchema = z.object({
  isEnabled: z.boolean().optional(),
  maxRequestsPerMinute: z.number().int().min(1).max(600).optional(),
  maxCreditsPerRun: z.number().int().min(0).optional().nullable(),
  config: z.record(z.unknown()).optional().nullable(),
});

/** Toggle / update a source config for the workspace. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ provider: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user.role || 'VIEWER') as Role;
  if (!canStartRuns(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { provider } = await ctx.params;
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

  const existing = await prisma.sourceConfig.findFirst({
    where: {
      workspaceId: session.user.workspaceId,
      provider: provider as never,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Source config not found' }, { status: 404 });
  }

  const updated = await prisma.sourceConfig.update({
    where: { id: existing.id },
    data: {
      isEnabled: parsed.data.isEnabled ?? existing.isEnabled,
      maxRequestsPerMinute:
        parsed.data.maxRequestsPerMinute ?? existing.maxRequestsPerMinute,
      maxCreditsPerRun:
        parsed.data.maxCreditsPerRun === undefined
          ? existing.maxCreditsPerRun
          : parsed.data.maxCreditsPerRun,
      config:
        parsed.data.config === undefined
          ? (existing.config as object)
          : (parsed.data.config as object),
    },
  });

  return NextResponse.json({ config: updated });
}
