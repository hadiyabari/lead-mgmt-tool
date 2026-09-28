import type { SourceAdapter, DiscoverQuery, AdapterContext, DiscoverResult } from '../types';

/** Simulation-friendly dummy adapter for framework tests. */
export const dummyAdapter: SourceAdapter = {
  id: 'DUMMY',
  name: 'Dummy (simulation)',
  countries: ['US', 'UK', 'AU'],
  kind: 'primary',

  async discover(query: DiscoverQuery, ctx: AdapterContext): Promise<DiscoverResult> {
    const limit = query.limit ?? 5;
    const leads = Array.from({ length: limit }).map((_, i) => ({
      companyName: `Demo ${query.vertical ?? 'Clinic'} ${i + 1}`,
      website: `https://example.com/demo-${i + 1}`,
      domain: 'example.com',
      country: query.country ?? 'US',
      region: query.region ?? 'CA',
      city: query.city ?? 'Demo City',
      vertical: query.vertical ?? 'DENTAL_ORTHO',
      sourceProvider: 'DUMMY' as const,
      sourceRef: `dummy-${i + 1}`,
      sourceMeta: { simulated: true },
    }));
    ctx.log?.('info', 'dummy.discover', { count: leads.length });
    return { leads, simulated: true };
  },
};
