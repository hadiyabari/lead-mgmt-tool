/**
 * Google Places enrichment (licensed Places API).
 * List-building via Maps scraping is forbidden; enrichment of known businesses only.
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

type PlacesTextSearch = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    websiteUri?: string;
    nationalPhoneNumber?: string;
    rating?: number;
    userRatingCount?: number;
  }>;
};

export const googlePlacesAdapter: SourceAdapter = {
  id: 'GOOGLE_PLACES_ENRICH',
  name: 'Google Places (enrichment only)',
  countries: ['US', 'UK', 'AU'],
  kind: 'enrichment',

  async discover(_query: DiscoverQuery, _ctx: AdapterContext): Promise<DiscoverResult> {
    // Never use Places as a primary list source
    return { leads: [], simulated: false };
  },

  async enrich(input: EnrichInput, ctx: AdapterContext): Promise<EnrichResult> {
    if (ctx.simulation || input.simulation) {
      return {
        simulated: true,
        rating: 4.2,
        reviewCount: 48,
        website: input.website || (input.domain ? `https://${input.domain}` : null),
        phone: '+15550100999',
        raw: { simulated: true, provider: 'GOOGLE_PLACES_ENRICH' },
      };
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY required for live Places enrichment');
    }

    const textQuery = [input.companyName, input.domain].filter(Boolean).join(' ');
    if (!textQuery) {
      return { raw: { error: 'missing_query' } };
    }

    // Places API (New) text search – enrichment only
    const data = await httpJson<PlacesTextSearch>('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount',
      },
      body: JSON.stringify({ textQuery, maxResultCount: 1 }),
      opts: { timeoutMs: 15_000, costPerCall: 1 },
    });

    const place = data.places?.[0];
    if (!place) return { raw: { empty: true } };

    return {
      rating: place.rating ?? null,
      reviewCount: place.userRatingCount ?? null,
      website: place.websiteUri ?? null,
      phone: place.nationalPhoneNumber ?? null,
      raw: { placeId: place.id, address: place.formattedAddress },
    };
  },
};
