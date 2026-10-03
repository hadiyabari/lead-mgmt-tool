export type {
  EmailFact,
  AuditFindingLite,
  GenerateEmailInput,
  GeneratedEmail,
} from './types';
export { buildAllowedFacts } from './facts';
export { generateFromTemplate } from './template';
export { generateWithAnthropic } from './anthropic';

import type { GenerateEmailInput, GeneratedEmail } from './types';
import { generateFromTemplate } from './template';
import { generateWithAnthropic } from './anthropic';

/** Main entry: template in simulation or without key; Anthropic when available. */
export async function generateEmail(input: GenerateEmailInput): Promise<GeneratedEmail> {
  const forceSim =
    input.simulation === true ||
    process.env.SIMULATION_MODE === 'true' ||
    !process.env.ANTHROPIC_API_KEY;

  if (forceSim) return generateFromTemplate({ ...input, simulation: true });
  return generateWithAnthropic(input);
}
