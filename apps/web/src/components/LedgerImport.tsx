'use client';

import { useState, FormEvent } from 'react';

type ImportResult = {
  inserted: number;
  updated: number;
  skipped: number;
  errors: { index: number; message: string }[];
  totalRows?: number;
  mappingUsed?: Record<string, string | undefined>;
};

export function LedgerImport({ onDone }: { onDone?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [origin, setOrigin] = useState('LEDGER_IMPORT_CSV');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Choose a CSV file');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('origin', origin);

      const res = await fetch('/api/ledger/import', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Import failed');
        if (data.headers) {
          setError(
            (data.error || 'Import failed') +
              ` · Headers found: ${(data.headers as string[]).join(', ')}`
          );
        }
      } else {
        setResult(data);
        onDone?.();
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div className="card-label">Import contacts</div>
      <p style={{ margin: '0 0 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Upload a CSV of previously contacted people. Columns are auto-detected (email, phone,
        domain, date). Duplicates update last-contacted only.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'end' }}>
        <label style={{ fontSize: '0.85rem' }}>
          File
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: 'block', marginTop: 4 }}
          />
        </label>

        <label style={{ fontSize: '0.85rem' }}>
          Origin
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            style={{
              display: 'block',
              marginTop: 4,
              padding: '0.4rem',
              borderRadius: 8,
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            <option value="LEDGER_IMPORT_CSV">CSV export</option>
            <option value="LEDGER_IMPORT_CRM">CRM export</option>
            <option value="LEDGER_IMPORT_GMAIL">Gmail sent (CSV export)</option>
          </select>
        </label>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Importing…' : 'Import'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--danger)', marginTop: 12, fontSize: '0.9rem' }}>{error}</p>}

      {result && (
        <p style={{ marginTop: 12, fontSize: '0.9rem' }}>
          <span className="badge badge-ok">inserted {result.inserted}</span>{' '}
          <span className="badge badge-muted">updated {result.updated}</span>{' '}
          <span className="badge badge-muted">skipped {result.skipped}</span>
          {result.errors?.length > 0 && (
            <span className="badge badge-danger"> errors {result.errors.length}</span>
          )}
          {result.totalRows != null && (
            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
              of {result.totalRows} rows
            </span>
          )}
        </p>
      )}

      <p style={{ margin: '0.75rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Gmail live API sync needs Google OAuth (Phase 16). Until then, export Sent as CSV and choose
        origin "Gmail sent".
      </p>
    </div>
  );
}
