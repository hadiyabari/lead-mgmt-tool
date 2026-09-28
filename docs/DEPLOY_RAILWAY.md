# Deploy on Railway

## Why builds failed before

1. `prisma migrate deploy` during **build** cannot reach `postgres.railway.internal`.
2. `prisma` lived in **devDependencies** and was missing when install was production-only.
3. Webpack choked on a broken regex in `normalize/email.ts` (fixed).

## Current approach

- `Dockerfile` multi-stage build
- `prisma generate` at build (no DB)
- `prisma migrate deploy` at **container start**
- Next.js `output: 'standalone'`

## Railway settings

- Builder: Dockerfile (from `railway.toml`)
- Attach Postgres and set `DATABASE_URL`
- Attach Redis and set `REDIS_URL` (optional for first boot)
- Required vars:
  - `AUTH_SECRET` (32+ chars)
  - `AUTH_URL` / `NEXTAUTH_URL` = public HTTPS URL
  - `SIMULATION_MODE=true` until live providers are ready
  - `NODE_ENV=production`

## After first successful deploy

One-off seed (Railway shell on web service):

```bash
# if seed script available in image; otherwise run locally against DATABASE_URL
pnpm --filter @leadpilot/db db:seed
```

Default owner (change immediately):
`owner@threezero.agency` / `ChangeMeNow123!`

## Verify

- `GET /api/health` → 200
- `GET /` → marketing home
- `GET /login` → login form
