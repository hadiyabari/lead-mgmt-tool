'use client';

import { useEffect, useState } from 'react';

type Analytics = {
  totalEvents: number;
  pageViews: number;
  contactSales: number;
  workspaceCount: number;
  userCount: number;
  topPaths: { path: string | null; count: number }[];
  recent: { id: string; name: string; path: string | null; createdAt: string }[];
};

export function AdminAnalyticsClient() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Failed');
        setData(j);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!data) return <p style={{ color: '#8b9bb4' }}>Loading…</p>;

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          ['Page views', data.pageViews],
          ['Contact sales', data.contactSales],
          ['Events', data.totalEvents],
          ['Workspaces', data.workspaceCount],
          ['Users', data.userCount],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            style={{
              background: '#1a2332',
              borderRadius: 10,
              padding: '1rem',
              border: '1px solid #2d3a4f',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#8b9bb4' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem' }}>Top paths</h2>
      <ul style={{ color: '#c5d0e0' }}>
        {data.topPaths.map((p) => (
          <li key={p.path || 'none'}>
            {p.path || '(none)'} · {p.count}
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: '1rem' }}>Recent events</h2>
      <ul style={{ color: '#c5d0e0', fontSize: '0.9rem' }}>
        {data.recent.map((e) => (
          <li key={e.id}>
            {e.name} {e.path || ''} · {new Date(e.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </>
  );
}
