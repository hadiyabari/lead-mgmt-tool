# LeadPilot Retainer Edition

**Status:** Phase 3 complete – full pipeline data model (leads, ledger, messaging, runs).

## One-liner

LeadPilot Retainer Edition finds high-value local service businesses (dental / orthodontic, home services, med-spa / aesthetic clinics) in the US, UK and Australia from official public registries, scores them using the agency's own audit tool results, writes grounded audit-based emails, sends only to never-contacted leads under strict compliance rules, and books discovery calls that convert into monthly retainers.

**Agency:** Threezero Agency  
**Primary domain:** threezero.agency (cold outreach uses subdomains only)

## Local Development

```bash
pnpm install
pnpm docker:up
cp .env.example .env

pnpm --filter @leadpilot/db db:generate
pnpm --filter @leadpilot/db db:migrate   # applies Phase 2 + Phase 3
pnpm --filter @leadpilot/db db:seed

pnpm --filter @leadpilot/web dev
# → http://localhost:3000/api/health
```

## Current Phase

**Phase 3 – complete.**  
Next: Phase 4 – Authentication, Workspaces, Roles, MFA, Password Reset.
