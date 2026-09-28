# FILEMAP – LeadPilot Retainer Edition

Living map of the repository. Updated after every phase.

## Root

| Path | Purpose |
|------|---------|
| `package.json` | Root workspace scripts, packageManager, shared devDeps |
| `pnpm-workspace.yaml` | Declares `apps/*` and `packages/*` |
| `turbo.json` | Turborepo task graph |
| `tsconfig.base.json` | Shared TypeScript base config |
| `.env.example` | All required env keys (no secrets) |
| `.gitignore` | Standard Node / Next / Prisma ignores |
| `.prettierrc` / `.prettierignore` | Formatting |
| `scripts/placeholder-scan.mjs` | CI gate – fails on TODO/FIXME/PLACEHOLDER + suspicious emails |

## docs/

| Path | Purpose |
|------|---------|
| `docs/AGENT_RULES.md` | Non-negotiable agent rules |
| `docs/HISTORY.md` | Phase-by-phase changelog |
| `docs/README.md` | Product overview + local run instructions |
| `docs/FILEMAP.md` | This file |
| `docs/PLAN.md` | Full project plan (source of truth) |

## apps/

| Path | Purpose |
|------|---------|
| `apps/web/` | Next.js 15 App Router application (frontend + Route Handlers). Skeleton only in Phase 0. |

## packages/

| Path | Purpose |
|------|---------|
| `packages/db/` | Prisma schema, migrations, generated client. Skeleton only in Phase 0. |
| `packages/shared/` | Shared TypeScript types, normalisation helpers, constants. Skeleton only in Phase 0. |
| `packages/workers/` | BullMQ worker processes. Skeleton only in Phase 0. |

## Planned (later phases)

- `docker-compose.yml` – Postgres + Redis
- `.github/workflows/ci.yml` – lint, typecheck, test, security audit
- `docs/REFERENCES.md` – open-source attribution
- Full Prisma schema, Auth.js config, source adapters, scoring engine, etc.
