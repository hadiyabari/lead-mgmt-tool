/**
 * Australia ABN Lookup / ABR JSON API pattern.
 * Official: https://abr.business.gov.au/Tools/WebServices
 * Requires GUID (ABR authentication).
 * Health practitioner registers follow the same adapter shape.
 */

import { httpJson } from '../http';
import type {
  SourceAdapter,
  DiscoverQuery,
  AdapterContext,
  DiscoverResult,
  DiscoveredLead,
} from '../types';

// ABR name search (JSON) – GUID required
const ABR_JSON = 'https://abr.business.gov.au/json/MatchingNames.aspx';

type AbrNameMatch = {
  Names?: Array<{
    Name?: string;
    StateCode?: string;
    Postcode?: string;
    Score?: number;
    IsCurrent?: boolean;
    ABN?: string;
  }>;
};

function toLead(n: NonNullable<AbrNameMatch['Names']>[number]): DiscoveredLead | null {
  if (!n.Name || !n.ABN) return null;
  return {
    companyName: n.Name,
    country: 'AU',
    region: n.StateCode ?? null,
    postalCode: n.Postcode ?? null,
    sourceProvider: 'ABN_ASIC_AU',
    sourceRef: n.ABN,
    sourceMeta: {
      score: n.Score,
      isCurrent: n.IsCurrent,
    },
  };
}

export const abnAuAdapter: SourceAdapter = {
  id: 'ABN_ASIC_AU',
  name: 'ABN Lookup / ASIC (AU)',
  countries: ['AU'],
  kind: 'primary',

  async discover(query: DiscoverQuery, ctx: AdapterContext): Promise<DiscoverResult> {
    const limit = Math.min(query.limit ?? 20, 50);
    const name =
      query.searchTerms?.[0] ||
      (query.vertical === 'DENTAL_ORTHO'
        ? 'dental'
        : query.vertical === 'HOME_SERVICES'
          ? 'plumbing'
          : 'clinic');

    if (ctx.simulation || query.simulation) {
      return {
        simulated: true,
        leads: Array.from({ length: Math.min(limit, 3) }).map((_, i) => ({
          companyName: `Simulated ${name} Pty Ltd`,
          country: 'AU' as const,
          region: query.region ?? 'NSW',
          vertical: query.vertical ?? null,
          sourceProvider: 'ABN_ASIC_AU' as const,
          sourceRef: `sim-abn-${i + 1}`,
          sourceMeta: { simulated: true },
        })),
      };
    }

    const guid = process.env.ABN_LOOKUP_GUID;
    if (!guid) {
      throw new Error('ABN_LOOKUP_GUID is required for live ABN Lookup calls');
    }

    const params = new URLSearchParams({
      name,
      maxResults: String(limit),
      callback: 'callback',
      guid,
    });

    // ABR returns JSONP; request without callback when possible – some endpoints need strip
    const url = `${ABR_JSON}?${params}`;
    ctx.log?.('info', 'abn.discover', { name });

    // Fetch as text and strip JSONP wrapper if present
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LeadPilot/1.0 (official-registry-client)' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`ABN HTTP ${res.status}`);
    let text = await res.text();
    const jsonp = text.match(/^[^(]+\((.*)\);?\s*$/s);
    if (jsonp) text = jsonp[1];
    const data = JSON.parse(text) as AbrNameMatch;

    const leads = (data.Names || [])
      .map(toLead)
      .filter((x): x is DiscoveredLead => x != null)
      .slice(0, limit);

    return { leads, rawCount: leads.length };
  },
};

/** Health practitioner register – same interface; simulation until specific register API wired. */
export const healthRegisterAuAdapter: SourceAdapter = {
  id: 'HEALTH_REGISTER_AU',
  name: 'Health Practitioner Register (AU)',
  countries: ['AU'],
  kind: 'primary',

  async discover(query: DiscoverQuery, ctx: AdapterContext): Promise<DiscoverResult> {
    const limit = Math.min(query.limit ?? 10, 30);
    // Ahpra public register scraping is restricted; prefer official bulk data if licensed.
    // Simulation / empty live until licensed feed configured.
    if (ctx.simulation || query.simulation || !process.env.AHPRA_DATA_URL) {
      return {
        simulated: true,
        leads: Array.from({ length: Math.min(limit, 2) }).map((_, i) => ({
          companyName: `Simulated AU Practitioner Clinic ${i + 1}`,
          country: 'AU' as const,
          vertical: query.vertical ?? ('DENTAL_ORTHO' as const),
          sourceProvider: 'HEALTH_REGISTER_AU' as const,
          sourceRef: `sim-ahpra-${i + 1}`,
          sourceMeta: { simulated: true },
        })),
      };
    }
    return { leads: [] };
  },
};
