# LeadPilot Retainer Edition

**v1.0.0** · Threezero Agency · Contact Sales **03293318181**

Phases 0–26 complete. See [RELEASE_NOTES.md](./RELEASE_NOTES.md).

```bash
pnpm install
cp .env.example .env
pnpm --filter @leadpilot/db exec prisma migrate deploy
pnpm --filter @leadpilot/db db:seed
pnpm --filter @leadpilot/web dev
```

Smoke: `BASE_URL=http://localhost:3000 pnpm smoke`
