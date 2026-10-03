# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 27 – Bulk outbox + playbooks

**Goal:** Post-v1 operator throughput: bulk outbox actions and playbook CRUD.

**Agent actions:**
- `POST /api/outbox/bulk` for submit, approve, reject, send (max 50 ids; send reuses ledger gates)
- Outbox UI selection + bulk buttons
- `GET/POST /api/playbooks`, `PATCH/DELETE /api/playbooks/:id`
- Dashboard `/dashboard/playbooks`

**Achieved:**
- Operators can approve/send batches without one-by-one clicks
- Offer copy managed via playbooks for drafts

**Open items:**
- Live registry discovery still optional Phase 28+

**Commit:** feat(phase-27): bulk outbox actions + playbook CRUD

---

## Prior

v1.0.0 phases 0–26 on main.
