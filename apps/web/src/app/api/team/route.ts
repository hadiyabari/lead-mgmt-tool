import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { hashPassword } from '@/lib/password';
import type { Role } from '@leadpilot/db';
import { canManageUsers } from '@/lib/rbac';

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await prisma.user.findMany({
    where: { workspaceId: session.user.workspaceId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().nullable(),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']),
  password: z.string().min(10).max(128),
});

/** OWNER/ADMIN create users inside their own workspace only. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user.role || 'VIEWER') as Role;
  if (!canManageUsers(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findFirst({
    where: {
      workspaceId: session.user.workspaceId,
      email,
      deletedAt: null,
    },
  });
  if (exists) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      workspaceId: session.user.workspaceId,
      email,
      name: parsed.data.name || null,
      role: parsed.data.role,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
