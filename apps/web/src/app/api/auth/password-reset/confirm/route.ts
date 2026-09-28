import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { prisma } from '@leadpilot/db';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { checkAuthRateLimit, getClientIp } from '@/lib/rate-limit';

const bodySchema = z.object({
  email: z.string().email(),
  workspaceSlug: z.string().min(1).default('threezero'),
  token: z.string().min(20),
  newPassword: z.string().min(12),
});

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = checkAuthRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const strengthError = validatePasswordStrength(parsed.data.newPassword);
  if (strengthError) {
    return NextResponse.json({ error: strengthError }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const workspace = await prisma.workspace.findFirst({
    where: { slug: parsed.data.workspaceSlug, deletedAt: null },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  const identifier = `pwdreset:${workspace.id}:${email}`;
  const tokenHash = createHash('sha256').update(parsed.data.token).digest('hex');

  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: tokenHash },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  // Single use: delete immediately
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.updateMany({
    where: { workspaceId: workspace.id, email, deletedAt: null },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
