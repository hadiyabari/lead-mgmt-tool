/**
 * @leadpilot/db – Prisma client singleton + basic repository helpers
 * Phase 2: Workspace, User, Icp, Playbook, SourceConfig
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';

// ---------------------------------------------------------------------------
// Basic repository helpers (thin wrappers – expand in later phases)
// ---------------------------------------------------------------------------

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findFirst({
    where: { slug, deletedAt: null },
  });
}

export async function getWorkspaceById(id: string) {
  return prisma.workspace.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function getUserByEmail(workspaceId: string, email: string) {
  return prisma.user.findFirst({
    where: {
      workspaceId,
      email: email.toLowerCase(),
      deletedAt: null,
    },
  });
}

export async function getOwnerUser(workspaceId: string) {
  return prisma.user.findFirst({
    where: {
      workspaceId,
      role: 'OWNER',
      deletedAt: null,
    },
  });
}

export async function listActiveIcps(workspaceId: string) {
  return prisma.icp.findMany({
    where: { workspaceId, isActive: true, deletedAt: null },
    orderBy: { name: 'asc' },
  });
}

export async function listEnabledSources(workspaceId: string) {
  return prisma.sourceConfig.findMany({
    where: { workspaceId, isEnabled: true },
    orderBy: { name: 'asc' },
  });
}

export async function listAllSourceConfigs(workspaceId: string) {
  return prisma.sourceConfig.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' },
  });
}
