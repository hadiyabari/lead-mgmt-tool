'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type CampaignItem = {
  id: string;
  name: string;
  status: string;
  isSimulation: boolean;
  playbook?: { name: string; offerName: string | null } | null;
  _count?: { outbox: number; sent: number };
};

export function CampaignsClient() {
  const [items, setItems] = useState<CampaignItem[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/campaigns');
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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, isSimulation: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setName('');
    await load();
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Update failed');
      return;
    }
    await load();
  }

  return (
    <div>
      <form
        onSubmit={onCreate}
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign name"
          required
          style={{
            background: '#0a1018',
            border: '1px solid #2d3a4f',
            borderRadius: 8,
            padding: '8px 10px',
            color: '#e7ecf3',
            minWidth: 220,
          }}
        />
        <button
          type="submit"
          style={{
            background: '#1a2d4a',
            border: '1px solid #2d3a4f',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#e7ecf3',
            cursor: 'pointer',
          }}
        >
          Create
        </button>
      </form>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No campaigns.</p>}
        {items.map((c) => (
          <div
            key={c.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <strong>{c.name}</strong>
            <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
              {c.status}
              {c.isSimulation ? ' · simulation' : ''}
              {c._count ? ` · outbox ${c._count.outbox} · sent ${c._count.sent}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(c.id, s)}
                  style={{
                    background: '#121a26',
                    border: '1px solid #2d3a4f',
                    borderRadius: 8,
                    padding: '6px 10px',
                    color: '#e7ecf3',
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
