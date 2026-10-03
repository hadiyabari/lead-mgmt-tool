'use client';

import { useCallback, useEffect, useState } from 'react';

type CostItem = {
  id: string;
  category: string;
  provider: string | null;
  units: number;
  totalCost: number | null;
  createdAt: string;
};

type Total = { category: string; units: number; totalCost: number };

export function CostsClient() {
  const [items, setItems] = useState<CostItem[]>([]);
  const [totals, setTotals] = useState<Total[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/costs');
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setItems(data.items || []);
    setTotals(data.totals || {});
    setError(null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {totals.map((t) => (
          <div
            key={t.category}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ color: '#8b9bb4', fontSize: 12 }}>{t.category}</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
              {t.units} units
            </div>
            <div style={{ color: '#8b9bb4', fontSize: 12 }}>
              cost {t.totalCost ?? 0}
            </div>
          </div>
        ))}
        {totals.length === 0 && (
          <div style={{ color: '#8b9bb4' }}>No cost totals yet.</div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No cost entries.</p>}
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <strong>{item.category}</strong>
              <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
                {item.provider || '—'} · {item.units} units
                {item.totalCost != null ? ` · ${item.totalCost}` : ''}
              </div>
            </div>
            <div style={{ color: '#8b9bb4', fontSize: 12 }}>
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
