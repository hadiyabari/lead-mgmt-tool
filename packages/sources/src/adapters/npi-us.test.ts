import { describe, it, expect } from 'vitest';
import { npiUsAdapter } from './npi-us';

describe('npiUsAdapter', () => {
  it('returns simulated dental leads', async () => {
    const result = await npiUsAdapter.discover(
      { vertical: 'DENTAL_ORTHO', country: 'US', region: 'TX', limit: 2, simulation: true },
      { simulation: true }
    );
    expect(result.simulated).toBe(true);
    expect(result.leads.length).toBe(2);
    expect(result.leads[0].sourceProvider).toBe('NPI_US');
    expect(result.leads[0].country).toBe('US');
  });
});
