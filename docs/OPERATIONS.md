# Operations

## Simulation vs live

| Flag | Effect |
|------|--------|
| `SIMULATION_MODE=true` | No live email; template drafts; simulated audit |
| `KILL_SWITCH=true` | Blocks runs, campaign activate, send |
| Workspace kill switch | Same, per tenant |

## Required production env

- `DATABASE_URL`
- `AUTH_SECRET` (32+ chars)
- `AUTH_URL` / `NEXTAUTH_URL` (public HTTPS URL)
- `SIMULATION_MODE` (start `true` until providers ready)

## Optional

- `ANTHROPIC_API_KEY` for live email copy
- `POSTMARK_API_TOKEN` + `EMAIL_FROM` for live send
- `INBOUND_WEBHOOK_SECRET` for reply webhook
- Registry API keys when leaving simulation discovery

## Smoke

```bash
BASE_URL=https://your-host ./scripts/smoke.sh
```

## First login

After seed: `owner@threezero.agency` (change password immediately).

## Compliance gates

1. Ledger before draft
2. Ledger + suppression before send
3. Unsubscribe adds suppression + ledger SUPPRESSION

## Sales contact

03293318181 (Contact Sales only; no public self-serve signup).
