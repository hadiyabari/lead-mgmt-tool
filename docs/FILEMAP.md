# FILEMAP – LeadPilot Retainer Edition

## Phase 5 UI

| Path | Purpose |
|------|---------|
| `apps/web/src/app/globals.css` | Design tokens + shell styles |
| `apps/web/src/components/AppShell.tsx` | Sidebar + topbar layout |
| `apps/web/src/components/KillSwitch.tsx` | Client kill-switch control |
| `apps/web/src/app/api/kill-switch/route.ts` | GET/POST kill switch |
| `apps/web/src/app/dashboard/*` | Dashboard + placeholder sections |
| `apps/web/src/app/settings/page.tsx` | Settings + kill switch |

## Schema addition

| Column | Table | Purpose |
|--------|-------|---------|
| `killSwitch` | `workspaces` | Durable flag; when true, sending + enrichment must stop |
