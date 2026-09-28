import type { Role } from '@leadpilot/db';

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 1,
  OPERATOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function hasMinRole(userRole: Role, required: Role): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

export function canManageUsers(role: Role): boolean {
  return hasMinRole(role, 'ADMIN');
}

export function canToggleKillSwitch(role: Role): boolean {
  return hasMinRole(role, 'ADMIN');
}

export function canStartRuns(role: Role): boolean {
  return hasMinRole(role, 'OPERATOR');
}

export function canApproveSends(role: Role): boolean {
  return hasMinRole(role, 'OPERATOR');
}
