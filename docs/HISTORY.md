# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 2 – Database Schema Part A: Tenancy, Users, ICP, Sources

**Goal:** Core multi-user foundation (single workspace for v1) and configuration tables.

**Agent actions:**
- Created full Prisma schema for Workspace, User, Account, Session, VerificationToken, Icp, Playbook, SourceConfig.
- Defined enums: Role, Vertical, CountryCode, SourceProvider.
- Wrote initial migration SQL (`20260928120000_phase2_tenancy_users_icp_sources`).
- Implemented seed script: Threezero Agency workspace, owner user, default ICP, default playbook, all source configs (disabled).
- Added thin repository helpers in `packages/db/src/index.ts` (getWorkspaceBySlug, getUserByEmail, listActiveIcps, etc.).
- Updated package.json with Prisma scripts (generate, migrate, seed, studio, reset).
- Updated living documents (HISTORY, README, FILEMAP, PLAN).

**Achieved:**
- Schema covers Auth.js-compatible auth models + workspace tenancy + ICP/playbook/source configuration.
- Soft-delete fields present on User, Workspace, Icp, Playbook.
- Seed is idempotent (upsert) and creates a working owner account ready for Phase 4 password hashing.
- Unique constraints: workspace slug, (workspaceId + email), (workspaceId + provider).

**Open items / risks:**
- Migration has not been applied against a live DB yet (requires local `docker compose up` + `pnpm db:migrate`).
- Password hashing and MFA fields exist but are unused until Phase 4.
- No leads/ledger/messaging tables yet (Phase 3).

**Commit:** feat(phase-2): database schema part A – tenancy, users, ICP, sources + seed

---

## [2026-09-28] Phase 1 – Monorepo Tooling, CI, Docker, Quality Gates

**Goal:** Make the development experience reliable and prevent bad code from landing.

**Agent actions:**
- Added `docker-compose.yml` (Postgres 16 + Redis 7 with healthchecks).
- Added GitHub Actions CI workflow (`.github/workflows/ci.yml`): install, placeholder-scan, lint, typecheck, unit tests, soft security audit.
- Scaffolded real Next.js 15 App Router app under `apps/web` with TypeScript, Vitest, path aliases.
- Implemented `/api/health` endpoint returning status, simulationMode, killSwitch flags.
- Added unit smoke test for health contract.
- Configured shared package (`@leadpilot/shared`) with editable agency defaults (Threezero Agency + legal address).
- Updated root scripts (`docker:up`, `docker:down`, `docker:logs`).
- Updated living documents (HISTORY, README, FILEMAP, PLAN).

**Achieved:**
- `docker compose up -d` brings up Postgres + Redis.
- CI workflow is present and will run on push/PR to main.
- Developer can run `pnpm install && pnpm --filter @leadpilot/web dev` and hit `/api/health`.
- Agency defaults are centralized and marked editable for later workspace settings.

**Open items / risks:**
- `pnpm-lock.yaml` will be generated on first local `pnpm install` (not committed yet; CI uses `--frozen-lockfile` once lockfile exists).
- Playwright e2e skeleton deferred until there is more UI (Phase 5).
- Prisma schema and real auth still Phase 2–4.

**Commit:** chore(phase-1): tooling, Docker, CI, health-check, quality gates

---

## [2026-09-28] Phase 0 – Repository Bootstrap and Living Documents

**Goal:** Create a clean monorepo skeleton and the five mandatory living documents so every future commit has a place to record history and rules.

**Agent actions:**
- Initialized pnpm + Turborepo monorepo layout (`apps/`, `packages/`).
- Added root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`.
- Created `docs/AGENT_RULES.md`, `docs/HISTORY.md`, `docs/README.md`, `docs/FILEMAP.md`, `docs/PLAN.md`.
- Added `.env.example` listing all required keys (no values).
- Added `scripts/placeholder-scan.mjs` that fails on TODO/FIXME/PLACEHOLDER and suspicious real-looking emails.
- Added `.gitignore`, Prettier config.
- Scaffolded empty package placeholders for `apps/web`, `packages/db`, `packages/shared`, `packages/workers`.

**Achieved:**
- Repository is no longer empty.
- All five living documents exist and are non-empty.
- `placeholder-scan` script is present and ready for CI.
- First commit lands the bootstrap exactly as specified in Phase 0.

**Open items / risks:**
- Actual Next.js / Prisma / worker packages are still skeleton only (Phase 1+).
- No Docker Compose, CI, or real app yet.
- Human must still answer the intake questions before Phase 1 proceeds.

**Commit:** chore: bootstrap monorepo and living documents
