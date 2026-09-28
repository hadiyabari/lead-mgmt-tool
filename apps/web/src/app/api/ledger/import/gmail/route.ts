import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canStartRuns } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

/**
 * Gmail sent-folder importer scaffold.
 * Full OAuth + Gmail API integration requires GOOGLE_CLIENT_ID/SECRET and
 * user-granted gmail.readonly (or gmail.metadata) scope.
 *
 * Until Google OAuth is connected for the workspace mailbox:
 * - Returns 501 with instructions
 * - Operators can export Gmail sent as CSV and use /api/ledger/import with origin LEDGER_IMPORT_GMAIL
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user.role || 'VIEWER') as Role;
  if (!canStartRuns(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const hasGoogle =
    Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

  if (!hasGoogle) {
    return NextResponse.json(
      {
        error: 'Gmail API not configured',
        code: 'GMAIL_NOT_CONFIGURED',
        message:
          'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, connect a Google account with gmail.readonly, or export Sent mail as CSV and import via /api/ledger/import with origin LEDGER_IMPORT_GMAIL.',
      },
      { status: 501 }
    );
  }

  // Placeholder for live Gmail sync once OAuth tokens are stored per mailbox.
  return NextResponse.json(
    {
      error: 'Gmail sync not yet connected for this workspace',
      code: 'GMAIL_OAUTH_REQUIRED',
      message:
        'Google OAuth env is present. Connect a mailbox in Settings (Phase 16) then retry. Meanwhile use CSV export of Sent folder.',
    },
    { status: 501 }
  );
}
