export type ScoreWeights = {
  auditScore: number;
  rating: number;
  reviewCount: number;
  hasWebsite: number;
  hasEmail: number;
  hasPhone: number;
  jobSignal: number;
  icpCountryFit: number;
  icpVerticalFit: number;
};

export const DEFAULT_WEIGHTS: ScoreWeights = {
  auditScore: 0.28,
  rating: 0.12,
  reviewCount: 0.1,
  hasWebsite: 0.1,
  hasEmail: 0.12,
  hasPhone: 0.08,
  jobSignal: 0.05,
  icpCountryFit: 0.08,
  icpVerticalFit: 0.07,
};

export type ScoreInput = {
  auditScore?: number | null; // 0-100
  rating?: number | null; // 0-5
  reviewCount?: number | null;
  hasWebsite?: boolean;
  hasEmail?: boolean;
  hasPhone?: boolean;
  jobSignal?: boolean;
  countryMatchesIcp?: boolean;
  verticalMatchesIcp?: boolean;
};

export type ScoreBreakdownItem = {
  key: keyof ScoreWeights;
  label: string;
  weight: number;
  raw: number; // 0-1 contribution factor before weight
  contribution: number; // weight * raw, sums toward total
  detail: string;
};

export type ScoreResult = {
  totalScore: number; // 0-100
  breakdown: ScoreBreakdownItem[];
  weightsUsed: ScoreWeights;
  qualified: boolean;
  threshold: number;
};

export const DEFAULT_QUALIFIED_THRESHOLD = 55;
