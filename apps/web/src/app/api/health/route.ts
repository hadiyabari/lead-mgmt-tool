import { NextResponse } from 'next/server';
import { prisma } from '@leadpilot/db';

/**
 * Health check with optional deep DB probe via ?deep=1
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const deep = url.searchParams.get('deep') === '1';

  const base = {
    status: 'ok' as 'ok' | 'degraded',
    service: 'leadpilot-web',
    timestamp: new Date().toISOString(),
    simulationMode: process.env.SIMULATION_MODE !== 'false',
    killSwitchEnv: process.env.KILL_SWITCH === 'true',
    version: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.npm_package_version || '0.0.0',
  };

  if (!deep) {
    return NextResponse.json(base, { status: 200 });
  }

  let dbOk = false;
  let dbLatencyMs: number | null = null;
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const status = dbOk ? 'ok' : 'degraded';
  return NextResponse.json(
    {
      ...base,
      status,
      checks: {
        database: { ok: dbOk, latencyMs: dbLatencyMs },
      },
    },
    { status: dbOk ? 200 : 503 }
  );
}
