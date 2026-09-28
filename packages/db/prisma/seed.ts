/**
 * Phase 2–4 seed – Threezero workspace + owner with Argon2id password.
 * Default password (dev only): ChangeMeNow123!
 * Run: pnpm --filter @leadpilot/db db:seed
 */
import { PrismaClient, Role, SourceProvider, Vertical, CountryCode } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const DEV_PASSWORD = 'ChangeMeNow123!';

async function main() {
  console.log('Seeding LeadPilot…');

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'threezero' },
    update: {},
    create: {
      name: 'Threezero Agency',
      slug: 'threezero',
      legalAddress: 'China Corporation, Main road China scheme, Lahore 54000',
      primaryDomain: 'threezero.agency',
    },
  });
  console.log(`  Workspace: ${workspace.name}`);

  const passwordHash = await argon2.hash(DEV_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const owner = await prisma.user.upsert({
    where: {
      workspaceId_email: {
        workspaceId: workspace.id,
        email: 'owner@threezero.agency',
      },
    },
    update: { passwordHash },
    create: {
      workspaceId: workspace.id,
      email: 'owner@threezero.agency',
      name: 'Threezero Owner',
      role: Role.OWNER,
      passwordHash,
    },
  });
  console.log(`  Owner: ${owner.email} (password set for dev)`);

  const icp = await prisma.icp.upsert({
    where: { id: 'seed-icp-default' },
    update: {},
    create: {
      id: 'seed-icp-default',
      workspaceId: workspace.id,
      name: 'Default – Dental / Home Services / Med-Spa',
      description:
        'v1 ICP: dental & ortho, home services, aesthetic/med-spa across US, UK (Ltd/LLP), AU.',
      verticals: [Vertical.DENTAL_ORTHO, Vertical.HOME_SERVICES, Vertical.AESTHETIC_MEDSPA],
      countries: [CountryCode.US, CountryCode.UK, CountryCode.AU],
      requireWebsite: true,
      minAuditScore: 40,
      isActive: true,
    },
  });
  console.log(`  ICP: ${icp.name}`);

  await prisma.playbook.upsert({
    where: { id: 'seed-playbook-default' },
    update: {},
    create: {
      id: 'seed-playbook-default',
      workspaceId: workspace.id,
      icpId: icp.id,
      name: 'Local + AI Visibility Retainer',
      description: 'Entry offer = free/low-cost audit + 30-day quick wins → monthly retainer.',
      offerName: 'Local + AI Visibility Retainer',
      offerSummary:
        'Google Business Profile + Local SEO + AEO + conversion-ready website. Free or low-cost audit + 30-day quick wins, then monthly retainer.',
      isActive: true,
    },
  });

  const sources: { provider: SourceProvider; name: string }[] = [
    { provider: SourceProvider.NPI_US, name: 'NPI Registry (US)' },
    { provider: SourceProvider.STATE_LICENSE_US, name: 'State Licensing Boards (US)' },
    { provider: SourceProvider.COMPANIES_HOUSE_UK, name: 'Companies House (UK – Ltd/LLP)' },
    { provider: SourceProvider.ABN_ASIC_AU, name: 'ABN Lookup / ASIC (AU)' },
    { provider: SourceProvider.HEALTH_REGISTER_AU, name: 'Health Practitioner Register (AU)' },
    { provider: SourceProvider.JOB_BOARD, name: 'Job Board Intent Signals' },
    { provider: SourceProvider.GOOGLE_PLACES_ENRICH, name: 'Google Places (enrichment only)' },
    { provider: SourceProvider.YELP_ENRICH, name: 'Yelp (enrichment only)' },
    { provider: SourceProvider.WEBSITE_EXTRACT, name: 'Website Contact Extraction' },
  ];

  for (const s of sources) {
    await prisma.sourceConfig.upsert({
      where: {
        workspaceId_provider: { workspaceId: workspace.id, provider: s.provider },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        provider: s.provider,
        name: s.name,
        isEnabled: false,
        maxRequestsPerMinute: 30,
      },
    });
  }

  console.log('Seed complete.');
  console.log(`  Dev login: owner@threezero.agency / ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
