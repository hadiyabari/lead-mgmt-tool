import type { EmailFact, GenerateEmailInput, GeneratedEmail } from './types';
import { buildAllowedFacts } from './facts';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function topFindings(facts: EmailFact[], limit = 3): EmailFact[] {
  return facts.filter((f) => f.kind === 'audit_finding').slice(0, limit);
}

/**
 * Deterministic template writer. Uses only allowed facts. No LLM required.
 */
export function generateFromTemplate(input: GenerateEmailInput): GeneratedEmail {
  const facts = buildAllowedFacts(input);
  const findings = topFindings(facts, 3);
  const agency = input.agencyName || 'our team';
  const sender = input.senderName || agency;
  const offer = input.offerName || 'a short visibility review';

  const subjectParts = [input.companyName];
  if (findings[0]) {
    subjectParts.push(findings[0].text.replace(/^Audit score:\s*/i, '').slice(0, 60));
  } else {
    subjectParts.push('quick note on local presence');
  }
  const subject = subjectParts.join(' · ').slice(0, 120);

  const greeting = input.toName ? `Hi ${input.toName},` : `Hi,`;

  const findingLines =
    findings.length > 0
      ? findings.map((f) => `- ${f.text}`).join('\n')
      : '- We reviewed public signals for your business and have a few practical notes.';

  const locationBit = [input.city, input.region].filter(Boolean).join(', ');
  const open =
    locationBit
      ? `I looked at ${input.companyName} (${locationBit}) against public web and listing signals.`
      : `I looked at ${input.companyName} against public web and listing signals.`;

  const scoreFact = facts.find((f) => f.text.startsWith('Audit score:'));
  const scoreLine = scoreFact ? `${scoreFact.text}. ` : '';

  const bodyText = [
    greeting,
    '',
    open,
    '',
    `${scoreLine}A few points that stood out:`,
    findingLines,
    '',
    `We help local service businesses close those gaps through ${offer}.`,
    input.offerSummary ? `${input.offerSummary}` : '',
    '',
    'If useful, I can send a one-page summary of what we would fix first. No obligation.',
    '',
    `Best,`,
    sender,
    agency !== sender ? agency : '',
    input.legalAddress || '',
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n')
    .trim();

  const bodyHtml = `
<p>${escapeHtml(greeting)}</p>
<p>${escapeHtml(open)}</p>
<p>${escapeHtml(scoreLine)}A few points that stood out:</p>
<ul>
${findings.length > 0 ? findings.map((f) => `<li>${escapeHtml(f.text)}</li>`).join('\n') : '<li>We reviewed public signals for your business and have a few practical notes.</li>'}
</ul>
<p>We help local service businesses close those gaps through ${escapeHtml(offer)}.</p>
${input.offerSummary ? `<p>${escapeHtml(input.offerSummary)}</p>` : ''}
<p>If useful, I can send a one-page summary of what we would fix first. No obligation.</p>
<p>Best,<br/>${escapeHtml(sender)}${agency !== sender ? `<br/>${escapeHtml(agency)}` : ''}${input.legalAddress ? `<br/><span style="font-size:12px;color:#666">${escapeHtml(input.legalAddress)}</span>` : ''}</p>
`.trim();

  return {
    subject,
    bodyText,
    bodyHtml,
    factsUsed: facts,
    simulated: true,
    model: 'template-v1',
  };
}
