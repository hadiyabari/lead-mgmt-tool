# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 16 – Reply intake and classification

**Goal:** Capture inbound replies, classify, update lead and suppression.

**Agent actions:**
- Package `@leadpilot/replies` with deterministic rule classifier (unsub, bounce, OOO, interested, objection).
- `POST /api/replies/inbound` webhook (Postmark-shaped or generic JSON), secret via `INBOUND_WEBHOOK_SECRET`.
- Match to EmailSent / lead; store Reply; update lead status; suppress + ledger on UNSUBSCRIBE.
- `GET /api/replies` list; manual reclassify API.
- Dashboard `/dashboard/replies`.
- Unit tests for classifier.

**Achieved:**
- End-to-end reply path without LLM.
- Unsubscribe permanently blocks via suppression list.

**Open items:**
- Meeting booking flow (Phase 17).
- Provider-specific signature verification beyond shared secret.

**Commit:** feat(phase-16): inbound reply intake, classification, suppression on unsubscribe

---

## Prior

Phases 0–15 on main.
