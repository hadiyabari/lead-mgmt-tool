import { NextResponse } from 'next/server';

/**
 * Public registration is disabled.
 * Workspaces and users are created only by SUPER_ADMIN after Contact Sales.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Public registration is closed. Contact Sales at 03293318181.',
      code: 'REGISTRATION_DISABLED',
    },
    { status: 403 }
  );
}
