# FILEMAP – LeadPilot Retainer Edition

## Apps

| Path | Role |
|------|------|
| `apps/web` | Next.js 15 app (marketing + dashboard + APIs) |

## Packages

| Package | Role |
|---------|------|
| `@leadpilot/db` | Prisma schema, ledger, client |
| `@leadpilot/shared` | Normalize, CSV |
| `@leadpilot/sources` | Registry adapters |
| `@leadpilot/audit` | Audit client |
| `@leadpilot/scoring` | Lead scoring |
| `@leadpilot/email-gen` | Grounded drafts |
| `@leadpilot/email-send` | Simulation / Postmark |
| `@leadpilot/replies` | Reply classifier |

## Key APIs

| Route | Purpose |
|-------|---------|
| `/api/health` | Liveness (+ `?deep=1` DB) |
| `/api/leads` | Lead list |
| `/api/leads/:id/draft-email` | Draft |
| `/api/outbox/*` | Review + send |
| `/api/replies/inbound` | Webhook |
| `/api/runs/:id/execute` | E2E simulation |
| `/api/meetings` | Booking |
| `/api/campaigns` | Campaigns |
| `/api/costs` | Cost ledger |
| `/api/suppression` | Suppression |

## Docs

`PLAN.md` `HISTORY.md` `FILEMAP.md` `OPERATIONS.md` `COMPLIANCE.md` `SHIP_CHECKLIST.md` `SECURITY.md` `ANALYTICS.md`
