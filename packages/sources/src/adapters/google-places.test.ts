import { describe, it, expect } from 'vitest';
import { googlePlacesAdapter } from './google-places';

describe('googlePlacesAdapter', () => {
  it('enrich simulation returns rating', async () => {
    const r = await googlePlacesAdapter.enrich!(
      { companyName: 'Test Dental', domain: 'testdental.com', simulation: true },
      { simulation: true }
    );
    expect(r.simulated).toBe(true);
    expect(r.rating).toBeGreaterThan(0);
  });

  it('discover always empty (not a list source)', async () => {
    const d = await googlePlacesAdapter.discover({}, { simulation: true });
    expect(d.leads).toHaveLength(0);
  });
});
