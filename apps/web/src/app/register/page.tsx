'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, workspaceSlug: 'threezero' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }
      router.push('/login');
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h1 style={styles.h1}>Create account</h1>
        <p style={styles.sub}>
          Only available when the workspace has no users yet (bootstrap).
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
        </label>

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

        <label style={styles.label}>
          Password (min 12 chars, upper, lower, number)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
            style={styles.input}
          />
        </label>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Creating…' : 'Register'}
        </button>

        <p style={styles.footer}>
          <Link href="/login">Back to sign in</Link>
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
    maxWidth: 400,
    padding: '2rem',
    background: '#1a2332',
    borderRadius: 12,
    color: '#e7ecf3',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  h1: { margin: 0, fontSize: '1.5rem' },
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
