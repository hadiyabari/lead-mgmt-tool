'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

export function MfaForm() {
  const [enabled, setEnabled] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/account/mfa/status');
    const data = await res.json();
    if (res.ok) setEnabled(Boolean(data.mfaEnabled));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function startSetup() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/account/mfa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Setup failed');
      else {
        setQr(data.qrDataUrl);
        setSecret(data.secret);
      }
    } catch {
      setError('Network error');
    }
    setBusy(false);
  }

  async function confirm(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/account/mfa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Confirm failed');
      else {
        setEnabled(true);
        setQr(null);
        setSecret(null);
        setToken('');
        setMessage('MFA enabled.');
      }
    } catch {
      setError('Network error');
    }
    setBusy(false);
  }

  async function disable(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/account/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token: token || undefined }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Disable failed');
      else {
        setEnabled(false);
        setPassword('');
        setToken('');
        setMessage('MFA disabled.');
      }
    } catch {
      setError('Network error');
    }
    setBusy(false);
  }

  return (
    <div className="card" style={{ marginTop: 16, maxWidth: 420 }}>
      <div className="card-label">Two-factor authentication</div>
      <p style={{ margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Status: {enabled ? 'Enabled' : 'Disabled'}
      </p>

      {!enabled && !qr && (
        <button type="button" className="btn" disabled={busy} onClick={startSetup}>
          Set up MFA
        </button>
      )}

      {qr && (
        <form onSubmit={confirm} style={{ display: 'grid', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="MFA QR" width={180} height={180} />
          {secret && (
            <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{secret}</code>
          )}
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="6-digit code"
            required
            style={inputStyle}
          />
          <button type="submit" className="btn" disabled={busy}>
            Confirm MFA
          </button>
        </form>
      )}

      {enabled && (
        <form onSubmit={disable} style={{ display: 'grid', gap: 10 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={inputStyle}
          />
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="MFA code"
            required
            style={inputStyle}
          />
          <button type="submit" className="btn" disabled={busy}>
            Disable MFA
          </button>
        </form>
      )}

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {message && <p style={{ color: '#4ade80' }}>{message}</p>}
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
