# LeadPilot Retainer Edition

**Status:** Phase 6 complete – normalisation + ledger core.

## Agency

Threezero Agency · threezero.agency

## Local Development

```bash
pnpm install
pnpm docker:up
cp .env.example .env

pnpm --filter @leadpilot/db db:generate
pnpm --filter @leadpilot/db db:migrate
pnpm --filter @leadpilot/db db:seed

pnpm --filter @leadpilot/shared test   # normalisation unit tests
pnpm --filter @leadpilot/web dev
```

### Dev login

`owner@threezero.agency` / `ChangeMeNow123!`

## Current Phase

**Phase 6 – complete.**  
Next: Phase 7 – Ledger imports (Gmail, CRM, CSV) + ledger UI.
