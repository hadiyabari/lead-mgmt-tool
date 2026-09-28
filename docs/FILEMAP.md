# FILEMAP – LeadPilot Retainer Edition

## Phase 10–11

| Path | Purpose |
|------|---------|
| `packages/sources/src/adapters/google-places.ts` | Places enrich-only |
| `packages/sources/src/adapters/yelp.ts` | Yelp enrich |
| `packages/sources/src/adapters/website-extract.ts` | Contact scrape + robots |
| `packages/sources/src/adapters/job-board.ts` | Hiring intent |
| `packages/sources/src/enrich.ts` | Orchestrator |
| `packages/audit/src/client.ts` | Audit tool client + cache |
| `apps/web/src/app/api/leads/[id]/enrich/route.ts` | Enrich lead |
| `apps/web/src/app/api/leads/[id]/audit/route.ts` | Audit lead |
| `apps/web/src/app/api/audit/route.ts` | Standalone audit |
