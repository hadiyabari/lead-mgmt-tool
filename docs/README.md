# LeadPilot Retainer Edition

**Status:** Phase 0 complete – monorepo + living documents bootstrapped.

## One-liner

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

## Repository Layout (high level)

```
apps/
  web/          # Next.js 15 App Router frontend + API routes
packages/
  db/           # Prisma schema, migrations, client
  shared/       # Shared types, normalisation, utilities
  workers/      # BullMQ workers
docs/           # Living documents (AGENT_RULES, HISTORY, README, FILEMAP, PLAN)
scripts/        # Quality gates (placeholder-scan, etc.)
```

## Local Development (current status)

Phase 0 only. Full local setup arrives in Phase 1.

```bash
pnpm install
# (later) docker compose up -d
# (later) pnpm dev
```

## Living Documents

| File | Purpose |
|------|---------|
| `docs/AGENT_RULES.md` | Strict rules every agent must follow |
| `docs/HISTORY.md` | Chronological record of every phase |
| `docs/README.md` | This file – product overview + how to run |
| `docs/FILEMAP.md` | Directory tree + purpose of every major file |
| `docs/PLAN.md` | Full project plan (source of truth for scope & order) |

## Security & Compliance Notes

- Contact-history ledger is the single source of truth for "already contacted".
- Simulation mode must be available end-to-end.
- No LinkedIn / Instagram scraping. Official registries + licensed enrichment only.
- Secondary domains only for cold outreach. Primary domain never used for cold mail.
- CAN-SPAM / PECR / Australian Spam Act compliance enforced by the compliance engine.

## Current Phase

**Phase 0 – complete.**  
Next: Phase 1 (tooling, CI, Docker, quality gates) **after** human answers the intake questions listed in `docs/PLAN.md` Section 8.
