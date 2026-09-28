# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 10–11 – Enrichment Layer + Audit Tool Integration

**Goal:** Attach ratings/contacts/signals to leads; call agency audit tool for grounded outreach.

**Agent actions (Phase 10):**
- Google Places enrichment adapter (enrich-only; never list-building).
- Yelp Fusion enrichment adapter.
- Website contact extractor (robots.txt respectful, contact path crawl).
- Job board intent adapter (hiring signal; simulation default).
- `enrichLead()` orchestrator merges provider results.
- `POST /api/leads/[id]/enrich` persists `LeadEnrichment` rows + updates lead.

**Agent actions (Phase 11):**
- New package `@leadpilot/audit`: `runAudit(url)` → score + findings.
- In-memory cache (7 days); simulation when tool/URL missing; live fallback to simulation on error.
- `POST /api/leads/[id]/audit` attaches `AuditResult` to lead.
- `POST /api/audit` standalone audit.
- Env: `AUDIT_TOOL_URL`, `AUDIT_TOOL_API_KEY`.
- Unit tests for simulation + cache.

**Achieved:**
- Enrichment results stored with provider + timestamps.
- Audit score/findings attachable to Lead for later email generation.
- Simulation path works without external keys.

**Open items:**
- Scoring formula (Phase 12–13).
- Live Adzuna job API not fully wired (needs keys + mapping).

**Commit:** feat(phase-10-11): enrichment adapters (Places/Yelp/website/jobs) + audit tool client

---

## [2026-09-28] Phase 8–9 – Source adapters + registries

**Commit:** feat(phase-8-9): source adapter framework + NPI, Companies House, ABN registry adapters

---

## [2026-09-28] Phases 0–7

Bootstrap through ledger UI – done.
