# @leadpilot/db

Prisma schema, migrations, client, and seed for LeadPilot Retainer Edition.

## Phase status

- **Phase 2 (done):** Workspace, User, Account, Session, VerificationToken, Icp, Playbook, SourceConfig
- **Phase 3 (next):** Leads, LeadEnrichment, LeadScore, AuditResult, ContactHistoryLedger, Campaigns, Emails, Replies, Meetings, Suppression, CostLedger, Runs

## Commands

```bash
# From repo root (requires DATABASE_URL and running Postgres)
pnpm --filter @leadpilot/db db:generate   # generate Prisma client
pnpm --filter @leadpilot/db db:migrate    # apply migrations (dev)
pnpm --filter @leadpilot/db db:seed       # seed Threezero workspace + owner
pnpm --filter @leadpilot/db db:studio     # Prisma Studio
```

## Seed creates

- Workspace: **Threezero Agency** (`slug: threezero`)
- Owner: `owner@threezero.agency` (password set in Phase 4)
- Default ICP covering all v1 verticals + US/UK/AU
- Default playbook: Local + AI Visibility Retainer
- Source configs for all official providers (disabled by default)
