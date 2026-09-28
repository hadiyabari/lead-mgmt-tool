# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 8–9 – Source Adapter Framework + Official Registry Adapters

**Goal:** Pluggable, rate-limited adapters + primary lead sources for US/UK/AU.

**Agent actions:**
- New package `@leadpilot/sources` with `SourceAdapter` interface, registry, `httpJson` (timeout, retry, circuit breaker, cost hook).
- Adapters: Dummy, NPI US (CMS public API), State License US (pattern), Companies House UK (Ltd/LLP filter), ABN AU, Health Register AU (pattern).
- All adapters honour `simulation` mode.
- APIs: `GET /api/sources`, `PATCH /api/sources/[provider]`, `POST /api/sources/discover` (optional persist to Lead).
- UI: `/dashboard/sources` – enable toggles + simulated discover.
- Kill switch blocks discover.
- Unit tests for NPI + Companies House simulation paths.
- Living docs updated.

**Achieved:**
- Framework ready for any official provider.
- Can pull simulated dental/home/med-spa candidates per country.
- Live NPI works without key; CH needs `COMPANIES_HOUSE_API_KEY`; ABN needs `ABN_LOOKUP_GUID`.
- UK adapter filters to Ltd/LLP-style company types.

**Open items / risks:**
- State board + Ahpra live feeds need per-board licensed endpoints.
- Enrichment adapters (Places/Yelp) are Phase 10.

**Commit:** feat(phase-8-9): source adapter framework + NPI, Companies House, ABN registry adapters

---

## [2026-09-28] Phase 7 – Ledger Imports + UI

**Commit:** feat(phase-7): ledger CSV/CRM import, Gmail import scaffold, ledger UI search/filter

---

## [2026-09-28] Phases 0–6

Bootstrap through ledger core – done.
