# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 39 – Workspace profile and ledger export

**Goal:** Editable agency profile and compliance export of contact ledger.

**Agent actions:**
- `GET/PATCH /api/workspace` (name, legalAddress, primaryDomain; OWNER/ADMIN)
- Settings workspace form
- `GET /api/ledger/export` CSV download
- Export CSV link on ledger page

**Achieved:**
- Legal footer address can be maintained in-app; ledger exportable for audits.

**Open items:**
- Pagination beyond 5000 export rows if needed.

**Commit:** feat(phase-39): workspace profile update + ledger CSV export

---

## Prior

Phases 0–38 on main.
