import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@leadpilot/db';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { checkAuthRateLimit, getClientIp } from '@/lib/rate-limit';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  name: z.string().min(1).max(120).optional(),
  workspaceSlug: z.string().min(1).default('threezero'),
});

/**
 * Register is restricted: only OWNER/ADMIN can create users in a workspace.
 * For v1 bootstrap, if no users exist in workspace, first register becomes OWNER.
 * Otherwise registration requires an authenticated admin (Phase 5 UI will enforce).
 * This endpoint remains rate-limited and validates strength.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = checkAuthRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const strengthError = validatePasswordStrength(parsed.data.password);
  if (strengthError) {
    return NextResponse.json({ error: strengthError }, { status: 400 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { slug: parsed.data.workspaceSlug, deletedAt: null },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const existingCount = await prisma.user.count({
    where: { workspaceId: workspace.id, deletedAt: null },
  });

  // Only allow open registration when workspace has zero users (bootstrap).
  // Otherwise require operator to invite (Phase 5+).
  if (existingCount > 0) {
    return NextResponse.json(
      { error: 'Registration closed. Ask an admin to invite you.' },
      { status: 403 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      workspaceId: workspace.id,
      email,
      name: parsed.data.name ?? null,
      passwordHash,
      role: 'OWNER',
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
