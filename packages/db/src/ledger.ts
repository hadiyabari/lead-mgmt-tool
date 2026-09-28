/**
 * Contact-history ledger service – single source of truth for "already contacted".
 * Four-point check: before enrichment, scoring, email write, and send.
 */

import {
  normalizeEmail,
  normalizePhone,
  normalizeDomain,
  domainFromEmail,
  type NormalizedIdentity,
} from '@leadpilot/shared';
import { prisma } from './client';
import type { ContactChannel, ContactOrigin, ContactHistoryLedger, Prisma } from '@prisma/client';

export type LedgerLookupInput = {
  email?: string | null;
  phone?: string | null;
  domain?: string | null;
  website?: string | null;
  defaultCountry?: string;
};

export type LedgerInsertInput = LedgerLookupInput & {
  origin: ContactOrigin;
  channel?: ContactChannel;
  sourceOfTruth?: string | null;
  notes?: string | null;
  contactedAt?: Date;
};

function toNormalized(input: LedgerLookupInput): NormalizedIdentity & { domain: string | null } {
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone, input.defaultCountry);
  const domain =
    normalizeDomain(input.domain) ||
    normalizeDomain(input.website) ||
    domainFromEmail(email);
  return { email, phone, domain, companyName: null };
}

export async function ledgerLookup(
  workspaceId: string,
  input: LedgerLookupInput
): Promise<ContactHistoryLedger | null> {
  const n = toNormalized(input);
  if (n.email) {
    const byEmail = await prisma.contactHistoryLedger.findUnique({
      where: {
        workspaceId_normalizedEmail: { workspaceId, normalizedEmail: n.email },
      },
    });
    if (byEmail) return byEmail;
  }
  if (n.phone) {
    const byPhone = await prisma.contactHistoryLedger.findUnique({
      where: {
        workspaceId_normalizedPhone: { workspaceId, normalizedPhone: n.phone },
      },
    });
    if (byPhone) return byPhone;
  }
  return null;
}

export async function ledgerIsContacted(
  workspaceId: string,
  input: LedgerLookupInput
): Promise<boolean> {
  return (await ledgerLookup(workspaceId, input)) != null;
}

export async function ledgerInsert(
  workspaceId: string,
  input: LedgerInsertInput
): Promise<ContactHistoryLedger> {
  const n = toNormalized(input);
  if (!n.email && !n.phone) {
    throw new Error('ledgerInsert requires at least email or phone');
  }

  const now = input.contactedAt ?? new Date();
  const existing = await ledgerLookup(workspaceId, input);

  if (existing) {
    return prisma.contactHistoryLedger.update({
      where: { id: existing.id },
      data: {
        lastContactedAt: now,
        notes: input.notes ?? existing.notes,
        sourceOfTruth: input.sourceOfTruth ?? existing.sourceOfTruth,
      },
    });
  }

  return prisma.contactHistoryLedger.create({
    data: {
      workspaceId,
      normalizedEmail: n.email,
      normalizedPhone: n.phone,
      domain: n.domain,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      origin: input.origin,
      channel: input.channel ?? 'EMAIL',
      sourceOfTruth: input.sourceOfTruth ?? null,
      notes: input.notes ?? null,
      firstContactedAt: now,
      lastContactedAt: now,
    },
  });
}

export type BulkImportRow = {
  email?: string | null;
  phone?: string | null;
  domain?: string | null;
  origin?: ContactOrigin;
  sourceOfTruth?: string;
  contactedAt?: Date | string;
};

export type BulkImportResult = {
  inserted: number;
  updated: number;
  skipped: number;
  errors: { index: number; message: string }[];
};

export async function ledgerBulkImport(
  workspaceId: string,
  rows: BulkImportRow[],
  defaults?: { origin?: ContactOrigin; defaultCountry?: string }
): Promise<BulkImportResult> {
  const result: BulkImportResult = { inserted: 0, updated: 0, skipped: 0, errors: [] };
  const origin = defaults?.origin ?? 'LEDGER_IMPORT_CSV';

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const n = toNormalized({
        email: row.email,
        phone: row.phone,
        domain: row.domain,
        defaultCountry: defaults?.defaultCountry,
      });
      if (!n.email && !n.phone) {
        result.skipped += 1;
        continue;
      }

      const existing = await ledgerLookup(workspaceId, {
        email: row.email,
        phone: row.phone,
        domain: row.domain,
        defaultCountry: defaults?.defaultCountry,
      });

      const contactedAt = row.contactedAt ? new Date(row.contactedAt) : new Date();

      if (existing) {
        await prisma.contactHistoryLedger.update({
          where: { id: existing.id },
          data: { lastContactedAt: contactedAt },
        });
        result.updated += 1;
      } else {
        await prisma.contactHistoryLedger.create({
          data: {
            workspaceId,
            normalizedEmail: n.email,
            normalizedPhone: n.phone,
            domain: n.domain,
            email: row.email?.trim() || null,
            phone: row.phone?.trim() || null,
            origin: row.origin ?? origin,
            channel: 'EMAIL',
            sourceOfTruth: row.sourceOfTruth ?? null,
            firstContactedAt: contactedAt,
            lastContactedAt: contactedAt,
          },
        });
        result.inserted += 1;
      }
    } catch (e) {
      result.errors.push({
        index: i,
        message: e instanceof Error ? e.message : 'unknown error',
      });
    }
  }

  return result;
}

export type LedgerListFilters = {
  q?: string;
  origin?: ContactOrigin;
  limit?: number;
  offset?: number;
};

export async function ledgerList(workspaceId: string, filters: LedgerListFilters = {}) {
  const limit = Math.min(filters.limit ?? 50, 200);
  const offset = filters.offset ?? 0;

  const where: Prisma.ContactHistoryLedgerWhereInput = { workspaceId };

  if (filters.origin) {
    where.origin = filters.origin;
  }
  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { normalizedEmail: { contains: q.toLowerCase() } },
      { phone: { contains: q } },
      { normalizedPhone: { contains: q.replace(/\D/g, '') } },
      { domain: { contains: q.toLowerCase() } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.contactHistoryLedger.findMany({
      where,
      orderBy: { lastContactedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.contactHistoryLedger.count({ where }),
  ]);

  return { items, total, limit, offset };
}

export async function fourPointCheck(
  workspaceId: string,
  input: LedgerLookupInput & { checkSuppression?: boolean }
): Promise<{ allowed: boolean; reason?: string; ledgerEntry?: ContactHistoryLedger | null }> {
  const n = toNormalized(input);

  if (input.checkSuppression !== false) {
    if (n.email) {
      const sup = await prisma.suppressionList.findUnique({
        where: {
          workspaceId_normalizedEmail: {
            workspaceId,
            normalizedEmail: n.email,
          },
        },
      });
      if (sup) return { allowed: false, reason: 'suppressed_email' };
    }
    if (n.phone) {
      const sup = await prisma.suppressionList.findUnique({
        where: {
          workspaceId_normalizedPhone: {
            workspaceId,
            normalizedPhone: n.phone,
          },
        },
      });
      if (sup) return { allowed: false, reason: 'suppressed_phone' };
    }
    if (n.domain) {
      const sup = await prisma.suppressionList.findFirst({
        where: { workspaceId, domain: n.domain },
      });
      if (sup) return { allowed: false, reason: 'suppressed_domain' };
    }
  }

  const ledgerEntry = await ledgerLookup(workspaceId, input);
  if (ledgerEntry) {
    return { allowed: false, reason: 'already_contacted', ledgerEntry };
  }

  return { allowed: true, ledgerEntry: null };
}
