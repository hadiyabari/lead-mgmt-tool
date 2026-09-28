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

## packages/db

| Path | Purpose |
|------|---------|
| `packages/db/prisma/schema.prisma` | Full schema (Phase 2 + 3) |
| `packages/db/prisma/migrations/…` | Phase 2 + Phase 3 migrations |
| `packages/db/prisma/seed.ts` | Threezero workspace + owner + default ICP/playbook/sources |
| `packages/db/src/index.ts` | Prisma client + helpers (ledger, leads, runs) |

### Table purposes

#### Phase 2 – Tenancy & config

| Table | Purpose |
|-------|---------|
| `workspaces` | Single-tenant workspace (Threezero); multi-tenant ready |
| `users` | Users with Role; soft-delete |
| `accounts` | OAuth / Auth.js account links |
| `sessions` | Auth.js sessions |
| `verification_tokens` | Email verification / password-reset tokens |
| `icps` | Ideal Customer Profiles |
| `playbooks` | Outreach sequences + offer messaging |
| `source_configs` | Official registry / enrichment adapters + rate limits |

#### Phase 3 – Pipeline data model

| Table | Purpose |
|-------|---------|
| `leads` | Normalized company identity, location, vertical, status, provenance |
| `lead_enrichments` | Rating, reviews, website, phone/email from enrichment providers |
| `lead_scores` | Explainable total score + breakdown + weights snapshot |
| `audit_results` | Agency audit tool output (score + findings) linked to lead |
| `contact_history_ledger` | **Single source of truth for already-contacted.** Unique on normalized email/phone per workspace. Checked at four pipeline points. |
| `campaigns` | Campaign container; supports simulation flag |
| `sequences` | Ordered step configs for outreach |
| `emails_outbox` | Outbox pattern with worker locks; factsUsed for grounding |
| `emails_sent` | Immutable send log |
| `replies` | Inbound replies + classification |
| `meetings` | Booked calls linked to leads |
| `suppression_list` | Hard block (unsubscribe, bounce, legal) |
| `cost_ledger` | Every paid API / credit spend |
| `runs` | Goal-based pipeline runs (lead count + max credits + simulation) |

## packages/shared

| Path | Purpose |
|------|---------|
| `packages/shared/src/index.ts` | Agency defaults, shared types |

## packages/workers

Skeleton only – workers arrive with pipeline phases.
