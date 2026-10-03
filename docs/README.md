# LeadPilot Retainer Edition

Multi-tenant agency product. Contact Sales: **03293318181**. No public signup.

## Status

Phases 0–13 complete (includes grounded email drafts).

```bash
pnpm install && pnpm docker:up
cp .env.example .env
pnpm --filter @leadpilot/db db:migrate
pnpm --filter @leadpilot/email-gen test
pnpm --filter @leadpilot/web dev
```

Draft email: `POST /api/leads/:id/draft-email`
