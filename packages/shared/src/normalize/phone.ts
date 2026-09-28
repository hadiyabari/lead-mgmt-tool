/**
 * Phone normalisation – E.164-ish digits only with leading + when country known.
 * Without explicit country we keep digits only (min 8) for matching.
 */

export function normalizePhone(
  raw: string | null | undefined,
  defaultCountry?: 'US' | 'UK' | 'AU' | string
): string | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;

  // Keep leading + if present, strip other non-digits
  const hasPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;

  if (hasPlus) {
    return `+${digits}`;
  }

  // Apply simple country defaults when no +
  if (defaultCountry === 'US' || defaultCountry === 'CA') {
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  }
  if (defaultCountry === 'UK' || defaultCountry === 'GB') {
    if (digits.length === 10 && digits.startsWith('7')) return `+44${digits}`;
    if (digits.startsWith('44')) return `+${digits}`;
    if (digits.startsWith('0') && digits.length === 11) return `+44${digits.slice(1)}`;
  }
  if (defaultCountry === 'AU') {
    if (digits.startsWith('0') && digits.length === 10) return `+61${digits.slice(1)}`;
    if (digits.startsWith('61')) return `+${digits}`;
  }

  // Fallback: digits only with + if looks international (11–15)
  if (digits.length >= 11) return `+${digits}`;
  return digits;
}

export function isValidNormalizedPhone(phone: string | null): phone is string {
  return typeof phone === 'string' && phone.replace(/\D/g, '').length >= 8;
}
