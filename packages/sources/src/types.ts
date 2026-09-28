/**
 * Source adapter contracts – Phase 8
 */

export type CountryCode = 'US' | 'UK' | 'AU';

export type Vertical = 'DENTAL_ORTHO' | 'HOME_SERVICES' | 'AESTHETIC_MEDSPA' | 'OTHER';

export type SourceProviderId =
  | 'NPI_US'
  | 'STATE_LICENSE_US'
  | 'COMPANIES_HOUSE_UK'
  | 'ABN_ASIC_AU'
  | 'HEALTH_REGISTER_AU'
  | 'JOB_BOARD'
  | 'GOOGLE_PLACES_ENRICH'
  | 'YELP_ENRICH'
  | 'WEBSITE_EXTRACT'
  | 'CUSTOM'
  | 'DUMMY';

/** Normalized lead candidate produced by discover() */
export type DiscoveredLead = {
  companyName: string;
  website?: string | null;
  domain?: string | null;
  country?: CountryCode | null;
  region?: string | null;
  city?: string | null;
  postalCode?: string | null;
  address?: string | null;
  vertical?: Vertical | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  sourceProvider: SourceProviderId;
  sourceRef?: string | null;
  sourceMeta?: Record<string, unknown>;
};

export type DiscoverQuery = {
  vertical?: Vertical;
  country?: CountryCode;
  region?: string; // state / county
  city?: string;
  searchTerms?: string[];
  limit?: number;
  cursor?: string;
  simulation?: boolean;
};

export type DiscoverResult = {
  leads: DiscoveredLead[];
  nextCursor?: string;
  rawCount?: number;
  simulated?: boolean;
};

export type EnrichInput = {
  companyName?: string;
  website?: string | null;
  domain?: string | null;
  sourceRef?: string | null;
  simulation?: boolean;
};

export type EnrichResult = {
  rating?: number | null;
  reviewCount?: number | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  raw?: Record<string, unknown>;
  simulated?: boolean;
};

export type AdapterContext = {
  /** When true, adapters must not call paid/external APIs that spend credits */
  simulation: boolean;
  /** Soft credit budget remaining for this run (optional) */
  creditsRemaining?: number;
  /** Abort signal */
  signal?: AbortSignal;
  /** Logger hook */
  log?: (level: 'info' | 'warn' | 'error', msg: string, meta?: Record<string, unknown>) => void;
};

export interface SourceAdapter {
  readonly id: SourceProviderId;
  readonly name: string;
  readonly countries: CountryCode[];
  /** Primary list source vs enrichment-only */
  readonly kind: 'primary' | 'enrichment';

  discover(query: DiscoverQuery, ctx: AdapterContext): Promise<DiscoverResult>;
  enrich?(input: EnrichInput, ctx: AdapterContext): Promise<EnrichResult>;
}

export type HttpClientOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  costPerCall?: number;
  onCost?: (units: number, meta: { url: string }) => void;
};
