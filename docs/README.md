# LeadPilot Retainer Edition

**Status:** Phase 5 complete – app shell + kill switch.

## Agency

Threezero Agency · threezero.agency

## Local Development

```bash
pnpm install
pnpm docker:up
cp .env.example .env   # set AUTH_SECRET

pnpm --filter @leadpilot/db db:generate
pnpm --filter @leadpilot/db db:migrate
pnpm --filter @leadpilot/db db:seed

pnpm --filter @leadpilot/web dev
# → http://localhost:3000/login
```

### Dev login

- Email: `owner@threezero.agency`
- Password: `ChangeMeNow123!`

### App routes

| Path | Purpose |
|------|---------|
| `/login` | Sign in + MFA |
| `/dashboard` | Shell + stats + kill switch |
| `/settings` | Workspace + kill switch |
| `/api/kill-switch` | GET/POST kill switch (ADMIN+) |

## Current Phase

**Phase 5 – complete.**  
Next: Phase 6 – Normalisation package + contact-history ledger core.
