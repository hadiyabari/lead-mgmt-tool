'use client';

import { FormEvent, useState } from 'react';

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed');
      } else {
        setOk(true);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch {
      setError('Network error');
    }
    setBusy(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card"
      style={{ display: 'grid', gap: 10, maxWidth: 420 }}
    >
      <div className="card-label">Change password</div>
      <input
        type="password"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Current password"
        style={inputStyle}
      />
      <input
        type="password"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
        style={inputStyle}
      />
      <button type="submit" className="btn" disabled={busy}>
        {busy ? 'Saving…' : 'Update password'}
      </button>
      {error && <p style={{ color: '#f87171', margin: 0 }}>{error}</p>}
      {ok && <p style={{ color: '#4ade80', margin: 0 }}>Password updated.</p>}
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
