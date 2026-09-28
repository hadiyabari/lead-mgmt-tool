/**
 * Enrichment orchestrator – runs enrichment-kind adapters and merges results.
 */

import { listAdapters, getAdapter } from './registry';
import type {
  AdapterContext,
  EnrichInput,
  EnrichResult,
  SourceProviderId,
} from './types';

export type EnrichmentBundle = {
  merged: EnrichResult;
  byProvider: Partial<Record<SourceProviderId, EnrichResult>>;
};

const DEFAULT_ENRICHERS: SourceProviderId[] = [
  'GOOGLE_PLACES_ENRICH',
  'YELP_ENRICH',
  'WEBSITE_EXTRACT',
];

export async function enrichLead(
  input: EnrichInput,
  ctx: AdapterContext,
  providers: SourceProviderId[] = DEFAULT_ENRICHERS
): Promise<EnrichmentBundle> {
  const byProvider: EnrichmentBundle['byProvider'] = {};
  const merged: EnrichResult = { raw: {} };

  for (const id of providers) {
    const adapter = getAdapter(id);
    if (!adapter?.enrich) continue;
    try {
      const result = await adapter.enrich(input, ctx);
      byProvider[id] = result;
      if (result.rating != null && merged.rating == null) merged.rating = result.rating;
      if (result.reviewCount != null && merged.reviewCount == null) {
        merged.reviewCount = result.reviewCount;
      }
      if (result.website && !merged.website) merged.website = result.website;
      if (result.phone && !merged.phone) merged.phone = result.phone;
      if (result.email && !merged.email) merged.email = result.email;
      if (result.simulated) merged.simulated = true;
    } catch (e) {
      ctx.log?.('warn', 'enrich.provider_failed', {
        provider: id,
        error: e instanceof Error ? e.message : String(e),
      });
      byProvider[id] = {
        raw: { error: e instanceof Error ? e.message : String(e) },
      };
    }
  }

  return { merged, byProvider };
}

export function listEnrichmentAdapters() {
  return listAdapters().filter((a) => a.kind === 'enrichment');
}
