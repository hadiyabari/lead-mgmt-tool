import { describe, it, expect } from 'vitest';
import { hasMinRole, canToggleKillSwitch, canStartRuns } from './rbac';

describe('rbac', () => {
  it('OWNER can do everything', () => {
    expect(hasMinRole('OWNER', 'VIEWER')).toBe(true);
    expect(canToggleKillSwitch('OWNER')).toBe(true);
    expect(canStartRuns('OWNER')).toBe(true);
  });

  it('VIEWER cannot start runs or kill switch', () => {
    expect(canStartRuns('VIEWER')).toBe(false);
    expect(canToggleKillSwitch('VIEWER')).toBe(false);
  });

  it('OPERATOR can start runs but not kill switch', () => {
    expect(canStartRuns('OPERATOR')).toBe(true);
    expect(canToggleKillSwitch('OPERATOR')).toBe(false);
  });
});
