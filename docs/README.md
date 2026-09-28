# LeadPilot Retainer Edition

**Status:** Phase 7 complete – ledger import + UI.

## Local Development

```bash
pnpm install && pnpm docker:up
cp .env.example .env   # AUTH_SECRET
pnpm --filter @leadpilot/db db:generate && pnpm --filter @leadpilot/db db:migrate && pnpm --filter @leadpilot/db db:seed
pnpm --filter @leadpilot/web dev
```

Dev login: `owner@threezero.agency` / `ChangeMeNow123!`

### Ledger

- UI: `/dashboard/ledger`
- Import CSV (auto column map) with origin CSV / CRM / Gmail-export
- Live Gmail API: configure Google OAuth later (Phase 16)

## Current Phase

**Phase 7 – complete.** Next: Phase 8 – Source adapter framework.
