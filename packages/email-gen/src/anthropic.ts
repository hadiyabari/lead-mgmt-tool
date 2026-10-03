import type { GenerateEmailInput, GeneratedEmail } from './types';
import { buildAllowedFacts } from './facts';
import { generateFromTemplate } from './template';

/**
 * Optional Anthropic path. Falls back to template if no key or on error.
 * Prompt instructs the model to use only the provided facts.
 */
export async function generateWithAnthropic(
  input: GenerateEmailInput
): Promise<GeneratedEmail> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || input.simulation) {
    return generateFromTemplate(input);
  }

  const facts = buildAllowedFacts(input);
  const factBlock = facts.map((f) => `- [${f.id}] ${f.text}`).join('\n');

  const system = `You write short B2B cold emails for local service businesses.
Rules:
- Use ONLY the facts listed. Do not invent ratings, reviews, awards, traffic numbers, or services.
- Reference at most three audit findings by their substance, not by inventing new ones.
- Tone: professional, specific, low pressure. No em dashes.
- Output strict JSON: {"subject":"...","bodyText":"...","bodyHtml":"...","factIdsUsed":["f1","f2"]}
- bodyHtml must be simple HTML paragraphs/lists only.
- Include a plain-text legal address line if provided in facts.`;

  const user = `Write one outreach email.
Recipient company: ${input.companyName}
Allowed facts:
${factBlock}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    if (!res.ok) {
      return generateFromTemplate(input);
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((c) => c.type === 'text')?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return generateFromTemplate(input);

    const parsed = JSON.parse(jsonMatch[0]) as {
      subject?: string;
      bodyText?: string;
      bodyHtml?: string;
      factIdsUsed?: string[];
    };

    if (!parsed.subject || !parsed.bodyText) {
      return generateFromTemplate(input);
    }

    const usedIds = new Set(parsed.factIdsUsed || []);
    const factsUsed =
      usedIds.size > 0 ? facts.filter((f) => usedIds.has(f.id)) : facts;

    return {
      subject: String(parsed.subject).slice(0, 200),
      bodyText: String(parsed.bodyText),
      bodyHtml: String(parsed.bodyHtml || `<p>${parsed.bodyText}</p>`),
      factsUsed,
      simulated: false,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    };
  } catch {
    return generateFromTemplate(input);
  }
}
