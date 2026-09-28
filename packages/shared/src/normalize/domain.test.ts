import { describe, it, expect } from 'vitest';
import { normalizeDomain, domainFromEmail } from './domain';

describe('normalizeDomain', () => {
  it('strips protocol and www', () => {
    expect(normalizeDomain('https://www.Example.com/path')).toBe('example.com');
  });

  it('strips port', () => {
    expect(normalizeDomain('example.com:443')).toBe('example.com');
  });

  it('domainFromEmail', () => {
    expect(domainFromEmail('a@clinic.co.uk')).toBe('clinic.co.uk');
  });
});
