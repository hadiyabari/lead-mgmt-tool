import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canManageUsers } from '@/lib/rbac';

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: session.user.workspaceId, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      legalAddress: true,
      primaryDomain: true,
      planCode: true,
      killSwitch: true,
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ workspace });
}

const patchSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  legalAddress: z.string().max(500).optional().nullable(),
  primaryDomain: z.string().max(120).optional().nullable(),
});

/** OWNER/ADMIN update own workspace profile fields. */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canManageUsers((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  const workspace = await prisma.workspace.update({
    where: { id: session.user.workspaceId },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      slug: true,
      legalAddress: true,
      primaryDomain: true,
      planCode: true,
    },
  });

  return NextResponse.json({ workspace });
}
