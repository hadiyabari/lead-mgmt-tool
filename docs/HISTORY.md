# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 41 – Analytics CSV and sequences

**Goal:** Export site events; manage email sequence definitions.

**Agent actions:**
- `GET /api/admin/analytics/export?days=`
- Sequences API `GET/POST /api/sequences`, `PATCH/DELETE /api/sequences/:id`
- UI `/dashboard/sequences` with default 3-step template

**Achieved:**
- Analytics downloadable; sequences stored for campaign planning.

**Open items:**
- Auto-enqueue sequence steps into outbox scheduler later.

**Commit:** feat(phase-41): analytics CSV export + sequences CRUD

---

## Prior

Phases 0–40 on main.
