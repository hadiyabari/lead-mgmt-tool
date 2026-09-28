/**
 * Domain normalisation – extract registrable-ish host from URL or bare domain.
 */

export function normalizeDomain(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let s = String(raw).trim().toLowerCase();
  if (!s) return null;

  // Strip protocol and path
  s = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  s = s.split('/')[0] ?? s;
  s = s.split('?')[0] ?? s;
  s = s.split('#')[0] ?? s;
  // Strip port
  s = s.replace(/:\d+$/, '');
  s = s.replace(/\.+$/, '').trim();

  if (!s || !s.includes('.')) return null;
  if (s.length > 253) return null;
  if (!/^[a-z0-9.-]+$/i.test(s)) return null;

  return s;
}

export function domainFromEmail(email: string | null | undefined): string | null {
  if (!email || !email.includes('@')) return null;
  const domain = email.split('@').pop()?.toLowerCase().trim();
  if (!domain || !domain.includes('.')) return null;
  return domain;
}
