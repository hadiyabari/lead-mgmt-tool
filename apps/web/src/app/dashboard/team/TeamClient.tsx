'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Member = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export function TeamClient() {
  const [items, setItems] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR' | 'VIEWER'>('OPERATOR');
  const [password, setPassword] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/team');
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
    setError(null);
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setEmail('');
    setName('');
    setPassword('');
    await load();
  }

  async function setMemberRole(id: string, next: string) {
    const res = await fetch(`/api/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: next }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Update failed');
      return;
    }
    await load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Remove failed');
      return;
    }
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
        <strong>Add member</strong>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={inputStyle}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={inputStyle}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          style={inputStyle}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="OPERATOR">OPERATOR</option>
          <option value="VIEWER">VIEWER</option>
        </select>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 10)"
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>
          Create
        </button>
      </form>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((m) => (
          <div
            key={m.id}
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
              <strong>{m.email}</strong>
              <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
                {m.name || '—'} · {m.role}
              </div>
            </div>
            {m.role !== 'OWNER' && m.role !== 'SUPER_ADMIN' && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['ADMIN', 'OPERATOR', 'VIEWER'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    style={btnStyle}
                    onClick={() => setMemberRole(m.id, r)}
                  >
                    {r}
                  </button>
                ))}
                <button type="button" style={btnStyle} onClick={() => remove(m.id)}>
                  Remove
                </button>
              </div>
            )}
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
