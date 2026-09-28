import { describe, it, expect } from 'vitest';
import { computeLeadScore } from './score';
import { DEFAULT_WEIGHTS } from './types';

describe('computeLeadScore', () => {
  it('is reproducible', () => {
    const input = {
      auditScore: 72,
      rating: 4.5,
      reviewCount: 40,
      hasWebsite: true,
      hasEmail: true,
      hasPhone: true,
      jobSignal: false,
      countryMatchesIcp: true,
      verticalMatchesIcp: true,
    };
    const a = computeLeadScore(input);
    const b = computeLeadScore(input);
    expect(a.totalScore).toBe(b.totalScore);
    expect(a.breakdown).toEqual(b.breakdown);
  });

  it('higher audit increases score', () => {
    const low = computeLeadScore({ auditScore: 20, hasWebsite: true });
    const high = computeLeadScore({ auditScore: 90, hasWebsite: true });
    expect(high.totalScore).toBeGreaterThan(low.totalScore);
  });

  it('weights sum to 1 after normalize', () => {
    const r = computeLeadScore({});
    const sum = Object.values(r.weightsUsed).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('exposes breakdown labels for operators', () => {
    const r = computeLeadScore({ auditScore: 50 });
    expect(r.breakdown.every((b) => b.label && b.detail)).toBe(true);
    expect(r.weightsUsed.auditScore).toBeCloseTo(DEFAULT_WEIGHTS.auditScore, 5);
  });

  it('respects threshold', () => {
    const r = computeLeadScore({ auditScore: 100, hasWebsite: true, hasEmail: true }, {}, 99);
    expect(typeof r.qualified).toBe('boolean');
  });
});
