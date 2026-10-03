'use client';

import { useCallback, useEffect, useState } from 'react';

type AnalyticsPayload = {
  days: number;
  totalEvents: number;
  uniqueSessions: number;
  byName: { name: string; count: number }[];
  byPath: { path: string | null; count: number }[];
  bySource: { source: string | null; count: number }[];
  recent: {
    id: string;
    name: string;
    path: string | null;
    utmSource: string | null;
    createdAt: string;
  }[];
};

export function AnalyticsClient() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/analytics?days=${days}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Failed');
      return;
    }
    setData(json);
    setError(null);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: days === d ? '1px solid #4f8cff' : '1px solid #2d3a4f',
              background: days === d ? '#1a2d4a' : '#121a26',
              color: '#e7ecf3',
              cursor: 'pointer',
            }}
          >
            {d}d
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {data && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Stat label="Events" value={String(data.totalEvents)} />
            <Stat label="Sessions" value={String(data.uniqueSessions)} />
          </div>

          <Panel title="Events by name">
            {data.byName.length === 0 && <Empty />}
            {data.byName.map((r) => (
              <Row key={r.name} left={r.name} right={String(r.count)} />
            ))}
          </Panel>

          <Panel title="Top paths">
            {data.byPath.length === 0 && <Empty />}
            {data.byPath.map((r) => (
              <Row key={r.path || 'none'} left={r.path || '—'} right={String(r.count)} />
            ))}
          </Panel>

          <Panel title="UTM sources">
            {data.bySource.length === 0 && <Empty />}
            {data.bySource.map((r) => (
              <Row key={r.source || 'none'} left={r.source || '—'} right={String(r.count)} />
            ))}
          </Panel>

          <Panel title="Recent">
            {data.recent.length === 0 && <Empty />}
            {data.recent.map((r) => (
              <Row
                key={r.id}
                left={`${r.name}${r.path ? ` · ${r.path}` : ''}`}
                right={new Date(r.createdAt).toLocaleString()}
              />
            ))}
          </Panel>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#1a2332',
        border: '1px solid #2d3a4f',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ color: '#8b9bb4', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#1a2332',
        border: '1px solid #2d3a4f',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '6px 0',
        borderTop: '1px solid #2d3a4f',
        fontSize: 13,
      }}
    >
      <span style={{ wordBreak: 'break-all' }}>{left}</span>
      <span style={{ color: '#8b9bb4', flexShrink: 0 }}>{right}</span>
    </div>
  );
}

function Empty() {
  return <div style={{ color: '#8b9bb4', fontSize: 13 }}>None</div>;
}
