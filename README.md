# LeadPilot Retainer Edition

**v1.0.0** – Agency lead discovery, audit-grounded outreach, compliance-first contact ledger.

Multi-tenant. No public self-serve signup. Contact Sales: **03293318181**.

## Status

Phases **0–26 complete**. Release notes: `docs/RELEASE_NOTES.md`.

## Stack

- Next.js 15 (App Router) · Prisma · PostgreSQL · pnpm workspaces
- Simulation mode by default (`SIMULATION_MODE=true`)

## Quick start

```bash
pnpm install
cp .env.example .env
# set DATABASE_URL and AUTH_SECRET
pnpm --filter @leadpilot/db exec prisma migrate deploy
pnpm --filter @leadpilot/db db:seed
pnpm --filter @leadpilot/web dev
```

## Operator path

1. Login
2. `/dashboard/runs` → Start simulation run
3. `/dashboard/leads` → Draft email
4. `/dashboard/outbox` → Approve → Send (simulated)

## Docs

| Doc | Path |
|-----|------|
| Release | `docs/RELEASE_NOTES.md` |
| Ops | `docs/OPERATIONS.md` |
| Compliance | `docs/COMPLIANCE.md` |
| Ship checklist | `docs/SHIP_CHECKLIST.md` |
| QA | `docs/QA_NOTES.md` |
| Plan | `docs/PLAN.md` |

## License

Private / proprietary unless otherwise stated by Threezero Agency.
