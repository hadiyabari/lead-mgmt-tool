import { describe, it, expect } from 'vitest';
import { companiesHouseUkAdapter } from './companies-house-uk';

describe('companiesHouseUkAdapter', () => {
  it('simulates Ltd companies only pattern', async () => {
    const result = await companiesHouseUkAdapter.discover(
      { searchTerms: ['dental'], limit: 2, simulation: true },
      { simulation: true }
    );
    expect(result.leads.every((l) => l.sourceMeta?.company_type === 'ltd')).toBe(true);
    expect(result.leads[0].country).toBe('UK');
  });
});
