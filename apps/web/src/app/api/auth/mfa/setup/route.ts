import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { generateMfaSecret, getMfaOtpauthUrl, getMfaQrDataUrl } from '@/lib/mfa';

/**
 * Start MFA enrollment: generate secret + QR. Secret stored only after confirm.
 * Returns otpauth URL + QR data URL. Secret held in response for confirm step
 * (client must call /mfa/confirm with the same secret + a valid token).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, deletedAt: null },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const secret = generateMfaSecret();
  const otpauthUrl = getMfaOtpauthUrl(secret, user.email);
  const qrDataUrl = await getMfaQrDataUrl(otpauthUrl);

  // Stash pending secret temporarily in mfaSecret only after confirm.
  // Return secret to client for the confirm call (over TLS).
  return NextResponse.json({
    secret,
    otpauthUrl,
    qrDataUrl,
  });
}
