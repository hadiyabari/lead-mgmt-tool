# LeadPilot Retainer Edition

**Status:** Phase 10–11 complete – enrichment + audit client.

## Enrichment

| Provider | Env |
|----------|-----|
| Google Places | `GOOGLE_PLACES_API_KEY` |
| Yelp | `YELP_API_KEY` |
| Website extract | none (robots-respecting fetch) |
| Job board | `ADZUNA_APP_ID` (optional) |

`POST /api/leads/:id/enrich`

## Audit

| Env | Purpose |
|-----|---------|
| `AUDIT_TOOL_URL` | Agency tool base (`POST /audit`) |
| `AUDIT_TOOL_API_KEY` | Optional bearer |

`POST /api/leads/:id/audit` · `POST /api/audit` `{ "url": "…" }`

Simulation default when keys/tool missing.

## Current Phase

**Phase 10–11 – complete.** Next: Phase 12 – Scoring model.
