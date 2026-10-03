import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { normalizeEmail, normalizePhone, normalizeDomain } from '@leadpilot/shared';
import type { Role } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

  const items = await prisma.suppressionList.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  domain: z.string().optional(),
  reason: z.string().max(200).optional(),
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

  const email = normalizeEmail(parsed.data.email);
  const phone = normalizePhone(parsed.data.phone);
  const domain = normalizeDomain(parsed.data.domain);

  if (!email && !phone && !domain) {
    return NextResponse.json({ error: 'Need email, phone, or domain' }, { status: 400 });
  }

  try {
    const item = await prisma.suppressionList.create({
      data: {
        workspaceId: session.user.workspaceId,
        normalizedEmail: email,
        normalizedPhone: phone,
        domain,
        reason: parsed.data.reason || 'manual',
        source: 'operator',
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Already suppressed' }, { status: 409 });
  }
}
