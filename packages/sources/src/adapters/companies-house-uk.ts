/**
 * UK Companies House API – official registry.
 * https://developer.company-information.service.gov.uk/
 * Enforces Ltd / LLP only (PECR / plan requirement). Skips sole traders.
 */

import { httpJson } from '../http';
import type {
  SourceAdapter,
  DiscoverQuery,
  AdapterContext,
  DiscoverResult,
  DiscoveredLead,
} from '../types';

const CH_BASE = 'https://api.company-information.service.gov.uk';

const ALLOWED_TYPES = new Set([
  'ltd',
  'private-limited-guarant-nsc',
  'private-limited-guarant-nsc-limited-exemption',
  'private-limited-shares-section-30-exemption',
  'llp',
  'private-unlimited',
  'private-unlimited-nsc',
  'plc',
]);

type ChSearchResponse = {
  items?: Array<{
    company_number?: string;
    title?: string;
    company_status?: string;
    company_type?: string;
    address_snippet?: string;
    address?: {
      address_line_1?: string;
      locality?: string;
      postal_code?: string;
      region?: string;
      country?: string;
    };
  }>;
  total_results?: number;
};

function isLtdOrLlp(companyType?: string): boolean {
  if (!companyType) return false;
  const t = companyType.toLowerCase();
  if (ALLOWED_TYPES.has(t)) return true;
  // Human-readable variants from some responses
  return /\bltd\b|limited|llp|plc/i.test(t) && !/sole|partnership(?!.*limited)/i.test(t);
}

function toLead(item: NonNullable<ChSearchResponse['items']>[number]): DiscoveredLead | null {
  if (!item.title || !isLtdOrLlp(item.company_type)) return null;
  if (item.company_status && item.company_status !== 'active') return null;

  return {
    companyName: item.title.replace(/\s+/g, ' ').trim(),
    country: 'UK',
    region: item.address?.region ?? null,
    city: item.address?.locality ?? null,
    postalCode: item.address?.postal_code ?? null,
    address: item.address?.address_line_1 ?? item.address_snippet ?? null,
    sourceProvider: 'COMPANIES_HOUSE_UK',
    sourceRef: item.company_number ?? null,
    sourceMeta: {
      company_type: item.company_type,
      company_status: item.company_status,
    },
  };
}

export const companiesHouseUkAdapter: SourceAdapter = {
  id: 'COMPANIES_HOUSE_UK',
  name: 'Companies House (UK – Ltd/LLP)',
  countries: ['UK'],
  kind: 'primary',

  async discover(query: DiscoverQuery, ctx: AdapterContext): Promise<DiscoverResult> {
    const limit = Math.min(query.limit ?? 20, 50);
    const terms =
      query.searchTerms?.join(' ') ||
      (query.vertical === 'DENTAL_ORTHO'
        ? 'dental'
        : query.vertical === 'HOME_SERVICES'
          ? 'roofing'
          : query.vertical === 'AESTHETIC_MEDSPA'
            ? 'clinic'
            : 'services');

    if (ctx.simulation || query.simulation) {
      return {
        simulated: true,
        leads: Array.from({ length: Math.min(limit, 3) }).map((_, i) => ({
          companyName: `Simulated ${terms} Services Ltd`,
          country: 'UK' as const,
          city: query.city ?? 'London',
          vertical: query.vertical ?? null,
          sourceProvider: 'COMPANIES_HOUSE_UK' as const,
          sourceRef: `sim-ch-${i + 1}`,
          sourceMeta: { company_type: 'ltd', simulated: true },
        })),
      };
    }

    const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
    if (!apiKey) {
      throw new Error('COMPANIES_HOUSE_API_KEY is required for live Companies House calls');
    }

    const params = new URLSearchParams({
      q: terms,
      items_per_page: String(limit),
      start_index: query.cursor || '0',
    });

    const url = `${CH_BASE}/search/companies?${params}`;
    const auth = Buffer.from(`${apiKey}:`).toString('base64');

    const data = await httpJson<ChSearchResponse>(url, {
      headers: { Authorization: `Basic ${auth}` },
      opts: { timeoutMs: 20_000, costPerCall: 0 },
    });

    const leads = (data.items || [])
      .map(toLead)
      .filter((x): x is DiscoveredLead => x != null);

    const start = Number(query.cursor || 0);
    const nextCursor =
      (data.total_results ?? 0) > start + limit ? String(start + limit) : undefined;

    return { leads, nextCursor, rawCount: data.total_results };
  },
};
