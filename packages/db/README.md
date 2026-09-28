# @leadpilot/db

Prisma schema, migrations, client, and seed for LeadPilot Retainer Edition.

## Phase status

- **Phase 2 (done):** Workspace, User, Account, Session, VerificationToken, Icp, Playbook, SourceConfig
- **Phase 3 (done):** Lead, LeadEnrichment, LeadScore, AuditResult, ContactHistoryLedger, Campaign, Sequence, EmailOutbox, EmailSent, Reply, Meeting, SuppressionList, CostLedger, Run

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

## Critical tables

| Table | Role |
|-------|------|
| `contact_history_ledger` | Append-oriented ledger; unique on normalized email/phone per workspace. Checked before enrichment, scoring, email write, and send. |
| `suppression_list` | Hard block list (unsubscribe, bounce, legal). |
| `emails_outbox` | Outbox pattern with lock fields for workers. |
| `runs` | Goal-based pipeline runs with credit budget. |
