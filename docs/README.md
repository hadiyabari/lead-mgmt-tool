# LeadPilot Retainer Edition

**Status:** Phase 2 complete – tenancy, users, ICP, sources schema + seed.

## One-liner

LeadPilot Retainer Edition finds high-value local service businesses (dental / orthodontic, home services, med-spa / aesthetic clinics) in the US, UK and Australia from official public registries, scores them using the agency's own audit tool results, writes grounded audit-based emails, sends only to never-contacted leads under strict compliance rules, and books discovery calls that convert into monthly retainers.

**Agency:** Threezero Agency  
**Primary domain:** threezero.agency (cold outreach uses subdomains only)

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

## Repository Layout

```
apps/
  web/          # Next.js 15 App Router frontend + API routes
packages/
  db/           # Prisma schema, migrations, client, seed
  shared/       # Shared types, normalisation, agency defaults
  workers/      # BullMQ workers (later phases)
docs/           # Living documents
scripts/        # Quality gates
```

## Local Development

### Prerequisites
- Node.js ≥ 20
- pnpm 9.15+
- Docker & Docker Compose

### First-time setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start Postgres + Redis
pnpm docker:up

# 3. Copy env
cp .env.example .env

# 4. Generate Prisma client + apply migrations + seed
pnpm --filter @leadpilot/db db:generate
pnpm --filter @leadpilot/db db:migrate
pnpm --filter @leadpilot/db db:seed

# 5. Start the web app
pnpm --filter @leadpilot/web dev
# → http://localhost:3000
# → Health: http://localhost:3000/api/health
```

### Useful scripts

| Command | Purpose |
|---------|---------|
| `pnpm docker:up` | Start Postgres + Redis |
| `pnpm docker:down` | Stop containers |
| `pnpm --filter @leadpilot/db db:migrate` | Apply migrations |
| `pnpm --filter @leadpilot/db db:seed` | Seed Threezero workspace + owner |
| `pnpm --filter @leadpilot/db db:studio` | Prisma Studio |
| `pnpm lint` / `typecheck` / `test` | Quality gates |
| `pnpm placeholder-scan` | Fail on TODO / suspicious emails |

### Seed creates

- Workspace: **Threezero Agency** (`slug: threezero`)
- Owner: `owner@threezero.agency` (password arrives in Phase 4)
- Default ICP + Playbook
- All source providers registered (disabled)

## Living Documents

| File | Purpose |
|------|---------|
| `docs/AGENT_RULES.md` | Strict rules every agent must follow |
| `docs/HISTORY.md` | Chronological record of every phase |
| `docs/README.md` | This file |
| `docs/FILEMAP.md` | Directory tree + purpose of every major file |
| `docs/PLAN.md` | Full project plan (source of truth) |

## Security & Compliance Notes

- Contact-history ledger is the single source of truth for "already contacted".
- Simulation mode must be available end-to-end.
- No LinkedIn / Instagram scraping. Official registries + licensed enrichment only.
- Secondary domains only for cold outreach (`*.threezero.agency`).
- Legal footer address: China Corporation, Main road China scheme, Lahore 54000.

## Current Phase

**Phase 2 – complete.**  
Next: Phase 3 – Database Schema Part B (Leads, Ledger, Messaging, Meetings).
