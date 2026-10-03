import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { hashPassword } from '@/lib/password';
import type { Role } from '@leadpilot/db';
import { canProvisionTenants } from '@/lib/rbac';

const createSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.string().email(),
  name: z.string().max(120).optional(),
  role: z.enum(['OWNER', 'ADMIN', 'OPERATOR', 'VIEWER', 'SUPER_ADMIN']).default('OPERATOR'),
  password: z.string().min(10).max(128),
});

/** SUPER_ADMIN only: create a user in any workspace. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canProvisionTenants((session.user.role || 'VIEWER') as Role)) {
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

  const workspace = await prisma.workspace.findFirst({
    where: { id: parsed.data.workspaceId, deletedAt: null },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findFirst({
    where: { workspaceId: workspace.id, email, deletedAt: null },
  });
  if (exists) {
    return NextResponse.json({ error: 'User already exists in workspace' }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      workspaceId: workspace.id,
      email,
      name: parsed.data.name || null,
      role: parsed.data.role,
      passwordHash,
    },
    select: { id: true, email: true, role: true, workspaceId: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
