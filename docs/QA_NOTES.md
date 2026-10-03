# QA notes – Phase 24

## Static checks (repo)

- Analytics `meta` field cast to `Prisma.InputJsonValue` (build regression fix)
- Scoring entrypoint is `computeLeadScore` (used by run execute)
- Outbox send uses `fourPointCheck` + `ledgerInsert`
- Inbound replies public path remains `/api/replies/inbound`
- Middleware protects dashboard and private APIs

## Manual QA (operator)

1. Login with seeded owner
2. Dashboard shows counts
3. Runs → Start simulation run → log lines appear
4. Leads list shows new sample leads
5. Draft email from lead → appears in Outbox as DRAFT
6. Approve → Send (simulation) → status SIMULATED; ledger updated
7. Kill switch blocks new runs and sends
8. Marketing `/`, `/pricing`, `/contact`, `/legal/privacy` load
9. Cookie banner present on marketing

## Deploy QA

```bash
BASE_URL=https://YOUR_HOST ./scripts/smoke.sh
curl -s "$BASE_URL/api/health?deep=1"
```

## Residual risks

- Production build must use Dockerfile (not Railpack migrate-at-build)
- Edge warning for `jose` in middleware is non-fatal
