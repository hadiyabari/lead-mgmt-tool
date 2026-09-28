import { describe, it, expect } from 'vitest';
import { normalizeEmail } from './email';

describe('normalizeEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeEmail('  Foo.Bar@Example.COM ')).toBe('foo.bar@example.com');
  });

  it('strips mailto and angle brackets', () => {
    expect(normalizeEmail('mailto:User@Example.com')).toBe('user@example.com');
    expect(normalizeEmail('<user@example.com>')).toBe('user@example.com');
  });

  it('collapses gmail dots', () => {
    expect(normalizeEmail('john.doe@gmail.com')).toBe('johndoe@gmail.com');
    expect(normalizeEmail('j.o.h.n@googlemail.com')).toBe('john@gmail.com');
  });

  it('keeps plus tags', () => {
    expect(normalizeEmail('user+tag@example.com')).toBe('user+tag@example.com');
  });

  it('returns null for invalid', () => {
    expect(normalizeEmail('')).toBeNull();
    expect(normalizeEmail('not-an-email')).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });

  it('treats same person under different casings as equal', () => {
    const a = normalizeEmail('Dr.Smith@Clinic.COM');
    const b = normalizeEmail('dr.smith@clinic.com');
    expect(a).toBe(b);
  });
});
