# FILEMAP – LeadPilot Retainer Edition

Living map of the repository. Updated after every phase.

## Root

| Path | Purpose |
|------|---------|
| `package.json` | Root workspace scripts |
| `pnpm-workspace.yaml` | apps/* + packages/* |
| `turbo.json` | Turborepo task graph |
| `tsconfig.base.json` | Shared TS base |
| `docker-compose.yml` | Postgres 16 + Redis 7 |
| `.env.example` | Required env keys |
| `.github/workflows/ci.yml` | CI pipeline |
| `scripts/placeholder-scan.mjs` | CI gate for TODO / fake emails |

## docs/

| Path | Purpose |
|------|---------|
| `docs/AGENT_RULES.md` | Non-negotiable agent rules |
| `docs/HISTORY.md` | Phase-by-phase changelog |
| `docs/README.md` | Product overview + local run |
| `docs/FILEMAP.md` | This file |
| `docs/PLAN.md` | Full project plan |

## apps/web

| Path | Purpose |
|------|---------|
| `apps/web/src/app/layout.tsx` | Root layout |
| `apps/web/src/app/page.tsx` | Home placeholder |
| `apps/web/src/app/api/health/route.ts` | Health-check endpoint |
| `apps/web/src/app/api/health/route.test.ts` | Smoke test |

## packages/db (Phase 2)

| Path | Purpose |
|------|---------|
| `packages/db/prisma/schema.prisma` | Full schema: Workspace, User, Account, Session, VerificationToken, Icp, Playbook, SourceConfig |
| `packages/db/prisma/migrations/…` | Initial migration SQL |
| `packages/db/prisma/seed.ts` | Seed: Threezero workspace, owner, default ICP/playbook, source configs |
| `packages/db/src/index.ts` | Prisma client singleton + repository helpers |

### Table purposes (Phase 2)

| Table | Purpose |
|-------|---------|
| `workspaces` | Single-tenant workspace (Threezero Agency); multi-tenant ready |
| `users` | Users with Role (OWNER/ADMIN/OPERATOR/VIEWER); soft-delete |
| `accounts` | OAuth / Auth.js account links |
| `sessions` | Auth.js sessions |
| `verification_tokens` | Email verification / password-reset tokens |
| `icps` | Ideal Customer Profiles (verticals, countries, geo, audit thresholds) |
| `playbooks` | Outreach sequences + offer messaging linked to ICPs |
| `source_configs` | Which official registry / enrichment adapters are enabled + rate limits |

## packages/shared

| Path | Purpose |
|------|---------|
| `packages/shared/src/index.ts` | Agency defaults, shared types |

## packages/workers

Skeleton only – workers arrive with pipeline phases.
