'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  planCode: string | null;
  killSwitch: boolean;
  _count?: { users: number; leads: number };
};

export function TenantsClient() {
  const [items, setItems] = useState<WorkspaceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [planCode, setPlanCode] = useState('starter');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/workspaces');
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
    const res = await fetch('/api/admin/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        planCode,
        ownerEmail,
        ownerPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setName('');
    setSlug('');
    setOwnerEmail('');
    setOwnerPassword('');
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
        <strong>Provision workspace</strong>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Agency name" style={inputStyle} />
        <input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-lowercase" style={inputStyle} />
        <input value={planCode} onChange={(e) => setPlanCode(e.target.value)} placeholder="planCode" style={inputStyle} />
        <input required type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="Owner email" style={inputStyle} />
        <input required type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="Owner password (min 10)" style={inputStyle} />
        <button type="submit" style={btnStyle}>
          Create tenant
        </button>
      </form>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((w) => (
          <div
            key={w.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <strong>{w.name}</strong>
            <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
              {w.slug}
              {w.planCode ? ` · ${w.planCode}` : ''}
              {w.killSwitch ? ' · kill switch ON' : ''}
              {w._count ? ` · users ${w._count.users} · leads ${w._count.leads}` : ''}
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
