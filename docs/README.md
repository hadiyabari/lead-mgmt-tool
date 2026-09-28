# LeadPilot Retainer Edition

Multi-tenant lead generation platform for agencies. Public site is Contact Sales only.

**Sales:** 03293318181

## Plans

- Starter $100/month
- Growth $300/month
- Enterprise custom

All sold via Contact Sales. SUPER_ADMIN provisions workspaces.

## Local

```bash
pnpm install && pnpm docker:up
cp .env.example .env
pnpm --filter @leadpilot/db db:generate && pnpm --filter @leadpilot/db db:migrate
pnpm --filter @leadpilot/web dev
```

Marketing: `/` · App login: `/login` · Super-admin analytics: `/admin/analytics`
