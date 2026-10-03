import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await prisma.icp.findMany({
    where: { workspaceId: session.user.workspaceId, deletedAt: null },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().min(1).max(160),
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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role)) {
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

  const item = await prisma.icp.create({
    data: {
      workspaceId: session.user.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      verticals: parsed.data.verticals ?? ['DENTAL_ORTHO', 'HOME_SERVICES', 'AESTHETIC_MEDSPA'],
      countries: parsed.data.countries ?? ['US', 'UK', 'AU'],
      minRating: parsed.data.minRating ?? null,
      minReviews: parsed.data.minReviews ?? null,
      minAuditScore: parsed.data.minAuditScore ?? null,
      requireWebsite: parsed.data.requireWebsite ?? true,
      isActive: parsed.data.isActive ?? true,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
