import { describe, it, expect } from 'vitest';
import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('strips formatting', () => {
    expect(normalizePhone('(555) 123-4567', 'US')).toBe('+15551234567');
  });

  it('preserves E.164 plus', () => {
    expect(normalizePhone('+44 7700 900123')).toBe('+447700900123');
  });

  it('handles UK leading zero', () => {
    expect(normalizePhone('07700 900123', 'UK')).toBe('+447700900123');
  });

  it('handles AU', () => {
    expect(normalizePhone('0412 345 678', 'AU')).toBe('+61412345678');
  });

  it('returns null for too short', () => {
    expect(normalizePhone('12345')).toBeNull();
  });
});
