# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 19–20 – Hardening + e2e run

**Goal:** Operational hardening and one-button simulated pipeline.

**Agent actions (19):**
- Deep health: `GET /api/health?deep=1` probes Postgres
- Cost ledger API `GET/POST /api/costs` + `recordCost` helper
- Suppression list API `GET/POST /api/suppression`

**Agent actions (20):**
- `POST /api/runs` create; `POST /api/runs/:id/execute` runs simulation pipeline:
  create sample leads → audit → score → draft email (ledger gated)
- Runs dashboard: start simulation run + log output
- Respects kill switch and maxCredits

**Achieved:**
- Operators can prove the full loop without live providers.

**Open items:**
- Live registry adapters in non-simulation execute path.
- Cost UI panel (API ready).

**Commit:** feat(phase-19-20): hardening (health, costs, suppression) + e2e pipeline run

---

## Prior

Phases 0–18 on main.
