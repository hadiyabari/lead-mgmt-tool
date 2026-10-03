'use client';

import { useCallback, useEffect, useState } from 'react';

type ReplyItem = {
  id: string;
  fromEmail: string;
  subject: string | null;
  bodyText: string | null;
  classification: string;
  receivedAt: string;
  lead?: { id: string; companyName: string; status: string } | null;
};

const CLASSES = [
  '',
  'INTERESTED',
  'OBJECTION',
  'UNSUBSCRIBE',
  'OUT_OF_OFFICE',
  'BOUNCE',
  'OTHER',
  'UNCLASSIFIED',
];

export function RepliesClient() {
  const [items, setItems] = useState<ReplyItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const q = filter ? `?classification=${encodeURIComponent(filter)}` : '';
    const res = await fetch(`/api/replies${q}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setItems(data.items || []);
    setCounts(data.counts || {});
    setError(null);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function reclassify(id: string, classification: string) {
    const res = await fetch(`/api/replies/${id}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classification }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Classify failed');
      return;
    }
    await load();
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {CLASSES.map((c) => (
          <button
            key={c || 'all'}
            type="button"
            onClick={() => setFilter(c)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: filter === c ? '1px solid #4f8cff' : '1px solid #2d3a4f',
              background: filter === c ? '#1a2d4a' : '#121a26',
              color: '#e7ecf3',
              cursor: 'pointer',
            }}
          >
            {c || 'All'}{c && counts[c] != null ? ` (${counts[c]})` : ''}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No replies yet.</p>}
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
              <div style={{ flex: 1 }}>
                <strong>{item.lead?.companyName || 'Unknown lead'}</strong>
                <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
                  {item.fromEmail} · {item.classification} ·{' '}
                  {new Date(item.receivedAt).toLocaleString()}
                </div>
                {item.subject && <div style={{ marginTop: 8 }}>{item.subject}</div>}
                {item.bodyText && (
                  <pre
                    style={{
                      marginTop: 8,
                      whiteSpace: 'pre-wrap',
                      fontSize: 13,
                      color: '#c5d0e0',
                      maxHeight: 160,
                      overflow: 'auto',
                    }}
                  >
                    {item.bodyText.slice(0, 800)}
                  </pre>
                )}
              </div>
              <select
                value={item.classification}
                onChange={(e) => reclassify(item.id, e.target.value)}
                style={{
                  background: '#0a1018',
                  color: '#e7ecf3',
                  border: '1px solid #2d3a4f',
                  borderRadius: 8,
                  padding: 6,
                  height: 36,
                }}
              >
                {CLASSES.filter(Boolean).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
