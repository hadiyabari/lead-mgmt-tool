# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 7 – Ledger Imports (CSV, CRM, Gmail) and Ledger UI

**Goal:** Ingest historical contacts so the system never emails people the agency already spoke to.

**Agent actions:**
- CSV parser + column auto-mapping in `@leadpilot/shared` (`parseCsv`, `guessColumnMapping`) with unit tests.
- `POST /api/ledger/import` – multipart CSV or JSON; origins CSV / CRM / Gmail-export; max 5MB / 5000 rows; uses `ledgerBulkImport`.
- `POST /api/ledger/import/gmail` – scaffold (501 until Google OAuth + mailbox connect in Phase 16); documents CSV fallback.
- `GET /api/ledger` – search/filter by q + origin, pagination.
- `ledgerList` service helper.
- Ledger UI: import form + searchable table (origin, last contacted).
- Middleware protects `/api/ledger*`.
- Living docs updated.

**Achieved:**
- CSV import path can load large historical lists with dedup on normalized email/phone.
- UI shows origin and last-contacted date.
- CRM treated as same CSV pipeline with origin `LEDGER_IMPORT_CRM`.

**Open items / risks:**
- Live Gmail API sync deferred to mailbox OAuth (Phase 16); CSV export path works now.
- No streaming parse for files >5MB (limit enforced).

**Commit:** feat(phase-7): ledger CSV/CRM import, Gmail import scaffold, ledger UI search/filter

---

## [2026-09-28] Phase 6 – Normalisation + Ledger Core

**Commit:** feat(phase-6): normalisation package + contact-history ledger core + four-point check

---

## [2026-09-28] Phase 5 – Frontend Shell, Kill Switch

**Commit:** feat(phase-5): app shell, design tokens, sidebar, kill switch API + UI

---

## [2026-09-28] Phase 4 – Authentication

**Commit:** feat(phase-4): auth.js credentials, argon2id, MFA TOTP, password reset, RBAC, rate limits

---

## [2026-09-28] Phases 0–3

Bootstrap, tooling, schema A/B – done.
