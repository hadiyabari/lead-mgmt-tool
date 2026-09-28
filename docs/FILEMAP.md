# FILEMAP – LeadPilot Retainer Edition

Living map of the repository. Updated after every phase.

## Root

| Path | Purpose |
|------|---------|
| `package.json` | Root workspace scripts, packageManager, shared devDeps |
| `pnpm-workspace.yaml` | Declares `apps/*` and `packages/*` |
| `turbo.json` | Turborepo task graph |
| `tsconfig.base.json` | Shared TypeScript base config |
| `docker-compose.yml` | Postgres 16 + Redis 7 (local) |
| `.env.example` | All required env keys (no secrets) |
| `.gitignore` | Standard Node / Next / Prisma ignores |
| `.prettierrc` / `.prettierignore` | Formatting |
| `scripts/placeholder-scan.mjs` | CI gate – fails on TODO/FIXME/PLACEHOLDER + suspicious emails |
| `.github/workflows/ci.yml` | Lint, typecheck, test, placeholder-scan, audit |

## docs/

| Path | Purpose |
|------|---------|
| `docs/AGENT_RULES.md` | Non-negotiable agent rules |
| `docs/HISTORY.md` | Phase-by-phase changelog |
| `docs/README.md` | Product overview + local run instructions |
| `docs/FILEMAP.md` | This file |
| `docs/PLAN.md` | Full project plan (source of truth) |

## apps/web

| Path | Purpose |
|------|---------|
| `apps/web/package.json` | Next.js 15 + React 19 + Vitest |
| `apps/web/tsconfig.json` | Extends base; path aliases `@/*`, `@leadpilot/shared` |
| `apps/web/next.config.ts` | Next config, transpile shared package |
| `apps/web/src/app/layout.tsx` | Root layout |
| `apps/web/src/app/page.tsx` | Home placeholder |
| `apps/web/src/app/api/health/route.ts` | Health-check endpoint |
| `apps/web/src/app/api/health/route.test.ts` | Smoke test for health contract |
| `apps/web/vitest.config.ts` | Unit test config |

## packages/

| Path | Purpose |
|------|---------|
| `packages/shared/src/index.ts` | Agency defaults (Threezero Agency), shared types |
| `packages/shared/tsconfig.json` | Shared package TS config |
| `packages/db/` | Prisma schema, migrations, client (Phase 2+) |
| `packages/workers/` | BullMQ workers (later phases) |

## Planned (later phases)

- Prisma schema + seed (Phase 2–3)
- Auth.js + MFA pages (Phase 4–5)
- Full pipeline packages, source adapters, scoring, etc.
