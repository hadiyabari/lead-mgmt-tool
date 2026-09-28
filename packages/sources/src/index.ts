/**
 * @leadpilot/sources – adapter framework + registry + enrichment
 */

export * from './types';
export { httpJson, resetCircuits } from './http';
export { registerAdapter, getAdapter, listAdapters, listPrimaryAdapters } from './registry';
export { enrichLead, listEnrichmentAdapters } from './enrich';
export type { EnrichmentBundle } from './enrich';

export { dummyAdapter } from './adapters/dummy';
export { npiUsAdapter } from './adapters/npi-us';
export { stateLicenseUsAdapter, createStateLicenseAdapter } from './adapters/state-license-us';
export { companiesHouseUkAdapter } from './adapters/companies-house-uk';
export { abnAuAdapter, healthRegisterAuAdapter } from './adapters/abn-au';
export { googlePlacesAdapter } from './adapters/google-places';
export { yelpAdapter } from './adapters/yelp';
export { websiteExtractAdapter } from './adapters/website-extract';
export { jobBoardAdapter } from './adapters/job-board';

import { registerAdapter } from './registry';
import { dummyAdapter } from './adapters/dummy';
import { npiUsAdapter } from './adapters/npi-us';
import { stateLicenseUsAdapter } from './adapters/state-license-us';
import { companiesHouseUkAdapter } from './adapters/companies-house-uk';
import { abnAuAdapter, healthRegisterAuAdapter } from './adapters/abn-au';
import { googlePlacesAdapter } from './adapters/google-places';
import { yelpAdapter } from './adapters/yelp';
import { websiteExtractAdapter } from './adapters/website-extract';
import { jobBoardAdapter } from './adapters/job-board';

export function registerBuiltinAdapters() {
  const all = [
    dummyAdapter,
    npiUsAdapter,
    stateLicenseUsAdapter,
    companiesHouseUkAdapter,
    abnAuAdapter,
    healthRegisterAuAdapter,
    googlePlacesAdapter,
    yelpAdapter,
    websiteExtractAdapter,
    jobBoardAdapter,
  ];
  for (const a of all) registerAdapter(a);
  return all;
}

registerBuiltinAdapters();
