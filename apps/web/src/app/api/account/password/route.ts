import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/password';

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10).max(128),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  const strength = validatePasswordStrength(parsed.data.newPassword);
  if (strength) {
    return NextResponse.json({ error: strength }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, deletedAt: null },
  });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: 'Password login not available' }, { status: 400 });
  }

  const ok = await verifyPassword(user.passwordHash, parsed.data.currentPassword);
  if (!ok) {
    return NextResponse.json({ error: 'Current password incorrect' }, { status: 403 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
