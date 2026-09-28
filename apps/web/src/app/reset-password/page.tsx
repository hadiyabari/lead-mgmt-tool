'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, workspaceSlug: 'threezero' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Request failed');
      } else {
        setMessage(data.message);
        setStep('confirm');
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          workspaceSlug: 'threezero',
          token,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed');
      } else {
        setMessage('Password updated. You can sign in now.');
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Reset password</h1>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.ok}>{message}</p>}

        {step === 'request' ? (
          <form onSubmit={onRequest} style={styles.form}>
            <label style={styles.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </label>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Sending…' : 'Request reset'}
            </button>
          </form>
        ) : (
          <form onSubmit={onConfirm} style={styles.form}>
            <p style={styles.sub}>
              In development the token is logged on the server. Paste it below.
            </p>
            <label style={styles.label}>
              Token
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={12}
                style={styles.input}
              />
            </label>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Updating…' : 'Set new password'}
            </button>
          </form>
        )}

        <p style={styles.footer}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f1419',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: '2rem',
    background: '#1a2332',
    borderRadius: 12,
    color: '#e7ecf3',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  h1: { margin: '0 0 1rem', fontSize: '1.5rem' },
  sub: { margin: 0, color: '#8b9bb4', fontSize: '0.85rem' },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem' },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: 8,
    border: '1px solid #2d3a4f',
    background: '#0f1419',
    color: '#e7ecf3',
    fontSize: '1rem',
  },
  button: {
    padding: '0.7rem',
    borderRadius: 8,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: { color: '#f87171', fontSize: '0.9rem' },
  ok: { color: '#4ade80', fontSize: '0.9rem' },
  footer: { marginTop: '1rem', fontSize: '0.85rem', color: '#8b9bb4' },
};
