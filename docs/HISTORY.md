# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 5 – Frontend Shell, Design System, Auth Pages, Kill Switch

**Goal:** Usable application shell and emergency controls.

**Agent actions:**
- Global CSS design tokens (dark theme: bg, border, primary, danger, badges).
- `AppShell` component: sidebar nav (Dashboard, Leads, Runs, Campaigns, Ledger, Settings) + topbar.
- Placeholder pages under `/dashboard/*` and `/settings`.
- Kill switch: `workspaces.killSwitch` column + migration; `GET/POST /api/kill-switch`; `KillSwitch` client component (OWNER/ADMIN only).
- Dashboard shows lead/run/campaign counts, simulation badge, kill switch banner.
- Root `/` redirects to dashboard or login.
- Middleware protects kill-switch API and settings.
- Living docs updated.

**Achieved:**
- Authenticated app loads with shell navigation.
- Kill switch is reachable and persists on the workspace (workers will honour it in later phases).
- Env `KILL_SWITCH=true` still forces active state.

**Open items / risks:**
- Design system is CSS tokens only (full shadcn/Tailwind can be layered later without breaking layout).
- Nav links to empty feature pages by design.
- Workers do not yet read kill switch (no workers until pipeline phases).

**Commit:** feat(phase-5): app shell, design tokens, sidebar, kill switch API + UI

---

## [2026-09-28] Phase 4 – Authentication, Workspaces, Roles, MFA, Password Reset

**Commit:** feat(phase-4): auth.js credentials, argon2id, MFA TOTP, password reset, RBAC, rate limits

---

## [2026-09-28] Phase 3 – Database Schema Part B

**Commit:** feat(phase-3): database schema part B – leads, ledger, messaging, meetings, runs

---

## [2026-09-28] Phase 2 – Database Schema Part A

**Commit:** feat(phase-2): database schema part A – tenancy, users, ICP, sources + seed

---

## [2026-09-28] Phase 1 – Tooling, CI, Docker

**Commit:** chore(phase-1): tooling, Docker, CI, health-check, quality gates

---

## [2026-09-28] Phase 0 – Bootstrap

**Commit:** chore: bootstrap monorepo and living documents
