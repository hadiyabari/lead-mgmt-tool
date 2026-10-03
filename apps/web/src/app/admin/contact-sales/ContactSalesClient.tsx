'use client';

import { useCallback, useEffect, useState } from 'react';

type Row = {
  id: string;
  createdAt: string;
  meta: {
    name?: string;
    email?: string;
    company?: string;
    phone?: string | null;
    message?: string;
    planInterest?: string | null;
  } | null;
};

export function ContactSalesClient() {
  const [items, setItems] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/contact-sales');
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setItems(data.items || []);
    setError(null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No submissions.</p>}
        {items.map((item) => {
          const m = item.meta || {};
          return (
            <div
              key={item.id}
              style={{
                background: '#1a2332',
                border: '1px solid #2d3a4f',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <strong>{m.company || 'Company'}</strong>
              <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
                {m.name}
                {m.email ? ` · ${m.email}` : ''}
                {m.phone ? ` · ${m.phone}` : ''}
                {m.planInterest ? ` · ${m.planInterest}` : ''}
                {` · ${new Date(item.createdAt).toLocaleString()}`}
              </div>
              {m.message && (
                <p style={{ marginTop: 10, whiteSpace: 'pre-wrap', fontSize: 14 }}>{m.message}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
