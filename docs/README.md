# LeadPilot Retainer Edition

**Status:** Phase 4 complete – authentication, MFA, password reset, RBAC.

## Agency

Threezero Agency · threezero.agency (cold outreach = subdomains only)

## Local Development

```bash
pnpm install
pnpm docker:up
cp .env.example .env
# Set AUTH_SECRET to a long random string

pnpm --filter @leadpilot/db db:generate
pnpm --filter @leadpilot/db db:migrate
pnpm --filter @leadpilot/db db:seed

pnpm --filter @leadpilot/web dev
```

### Dev login (after seed)

- **Email:** `owner@threezero.agency`
- **Password:** `ChangeMeNow123!`
- Change immediately in production.

### Auth routes

| Path | Purpose |
|------|---------|
| `/login` | Credentials + optional MFA step |
| `/register` | Bootstrap only (empty workspace) |
| `/reset-password` | Request + confirm reset |
| `/dashboard` | Protected shell |
| `/api/auth/*` | Auth.js + register / reset / MFA |

## Current Phase

**Phase 4 – complete.**  
Next: Phase 5 – Frontend shell, design system, kill switch.
