import { auth } from '@/auth';
import { ledgerList } from '@leadpilot/db';

function csvEscape(v: string | null | undefined): string {
  const s = v ?? '';
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await ledgerList(session.user.workspaceId, {
    limit: 5000,
    offset: 0,
  });

  const header = [
    'id',
    'email',
    'phone',
    'domain',
    'origin',
    'channel',
    'sourceOfTruth',
    'firstContactedAt',
    'lastContactedAt',
    'notes',
  ];

  const lines = [header.join(',')];
  for (const row of result.items) {
    lines.push(
      [
        csvEscape(row.id),
        csvEscape(row.email),
        csvEscape(row.phone),
        csvEscape(row.domain),
        csvEscape(row.origin),
        csvEscape(row.channel),
        csvEscape(row.sourceOfTruth),
        csvEscape(row.firstContactedAt?.toISOString?.() ?? String(row.firstContactedAt)),
        csvEscape(row.lastContactedAt?.toISOString?.() ?? String(row.lastContactedAt)),
        csvEscape(row.notes),
      ].join(',')
    );
  }

  const body = lines.join('\r\n') + '\r\n';
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="contact-ledger.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
