/**
 * @leadpilot/shared – public surface
 * Real normalisation, types and helpers land in Phase 6+.
 */

export const PACKAGE_NAME = '@leadpilot/shared' as const;

export type AgencyConfig = {
  name: string;
  legalAddress: string;
  primaryDomain: string;
};

/** Editable agency defaults – override via env / workspace settings later */
export const DEFAULT_AGENCY: AgencyConfig = {
  name: 'Threezero Agency',
  legalAddress: 'China Corporation, Main road China scheme, Lahore 54000',
  primaryDomain: 'threezero.agency',
};
