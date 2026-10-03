'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type MeetingItem = {
  id: string;
  title: string | null;
  startsAt: string;
  endsAt: string | null;
  status: string;
  meetingUrl: string | null;
  notes: string | null;
  lead?: { id: string; companyName: string; primaryEmail: string | null } | null;
};

export function MeetingsClient() {
  const [items, setItems] = useState<MeetingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/meetings');
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
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        startsAt: new Date(startsAt).toISOString(),
        meetingUrl: meetingUrl || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Create failed');
      return;
    }
    setLeadId('');
    setStartsAt('');
    setMeetingUrl('');
    await load();
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/meetings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Update failed');
      return;
    }
    await load();
  }

  async function openCalendar(id: string, provider: 'google' | 'outlook' | 'ics') {
    if (provider === 'ics') {
      window.location.href = `/api/meetings/${id}/ics`;
      return;
    }
    const res = await fetch(`/api/meetings/${id}/calendar-links`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Links failed');
      return;
    }
    window.open(provider === 'google' ? data.google : data.outlook, '_blank');
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
        <strong>Book meeting</strong>
        <input
          placeholder="Lead ID"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Meeting URL (optional)"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>
          Schedule
        </button>
      </form>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 && <p style={{ color: '#8b9bb4' }}>No meetings.</p>}
        {items.map((m) => (
          <div
            key={m.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3a4f',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <strong>{m.title || m.lead?.companyName}</strong>
            <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 4 }}>
              {m.lead?.companyName} · {m.status} · {new Date(m.startsAt).toLocaleString()}
            </div>
            {m.meetingUrl && (
              <a href={m.meetingUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                Join link
              </a>
            )}
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <button type="button" style={btnStyle} onClick={() => openCalendar(m.id, 'ics')}>
                Download ICS
              </button>
              <button type="button" style={btnStyle} onClick={() => openCalendar(m.id, 'google')}>
                Google Calendar
              </button>
              <button type="button" style={btnStyle} onClick={() => openCalendar(m.id, 'outlook')}>
                Outlook
              </button>
              {['COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => (
                <button key={s} type="button" style={btnStyle} onClick={() => setStatus(m.id, s)}>
                  {s}
                </button>
              ))}
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
