# Ship checklist

- [ ] `pnpm install`
- [ ] Postgres + Redis up
- [ ] `pnpm --filter @leadpilot/db exec prisma migrate deploy`
- [ ] Seed run once
- [ ] `GET /api/health` and `?deep=1` OK
- [ ] Login works
- [ ] Simulation run completes (dashboard Runs)
- [ ] Outbox approve + simulated send works
- [ ] Inbound reply test (optional)
- [ ] Marketing pages load (/, /pricing, /contact, legal)
- [ ] Cookie consent banner present
- [ ] Kill switch toggles
- [ ] Change default owner password
- [ ] `SIMULATION_MODE=true` until providers ready
- [ ] `AUTH_URL` matches public URL
