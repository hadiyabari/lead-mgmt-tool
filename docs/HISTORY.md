# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

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
