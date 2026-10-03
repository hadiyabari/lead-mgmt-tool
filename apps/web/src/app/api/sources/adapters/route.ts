import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listAdapters } from '@leadpilot/sources';

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = listAdapters().map((a) => ({
    id: a.id,
    name: a.name,
    kind: a.kind,
    countries: a.countries,
  }));

  return NextResponse.json({ items });
}
