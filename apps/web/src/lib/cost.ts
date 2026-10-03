import { prisma } from '@leadpilot/db';
import type { CostCategory, Prisma } from '@leadpilot/db';

export async function recordCost(opts: {
  workspaceId: string;
  category: CostCategory;
  provider?: string;
  units?: number;
  unitCost?: number;
  totalCost?: number;
  runId?: string | null;
  meta?: Prisma.InputJsonValue;
}) {
  const units = opts.units ?? 1;
  const unitCost = opts.unitCost ?? 0;
  const totalCost = opts.totalCost ?? units * unitCost;
  try {
    return await prisma.costLedger.create({
      data: {
        workspaceId: opts.workspaceId,
        category: opts.category,
        provider: opts.provider,
        units,
        unitCost,
        totalCost,
        runId: opts.runId ?? null,
        meta: opts.meta,
      },
    });
  } catch {
    return null;
  }
}
