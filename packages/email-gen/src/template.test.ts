import { describe, it, expect } from 'vitest';
import { generateFromTemplate } from './template';
import { buildAllowedFacts } from './facts';

describe('generateFromTemplate', () => {
  it('includes company name and findings only from input', () => {
    const out = generateFromTemplate({
      companyName: 'Bright Smile Dental',
      city: 'Austin',
      region: 'TX',
      country: 'US',
      auditScore: 42,
      findings: [
        { title: 'GBP incomplete', severity: 'high', description: 'Missing hours' },
        { title: 'Weak mobile CTA', severity: 'medium' },
      ],
      offerName: 'Local SEO retainer',
      agencyName: 'Threezero Agency',
      legalAddress: 'China Corporation, Main road China scheme, Lahore 54000',
    });

    expect(out.subject).toContain('Bright Smile Dental');
    expect(out.bodyText).toContain('Bright Smile Dental');
    expect(out.bodyText).toContain('GBP incomplete');
    expect(out.bodyText).not.toContain('em dash');
    expect(out.factsUsed.length).toBeGreaterThan(0);
    expect(out.simulated).toBe(true);
  });

  it('buildAllowedFacts stays within provided data', () => {
    const facts = buildAllowedFacts({
      companyName: 'Test Co',
      auditScore: 10,
    });
    expect(facts.every((f) => f.text.length > 0)).toBe(true);
    expect(facts.some((f) => f.text.includes('Test Co'))).toBe(true);
  });
});
