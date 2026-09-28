import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { verifyMfaToken } from '@/lib/mfa';
import { verifyPassword } from '@/lib/password';

const bodySchema = z.object({
  password: z.string().min(1),
  token: z.string().min(6).max(8),
});

/** Disable MFA – requires current password + valid TOTP. */
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

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, deletedAt: null },
  });
  if (!user?.passwordHash || !user.mfaSecret) {
    return NextResponse.json({ error: 'MFA not enabled' }, { status: 400 });
  }

  const pwOk = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!pwOk) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
  }

  if (!verifyMfaToken(user.mfaSecret, parsed.data.token)) {
    return NextResponse.json({ error: 'Invalid MFA code' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: false, mfaSecret: null },
  });

  return NextResponse.json({ ok: true, mfaEnabled: false });
}
