# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 29 – ICPs + SUPER_ADMIN provisioning

**Goal:** Tenant ICP management and platform-level workspace creation.

**Agent actions:**
- `GET/POST /api/icps`, `PATCH/DELETE /api/icps/:id`
- Dashboard `/dashboard/icps`
- `GET/POST /api/admin/workspaces` (SUPER_ADMIN only) creates workspace + OWNER
- `POST /api/admin/users` (SUPER_ADMIN only)
- `/admin/tenants` UI; nav link for SUPER_ADMIN only

**Achieved:**
- Multi-tenant provisioning path matches product rules (no public signup).

**Open items:**
- Promote a seeded SUPER_ADMIN user when needed (role assign via DB or admin API).

**Commit:** feat(phase-29): ICP management + SUPER_ADMIN workspace provisioning

---

## Prior

Phases 0–27 on main.
