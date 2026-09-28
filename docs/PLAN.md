# PLAN – LeadPilot Retainer Edition

**Version 3.0 | Single source of truth for scope, order of work, security, compliance and documentation discipline.**

Any deviation must be recorded in `HISTORY.md` with a clear reason.

---

## Product One-Liner

LeadPilot Retainer Edition finds high-value local service businesses (dental / orthodontic, home services, med-spa / aesthetic clinics) in the US, UK and Australia from official public registries, scores them using the agency's own audit tool results, writes grounded audit-based emails, sends only to never-contacted leads under strict compliance rules, and books discovery calls that convert into monthly retainers.

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

- **R1** Source only from official / licensed sources (NPI, state licensing boards, Companies House, ABN Lookup / ASIC, health practitioner registers, job boards for intent signals). Google Places / Yelp used only for enrichment, never as primary list source.
- **R2** Strict "never contacted before" gate using a durable contact-history ledger that also ingests the agency's historical Gmail sent folder, CRM exports, and old CSVs.
- **R3** Lead scoring heavily weighted by the agency's own audit tool score. Score must be explainable.
- **R4** Email content must be grounded only in stored facts about the lead + audit findings. A validator rejects any fabricated claims.
- **R5** Compliance engine enforces country-specific rules (CAN-SPAM, PECR Ltd/LLP only, Australian Spam Act). Canada blocked by default.
- **R6** Volume is quality-first: 20–30 emails per mailbox per day on secondary domains only.
- **R7** Full simulation / dry-run mode for the entire pipeline.
- **R8** Export mode compatible with Instantly / Smartlead while still writing to the ledger.
- **R9** Modern security (DDoS, credential stuffing, API abuse, data leaks, injection, BOLA, secret exposure). MFA + password reset required.
- **R10** AEO + SEO of the product itself must be 10/10 relative to competitors.
- **R11** Cost control: free enrichment and pre-score first; paid calls only on highest-scoring leads within credit budget.
- **R12** Observability: every run, send, API call, credit spend logged and queryable. Kill switch from UI and Telegram/Slack.

---

## Recommended Tech Stack

- Monorepo: pnpm workspaces + Turborepo
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- Backend: Next.js Route Handlers + worker processes
- Database: PostgreSQL 16 + Prisma ORM
- Queue / Jobs: BullMQ + Redis
- Auth: Auth.js with credentials + Google + magic link, MFA (TOTP), password reset
- Email: multiple providers behind abstraction; secondary domains only
- Calendar: Google Calendar + Microsoft Graph
- LLM: OpenAI / Anthropic (structured output + validation)
- Caching: Redis
- Object storage: S3-compatible
- Observability: pino, OpenTelemetry
- Deployment: Docker + Compose locally; Railway / Fly.io / Render / VPS production
- CI: GitHub Actions

---

## High-Level Architecture

```
[Browser / CLI / Telegram]
        ↓
[Next.js Frontend + API Routes]
        ↓
[Auth + RBAC + Rate Limiter + Input Validation]
        ↓
[Domain Services]
  - Workspace / Tenant (single tenant for v1)
  - ICP & Playbooks
  - Source Adapters
  - Contact History Ledger
  - Scoring Engine
  - Email Writer + Fact Validator
  - Compliance Engine
  - Outbox / Sending Engine
  - Reply Ingestion + Classification
  - Booking Engine
  - Cost Ledger
  - Kill Switch
        ↓
[BullMQ Workers]
        ↓
[PostgreSQL]  [Redis]  [S3]  [External APIs]
```

Key design decisions:
- Contact-history ledger is append-only and checked at four points in the pipeline.
- Every outbound email is written to an outbox table first; a worker claims it with a lock.
- Simulation mode sets a global or per-run flag that short-circuits actual send and paid enrichment.
- All paid calls go through a credit-budget guard.

---

## Data Model (core tables – simplified)

workspaces, users (roles: owner, admin, operator, viewer), icps, playbooks, source_configs, leads, lead_enrichments, lead_scores, audit_results, contact_history_ledger, campaigns, sequences, emails_outbox, emails_sent, replies, meetings, suppression_list, cost_ledger, runs, api_keys_encrypted, mailbox_connections, calendar_connections.

All PII tables must support soft-delete and a Data Subject Request export/delete path.

---

## Security Requirements (non-negotiable)

See full checklist in original plan Section 5. Summary:
- Argon2id password hashing, MFA (TOTP), secure password-reset, rate-limited auth endpoints.
- Object-level authorization on every route. RBAC.
- Global + per-endpoint rate limiting via Redis.
- Strict CORS, security headers, Zod validation, parameterized queries only.
- No secrets in repo. Encryption at rest for sensitive columns.
- Kill switch that immediately stops all sending and new enrichment jobs.
- SPF/DKIM/DMARC checked before mailbox activation. Suppression list on every send.

---

## AEO / SEO Requirements for the Product

Organization, SoftwareApplication/Product, FAQPage, Article, BreadcrumbList, HowTo schema. Direct-answer first paragraphs. Freshness signals. robots.txt allowing major AI crawlers where desired. Core Web Vitals. Full details in original plan Section 6.

---

## Project Phases (must be followed in order)

| Phase | Title | Status |
|-------|-------|--------|
| 0 | Repository Bootstrap and Living Documents | **DONE** |
| 1 | Monorepo Tooling, CI, Docker, Quality Gates | Pending (awaits human intake) |
| 2 | Database Schema Part A: Tenancy, Users, ICP, Sources | Pending |
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

---

## First Actions for the Agent (Section 8)

1. Create the monorepo and the five living documents exactly as specified in Phase 0. ✅
2. Commit with a clear message. ✅
3. Ask the human for the following (in one message):
   - Agency name, offer description, and current ICP notes
   - Whether an audit tool API / CLI already exists and its contract
   - Preferred LLM provider and any existing API keys (do not store them yet)
   - Sending domains that will be used (secondary domains only)
   - Postal address for CAN-SPAM / PECR / Spam Act footers
   - Any existing CSV / Gmail / CRM exports that should seed the ledger
4. Only after the above answers are received, proceed to Phase 1.
