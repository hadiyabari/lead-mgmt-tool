import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ledgerList } from '@leadpilot/db';
import type { ContactOrigin } from '@leadpilot/db';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get('q') ?? undefined;
  const origin = (url.searchParams.get('origin') as ContactOrigin | null) ?? undefined;
  const limit = Number(url.searchParams.get('limit') || 50);
  const offset = Number(url.searchParams.get('offset') || 0);

  const result = await ledgerList(session.user.workspaceId, {
    q,
    origin: origin || undefined,
    limit,
    offset,
  });

  return NextResponse.json(result);
}
