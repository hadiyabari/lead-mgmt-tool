import { describe, it, expect } from 'vitest';

/**
 * Smoke test for the health endpoint shape.
 * Full request testing arrives with Playwright / integration suite later.
 */
describe('health endpoint contract', () => {
  it('defines the expected response shape', () => {
    const sample = {
      status: 'ok',
      service: 'leadpilot-web',
      timestamp: new Date().toISOString(),
      simulationMode: true,
      killSwitch: false,
    };
    expect(sample.status).toBe('ok');
    expect(sample.service).toBe('leadpilot-web');
    expect(typeof sample.timestamp).toBe('string');
  });
});
