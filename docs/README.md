# LeadPilot Retainer Edition

**Status:** Phase 1 complete – tooling, Docker, CI, health-check in place.

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
  db/           # Prisma schema, migrations, client (Phase 2+)
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
# or: docker compose up -d

# 3. Copy env and adjust if needed
cp .env.example .env

# 4. Start the web app
pnpm --filter @leadpilot/web dev
# → http://localhost:3000
# → Health: http://localhost:3000/api/health
```

### Useful scripts

| Command | Purpose |
|---------|---------|
| `pnpm docker:up` | Start Postgres + Redis |
| `pnpm docker:down` | Stop containers |
| `pnpm docker:logs` | Follow container logs |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Unit tests |
| `pnpm placeholder-scan` | Fail on TODO / suspicious emails |

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
- Secondary domains only for cold outreach (`*.threezero.agency`). Primary domain never used for cold mail.
- Legal footer address: China Corporation, Main road China scheme, Lahore 54000.
- CAN-SPAM / PECR / Australian Spam Act compliance enforced by the compliance engine.

## Current Phase

**Phase 1 – complete.**  
Next: Phase 2 – Database Schema Part A (tenancy, users, ICP, sources).
