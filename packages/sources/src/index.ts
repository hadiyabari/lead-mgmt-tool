/**
 * @leadpilot/sources – adapter framework + official registry adapters
 */

export * from './types';
export { httpJson, resetCircuits } from './http';
export { registerAdapter, getAdapter, listAdapters, listPrimaryAdapters } from './registry';

export { dummyAdapter } from './adapters/dummy';
export { npiUsAdapter } from './adapters/npi-us';
export { stateLicenseUsAdapter, createStateLicenseAdapter } from './adapters/state-license-us';
export { companiesHouseUkAdapter } from './adapters/companies-house-uk';
export { abnAuAdapter, healthRegisterAuAdapter } from './adapters/abn-au';

import { registerAdapter } from './registry';
import { dummyAdapter } from './adapters/dummy';
import { npiUsAdapter } from './adapters/npi-us';
import { stateLicenseUsAdapter } from './adapters/state-license-us';
import { companiesHouseUkAdapter } from './adapters/companies-house-uk';
import { abnAuAdapter, healthRegisterAuAdapter } from './adapters/abn-au';

/** Register all built-in adapters (idempotent). */
export function registerBuiltinAdapters() {
  const all = [
    dummyAdapter,
    npiUsAdapter,
    stateLicenseUsAdapter,
    companiesHouseUkAdapter,
    abnAuAdapter,
    healthRegisterAuAdapter,
  ];
  for (const a of all) registerAdapter(a);
  return all;
}

// Auto-register on import
registerBuiltinAdapters();
