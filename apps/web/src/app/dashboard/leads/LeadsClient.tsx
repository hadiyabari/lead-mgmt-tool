'use client';

import { useCallback, useEffect, useState } from 'react';

type LeadItem = {
  id: string;
  companyName: string;
  domain: string | null;
  primaryEmail: string | null;
  city: string | null;
  region: string | null;
  status: string;
  scores?: { totalScore: number }[];
  auditResults?: { score: number }[];
};

export function LeadsClient() {
  const [items, setItems] = useState<LeadItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q.trim()) params.set('q', q.trim());
    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setItems(data.items || []);
    setCounts(data.counts || {});
    setError(null);
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function draftEmail(id: string) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/leads/${id}/draft-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulation: true }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Draft failed');
    setBusyId(null);
  }

  const statuses = ['', 'DISCOVERED', 'SCORED', 'QUALIFIED', 'CONTACTED', 'REPLIED', 'MEETING_BOOKED', 'SUPPRESSED'];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company, domain, email"
          style={{
            background: '#0a1018',
            border: '1px solid #2d3a4f',
            borderRadius: 8,
            padding: '8px 10px',
            color: '#e7ecf3',
            minWidth: 220,
          }}
        />
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatus(s)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: status === s ? '1px solid #4f8cff' : '1px solid #2d3a4f',
              background: status === s ? '#1a2d4a' : '#121a26',
              color: '#e7ecf3',
              cursor: 'pointer',
            }}
          >
            {s || 'All'}{s && counts[s] != null ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No leads.</p>}
        {items.map((l) => (
          <div
            key={l.id}
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
              <strong>{l.companyName}</strong>
              <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
                {l.status}
                {l.domain ? ` · ${l.domain}` : ''}
                {l.primaryEmail ? ` · ${l.primaryEmail}` : ''}
                {l.city ? ` · ${l.city}${l.region ? `, ${l.region}` : ''}` : ''}
              </div>
              <div style={{ fontSize: 13, marginTop: 6, color: '#c5d0e0' }}>
                {l.scores?.[0] != null ? `Score ${l.scores[0].totalScore}` : 'No score'}
                {l.auditResults?.[0] != null ? ` · Audit ${l.auditResults[0].score}` : ''}
              </div>
              <div style={{ fontSize: 11, color: '#6b7a90', marginTop: 4 }}>ID {l.id}</div>
            </div>
            {l.primaryEmail && (
              <button
                type="button"
                disabled={busyId === l.id}
                onClick={() => draftEmail(l.id)}
                style={{
                  background: '#1a2d4a',
                  border: '1px solid #2d3a4f',
                  borderRadius: 8,
                  padding: '6px 10px',
                  color: '#e7ecf3',
                  cursor: 'pointer',
                  height: 36,
                }}
              >
                {busyId === l.id ? 'Drafting…' : 'Draft email'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
