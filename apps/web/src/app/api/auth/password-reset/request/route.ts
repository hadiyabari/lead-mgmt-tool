import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes, createHash } from 'node:crypto';
import { prisma } from '@leadpilot/db';
import { checkAuthRateLimit, getClientIp } from '@/lib/rate-limit';

const bodySchema = z.object({
  email: z.string().email(),
  workspaceSlug: z.string().min(1).default('threezero'),
});

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour, single use

/**
 * Request password reset. Always returns 200 to avoid account enumeration.
 * Token stored in VerificationToken table (hashed).
 */
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

  const email = parsed.data.email.toLowerCase();
  const acctRl = checkAuthRateLimit(ip, email);
  if (!acctRl.allowed) {
    return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { slug: parsed.data.workspaceSlug, deletedAt: null },
  });

  if (workspace) {
    const user = await prisma.user.findFirst({
      where: { workspaceId: workspace.id, email, deletedAt: null },
    });

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const expires = new Date(Date.now() + TOKEN_TTL_MS);

      // identifier encodes workspace + email for uniqueness
      const identifier = `pwdreset:${workspace.id}:${email}`;

      // Invalidate previous tokens for this identifier
      await prisma.verificationToken.deleteMany({ where: { identifier } });

      await prisma.verificationToken.create({
        data: { identifier, token: tokenHash, expires },
      });

      // In production: send email with link containing rawToken.
      // For now (no mailer yet): log token only in development.
      if (process.env.NODE_ENV === 'development') {
        console.info(`[password-reset] token for ${email}: ${rawToken}`);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'If an account exists, a reset link has been issued.',
  });
}
