# Operations

## Simulation vs live

| Flag | Effect |
|------|--------|
| `SIMULATION_MODE=true` | No live email; template drafts; simulated audit/discover |
| `KILL_SWITCH=true` | Blocks runs, campaign activate, send, discover |

## Discover

```http
POST /api/sources/discover
{ "provider": "NPI_US", "country": "US", "limit": 5, "simulation": true }
```

Live mode requires the workspace SourceConfig `isEnabled=true` and provider env keys when the adapter needs them.

## Required production env

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL` / `NEXTAUTH_URL`
- `SIMULATION_MODE` (start `true`)

## Optional provider keys

- `COMPANIES_HOUSE_API_KEY`
- `ABN_LOOKUP_GUID`
- `GOOGLE_PLACES_API_KEY`
- `YELP_API_KEY`
- `ANTHROPIC_API_KEY`
- `POSTMARK_API_TOKEN`
- `EMAIL_FROM`
- `INBOUND_WEBHOOK_SECRET`

## Smoke

```bash
BASE_URL=https://your-host ./scripts/smoke.sh
```

Contact Sales: 03293318181
