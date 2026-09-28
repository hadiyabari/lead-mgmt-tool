import { NextResponse } from 'next/server';

/**
 * Simple health-check endpoint.
 * Used by load balancers, Docker, and local smoke tests.
 * Does not touch the database or Redis yet (those arrive with schema + workers).
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'leadpilot-web',
      timestamp: new Date().toISOString(),
      simulationMode: process.env.SIMULATION_MODE === 'true',
      killSwitch: process.env.KILL_SWITCH === 'true',
    },
    { status: 200 }
  );
}
