import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const item = await prisma.emailOutbox.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
    include: {
      lead: true,
    },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item });
}

const patchSchema = z.object({
  subject: z.string().min(1).max(300).optional(),
  bodyHtml: z.string().min(1).optional(),
  bodyText: z.string().optional(),
  toEmail: z.string().email().optional(),
  toName: z.string().max(120).nullable().optional(),
});

/** Edit draft while still DRAFT or PENDING_REVIEW. */
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
  const item = await prisma.emailOutbox.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (item.status !== 'DRAFT' && item.status !== 'PENDING_REVIEW') {
    return NextResponse.json({ error: 'Only draft or pending items can be edited' }, { status: 400 });
  }

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

  const updated = await prisma.emailOutbox.update({
    where: { id },
    data: {
      ...parsed.data,
    },
  });
  return NextResponse.json({ item: updated });
}
