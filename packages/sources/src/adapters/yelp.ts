/**
 * Yelp Fusion enrichment (licensed API only).
 */

import { httpJson } from '../http';
import type {
  SourceAdapter,
  DiscoverQuery,
  DiscoverResult,
  EnrichInput,
  EnrichResult,
  AdapterContext,
} from '../types';

type YelpSearch = {
  businesses?: Array<{
    id?: string;
    name?: string;
    url?: string;
    phone?: string;
    rating?: number;
    review_count?: number;
  }>;
};

export const yelpAdapter: SourceAdapter = {
  id: 'YELP_ENRICH',
  name: 'Yelp (enrichment only)',
  countries: ['US', 'UK', 'AU'],
  kind: 'enrichment',

  async discover(): Promise<DiscoverResult> {
    return { leads: [] };
  },

  async enrich(input: EnrichInput, ctx: AdapterContext): Promise<EnrichResult> {
    if (ctx.simulation || input.simulation) {
      return {
        simulated: true,
        rating: 3.9,
        reviewCount: 22,
        phone: '+15550100888',
        raw: { simulated: true, provider: 'YELP_ENRICH' },
      };
    }

    const token = process.env.YELP_API_KEY;
    if (!token) {
      throw new Error('YELP_API_KEY required for live Yelp enrichment');
    }

    const term = input.companyName || input.domain;
    if (!term) return { raw: { error: 'missing_query' } };

    const params = new URLSearchParams({ term, limit: '1' });
    const data = await httpJson<YelpSearch>(`https://api.yelp.com/v3/businesses/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      opts: { timeoutMs: 15_000, costPerCall: 1 },
    });

    const b = data.businesses?.[0];
    if (!b) return { raw: { empty: true } };

    return {
      rating: b.rating ?? null,
      reviewCount: b.review_count ?? null,
      phone: b.phone ?? null,
      website: b.url ?? null,
      raw: { yelpId: b.id, name: b.name },
    };
  },
};
