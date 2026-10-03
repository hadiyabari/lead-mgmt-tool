# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 32 – Batch discover

**Goal:** Run discover across multiple primary sources in one request; tighten Sources UI.

**Agent actions:**
- `POST /api/sources/discover-batch` (enabled sources in live mode; all primary in simulation)
- Sources UI: persist toggle, Discover one, Batch discover
- Removed marketing-style guidance blurb from Sources page

**Achieved:**
- Multi-source discovery with domain dedupe and cost ledger entries per provider.

**Open items:**
- Live key QA per registry remains environment-specific.

**Commit:** feat(phase-32): batch discover across enabled sources + sources UI

---

## Prior

Phases 0–31 on main.
