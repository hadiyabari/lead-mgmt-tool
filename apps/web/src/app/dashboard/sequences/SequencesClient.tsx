'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Seq = {
  id: string;
  name: string;
  isActive: boolean;
  steps: { dayOffset: number; subject?: string; bodyHint?: string }[];
  campaign?: { id: string; name: string } | null;
};

export function SequencesClient() {
  const [items, setItems] = useState<Seq[]>([]);
  const [name, setName] = useState('');
  const [stepSubject, setStepSubject] = useState('Follow-up');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/sequences');
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
    const res = await fetch('/api/sequences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        steps: [
          { dayOffset: 0, subject: stepSubject, bodyHint: 'Initial outreach' },
          { dayOffset: 3, subject: `Re: ${stepSubject}`, bodyHint: 'Follow-up 1' },
          { dayOffset: 7, subject: `Re: ${stepSubject}`, bodyHint: 'Follow-up 2' },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setName('');
    await load();
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/sequences/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/sequences/${id}`, { method: 'DELETE' });
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
          maxWidth: 480,
        }}
      >
        <strong>New sequence</strong>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={inputStyle}
        />
        <input
          value={stepSubject}
          onChange={(e) => setStepSubject(e.target.value)}
          placeholder="Base subject"
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>
          Create (3-step default)
        </button>
      </form>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No sequences.</p>}
        {items.map((s) => (
          <div
            key={s.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <strong>{s.name}</strong>
            <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
              {s.isActive ? 'Active' : 'Inactive'}
              {s.campaign ? ` · ${s.campaign.name}` : ''}
              {` · ${Array.isArray(s.steps) ? s.steps.length : 0} steps`}
            </div>
            {Array.isArray(s.steps) && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, color: '#c5d0e0' }}>
                {s.steps.map((st, i) => (
                  <li key={i}>
                    Day {st.dayOffset}: {st.subject || '—'}
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" style={btnStyle} onClick={() => toggle(s.id, s.isActive)}>
                {s.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button type="button" style={btnStyle} onClick={() => remove(s.id)}>
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
