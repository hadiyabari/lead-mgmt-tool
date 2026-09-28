'use client';

import { useState } from 'react';

export function KillSwitch({
  initialActive,
  canToggle,
}: {
  initialActive: boolean;
  canToggle: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!canToggle) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !active }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update kill switch');
      } else {
        setActive(data.killSwitch);
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <div className={`kill-banner${active ? ' active' : ''}`}>
      <div>
        <strong>
          Kill switch{' '}
          <span className={`badge ${active ? 'badge-danger' : 'badge-ok'}`}>
            {active ? 'ACTIVE' : 'OFF'}
          </span>
        </strong>
        <p>
          {active
            ? 'All sending and new enrichment jobs are blocked for this workspace.'
            : 'Pipeline can send and enrich normally (subject to simulation mode).'}
        </p>
        {error && <p style={{ color: 'var(--danger)', marginTop: 6 }}>{error}</p>}
      </div>
      {canToggle && (
        <button
          type="button"
          className={active ? 'btn btn-ghost' : 'btn btn-danger'}
          onClick={toggle}
          disabled={loading}
        >
          {loading ? 'Updating…' : active ? 'Deactivate' : 'Activate kill switch'}
        </button>
      )}
    </div>
  );
}
