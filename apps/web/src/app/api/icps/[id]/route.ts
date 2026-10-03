import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

const patchSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).optional().nullable(),
  verticals: z
    .array(z.enum(['DENTAL_ORTHO', 'HOME_SERVICES', 'AESTHETIC_MEDSPA', 'OTHER']))
    .optional(),
  countries: z.array(z.enum(['US', 'UK', 'AU'])).optional(),
  minRating: z.number().min(0).max(5).optional().nullable(),
  minReviews: z.number().int().min(0).optional().nullable(),
  minAuditScore: z.number().min(0).max(100).optional().nullable(),
  requireWebsite: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
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
  const existing = await prisma.icp.findFirst({
    where: { id, workspaceId: session.user.workspaceId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const item = await prisma.icp.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ item });
}

export async function DELETE(
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

  const { id } = await ctx.params;
  const existing = await prisma.icp.findFirst({
    where: { id, workspaceId: session.user.workspaceId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.icp.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  return NextResponse.json({ ok: true });
}
