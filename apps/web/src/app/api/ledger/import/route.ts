import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ledgerBulkImport } from '@leadpilot/db';
import type { ContactOrigin } from '@leadpilot/db';
import { parseCsv, guessColumnMapping } from '@leadpilot/shared';
import { canStartRuns } from '@/lib/rbac';
import type { Role } from '@leadpilot/db';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS = 5000;

/**
 * POST multipart or JSON:
 * - multipart: file field "file" (CSV)
 * - JSON: { csv: string, mapping?: { email, phone, domain, date }, origin?, sourceOfTruth? }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user.role || 'VIEWER') as Role;
  if (!canStartRuns(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const contentType = req.headers.get('content-type') || '';
  let csvText = '';
  let mapping: { email?: string; phone?: string; domain?: string; date?: string } = {};
  let origin: ContactOrigin = 'LEDGER_IMPORT_CSV';
  let sourceOfTruth = 'csv-upload';
  let defaultCountry: string | undefined;

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'Missing file' }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
      }
      csvText = await file.text();
      sourceOfTruth = file.name || 'csv-upload';

      const originField = form.get('origin');
      if (typeof originField === 'string' && originField) {
        origin = originField as ContactOrigin;
      }
      const mapRaw = form.get('mapping');
      if (typeof mapRaw === 'string' && mapRaw) {
        mapping = JSON.parse(mapRaw);
      }
      const country = form.get('defaultCountry');
      if (typeof country === 'string') defaultCountry = country;
    } else {
      const body = await req.json();
      csvText = body.csv || '';
      mapping = body.mapping || {};
      origin = body.origin || 'LEDGER_IMPORT_CSV';
      sourceOfTruth = body.sourceOfTruth || 'csv-upload';
      defaultCountry = body.defaultCountry;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!csvText.trim()) {
    return NextResponse.json({ error: 'Empty CSV' }, { status: 400 });
  }

  const { headers, rows } = parseCsv(csvText);
  if (headers.length === 0) {
    return NextResponse.json({ error: 'No headers found' }, { status: 400 });
  }

  const guessed = guessColumnMapping(headers);
  const emailCol = mapping.email || guessed.email;
  const phoneCol = mapping.phone || guessed.phone;
  const domainCol = mapping.domain || guessed.domain;
  const dateCol = mapping.date || guessed.date;

  if (!emailCol && !phoneCol) {
    return NextResponse.json(
      {
        error: 'Could not detect email or phone column',
        headers,
        suggestedMapping: guessed,
      },
      { status: 400 }
    );
  }

  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows (max ${MAX_ROWS})` },
      { status: 400 }
    );
  }

  // CRM exports use same path with origin LEDGER_IMPORT_CRM
  if (origin !== 'LEDGER_IMPORT_CSV' && origin !== 'LEDGER_IMPORT_CRM' && origin !== 'LEDGER_IMPORT_GMAIL') {
    origin = 'LEDGER_IMPORT_CSV';
  }

  const bulkRows = rows.map((r) => ({
    email: emailCol ? r[emailCol] : null,
    phone: phoneCol ? r[phoneCol] : null,
    domain: domainCol ? r[domainCol] : null,
    contactedAt: dateCol && r[dateCol] ? r[dateCol] : undefined,
    sourceOfTruth,
  }));

  const result = await ledgerBulkImport(session.user.workspaceId, bulkRows, {
    origin,
    defaultCountry,
  });

  return NextResponse.json({
    ...result,
    totalRows: rows.length,
    mappingUsed: { email: emailCol, phone: phoneCol, domain: domainCol, date: dateCol },
    headers,
  });
}
