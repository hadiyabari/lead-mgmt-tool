'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Playbook = {
  id: string;
  name: string;
  offerName: string | null;
  offerSummary: string | null;
  isActive: boolean;
};

export function PlaybooksClient() {
  const [items, setItems] = useState<Playbook[]>([]);
  const [name, setName] = useState('');
  const [offerName, setOfferName] = useState('');
  const [offerSummary, setOfferSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/playbooks');
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
    const res = await fetch('/api/playbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, offerName, offerSummary }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setName('');
    setOfferName('');
    setOfferSummary('');
    await load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/playbooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/playbooks/${id}`, { method: 'DELETE' });
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
        <strong>New playbook</strong>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={inputStyle}
        />
        <input
          value={offerName}
          onChange={(e) => setOfferName(e.target.value)}
          placeholder="Offer name"
          style={inputStyle}
        />
        <textarea
          value={offerSummary}
          onChange={(e) => setOfferSummary(e.target.value)}
          placeholder="Offer summary"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <button type="submit" style={btnStyle}>
          Create
        </button>
      </form>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No playbooks.</p>}
        {items.map((p) => (
          <div
            key={p.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <strong>{p.name}</strong>
            <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
              {p.isActive ? 'Active' : 'Inactive'}
              {p.offerName ? ` · ${p.offerName}` : ''}
            </div>
            {p.offerSummary && (
              <p style={{ marginTop: 8, fontSize: 14, color: '#c5d0e0' }}>{p.offerSummary}</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" style={btnStyle} onClick={() => toggleActive(p.id, p.isActive)}>
                {p.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button type="button" style={btnStyle} onClick={() => remove(p.id)}>
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
