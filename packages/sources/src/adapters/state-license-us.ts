/**
 * US State licensing board pattern adapter.
 * Many boards expose searchable public rosters; endpoints differ by state.
 * This adapter defines the pattern + a configurable base URL for boards that
 * offer JSON/CSV open data. Default mode is simulation-safe.
 */

import type {
  SourceAdapter,
  DiscoverQuery,
  AdapterContext,
  DiscoverResult,
} from '../types';

export type StateLicenseConfig = {
  state: string;
  /** Official open-data or API endpoint (must be robots/API ToS compliant) */
  endpoint?: string;
  profession?: string;
};

export function createStateLicenseAdapter(config: StateLicenseConfig): SourceAdapter {
  return {
    id: 'STATE_LICENSE_US',
    name: `State License (${config.state})`,
    countries: ['US'],
    kind: 'primary',

    async discover(query: DiscoverQuery, ctx: AdapterContext): Promise<DiscoverResult> {
      const limit = Math.min(query.limit ?? 10, 50);

      // Without a configured official endpoint, only simulation output is returned.
      if (!config.endpoint || ctx.simulation || query.simulation) {
        return {
          simulated: true,
          leads: Array.from({ length: Math.min(limit, 3) }).map((_, i) => ({
            companyName: `${config.state} Licensed Practice ${i + 1}`,
            country: 'US' as const,
            region: config.state,
            vertical: query.vertical ?? ('DENTAL_ORTHO' as const),
            sourceProvider: 'STATE_LICENSE_US' as const,
            sourceRef: `${config.state}-sim-${i + 1}`,
            sourceMeta: {
              simulated: true,
              state: config.state,
              profession: config.profession ?? 'dental',
            },
          })),
        };
      }

      // Real HTTP path: board-specific parsing belongs in board plugins.
      // Placeholder keeps rate-limit / ToS discipline until a board is wired.
      ctx.log?.('warn', 'state_license.endpoint_not_parsed', {
        state: config.state,
        endpoint: config.endpoint,
      });
      return { leads: [], simulated: false };
    },
  };
}

/** Default CA dental pattern (simulation until endpoint configured). */
export const stateLicenseUsAdapter = createStateLicenseAdapter({
  state: 'CA',
  profession: 'dental',
});
