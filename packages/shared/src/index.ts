/**
 * @leadpilot/shared – public surface
 */

export const PACKAGE_NAME = '@leadpilot/shared' as const;

export type AgencyConfig = {
  name: string;
  legalAddress: string;
  primaryDomain: string;
};

export const DEFAULT_AGENCY: AgencyConfig = {
  name: 'Threezero Agency',
  legalAddress: 'China Corporation, Main road China scheme, Lahore 54000',
  primaryDomain: 'threezero.agency',
};

export * from './normalize';
export * from './csv';
