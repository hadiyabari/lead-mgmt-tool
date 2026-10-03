import type { EmailFact, GenerateEmailInput } from './types';

/**
 * Build the only facts the writer is allowed to use.
 * Nothing outside this list may appear as a claim in the email.
 */
export function buildAllowedFacts(input: GenerateEmailInput): EmailFact[] {
  const facts: EmailFact[] = [];
  let n = 0;
  const id = () => `f${++n}`;

  facts.push({
    id: id(),
    kind: 'company',
    text: `Company name: ${input.companyName}`,
    source: 'lead',
  });

  if (input.website || input.domain) {
    facts.push({
      id: id(),
      kind: 'company',
      text: `Website: ${input.website || `https://${input.domain}`}`,
      source: 'lead',
    });
  }

  const loc = [input.city, input.region, input.country].filter(Boolean).join(', ');
  if (loc) {
    facts.push({
      id: id(),
      kind: 'company',
      text: `Location: ${loc}`,
      source: 'lead',
    });
  }

  if (input.vertical) {
    facts.push({
      id: id(),
      kind: 'company',
      text: `Vertical: ${input.vertical}`,
      source: 'lead',
    });
  }

  if (input.auditScore != null) {
    facts.push({
      id: id(),
      kind: 'audit_finding',
      text: `Audit score: ${Math.round(input.auditScore)}/100`,
      source: 'audit',
    });
  }

  for (const f of input.findings || []) {
    const bits = [f.title];
    if (f.severity) bits.push(`(${f.severity})`);
    if (f.description) bits.push(`: ${f.description}`);
    facts.push({
      id: id(),
      kind: 'audit_finding',
      text: bits.join(' '),
      source: f.category || 'audit',
    });
  }

  if (input.rating != null) {
    facts.push({
      id: id(),
      kind: 'enrichment',
      text: `Public rating: ${input.rating}/5`,
      source: 'enrichment',
    });
  }

  if (input.reviewCount != null) {
    facts.push({
      id: id(),
      kind: 'enrichment',
      text: `Review count: ${input.reviewCount}`,
      source: 'enrichment',
    });
  }

  if (input.offerName) {
    facts.push({
      id: id(),
      kind: 'offer',
      text: `Offer: ${input.offerName}`,
      source: 'playbook',
    });
  }

  if (input.offerSummary) {
    facts.push({
      id: id(),
      kind: 'offer',
      text: `Offer summary: ${input.offerSummary}`,
      source: 'playbook',
    });
  }

  if (input.agencyName) {
    facts.push({
      id: id(),
      kind: 'compliance',
      text: `Sender agency: ${input.agencyName}`,
      source: 'workspace',
    });
  }

  if (input.legalAddress) {
    facts.push({
      id: id(),
      kind: 'compliance',
      text: `Legal address for footer: ${input.legalAddress}`,
      source: 'workspace',
    });
  }

  return facts;
}
