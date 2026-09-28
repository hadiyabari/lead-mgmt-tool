'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [needMfa, setNeedMfa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        workspaceSlug: 'threezero',
        mfaToken: needMfa ? mfaToken : undefined,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes('MFA_REQUIRED') || res.error === 'MFA_REQUIRED') {
          setNeedMfa(true);
          setError('Enter your authenticator code');
        } else {
          setError('Invalid email or password');
        }
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h1 style={styles.h1}>LeadPilot</h1>
        <p style={styles.sub}>Threezero Agency</p>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={styles.input}
            disabled={needMfa}
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={styles.input}
            disabled={needMfa}
          />
        </label>

        {needMfa && (
          <label style={styles.label}>
            Authenticator code
            <input
              type="text"
              inputMode="numeric"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              required
              autoComplete="one-time-code"
              style={styles.input}
              placeholder="6-digit code"
            />
          </label>
        )}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in…' : needMfa ? 'Verify MFA' : 'Sign in'}
        </button>

        <p style={styles.footer}>
          <Link href="/reset-password">Forgot password?</Link>
          {' · '}
          <Link href="/register">Register</Link>
        </p>
      </form>
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
    maxWidth: 380,
    padding: '2rem',
    background: '#1a2332',
    borderRadius: 12,
    color: '#e7ecf3',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  h1: { margin: 0, fontSize: '1.5rem' },
  sub: { margin: 0, color: '#8b9bb4', fontSize: '0.9rem' },
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
    marginTop: '0.5rem',
    padding: '0.7rem',
    borderRadius: 8,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: { color: '#f87171', margin: 0, fontSize: '0.9rem' },
  footer: { margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#8b9bb4' },
};
