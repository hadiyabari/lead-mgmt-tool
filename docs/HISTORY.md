# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 14–15 – Outbox approval + send path

**Goal:** Review queue for drafts; send only after approval with final ledger gate.

**Agent actions (14):**
- Outbox list API with status filter and counts
- submit (DRAFT→PENDING_REVIEW), approve, reject, PATCH edit
- Dashboard `/dashboard/outbox` with actions

**Agent actions (15):**
- Package `@leadpilot/email-send` (simulation default, Postmark when token set)
- Send API: claim APPROVED row, fourPointCheck, send, EmailSent record, lead CONTACTED, ledgerInsert OUTBOUND_SEND
- Kill switch blocks send
- Row lock via lockedAt/lockedBy

**Achieved:**
- Full draft → review → approve → send loop in simulation
- Never-contacted enforced at send time again

**Open items:**
- Bulk approve/send
- Reply ingestion (Phase 16+)

**Commit:** feat(phase-14-15): outbox review queue + send path with ledger gate

---

## Prior

Phases 0–13 on main.
