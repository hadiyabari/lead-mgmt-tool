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
  const [selected, setSelected] = useState<Record<string, boolean>>({});
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

  const selectedIds = items.filter((i) => selected[i.id]).map((i) => i.id);

  async function action(id: string, path: string) {
    setBusy(`${id}:${path}`);
    setError(null);
    try {
      const res = await fetch(`/api/outbox/${id}/${path}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) setError(data.error || data.reason || 'Action failed');
      await load();
    } catch {
      setError('Network error');
    }
    setBusy(null);
  }

  async function bulk(actionName: 'submit' | 'approve' | 'reject' | 'send') {
    if (selectedIds.length === 0) {
      setError('Select at least one item');
      return;
    }
    setBusy(`bulk:${actionName}`);
    setError(null);
    try {
      const res = await fetch('/api/outbox/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionName, ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Bulk failed');
      setSelected({});
      await load();
    } catch {
      setError('Network error');
    }
    setBusy(null);
  }

  function toggleAll() {
    if (selectedIds.length === items.length) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    items.forEach((i) => {
      next[i.id] = true;
    });
    setSelected(next);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
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

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" disabled={!!busy} onClick={toggleAll} style={btnStyle}>
          {selectedIds.length === items.length && items.length > 0 ? 'Clear selection' : 'Select page'}
        </button>
        <button type="button" disabled={!!busy} onClick={() => bulk('submit')} style={btnStyle}>
          Bulk submit
        </button>
        <button type="button" disabled={!!busy} onClick={() => bulk('approve')} style={btnStyle}>
          Bulk approve
        </button>
        <button type="button" disabled={!!busy} onClick={() => bulk('reject')} style={btnStyle}>
          Bulk reject
        </button>
        <button type="button" disabled={!!busy} onClick={() => bulk('send')} style={btnStyle}>
          Bulk send
        </button>
        <span style={{ color: '#8b9bb4', alignSelf: 'center', fontSize: 13 }}>
          {selectedIds.length} selected
        </span>
      </div>

      {error && <p style={{ color: '#f87171', marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No outbox items.</p>}
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
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={!!selected[item.id]}
                onChange={(e) =>
                  setSelected((prev) => ({ ...prev, [item.id]: e.target.checked }))
                }
                style={{ marginTop: 4 }}
              />
              <div style={{ flex: 1 }}>
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
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.status === 'DRAFT' && (
                      <>
                        <button type="button" disabled={!!busy} onClick={() => action(item.id, 'submit')} style={btnStyle}>
                          Submit
                        </button>
                        <button type="button" disabled={!!busy} onClick={() => action(item.id, 'approve')} style={btnStyle}>
                          Approve
                        </button>
                      </>
                    )}
                    {item.status === 'PENDING_REVIEW' && (
                      <>
                        <button type="button" disabled={!!busy} onClick={() => action(item.id, 'approve')} style={btnStyle}>
                          Approve
                        </button>
                        <button type="button" disabled={!!busy} onClick={() => action(item.id, 'reject')} style={btnStyle}>
                          Reject
                        </button>
                      </>
                    )}
                    {item.status === 'APPROVED' && (
                      <button type="button" disabled={!!busy} onClick={() => action(item.id, 'send')} style={btnStyle}>
                        Send
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: '#1a2d4a',
  border: '1px solid #2d3a4f',
  borderRadius: 8,
  padding: '6px 10px',
  color: '#e7ecf3',
  cursor: 'pointer',
};
