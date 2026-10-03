'use client';

import { FormEvent, useEffect, useState } from 'react';

export function WorkspaceForm({ canEdit }: { canEdit: boolean }) {
  const [name, setName] = useState('');
  const [legalAddress, setLegalAddress] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/workspace')
      .then((r) => r.json())
      .then((data) => {
        if (data.workspace) {
          setName(data.workspace.name || '');
          setLegalAddress(data.workspace.legalAddress || '');
          setPrimaryDomain(data.workspace.primaryDomain || '');
          setSlug(data.workspace.slug || '');
        }
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setBusy(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          legalAddress: legalAddress || null,
          primaryDomain: primaryDomain || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Failed');
      else setOk(true);
    } catch {
      setError('Network error');
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
      <div className="card-label">Workspace profile</div>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Slug: {slug}</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={!canEdit}
        placeholder="Name"
        style={inputStyle}
      />
      <input
        value={legalAddress}
        onChange={(e) => setLegalAddress(e.target.value)}
        disabled={!canEdit}
        placeholder="Legal address"
        style={inputStyle}
      />
      <input
        value={primaryDomain}
        onChange={(e) => setPrimaryDomain(e.target.value)}
        disabled={!canEdit}
        placeholder="Primary domain"
        style={inputStyle}
      />
      {canEdit && (
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save workspace'}
        </button>
      )}
      {error && <p style={{ color: '#f87171', margin: 0 }}>{error}</p>}
      {ok && <p style={{ color: '#4ade80', margin: 0 }}>Saved.</p>}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#0a1018',
  border: '1px solid #2d3a4f',
  borderRadius: 8,
  padding: '8px 10px',
  color: '#e7ecf3',
};
