'use client';

import { useCallback, useEffect, useState } from 'react';

type OutboxItem = {
  id: string;
  toEmail: string;
  toName: string | null;
  subject: string;
  status: string;
  isSimulation: boolean;
  lastError: string | null;
  updatedAt: string;
  lead?: { id: string; companyName: string; domain: string | null } | null;
};

export function OutboxClient() {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const q = filter ? `?status=${encodeURIComponent(filter)}` : '';
    const res = await fetch(`/api/outbox${q}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to load');
      return;
    }
    setItems(data.items || []);
    setCounts(data.counts || {});
    setError(null);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function action(id: string, path: string) {
    setBusy(`${id}:${path}`);
    setError(null);
    try {
      const res = await fetch(`/api/outbox/${id}/${path}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.reason || 'Action failed');
      }
      await load();
    } catch {
      setError('Network error');
    }
    setBusy(null);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {['', 'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SENT', 'SIMULATED', 'FAILED', 'CANCELLED'].map(
          (s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: filter === s ? '1px solid #4f8cff' : '1px solid #2d3a4f',
                background: filter === s ? '#1a2d4a' : '#121a26',
                color: '#e7ecf3',
                cursor: 'pointer',
              }}
            >
              {s || 'All'}
              {s && counts[s] != null ? ` (${counts[s]})` : ''}
            </button>
          )
        )}
      </div>

      {error && (
        <p style={{ color: '#f87171', marginBottom: 12 }}>{error}</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && (
          <p style={{ color: '#8b9bb4' }}>No outbox items.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <strong>{item.lead?.companyName || 'Lead'}</strong>
                <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
                  {item.toEmail} · {item.status}
                  {item.isSimulation ? ' · sim' : ''}
                </div>
                <div style={{ marginTop: 8 }}>{item.subject}</div>
                {item.lastError && (
                  <div style={{ color: '#f87171', fontSize: 13, marginTop: 6 }}>{item.lastError}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {item.status === 'DRAFT' && (
                  <>
                    <button type="button" disabled={!!busy} onClick={() => action(item.id, 'submit')}>
                      Submit
                    </button>
                    <button type="button" disabled={!!busy} onClick={() => action(item.id, 'approve')}>
                      Approve
                    </button>
                  </>
                )}
                {item.status === 'PENDING_REVIEW' && (
                  <>
                    <button type="button" disabled={!!busy} onClick={() => action(item.id, 'approve')}>
                      Approve
                    </button>
                    <button type="button" disabled={!!busy} onClick={() => action(item.id, 'reject')}>
                      Reject
                    </button>
                  </>
                )}
                {item.status === 'APPROVED' && (
                  <button type="button" disabled={!!busy} onClick={() => action(item.id, 'send')}>
                    Send
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
