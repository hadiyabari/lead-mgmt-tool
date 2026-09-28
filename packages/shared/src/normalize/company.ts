/**
 * Company name normalisation for dedup – lowercase, strip legal suffixes, collapse whitespace.
 */

const LEGAL_SUFFIXES = [
  'llc',
  'l.l.c.',
  'ltd',
  'ltd.',
  'limited',
  'inc',
  'inc.',
  'incorporated',
  'corp',
  'corp.',
  'corporation',
  'plc',
  'llp',
  'lp',
  'co',
  'co.',
  'company',
  'pty',
  'pty ltd',
  'proprietary',
  'gmbh',
  'ag',
  'sa',
  'bv',
  'nv',
];

export function normalizeCompanyName(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let s = String(raw).trim().toLowerCase();
  if (!s) return null;

  // Unify punctuation / whitespace
  s = s.replace(/[\u2018\u2019']/g, "'");
  s = s.replace(/["\u201c\u201d]/g, '');
  s = s.replace(/[&]/g, ' and ');
  s = s.replace(/[^a-z0-9\s.'-]/gi, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  // Strip trailing legal suffixes repeatedly
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of LEGAL_SUFFIXES) {
      const re = new RegExp(`\\s+${suffix.replace(/\./g, '\\.')}$`, 'i');
      if (re.test(s)) {
        s = s.replace(re, '').trim();
        changed = true;
      }
    }
  }

  return s || null;
}
