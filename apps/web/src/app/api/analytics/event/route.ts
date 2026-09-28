import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { prisma } from '@leadpilot/db';
import type { Prisma } from '@prisma/client';

const bodySchema = z.object({
  name: z.string().min(1).max(64),
  path: z.string().max(512).optional().nullable(),
  referrer: z.string().max(1024).optional().nullable(),
  utmSource: z.string().max(128).optional().nullable(),
  utmMedium: z.string().max(128).optional().nullable(),
  utmCampaign: z.string().max(128).optional().nullable(),
  sessionId: z.string().max(128).optional().nullable(),
  meta: z.record(z.unknown()).optional().nullable(),
});

export async function POST(req: Request) {
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

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '';
  const ipHash = ip
    ? createHash('sha256').update(ip + (process.env.AUTH_SECRET || 'lp')).digest('hex').slice(0, 32)
    : null;

  const metaValue =
    parsed.data.meta == null
      ? undefined
      : (parsed.data.meta as Prisma.InputJsonValue);

  try {
    await prisma.siteEvent.create({
      data: {
        name: parsed.data.name,
        path: parsed.data.path ?? null,
        referrer: parsed.data.referrer ?? null,
        utmSource: parsed.data.utmSource ?? null,
        utmMedium: parsed.data.utmMedium ?? null,
        utmCampaign: parsed.data.utmCampaign ?? null,
        sessionId: parsed.data.sessionId ?? null,
        ipHash,
        userAgent: req.headers.get('user-agent')?.slice(0, 512) ?? null,
        meta: metaValue,
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true });
}
