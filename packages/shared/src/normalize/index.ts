export { normalizeEmail, isValidNormalizedEmail } from './email';
export { normalizePhone, isValidNormalizedPhone } from './phone';
export { normalizeDomain, domainFromEmail } from './domain';
export { normalizeCompanyName } from './company';

import { normalizeEmail } from './email';
import { normalizePhone } from './phone';
import { normalizeDomain, domainFromEmail } from './domain';
import { normalizeCompanyName } from './company';

export type NormalizedIdentity = {
  email: string | null;
  phone: string | null;
  domain: string | null;
  companyName: string | null;
};

/** Normalize a contact identity bundle in one call. */
export function normalizeIdentity(input: {
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  domain?: string | null;
  companyName?: string | null;
  defaultCountry?: string;
}): NormalizedIdentity {
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone, input.defaultCountry);
  const domain =
    normalizeDomain(input.domain) ||
    normalizeDomain(input.website) ||
    domainFromEmail(email);
  const companyName = normalizeCompanyName(input.companyName);
  return { email, phone, domain, companyName };
}
