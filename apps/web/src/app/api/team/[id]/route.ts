import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canManageUsers } from '@/lib/rbac';

const patchSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const actorRole = (session.user.role || 'VIEWER') as Role;
  if (!canManageUsers(actorRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const target = await prisma.user.findFirst({
    where: {
      id,
      workspaceId: session.user.workspaceId,
      deletedAt: null,
    },
  });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Cannot demote or alter OWNER / SUPER_ADMIN via team API
  if (target.role === 'OWNER' || target.role === 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Cannot modify this user via team API' }, { status: 403 });
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

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const actorRole = (session.user.role || 'VIEWER') as Role;
  if (!canManageUsers(actorRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (id === session.user.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
  }

  const target = await prisma.user.findFirst({
    where: {
      id,
      workspaceId: session.user.workspaceId,
      deletedAt: null,
    },
  });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.role === 'OWNER' || target.role === 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Cannot remove this user via team API' }, { status: 403 });
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
