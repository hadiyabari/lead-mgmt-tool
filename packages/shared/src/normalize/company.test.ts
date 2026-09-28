import { describe, it, expect } from 'vitest';
import { normalizeCompanyName } from './company';

describe('normalizeCompanyName', () => {
  it('strips legal suffixes', () => {
    expect(normalizeCompanyName('Acme Dental LLC')).toBe('acme dental');
    expect(normalizeCompanyName('Bright Smile Ltd.')).toBe('bright smile');
    expect(normalizeCompanyName('MedSpa Inc')).toBe('medspa');
  });

  it('collapses whitespace and case', () => {
    expect(normalizeCompanyName('  Foo   &  Bar  Co. ')).toBe('foo and bar');
  });
});
