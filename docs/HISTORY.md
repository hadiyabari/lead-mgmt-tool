# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

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
