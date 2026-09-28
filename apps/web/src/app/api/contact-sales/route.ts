import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@leadpilot/db';
import type { Prisma } from '@prisma/client';
import { checkAuthRateLimit, getClientIp } from '@/lib/rate-limit';

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  company: z.string().min(1).max(160),
  phone: z.string().max(40).optional().nullable(),
  message: z.string().min(1).max(4000),
  planInterest: z.string().max(40).optional().nullable(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = checkAuthRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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

  const meta = {
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company,
    phone: parsed.data.phone,
    message: parsed.data.message,
    planInterest: parsed.data.planInterest,
  } as Prisma.InputJsonValue;

  try {
    await prisma.siteEvent.create({
      data: {
        name: 'contact_sales',
        path: '/contact',
        meta,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Could not store message' }, { status: 500 });
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('[contact-sales]', parsed.data);
  }

  return NextResponse.json({ ok: true });
}
