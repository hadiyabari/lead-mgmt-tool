# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 3 – Database Schema Part B: Leads, Ledger, Messaging, Meetings

**Goal:** Complete the data model needed for the full pipeline.

**Agent actions:**
- Extended Prisma schema with Lead, LeadEnrichment, LeadScore, AuditResult.
- Added ContactHistoryLedger (unique on workspace + normalizedEmail / normalizedPhone).
- Added Campaign, Sequence, EmailOutbox, EmailSent, Reply, Meeting.
- Added SuppressionList, CostLedger, Run.
- New enums: LeadStatus, ContactChannel, ContactOrigin, CampaignStatus, OutboxStatus, ReplyClassification, MeetingStatus, RunStatus, CostCategory.
- Wrote migration `20260928140000_phase3_leads_ledger_messaging`.
- Extended repository helpers: `findLedgerByEmail`, `findLedgerByPhone`, `isAlreadyContacted`, `isSuppressed`, lead/run helpers.
- Updated FILEMAP with every table purpose; HISTORY, README, PLAN, db README updated.

**Achieved:**
- Full pipeline data model present.
- Ledger uniqueness constraints defined for never-contacted gate.
- Outbox includes lock fields (`lockedAt`, `lockedBy`) for worker claim pattern.
- Runs support goal lead count + max credits + simulation flag.
- Soft-delete on Lead; indexes for status, domain, email, score lookups.

**Open items / risks:**
- Migration not yet applied to a live DB (local `db:migrate` required).
- Postgres UNIQUE allows multiple NULLs; app must not insert empty normalized email/phone as unique keys.
- Normalisation package (Phase 6) still required before production ledger use.
- No seed data for leads/ledger (intentionally empty).

**Commit:** feat(phase-3): database schema part B – leads, ledger, messaging, meetings, runs

---

## [2026-09-28] Phase 2 – Database Schema Part A: Tenancy, Users, ICP, Sources

**Goal:** Core multi-user foundation (single workspace for v1) and configuration tables.

**Agent actions:**
- Created full Prisma schema for Workspace, User, Account, Session, VerificationToken, Icp, Playbook, SourceConfig.
- Defined enums: Role, Vertical, CountryCode, SourceProvider.
- Wrote initial migration SQL (`20260928120000_phase2_tenancy_users_icp_sources`).
- Implemented seed script: Threezero Agency workspace, owner user, default ICP, default playbook, all source configs (disabled).
- Added thin repository helpers in `packages/db/src/index.ts`.
- Updated package.json with Prisma scripts; updated living documents.

**Achieved:**
- Schema covers Auth.js-compatible auth models + workspace tenancy + ICP/playbook/source configuration.
- Soft-delete fields present on User, Workspace, Icp, Playbook.
- Seed is idempotent and creates a working owner account ready for Phase 4.

**Open items / risks:**
- Migration not applied against live DB yet.
- Password hashing / MFA unused until Phase 4.

**Commit:** feat(phase-2): database schema part A – tenancy, users, ICP, sources + seed

---

## [2026-09-28] Phase 1 – Monorepo Tooling, CI, Docker, Quality Gates

**Goal:** Make the development experience reliable and prevent bad code from landing.

**Agent actions:**
- Docker Compose (Postgres 16 + Redis 7), GitHub Actions CI, Next.js 15 app, `/api/health`, Vitest, shared agency defaults, living docs updated.

**Achieved:**
- Local Docker + CI + health endpoint in place.

**Commit:** chore(phase-1): tooling, Docker, CI, health-check, quality gates

---

## [2026-09-28] Phase 0 – Repository Bootstrap and Living Documents

**Goal:** Clean monorepo skeleton and five mandatory living documents.

**Agent actions:**
- pnpm + Turborepo layout, docs/*, .env.example, placeholder-scan, package skeletons.

**Commit:** chore: bootstrap monorepo and living documents
