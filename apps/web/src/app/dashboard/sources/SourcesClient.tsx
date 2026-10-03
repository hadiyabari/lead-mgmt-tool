'use client';

import { useCallback, useEffect, useState } from 'react';

type Adapter = { id: string; name: string; countries: string[]; kind: string };
type Config = {
  id: string;
  provider: string;
  name: string;
  isEnabled: boolean;
  maxRequestsPerMinute: number;
};

export function SourcesClient() {
  const [adapters, setAdapters] = useState<Adapter[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [provider, setProvider] = useState('NPI_US');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [persist, setPersist] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/sources');
    const data = await res.json();
    if (res.ok) {
      setAdapters(data.adapters || []);
      setConfigs(data.configs || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(providerId: string, isEnabled: boolean) {
    await fetch(`/api/sources/${providerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled }),
    });
    load();
  }

  async function runDiscover() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/sources/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          vertical: 'DENTAL_ORTHO',
          limit: 5,
          simulation: true,
          persist,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Discover failed');
      else setResult(JSON.stringify(data, null, 2));
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  async function runBatch() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/sources/discover-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical: 'DENTAL_ORTHO',
          limitPerSource: 3,
          simulation: true,
          persist,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Batch failed');
      else setResult(JSON.stringify(data, null, 2));
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  const primaries = adapters.filter((a) => a.kind === 'primary');

  return (
    <>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-label">Adapters</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Provider</th>
              <th style={{ padding: 8 }}>Countries</th>
              <th style={{ padding: 8 }}>Kind</th>
              <th style={{ padding: 8 }}>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {adapters.map((a) => {
              const cfg = configs.find((c) => c.provider === a.id);
              return (
                <tr key={a.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>
                    <strong>{a.name}</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{a.id}</div>
                  </td>
                  <td style={{ padding: 8 }}>{a.countries.join(', ')}</td>
                  <td style={{ padding: 8 }}>{a.kind}</td>
                  <td style={{ padding: 8 }}>
                    {cfg ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => toggle(a.id, !cfg.isEnabled)}
                      >
                        {cfg.isEnabled ? 'On' : 'Off'}
                      </button>
                    ) : (
                      <span className="badge badge-muted">no config</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-label">Discover</div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={persist}
            onChange={(e) => setPersist(e.target.checked)}
          />
          Persist leads
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 8,
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            {primaries.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn" disabled={loading} onClick={runDiscover}>
            {loading ? 'Running…' : 'Discover one'}
          </button>
          <button type="button" className="btn" disabled={loading} onClick={runBatch}>
            {loading ? 'Running…' : 'Batch discover'}
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        {result && (
          <pre
            style={{
              background: 'var(--bg)',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 12,
              maxHeight: 360,
            }}
          >
            {result}
          </pre>
        )}
      </div>
    </>
  );
}
