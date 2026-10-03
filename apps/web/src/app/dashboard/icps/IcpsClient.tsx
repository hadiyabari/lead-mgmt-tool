'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Icp = {
  id: string;
  name: string;
  description: string | null;
  verticals: string[];
  countries: string[];
  minAuditScore: number | null;
  requireWebsite: boolean;
  isActive: boolean;
};

export function IcpsClient() {
  const [items, setItems] = useState<Icp[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/icps');
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
    const res = await fetch('/api/icps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setName('');
    setDescription('');
    await load();
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/icps/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/icps/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <form
        onSubmit={onCreate}
        style={{
          background: '#1a2332',
          border: '1px solid #2d3a4f',
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          display: 'grid',
          gap: 10,
          maxWidth: 520,
        }}
      >
        <strong>New ICP</strong>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={inputStyle}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <button type="submit" style={btnStyle}>
          Create
        </button>
      </form>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No ICPs.</p>}
        {items.map((icp) => (
          <div
            key={icp.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <strong>{icp.name}</strong>
            <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
              {icp.isActive ? 'Active' : 'Inactive'}
              {` · ${icp.countries.join(', ')}`}
              {` · ${icp.verticals.join(', ')}`}
              {icp.minAuditScore != null ? ` · min audit ${icp.minAuditScore}` : ''}
            </div>
            {icp.description && (
              <p style={{ marginTop: 8, fontSize: 14, color: '#c5d0e0' }}>{icp.description}</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" style={btnStyle} onClick={() => toggle(icp.id, icp.isActive)}>
                {icp.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button type="button" style={btnStyle} onClick={() => remove(icp.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#0a1018',
  border: '1px solid #2d3a4f',
  borderRadius: 8,
  padding: '8px 10px',
  color: '#e7ecf3',
};

const btnStyle: React.CSSProperties = {
  background: '#1a2d4a',
  border: '1px solid #2d3a4f',
  borderRadius: 8,
  padding: '6px 10px',
  color: '#e7ecf3',
  cursor: 'pointer',
};
