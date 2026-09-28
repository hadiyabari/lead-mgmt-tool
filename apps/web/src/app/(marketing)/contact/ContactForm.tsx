'use client';

import { FormEvent, useState } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          company: fd.get('company'),
          phone: fd.get('phone'),
          message: fd.get('message'),
          planInterest: fd.get('planInterest'),
        }),
      });
      setStatus(res.ok ? 'ok' : 'err');
      if (res.ok) e.currentTarget.reset();
    } catch {
      setStatus('err');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="m-label">
        Name
        <input className="m-input" name="name" required autoComplete="name" />
      </label>
      <label className="m-label">
        Work email
        <input className="m-input" name="email" type="email" required autoComplete="email" />
      </label>
      <label className="m-label">
        Agency name
        <input className="m-input" name="company" required />
      </label>
      <label className="m-label">
        Phone
        <input className="m-input" name="phone" type="tel" autoComplete="tel" />
      </label>
      <label className="m-label">
        Plan interest
        <select className="m-input" name="planInterest" defaultValue="Growth">
          <option>Starter</option>
          <option>Growth</option>
          <option>Enterprise</option>
          <option>Not sure</option>
        </select>
      </label>
      <label className="m-label">
        Message
        <textarea className="m-input" name="message" rows={4} required />
      </label>
      <button type="submit" className="m-btn m-btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Sending…' : 'Send to sales'}
      </button>
      {status === 'ok' && (
        <p style={{ color: 'var(--m-accent2)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
          Message received. Sales will respond on a business day.
        </p>
      )}
      {status === 'err' && (
        <p style={{ color: '#f87171', marginTop: '0.75rem', fontSize: '0.9rem' }}>
          Could not send. Call 03293318181 or try again.
        </p>
      )}
    </form>
  );
}
