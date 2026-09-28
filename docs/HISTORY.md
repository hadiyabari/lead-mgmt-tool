# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 4 – Authentication, Workspaces, Roles, MFA, Password Reset

**Goal:** Secure login and account management.

**Agent actions:**
- Auth.js (NextAuth v5) credentials provider with JWT sessions (8h).
- Argon2id password hashing (`lib/password.ts`) + strength policy (12+ chars, upper, lower, number).
- MFA TOTP via otplib: setup (QR), confirm, disable endpoints.
- Password-reset request + confirm (hashed single-use token in VerificationToken, 1h TTL, rate limited).
- Register endpoint (bootstrap only when workspace has zero users).
- In-memory rate limiter on auth endpoints (IP + account; Redis-ready).
- RBAC helpers (`hasMinRole`, kill-switch / runs permissions).
- Middleware protecting `/dashboard` and `/settings`.
- Pages: `/login` (with MFA step), `/register`, `/reset-password`, `/dashboard`.
- Seed updated to set Argon2id hash for `owner@threezero.agency` (dev password documented).
- Unit tests for password strength and RBAC.
- Living docs updated.

**Achieved:**
- User can register (bootstrap), login, enable MFA, request/confirm password reset.
- Rate limits return 429 on abuse.
- Sessions use httpOnly JWT via Auth.js defaults; trustHost enabled for local.
- Role stored on JWT/session for object-level checks later.

**Open items / risks:**
- Rate limiter is in-memory (swap to Redis in production).
- MFA_REQUIRED is surfaced via error string; login UX handles second step.
- Password-reset email delivery not wired (dev logs token).
- Google OAuth provider not enabled yet (optional; credentials work).
- Full invite-user flow deferred to Phase 5 UI.

**Commit:** feat(phase-4): auth.js credentials, argon2id, MFA TOTP, password reset, RBAC, rate limits

---

## [2026-09-28] Phase 3 – Database Schema Part B: Leads, Ledger, Messaging, Meetings

**Goal:** Complete the data model needed for the full pipeline.

**Achieved:** Full pipeline tables + ledger uniqueness + outbox locks + runs.

**Commit:** feat(phase-3): database schema part B – leads, ledger, messaging, meetings, runs

---

## [2026-09-28] Phase 2 – Database Schema Part A: Tenancy, Users, ICP, Sources

**Commit:** feat(phase-2): database schema part A – tenancy, users, ICP, sources + seed

---

## [2026-09-28] Phase 1 – Monorepo Tooling, CI, Docker, Quality Gates

**Commit:** chore(phase-1): tooling, Docker, CI, health-check, quality gates

---

## [2026-09-28] Phase 0 – Repository Bootstrap and Living Documents

**Commit:** chore: bootstrap monorepo and living documents
