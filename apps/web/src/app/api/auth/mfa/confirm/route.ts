import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { verifyMfaToken } from '@/lib/mfa';

const bodySchema = z.object({
  secret: z.string().min(10),
  token: z.string().min(6).max(8),
});

/** Confirm MFA enrollment with a valid TOTP code, then persist secret. */
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

  if (!verifyMfaToken(parsed.data.secret, parsed.data.token)) {
    return NextResponse.json({ error: 'Invalid MFA code' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      mfaSecret: parsed.data.secret,
      mfaEnabled: true,
    },
  });

  return NextResponse.json({ ok: true, mfaEnabled: true });
}
