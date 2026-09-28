import { describe, it, expect } from 'vitest';
import { runAudit, clearAuditCache } from './client';

describe('runAudit', () => {
  it('returns simulated score and findings', async () => {
    clearAuditCache();
    const r = await runAudit('https://demo-dental.example', { simulation: true });
    expect(r.simulated).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.findings.length).toBeGreaterThan(0);
    expect(r.url).toContain('demo-dental');
  });

  it('caches by URL', async () => {
    clearAuditCache();
    const a = await runAudit('https://cache-test.example', { simulation: true });
    const b = await runAudit('https://cache-test.example', { simulation: true });
    expect(b.raw?.cacheHit).toBe(true);
    expect(a.score).toBe(b.score);
  });
});
