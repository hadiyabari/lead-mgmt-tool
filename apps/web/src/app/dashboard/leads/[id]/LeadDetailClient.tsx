'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';

type LeadDetail = {
  id: string;
  companyName: string;
  domain: string | null;
  website: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  vertical: string | null;
  status: string;
  sourceProvider: string | null;
  scores?: { totalScore: number; scoredAt: string }[];
  auditResults?: { score: number; auditedAt: string; findings: unknown }[];
  enrichments?: { provider: string; rating: number | null; reviewCount: number | null }[];
  outbox?: { id: string; subject: string; status: string }[];
  sentEmails?: { id: string; subject: string; sentAt: string }[];
  replies?: { id: string; classification: string; receivedAt: string }[];
  meetings?: { id: string; title: string | null; startsAt: string; status: string }[];
};

export function LeadDetailClient({ id }: { id: string }) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/leads/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setLead(data.lead);
    setError(null);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(path: string) {
    setBusy(path);
    setError(null);
    const res = await fetch(`/api/leads/${id}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulation: true }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || `${path} failed`);
    await load();
    setBusy(null);
  }

  async function bookMeeting(e: FormEvent) {
    e.preventDefault();
    setBusy('meeting');
    setError(null);
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: id,
        startsAt: new Date(startsAt).toISOString(),
        meetingUrl: meetingUrl || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Meeting failed');
    else {
      setStartsAt('');
      setMeetingUrl('');
    }
    await load();
    setBusy(null);
  }

  if (!lead && !error) {
    return <p style={{ color: '#8b9bb4' }}>Loading…</p>;
  }
  if (!lead) {
    return <p style={{ color: '#f87171' }}>{error || 'Not found'}</p>;
  }

  return (
    <div>
      <p style={{ marginBottom: 12 }}>
        <Link href="/dashboard/leads" style={{ color: '#8b9bb4' }}>
          Leads
        </Link>
      </p>

      <div
        style={{
          background: '#1a2332',
          border: '1px solid #2d3a4f',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>{lead.companyName}</h2>
        <div style={{ color: '#8b9bb4', fontSize: 13, marginTop: 6 }}>
          {lead.status}
          {lead.domain ? ` · ${lead.domain}` : ''}
          {lead.country ? ` · ${lead.country}` : ''}
          {lead.vertical ? ` · ${lead.vertical}` : ''}
        </div>
        <div style={{ marginTop: 10, fontSize: 14 }}>
          {lead.website && (
            <div>
              <a href={lead.website} target="_blank" rel="noreferrer">
                {lead.website}
              </a>
            </div>
          )}
          {lead.primaryEmail && <div>{lead.primaryEmail}</div>}
          {lead.primaryPhone && <div>{lead.primaryPhone}</div>}
          {(lead.city || lead.region) && (
            <div>{[lead.city, lead.region].filter(Boolean).join(', ')}</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          <button type="button" style={btnStyle} disabled={!!busy} onClick={() => act('enrich')}>
            {busy === 'enrich' ? '…' : 'Enrich'}
          </button>
          <button type="button" style={btnStyle} disabled={!!busy} onClick={() => act('audit')}>
            {busy === 'audit' ? '…' : 'Audit'}
          </button>
          <button type="button" style={btnStyle} disabled={!!busy} onClick={() => act('score')}>
            {busy === 'score' ? '…' : 'Score'}
          </button>
          <button type="button" style={btnStyle} disabled={!!busy} onClick={() => act('draft-email')}>
            {busy === 'draft-email' ? '…' : 'Draft email'}
          </button>
        </div>
        {error && <p style={{ color: '#f87171', marginTop: 10 }}>{error}</p>}
      </div>

      <form
        onSubmit={bookMeeting}
        style={{
          background: '#1a2332',
          border: '1px solid #2d3a4f',
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          display: 'grid',
          gap: 10,
          maxWidth: 420,
        }}
      >
        <strong>Book meeting</strong>
        <input
          type="datetime-local"
          required
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          style={inputStyle}
        />
        <input
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
          placeholder="Meeting URL"
          style={inputStyle}
        />
        <button type="submit" style={btnStyle} disabled={!!busy}>
          {busy === 'meeting' ? '…' : 'Schedule'}
        </button>
      </form>

      <Section title="Scores">
        {(lead.scores || []).length === 0 && <Empty />}
        {(lead.scores || []).map((s, i) => (
          <Row key={i} label={`${s.totalScore}`} sub={new Date(s.scoredAt).toLocaleString()} />
        ))}
      </Section>

      <Section title="Audits">
        {(lead.auditResults || []).length === 0 && <Empty />}
        {(lead.auditResults || []).map((a, i) => (
          <Row key={i} label={`Score ${a.score}`} sub={new Date(a.auditedAt).toLocaleString()} />
        ))}
      </Section>

      <Section title="Enrichments">
        {(lead.enrichments || []).length === 0 && <Empty />}
        {(lead.enrichments || []).map((e, i) => (
          <Row
            key={i}
            label={e.provider}
            sub={`${e.rating != null ? `rating ${e.rating}` : ''} ${e.reviewCount != null ? `reviews ${e.reviewCount}` : ''}`.trim()}
          />
        ))}
      </Section>

      <Section title="Outbox">
        {(lead.outbox || []).length === 0 && <Empty />}
        {(lead.outbox || []).map((o) => (
          <Row key={o.id} label={o.subject} sub={o.status} />
        ))}
      </Section>

      <Section title="Sent">
        {(lead.sentEmails || []).length === 0 && <Empty />}
        {(lead.sentEmails || []).map((s) => (
          <Row key={s.id} label={s.subject} sub={new Date(s.sentAt).toLocaleString()} />
        ))}
      </Section>

      <Section title="Replies">
        {(lead.replies || []).length === 0 && <Empty />}
        {(lead.replies || []).map((r) => (
          <Row key={r.id} label={r.classification} sub={new Date(r.receivedAt).toLocaleString()} />
        ))}
      </Section>

      <Section title="Meetings">
        {(lead.meetings || []).length === 0 && <Empty />}
        {(lead.meetings || []).map((m) => (
          <Row
            key={m.id}
            label={m.title || m.status}
            sub={`${m.status} · ${new Date(m.startsAt).toLocaleString()}`}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#1a2332',
        border: '1px solid #2d3a4f',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ padding: '6px 0', borderTop: '1px solid #2d3a4f' }}>
      <div>{label}</div>
      {sub && <div style={{ color: '#8b9bb4', fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

function Empty() {
  return <div style={{ color: '#8b9bb4', fontSize: 13 }}>None</div>;
}

const btnStyle: React.CSSProperties = {
  background: '#1a2d4a',
  border: '1px solid #2d3a4f',
  borderRadius: 8,
  padding: '6px 10px',
  color: '#e7ecf3',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  background: '#0a1018',
  border: '1px solid #2d3a4f',
  borderRadius: 8,
  padding: '8px 10px',
  color: '#e7ecf3',
};
