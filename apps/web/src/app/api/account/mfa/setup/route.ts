import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { generateMfaSecret, mfaOtpauthUrl } from '@/lib/mfa';
import QRCode from 'qrcode';

/** Start MFA setup: issue secret + QR (not enabled until confirm). */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, deletedAt: null },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (user.mfaEnabled) {
    return NextResponse.json({ error: 'MFA already enabled' }, { status: 400 });
  }

  const secret = generateMfaSecret();
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaSecret: secret, mfaEnabled: false },
  });

  const otpauth = mfaOtpauthUrl({ email: user.email, secret });
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  return NextResponse.json({
    secret,
    otpauth,
    qrDataUrl,
  });
}
