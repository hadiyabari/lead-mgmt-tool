# Release notes – LeadPilot Retainer Edition v1.0.0

**Date:** 2026-10-03  
**Agency seed:** Threezero Agency  
**Scope:** Single product monorepo, multi-tenant, Contact Sales only

## What is included

- Contact-history ledger with four-point gate (draft + send)
- Source adapter framework (simulation-first)
- Audit client (simulation + optional live URL)
- Reproducible lead scoring
- Grounded email drafts (template + optional Anthropic)
- Outbox review: submit, approve, reject, send
- Email send (simulation + optional Postmark)
- Inbound reply webhook + rule classifier + suppression on unsubscribe
- Meetings booking and campaign activation
- Cost ledger and suppression APIs
- E2E simulation run (leads → audit → score → draft)
- Marketing site: home, how-it-works, pricing, contact, legal pages
- Cookie consent, first-party analytics events, security headers
- SUPER_ADMIN-only tenant provisioning model (schema + rules)

## Default operating mode

`SIMULATION_MODE=true` until live keys are configured.

## Known limitations (v1.0)

- Live registry discovery requires provider keys and non-simulation execute path expansion
- No Google/Outlook calendar sync yet
- No bulk approve/send UI
- LLM email path requires `ANTHROPIC_API_KEY`
- Live send requires `POSTMARK_API_TOKEN` and `SIMULATION_MODE=false`

## Upgrade / deploy

1. Deploy from `main` with Dockerfile builder
2. Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXTAUTH_URL`
3. Run migrations on start (image CMD)
4. Seed once; change default owner password
5. Run `scripts/smoke.sh` against public URL

## Sales

Contact Sales: **03293318181**
