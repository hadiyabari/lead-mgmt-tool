import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { runAudit } from '@leadpilot/audit';
import { canStartRuns } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

const bodySchema = z.object({
  url: z.string().url(),
  simulation: z.boolean().optional(),
});

/** Standalone audit (no lead attachment). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  const simulation =
    parsed.data.simulation ?? process.env.SIMULATION_MODE !== 'false';
  const result = await runAudit(parsed.data.url, { simulation });
  return NextResponse.json(result);
}
