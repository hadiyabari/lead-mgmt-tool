'use client';

import { useCallback, useEffect, useState } from 'react';

type RunItem = {
  id: string;
  name: string | null;
  status: string;
  isSimulation: boolean;
  leadsFound: number;
  leadsQualified: number;
  creditsUsed: number;
  maxCredits: number | null;
  errorMessage: string | null;
  createdAt: string;
};

export function RunsClient() {
  const [items, setItems] = useState<RunItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/runs');
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setItems(data.items || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createAndRun() {
    setBusy(true);
    setError(null);
    setLog(null);
    try {
      const create = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalLeadCount: 3, isSimulation: true }),
      });
      const created = await create.json();
      if (!create.ok) {
        setError(created.error || 'Create failed');
        setBusy(false);
        return;
      }
      const exec = await fetch(`/api/runs/${created.item.id}/execute`, { method: 'POST' });
      const result = await exec.json();
      if (!exec.ok) {
        setError(result.error || 'Execute failed');
      } else {
        setLog(result.log || []);
      }
      await load();
    } catch {
      setError('Network error');
    }
    setBusy(false);
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={createAndRun}
        style={{
          background: '#1a2d4a',
          border: '1px solid #2d3a4f',
          borderRadius: 8,
          padding: '10px 14px',
          color: '#e7ecf3',
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        {busy ? 'Running…' : 'Start simulation run'}
      </button>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {log && (
        <pre
          style={{
            background: '#0a1018',
            border: '1px solid #2d3a4f',
            borderRadius: 8,
            padding: 12,
            color: '#c5d0e0',
            fontSize: 13,
            marginBottom: 16,
            whiteSpace: 'pre-wrap',
          }}
        >
          {log.join('\n')}
        </pre>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No runs yet.</p>}
        {items.map((r) => (
          <div
            key={r.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <strong>{r.name || r.id}</strong>
            <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
              {r.status}
              {r.isSimulation ? ' · simulation' : ''}
              {` · found ${r.leadsFound} · qualified ${r.leadsQualified} · credits ${r.creditsUsed}`}
            </div>
            {r.errorMessage && (
              <div style={{ color: '#f87171', fontSize: 13, marginTop: 6 }}>{r.errorMessage}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
