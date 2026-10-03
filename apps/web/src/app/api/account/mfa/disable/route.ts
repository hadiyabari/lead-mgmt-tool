import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { verifyMfaToken } from '@/lib/mfa';
import { verifyPassword } from '@/lib/password';

const bodySchema = z.object({
  password: z.string().min(1),
  token: z.string().min(6).max(8).optional(),
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

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, deletedAt: null },
  });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const ok = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!ok) {
    return NextResponse.json({ error: 'Password incorrect' }, { status: 403 });
  }

  if (user.mfaEnabled && user.mfaSecret) {
    if (!parsed.data.token || !verifyMfaToken(user.mfaSecret, parsed.data.token)) {
      return NextResponse.json({ error: 'MFA code required' }, { status: 403 });
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: false, mfaSecret: null },
  });

  return NextResponse.json({ ok: true, mfaEnabled: false });
}
