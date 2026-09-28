# PLAN – LeadPilot Retainer Edition

**Version 3.0 | Single source of truth for scope, order of work, security, compliance and documentation discipline.**

Any deviation must be recorded in `HISTORY.md` with a clear reason.

---

## Product One-Liner

LeadPilot Retainer Edition finds high-value local service businesses (dental / orthodontic, home services, med-spa / aesthetic clinics) in the US, UK and Australia from official public registries, scores them using the agency's own audit tool results, writes grounded audit-based emails, sends only to never-contacted leads under strict compliance rules, and books discovery calls that convert into monthly retainers.

**Agency (editable):** Threezero Agency  
**Primary domain:** threezero.agency (cold outreach = subdomains only)  
**Legal footer address:** China Corporation, Main road China scheme, Lahore 54000  
**LLM provider:** Anthropic  
**Audit tool:** Exists – URL → structured score + findings  
**Existing contact lists:** None (ledger starts empty)

## Target Verticals (v1)

- Dental & Orthodontic clinics
- Home services (roofing, HVAC, solar, plumbing, electrical)
- Aesthetic / Med-spa clinics

## Target Countries

- United States
- United Kingdom (Ltd / LLP only)
- Australia

## Primary Offer

"Local + AI Visibility Retainer" (Google Business Profile + Local SEO + AEO + conversion-ready website).  
Entry offer = free or low-cost audit + 30-day quick wins → monthly retainer.

---

## Living Documents (must stay updated)

1. `docs/AGENT_RULES.md`
2. `docs/HISTORY.md`
3. `docs/README.md`
4. `docs/FILEMAP.md`
5. `docs/PLAN.md` (this file)

---

## Product Requirements (R1–R12)

- **R1** Source only from official / licensed sources. Google Places / Yelp enrichment only, never primary list.
- **R2** Strict "never contacted before" gate via contact-history ledger.
- **R3** Lead scoring heavily weighted by agency audit tool score; explainable.
- **R4** Email content grounded only in stored facts + audit findings; validator rejects fabrications.
- **R5** Compliance: CAN-SPAM, PECR (Ltd/LLP only), Australian Spam Act. Canada blocked.
- **R6** 20–30 emails/mailbox/day on secondary domains only.
- **R7** Full simulation / dry-run mode.
- **R8** Export compatible with Instantly / Smartlead; still written to ledger.
- **R9** Modern security; MFA + password reset required.
- **R10** AEO + SEO of the product itself 10/10 relative to competitors.
- **R11** Cost control: free pre-score first; paid calls only on top leads within budget.
- **R12** Observability + kill switch (UI + Telegram/Slack).

---

## Tech Stack

- Monorepo: pnpm + Turborepo
- Frontend: Next.js 15 + TypeScript + Tailwind + shadcn/ui (later)
- Database: PostgreSQL 16 + Prisma
- Queue: BullMQ + Redis
- Auth: Auth.js, Argon2id, MFA TOTP (Phase 4)
- LLM: Anthropic
- CI: GitHub Actions

---

## Project Phases

| Phase | Title | Status |
|-------|-------|--------|
| 0 | Repository Bootstrap and Living Documents | **DONE** |
| 1 | Monorepo Tooling, CI, Docker, Quality Gates | **DONE** |
| 2 | Database Schema Part A: Tenancy, Users, ICP, Sources | **DONE** |
| 3 | Database Schema Part B: Leads, Ledger, Messaging, Meetings | Pending |
| 4 | Authentication, Workspaces, Roles, MFA, Password Reset | Pending |
| 5 | Frontend Shell, Design System, Auth Pages, Kill Switch | Pending |
| 6 | Normalisation Package + Contact-History Ledger Core | Pending |
| 7 | Ledger Imports (Gmail, CRM, CSV) and Ledger UI | Pending |
| 8 | Source Adapter Framework | Pending |
| 9 | Official Registry Adapters (US / UK / AU) | Pending |
| 10 | Enrichment (Google Places / Yelp / Website / Job Signals) | Pending |
| 11 | Audit Tool Integration | Pending |
| 12 | ICP Builder, Runs, Pipeline Orchestrator | Pending |
| 13 | Pre-score + Credit-Rationed Email Resolution | Pending |
| 14 | Rule-Based Scoring Engine + Explainability | Pending |
| 15 | LLM Layer, Qualification, Grounded Email Writer + Validator | Pending |
| 16 | Mailbox + Calendar Connections + Deliverability Checks | Pending |
| 17 | Sending Engine, Outbox, Locks, Compliance Engine | Pending |
| 18 | Campaigns, Review Queue, Simulation Mode UI | Pending |
| 19 | Inbox Ingestion, Reply Classification, Follow-ups | Pending |
| 20 | Calendar Booking Engine + Public Booking Page | Pending |
| 21 | Analytics, Cost Ledger, Score Calibration | Pending |
| 22 | Security Hardening, DSR Tool, Retention | Pending |
| 23 | AEO / SEO Implementation for the Product | Pending |
| 24 | Telegram / Slack Chat-Ops + CLI | Pending |
| 25 | End-to-End Tests, Performance, Deployment, Final Docs | Pending |
