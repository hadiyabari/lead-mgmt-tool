/**
 * US NPI Registry adapter – official CMS NPI API (public, no key).
 * https://npiregistry.cms.hhs.gov/api-page
 * Primary list source for dental / clinical providers.
 */

import { httpJson } from '../http';
import type {
  SourceAdapter,
  DiscoverQuery,
  AdapterContext,
  DiscoverResult,
  DiscoveredLead,
  Vertical,
} from '../types';

const NPI_BASE = 'https://npiregistry.cms.hhs.gov/api/';

// Taxonomy keywords → vertical
const TAXONOMY_HINTS: { match: RegExp; vertical: Vertical }[] = [
  { match: /dentist|orthodont|dental/i, vertical: 'DENTAL_ORTHO' },
  { match: /dermatolog|plastic|aesthetic|cosmetic/i, vertical: 'AESTHETIC_MEDSPA' },
];

type NpiResult = {
  result_count?: number;
  results?: Array<{
    number?: string;
    enumeration_type?: string;
    basic?: {
      organization_name?: string;
      first_name?: string;
      last_name?: string;
      status?: string;
    };
    addresses?: Array<{
      address_purpose?: string;
      address_1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      telephone_number?: string;
      country_code?: string;
    }>;
    taxonomies?: Array<{ desc?: string; primary?: boolean }>;
  }>;
};

function mapVertical(taxonomies?: Array<{ desc?: string }>): Vertical {
  const text = (taxonomies || []).map((t) => t.desc || '').join(' ');
  for (const h of TAXONOMY_HINTS) {
    if (h.match.test(text)) return h.vertical;
  }
  return 'OTHER';
}

function toLead(r: NonNullable<NpiResult['results']>[number]): DiscoveredLead | null {
  const name =
    r.basic?.organization_name ||
    [r.basic?.first_name, r.basic?.last_name].filter(Boolean).join(' ');
  if (!name) return null;

  const loc =
    r.addresses?.find((a) => a.address_purpose === 'LOCATION') || r.addresses?.[0];

  return {
    companyName: name,
    country: 'US',
    region: loc?.state ?? null,
    city: loc?.city ?? null,
    postalCode: loc?.postal_code?.slice(0, 5) ?? null,
    address: loc?.address_1 ?? null,
    primaryPhone: loc?.telephone_number ?? null,
    vertical: mapVertical(r.taxonomies),
    sourceProvider: 'NPI_US',
    sourceRef: r.number ?? null,
    sourceMeta: {
      enumeration_type: r.enumeration_type,
      taxonomy: r.taxonomies?.find((t) => t.primary)?.desc,
      status: r.basic?.status,
    },
  };
}

export const npiUsAdapter: SourceAdapter = {
  id: 'NPI_US',
  name: 'NPI Registry (US)',
  countries: ['US'],
  kind: 'primary',

  async discover(query: DiscoverQuery, ctx: AdapterContext): Promise<DiscoverResult> {
    const limit = Math.min(query.limit ?? 20, 50);

    if (ctx.simulation || query.simulation) {
      return {
        simulated: true,
        leads: Array.from({ length: Math.min(limit, 3) }).map((_, i) => ({
          companyName: `Simulated Dental Group ${i + 1}`,
          country: 'US' as const,
          region: query.region ?? 'TX',
          city: query.city ?? 'Austin',
          vertical: 'DENTAL_ORTHO' as const,
          sourceProvider: 'NPI_US' as const,
          sourceRef: `sim-npi-${i + 1}`,
          sourceMeta: { simulated: true },
        })),
      };
    }

    const params = new URLSearchParams({
      version: '2.1',
      limit: String(limit),
      skip: query.cursor || '0',
      enumeration_type: 'NPI-2', // organizations
    });

    if (query.region) params.set('state', query.region);
    if (query.city) params.set('city', query.city);

    const terms = query.searchTerms?.length
      ? query.searchTerms
      : query.vertical === 'DENTAL_ORTHO'
        ? ['dentist']
        : query.vertical === 'AESTHETIC_MEDSPA'
          ? ['dermatology']
          : ['clinic'];

    // NPI uses taxonomy description or organization name
    params.set('taxonomy_description', terms[0]);

    const url = `${NPI_BASE}?${params.toString()}`;
    ctx.log?.('info', 'npi.discover', { url: url.replace(/version=/, 'v=') });

    const data = await httpJson<NpiResult>(url, {
      opts: { timeoutMs: 20_000, costPerCall: 0 },
    });

    const leads = (data.results || [])
      .map(toLead)
      .filter((x): x is DiscoveredLead => x != null)
      .filter((l) => !query.vertical || l.vertical === query.vertical || l.vertical === 'OTHER');

    const skip = Number(query.cursor || 0);
    const nextCursor =
      (data.result_count ?? 0) > skip + limit ? String(skip + limit) : undefined;

    return { leads, nextCursor, rawCount: data.result_count };
  },
};
