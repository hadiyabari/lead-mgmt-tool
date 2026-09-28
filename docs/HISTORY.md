# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 6 – Normalisation Package + Contact-History Ledger Core

**Goal:** Canonical identity and the single source of truth for "already contacted".

**Agent actions:**
- Added `@leadpilot/shared` normalisation: email (Gmail dot-collapse), phone (E.164-ish + US/UK/AU defaults), domain, company name (legal suffix strip).
- `normalizeIdentity()` bundle helper.
- Unit tests for email, phone, domain, company edge cases.
- Ledger service (`packages/db/src/ledger.ts`): `ledgerLookup`, `ledgerIsContacted`, `ledgerInsert`, `ledgerBulkImport`, `fourPointCheck`.
- Four-point check: suppression list + ledger (already contacted); ready for enrich/score/write/send call sites.
- `@leadpilot/db` depends on `@leadpilot/shared`.
- Living docs updated.

**Achieved:**
- Same email in different formats maps to one normalized key (e.g. `John.Doe@Gmail.com` → `johndoe@gmail.com`).
- Ledger insert is idempotent on normalized email/phone; bulk import reports inserted/updated/skipped.
- Pipeline gate helper returns `allowed` + `reason`.

**Open items / risks:**
- Ledger UI + CSV/Gmail importers are Phase 7.
- Integration tests against live Postgres deferred to local/CI when DB is up.
- Gmail +tag is kept distinct by design (consent safety).

**Commit:** feat(phase-6): normalisation package + contact-history ledger core + four-point check

---

## [2026-09-28] Phase 5 – Frontend Shell, Kill Switch

**Commit:** feat(phase-5): app shell, design tokens, sidebar, kill switch API + UI

---

## [2026-09-28] Phase 4 – Authentication

**Commit:** feat(phase-4): auth.js credentials, argon2id, MFA TOTP, password reset, RBAC, rate limits

---

## [2026-09-28] Phase 3 – Schema Part B

**Commit:** feat(phase-3): database schema part B – leads, ledger, messaging, meetings, runs

---

## [2026-09-28] Phase 2 – Schema Part A

**Commit:** feat(phase-2): database schema part A – tenancy, users, ICP, sources + seed

---

## [2026-09-28] Phase 1 – Tooling

**Commit:** chore(phase-1): tooling, Docker, CI, health-check, quality gates

---

## [2026-09-28] Phase 0 – Bootstrap

**Commit:** chore: bootstrap monorepo and living documents
