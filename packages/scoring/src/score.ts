import {
  DEFAULT_QUALIFIED_THRESHOLD,
  DEFAULT_WEIGHTS,
  type ScoreBreakdownItem,
  type ScoreInput,
  type ScoreResult,
  type ScoreWeights,
} from './types';

const LABELS: Record<keyof ScoreWeights, string> = {
  auditScore: 'Audit score',
  rating: 'Public rating',
  reviewCount: 'Review volume',
  hasWebsite: 'Website present',
  hasEmail: 'Email resolved',
  hasPhone: 'Phone resolved',
  jobSignal: 'Hiring signal',
  icpCountryFit: 'ICP country fit',
  icpVerticalFit: 'ICP vertical fit',
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizeWeights(w: ScoreWeights): ScoreWeights {
  const sum = Object.values(w).reduce((a, b) => a + b, 0);
  if (sum <= 0) return { ...DEFAULT_WEIGHTS };
  const out = { ...w };
  (Object.keys(out) as (keyof ScoreWeights)[]).forEach((k) => {
    out[k] = out[k] / sum;
  });
  return out;
}

function factorAudit(score?: number | null): { raw: number; detail: string } {
  if (score == null || Number.isNaN(score)) return { raw: 0, detail: 'No audit' };
  const raw = clamp01(score / 100);
  return { raw, detail: `Audit ${Math.round(score)}/100` };
}

function factorRating(rating?: number | null): { raw: number; detail: string } {
  if (rating == null || Number.isNaN(rating)) return { raw: 0.3, detail: 'No rating (neutral)' };
  // Prefer mid-high ratings for local services; very low is weak
  const raw = clamp01(rating / 5);
  return { raw, detail: `Rating ${rating.toFixed(1)}/5` };
}

function factorReviews(count?: number | null): { raw: number; detail: string } {
  if (count == null || count <= 0) return { raw: 0.2, detail: 'No reviews' };
  // Log scale: 10 reviews ~0.5, 50+ ~0.85, 200+ ~1
  const raw = clamp01(Math.log10(count + 1) / Math.log10(201));
  return { raw, detail: `${count} reviews` };
}

function boolFactor(on: boolean | undefined, yes: string, no: string): { raw: number; detail: string } {
  return on ? { raw: 1, detail: yes } : { raw: 0, detail: no };
}

/**
 * Pure scoring function. Same inputs + weights always yield the same totalScore.
 */
export function computeLeadScore(
  input: ScoreInput,
  weights: Partial<ScoreWeights> = {},
  threshold: number = DEFAULT_QUALIFIED_THRESHOLD
): ScoreResult {
  const weightsUsed = normalizeWeights({ ...DEFAULT_WEIGHTS, ...weights });

  const parts: { key: keyof ScoreWeights; ...ReturnType<typeof factorAudit> }[] = [
    { key: 'auditScore', ...factorAudit(input.auditScore) },
    { key: 'rating', ...factorRating(input.rating) },
    { key: 'reviewCount', ...factorReviews(input.reviewCount) },
    { key: 'hasWebsite', ...boolFactor(input.hasWebsite, 'Website yes', 'No website') },
    { key: 'hasEmail', ...boolFactor(input.hasEmail, 'Email yes', 'No email') },
    { key: 'hasPhone', ...boolFactor(input.hasPhone, 'Phone yes', 'No phone') },
    { key: 'jobSignal', ...boolFactor(input.jobSignal, 'Hiring signal', 'No job signal') },
    {
      key: 'icpCountryFit',
      ...boolFactor(input.countryMatchesIcp !== false, 'Country fits ICP', 'Country outside ICP'),
    },
    {
      key: 'icpVerticalFit',
      ...boolFactor(input.verticalMatchesIcp !== false, 'Vertical fits ICP', 'Vertical outside ICP'),
    },
  ];

  // If ICP flags omitted, treat as fit (raw 1) already via !== false

  const breakdown: ScoreBreakdownItem[] = parts.map((p) => {
    const weight = weightsUsed[p.key];
    const contribution = weight * p.raw;
    return {
      key: p.key,
      label: LABELS[p.key],
      weight,
      raw: p.raw,
      contribution,
      detail: p.detail,
    };
  });

  const total01 = breakdown.reduce((s, b) => s + b.contribution, 0);
  const totalScore = Math.round(clamp01(total01) * 1000) / 10; // one decimal 0-100

  return {
    totalScore,
    breakdown,
    weightsUsed,
    qualified: totalScore >= threshold,
    threshold,
  };
}
