# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 31 – Registry discover API

**Goal:** Wire built-in source adapters into an operator discover endpoint that can persist leads.

**Agent actions:**
- `POST /api/sources/discover` runs primary adapter discover (NPI, Companies House, ABN, etc.)
- Respects kill switch, simulation flag, workspace source enablement for live mode
- Dedupes by domain; writes Lead rows as DISCOVERED
- Records cost ledger entry
- `GET /api/sources/adapters` lists registered adapters

**Achieved:**
- Discover path is no longer limited to hard-coded sample leads in the run executor.

**Open items:**
- Live keys: COMPANIES_HOUSE_API_KEY, ABN_LOOKUP_GUID, etc. still optional
- Batch discover across all enabled sources

**Commit:** feat(phase-31): registry discover API + lead persistence from adapters

---

## Prior

Phases 0–30 on main.
