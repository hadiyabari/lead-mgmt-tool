/**
 * @leadpilot/db – Prisma client singleton + repository helpers
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

export {
  ledgerLookup,
  ledgerIsContacted,
  ledgerInsert,
  ledgerBulkImport,
  fourPointCheck,
} from './ledger';
export type { LedgerLookupInput, LedgerInsertInput, BulkImportRow, BulkImportResult } from './ledger';

// ---------------------------------------------------------------------------
// Workspace / User helpers
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

// ---------------------------------------------------------------------------
// Legacy thin ledger helpers (prefer ledger.ts service)
// ---------------------------------------------------------------------------

export async function findLedgerByEmail(workspaceId: string, normalizedEmail: string) {
  if (!normalizedEmail) return null;
  return prisma.contactHistoryLedger.findUnique({
    where: {
      workspaceId_normalizedEmail: { workspaceId, normalizedEmail },
    },
  });
}

export async function findLedgerByPhone(workspaceId: string, normalizedPhone: string) {
  if (!normalizedPhone) return null;
  return prisma.contactHistoryLedger.findUnique({
    where: {
      workspaceId_normalizedPhone: { workspaceId, normalizedPhone },
    },
  });
}

export async function isAlreadyContacted(
  workspaceId: string,
  opts: { normalizedEmail?: string | null; normalizedPhone?: string | null }
): Promise<boolean> {
  if (opts.normalizedEmail) {
    const byEmail = await findLedgerByEmail(workspaceId, opts.normalizedEmail);
    if (byEmail) return true;
  }
  if (opts.normalizedPhone) {
    const byPhone = await findLedgerByPhone(workspaceId, opts.normalizedPhone);
    if (byPhone) return true;
  }
  return false;
}

export async function isSuppressed(
  workspaceId: string,
  opts: { normalizedEmail?: string | null; normalizedPhone?: string | null; domain?: string | null }
): Promise<boolean> {
  if (opts.normalizedEmail) {
    const row = await prisma.suppressionList.findUnique({
      where: {
        workspaceId_normalizedEmail: {
          workspaceId,
          normalizedEmail: opts.normalizedEmail,
        },
      },
    });
    if (row) return true;
  }
  if (opts.normalizedPhone) {
    const row = await prisma.suppressionList.findUnique({
      where: {
        workspaceId_normalizedPhone: {
          workspaceId,
          normalizedPhone: opts.normalizedPhone,
        },
      },
    });
    if (row) return true;
  }
  if (opts.domain) {
    const row = await prisma.suppressionList.findFirst({
      where: { workspaceId, domain: opts.domain },
    });
    if (row) return true;
  }
  return false;
}

export async function getLeadById(workspaceId: string, leadId: string) {
  return prisma.lead.findFirst({
    where: { id: leadId, workspaceId, deletedAt: null },
  });
}

export async function listLeadsByStatus(workspaceId: string, status: string) {
  return prisma.lead.findMany({
    where: { workspaceId, status: status as never, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getRunById(workspaceId: string, runId: string) {
  return prisma.run.findFirst({
    where: { id: runId, workspaceId },
  });
}

export async function listRuns(workspaceId: string) {
  return prisma.run.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
}
