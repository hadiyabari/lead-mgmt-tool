import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { verifyMfaToken } from '@/lib/mfa';

const bodySchema = z.object({
  token: z.string().min(6).max(8),
});

/** Confirm MFA with a valid TOTP code. */
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
  if (!user?.mfaSecret) {
    return NextResponse.json({ error: 'MFA setup not started' }, { status: 400 });
  }

  if (!verifyMfaToken(user.mfaSecret, parsed.data.token)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: true },
  });

  return NextResponse.json({ ok: true, mfaEnabled: true });
}
