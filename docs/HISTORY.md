# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 33 – Workspace team management

**Goal:** OWNER/ADMIN manage users inside their own workspace only.

**Agent actions:**
- `GET/POST /api/team` list and create (roles ADMIN, OPERATOR, VIEWER only)
- `PATCH/DELETE /api/team/:id` role update and soft-delete
- Cannot modify OWNER/SUPER_ADMIN or remove self
- UI `/dashboard/team` (nav for OWNER/ADMIN/SUPER_ADMIN)

**Achieved:**
- Tenant user lifecycle without public signup or cross-workspace access.

**Open items:**
- Password reset email flow still optional.

**Commit:** feat(phase-33): workspace team user management

---

## Prior

Phases 0–32 on main.
