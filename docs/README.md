# LeadPilot Retainer Edition

Threezero Agency · multi-tenant · Contact Sales only (03293318181).

**Status: phases 0–23 complete.**

## Quick start

```bash
pnpm install
pnpm docker:up   # if docker compose present
cp .env.example .env
pnpm --filter @leadpilot/db exec prisma migrate deploy
pnpm --filter @leadpilot/db db:seed
pnpm --filter @leadpilot/web dev
```

## Docs

- [OPERATIONS.md](./OPERATIONS.md)
- [COMPLIANCE.md](./COMPLIANCE.md)
- [SHIP_CHECKLIST.md](./SHIP_CHECKLIST.md)
- [PLAN.md](./PLAN.md)
