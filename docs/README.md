# LeadPilot Retainer Edition

Multi-tenant agency product. Contact Sales: **03293318181**. No public signup.

## Status

Phases 0–12 complete (includes scoring, marketing site, consent, security headers).

```bash
pnpm install && pnpm docker:up
cp .env.example .env
pnpm --filter @leadpilot/db db:migrate
pnpm --filter @leadpilot/scoring test
pnpm --filter @leadpilot/web dev
```
