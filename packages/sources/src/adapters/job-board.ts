/**
 * Job board intent signal – hiring = growth intent.
 * Uses official/licensed APIs only when keys present; otherwise simulation.
 * Not a primary list source for cold email without other registry data.
 */

import type {
  SourceAdapter,
  DiscoverQuery,
  DiscoverResult,
  EnrichInput,
  EnrichResult,
  AdapterContext,
  DiscoveredLead,
} from '../types';

export const jobBoardAdapter: SourceAdapter = {
  id: 'JOB_BOARD',
  name: 'Job Board Intent Signals',
  countries: ['US', 'UK', 'AU'],
  kind: 'primary',

  async discover(query: DiscoverQuery, ctx: AdapterContext): Promise<DiscoverResult> {
    const limit = Math.min(query.limit ?? 10, 20);
    const term =
      query.searchTerms?.[0] ||
      (query.vertical === 'DENTAL_ORTHO'
        ? 'dental assistant'
        : query.vertical === 'HOME_SERVICES'
          ? 'plumber'
          : 'clinic receptionist');

    // Live Adzuna/etc. needs API keys; default simulation-safe samples
    if (ctx.simulation || query.simulation || !process.env.ADZUNA_APP_ID) {
      const leads: DiscoveredLead[] = Array.from({ length: Math.min(limit, 3) }).map((_, i) => ({
        companyName: `Hiring ${term} Employer ${i + 1}`,
        country: query.country ?? 'US',
        region: query.region ?? null,
        city: query.city ?? null,
        vertical: query.vertical ?? 'OTHER',
        sourceProvider: 'JOB_BOARD',
        sourceRef: `sim-job-${i + 1}`,
        sourceMeta: {
          simulated: true,
          signal: 'hiring',
          jobTitle: term,
        },
      }));
      return { leads, simulated: true };
    }

    // Placeholder for licensed job API wiring
    ctx.log?.('warn', 'job_board.live_not_wired', { term });
    return { leads: [] };
  },

  async enrich(input: EnrichInput, ctx: AdapterContext): Promise<EnrichResult> {
    if (ctx.simulation || input.simulation) {
      return {
        simulated: true,
        raw: { hiringSignal: true, openRoles: 2 },
      };
    }
    return { raw: { hiringSignal: false } };
  },
};
