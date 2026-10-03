'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Item = {
  id: string;
  normalizedEmail: string | null;
  normalizedPhone: string | null;
  domain: string | null;
  reason: string | null;
  source: string | null;
  createdAt: string;
};

export function SuppressionClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [domain, setDomain] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/suppression');
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
    const res = await fetch('/api/suppression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email || undefined,
        phone: phone || undefined,
        domain: domain || undefined,
        reason: reason || 'manual',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setEmail('');
    setPhone('');
    setDomain('');
    setReason('');
    await load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/suppression/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Delete failed');
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
        <strong>Add suppression</strong>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={inputStyle}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          style={inputStyle}
        />
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Domain"
          style={inputStyle}
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>
          Add
        </button>
      </form>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No suppressions.</p>}
        {items.map((item) => (
          <div
            key={item.id}
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
              <div style={{ fontWeight: 600 }}>
                {item.normalizedEmail || item.normalizedPhone || item.domain || '—'}
              </div>
              <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
                {[item.reason, item.source, new Date(item.createdAt).toLocaleString()]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
            <button type="button" style={btnStyle} onClick={() => remove(item.id)}>
              Remove
            </button>
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
