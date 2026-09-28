'use client';

import { useCallback, useEffect, useState } from 'react';

type LedgerItem = {
  id: string;
  email: string | null;
  phone: string | null;
  domain: string | null;
  origin: string;
  lastContactedAt: string;
  firstContactedAt: string;
  sourceOfTruth: string | null;
};

export function LedgerTable({ refreshKey }: { refreshKey?: number }) {
  const [q, setQ] = useState('');
  const [origin, setOrigin] = useState('');
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (origin) params.set('origin', origin);
      params.set('limit', '50');
      const res = await fetch(`/api/ledger?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load');
      } else {
        setItems(data.items || []);
        setTotal(data.total || 0);
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }, [q, origin]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="card">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <input
          type="search"
          placeholder="Search email, phone, domain…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
          }}
        />
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
          }}
        >
          <option value="">All origins</option>
          <option value="LEDGER_IMPORT_CSV">CSV</option>
          <option value="LEDGER_IMPORT_CRM">CRM</option>
          <option value="LEDGER_IMPORT_GMAIL">Gmail</option>
          <option value="OUTBOUND_SEND">Outbound</option>
          <option value="MANUAL">Manual</option>
          <option value="SUPPRESSION">Suppression</option>
        </select>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>

      <p style={{ margin: '0 0 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {loading ? 'Loading…' : `${total} contact${total === 1 ? '' : 's'}`}
      </p>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Domain</th>
              <th style={th}>Origin</th>
              <th style={th}>Last contacted</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={td}>{row.email || '—'}</td>
                <td style={td}>{row.phone || '—'}</td>
                <td style={td}>{row.domain || '—'}</td>
                <td style={td}>
                  <span className="badge badge-muted">{formatOrigin(row.origin)}</span>
                </td>
                <td style={td}>{formatDate(row.lastContactedAt)}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...td, color: 'var(--text-muted)' }}>
                  No contacts in the ledger yet. Import a CSV above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: '0.5rem 0.6rem', fontWeight: 600 };
const td: React.CSSProperties = { padding: '0.55rem 0.6rem' };

function formatOrigin(o: string) {
  return o.replace(/^LEDGER_IMPORT_/, '').replace(/_/g, ' ');
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
