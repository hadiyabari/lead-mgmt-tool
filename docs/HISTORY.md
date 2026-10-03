# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 13 – Grounded email generation

**Goal:** Draft outreach only from verified lead facts and audit findings.

**Agent actions:**
- Package `@leadpilot/email-gen`: allowed-facts builder, deterministic template writer, optional Anthropic path with fact-only prompt and template fallback.
- `POST /api/leads/[id]/draft-email`: kill switch check, ledger never-contacted gate, playbook offer fields, creates EmailOutbox DRAFT with factsUsed JSON.
- Unit tests for template output.
- Web depends on email-gen; next.config transpilePackages updated; Dockerfile copies email-gen package.json.

**Achieved:**
- Simulation works without ANTHROPIC_API_KEY.
- Drafts blocked when ledger match exists.
- Facts used stored on outbox for auditability.

**Open items:**
- Operator UI to preview/edit draft (Phase 14).
- Live Anthropic requires ANTHROPIC_API_KEY and SIMULATION_MODE=false.

**Commit:** feat(phase-13): grounded email generation from audit facts + outbox draft API

---

## Prior

Phases 0–12 on main.
