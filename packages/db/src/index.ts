/**
 * @leadpilot/db – Prisma client singleton + repository helpers
 */

export { prisma } from './client';
export * from '@prisma/client';

export {
  ledgerLookup,
  ledgerIsContacted,
  ledgerInsert,
  ledgerBulkImport,
  ledgerList,
  fourPointCheck,
} from './ledger';
export type {
  LedgerLookupInput,
  LedgerInsertInput,
  BulkImportRow,
  BulkImportResult,
  LedgerListFilters,
} from './ledger';

import { prisma } from './client';

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findFirst({ where: { slug, deletedAt: null } });
}

export async function getWorkspaceById(id: string) {
  return prisma.workspace.findFirst({ where: { id, deletedAt: null } });
}

export async function getUserByEmail(workspaceId: string, email: string) {
  return prisma.user.findFirst({
    where: { workspaceId, email: email.toLowerCase(), deletedAt: null },
  });
}

export async function getOwnerUser(workspaceId: string) {
  return prisma.user.findFirst({
    where: { workspaceId, role: 'OWNER', deletedAt: null },
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
  return prisma.run.findFirst({ where: { id: runId, workspaceId } });
}

export async function listRuns(workspaceId: string) {
  return prisma.run.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
}
