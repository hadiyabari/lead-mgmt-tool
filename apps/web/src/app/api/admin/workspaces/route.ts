import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { hashPassword } from '@/lib/password';
import type { Role } from '@leadpilot/db';
import { canProvisionTenants } from '@/lib/rbac';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canProvisionTenants((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const items = await prisma.workspace.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      planCode: true,
      killSwitch: true,
      primaryDomain: true,
      createdAt: true,
      _count: { select: { users: true, leads: true } },
    },
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  legalAddress: z.string().max(500).optional().nullable(),
  primaryDomain: z.string().max(120).optional().nullable(),
  planCode: z.string().max(40).optional().nullable(),
  ownerEmail: z.string().email(),
  ownerName: z.string().max(120).optional(),
  ownerPassword: z.string().min(10).max(128),
});

/** SUPER_ADMIN only: create workspace + initial OWNER user. */
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
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const existingSlug = await prisma.workspace.findFirst({
    where: { slug: parsed.data.slug },
  });
  if (existingSlug) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.ownerPassword);

  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      legalAddress: parsed.data.legalAddress ?? null,
      primaryDomain: parsed.data.primaryDomain ?? null,
      planCode: parsed.data.planCode ?? null,
      users: {
        create: {
          email: parsed.data.ownerEmail.toLowerCase(),
          name: parsed.data.ownerName || 'Owner',
          role: 'OWNER',
          passwordHash,
        },
      },
    },
    include: {
      users: { select: { id: true, email: true, role: true } },
    },
  });

  return NextResponse.json(
    {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        planCode: workspace.planCode,
      },
      owner: workspace.users[0],
    },
    { status: 201 }
  );
}
