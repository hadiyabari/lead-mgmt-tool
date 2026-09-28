import { describe, it, expect } from 'vitest';
import { websiteExtractAdapter } from './website-extract';

describe('websiteExtractAdapter', () => {
  it('simulation returns contact fields', async () => {
    const r = await websiteExtractAdapter.enrich!(
      { website: 'https://example.com', simulation: true },
      { simulation: true }
    );
    expect(r.email).toBeTruthy();
    expect(r.phone).toBeTruthy();
  });
});
