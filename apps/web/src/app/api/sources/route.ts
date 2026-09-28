import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@leadpilot/db';
import { listAdapters } from '@leadpilot/sources';

/** List built-in adapters + workspace SourceConfig flags. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adapters = listAdapters().map((a) => ({
    id: a.id,
    name: a.name,
    countries: a.countries,
    kind: a.kind,
  }));

  const configs = await prisma.sourceConfig.findMany({
    where: { workspaceId: session.user.workspaceId },
  });

  return NextResponse.json({ adapters, configs });
}
