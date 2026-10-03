import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma, fourPointCheck } from '@leadpilot/db';
import { runAudit } from '@leadpilot/audit';
import { scoreLead } from '@leadpilot/scoring';
import { generateEmail } from '@leadpilot/email-gen';
import { recordCost } from '@/lib/cost';
import type { Role, Prisma } from '@leadpilot/db';
import { canStartRuns } from '@/lib/rbac';

/**
 * Phase 20 – end-to-end simulated pipeline for one run.
 * Steps: pick/create sample leads → audit → score → draft email (if email + ledger ok).
 * Always respects kill switch, maxCredits, and ledger.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canStartRuns((session.user.role || 'VIEWER') as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: session.user.workspaceId, deletedAt: null },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }
  if (workspace.killSwitch || process.env.KILL_SWITCH === 'true') {
    return NextResponse.json({ error: 'Kill switch is active' }, { status: 423 });
  }

  const { id } = await ctx.params;
  const run = await prisma.run.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });
  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  if (run.status === 'RUNNING') {
    return NextResponse.json({ error: 'Run already in progress' }, { status: 409 });
  }

  await prisma.run.update({
    where: { id },
    data: { status: 'RUNNING', startedAt: new Date(), errorMessage: null },
  });

  const log: string[] = [];
  let leadsFound = 0;
  let leadsQualified = 0;
  let creditsUsed = 0;
  const maxCredits = run.maxCredits ?? 100;
  const goal = run.goalLeadCount ?? 5;

  try {
    // Seed a few simulation leads if workspace is empty of DISCOVERED/SCORED
    const existing = await prisma.lead.count({
      where: { workspaceId: session.user.workspaceId, deletedAt: null },
    });

    if (existing === 0 || run.isSimulation) {
      const samples = [
        {
          companyName: 'Bright Smile Dental',
          domain: 'brightsmile.example',
          website: 'https://brightsmile.example',
          primaryEmail: `brightsmile+${Date.now()}@example.com`,
          city: 'Austin',
          region: 'TX',
          country: 'US' as const,
          vertical: 'DENTAL_ORTHO' as const,
        },
        {
          companyName: 'Summit Home Pros',
          domain: 'summithome.example',
          website: 'https://summithome.example',
          primaryEmail: `summit+${Date.now()}@example.com`,
          city: 'Denver',
          region: 'CO',
          country: 'US' as const,
          vertical: 'HOME_SERVICES' as const,
        },
        {
          companyName: 'Luxe Aesthetic Clinic',
          domain: 'luxeclinic.example',
          website: 'https://luxeclinic.example',
          primaryEmail: `luxe+${Date.now()}@example.com`,
          city: 'Miami',
          region: 'FL',
          country: 'US' as const,
          vertical: 'AESTHETIC_MEDSPA' as const,
        },
      ].slice(0, goal);

      for (const s of samples) {
        if (creditsUsed >= maxCredits) break;
        const lead = await prisma.lead.create({
          data: {
            workspaceId: session.user.workspaceId,
            ...s,
            status: 'DISCOVERED',
            sourceProvider: 'CUSTOM',
            sourceMeta: { runId: id, simulation: true },
          },
        });
        leadsFound += 1;
        creditsUsed += 1;
        log.push(`created lead ${lead.companyName}`);

        // Audit
        const audit = await runAudit(s.website, { simulation: true });
        await prisma.auditResult.create({
          data: {
            leadId: lead.id,
            url: s.website,
            score: audit.score,
            findings: audit.findings as unknown as Prisma.InputJsonValue,
            rawReport: audit.raw as Prisma.InputJsonValue,
          },
        });
        await recordCost({
          workspaceId: session.user.workspaceId,
          category: 'AUDIT',
          provider: 'simulation',
          units: 1,
          unitCost: 0,
          runId: id,
        });
        creditsUsed += 1;

        // Score
        const scored = scoreLead({
          auditScore: audit.score,
          hasWebsite: true,
          hasEmail: true,
          hasPhone: false,
        });
        await prisma.leadScore.create({
          data: {
            leadId: lead.id,
            totalScore: scored.totalScore,
            breakdown: scored.breakdown as unknown as Prisma.InputJsonValue,
            weightsUsed: scored.weightsUsed as unknown as Prisma.InputJsonValue,
          },
        });
        const qualified = scored.totalScore >= (scored.qualifiedThreshold ?? 55);
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: qualified ? 'QUALIFIED' : 'SCORED' },
        });
        if (qualified) leadsQualified += 1;
        log.push(`scored ${lead.companyName}: ${scored.totalScore}`);

        // Draft email if ledger allows
        const gate = await fourPointCheck(session.user.workspaceId, {
          email: s.primaryEmail,
          domain: s.domain,
        });
        if (gate.allowed) {
          const generated = await generateEmail({
            companyName: s.companyName,
            website: s.website,
            domain: s.domain,
            city: s.city,
            region: s.region,
            country: s.country,
            vertical: s.vertical,
            auditScore: audit.score,
            findings: audit.findings.map((f) => ({
              title: f.title,
              severity: f.severity,
              category: f.category,
              description: f.description,
            })),
            agencyName: workspace.name,
            legalAddress: workspace.legalAddress,
            simulation: true,
          });
          await prisma.emailOutbox.create({
            data: {
              workspaceId: session.user.workspaceId,
              leadId: lead.id,
              toEmail: s.primaryEmail,
              subject: generated.subject,
              bodyHtml: generated.bodyHtml,
              bodyText: generated.bodyText,
              factsUsed: generated.factsUsed as unknown as Prisma.InputJsonValue,
              status: 'DRAFT',
              isSimulation: true,
            },
          });
          await recordCost({
            workspaceId: session.user.workspaceId,
            category: 'LLM',
            provider: generated.model || 'template',
            units: 1,
            unitCost: 0,
            runId: id,
          });
          log.push(`draft email for ${lead.companyName}`);
        } else {
          log.push(`skipped draft for ${lead.companyName}: ${gate.reason}`);
        }
      }
    }

    const finished = await prisma.run.update({
      where: { id },
      data: {
        status: creditsUsed >= maxCredits ? 'BUDGET_EXHAUSTED' : 'COMPLETED',
        finishedAt: new Date(),
        leadsFound,
        leadsQualified,
        creditsUsed,
      },
    });

    return NextResponse.json({
      run: finished,
      log,
      summary: { leadsFound, leadsQualified, creditsUsed, maxCredits },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.run.update({
      where: { id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errorMessage: msg,
        leadsFound,
        leadsQualified,
        creditsUsed,
      },
    });
    return NextResponse.json({ error: msg, log }, { status: 500 });
  }
}
