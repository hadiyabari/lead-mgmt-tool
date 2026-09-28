# FILEMAP – LeadPilot Retainer Edition

## Phase 6 – Normalisation + Ledger

| Path | Purpose |
|------|---------|
| `packages/shared/src/normalize/email.ts` | Email canonical form (Gmail dots) |
| `packages/shared/src/normalize/phone.ts` | Phone E.164-ish + country defaults |
| `packages/shared/src/normalize/domain.ts` | Domain from URL/email |
| `packages/shared/src/normalize/company.ts` | Company name dedup |
| `packages/shared/src/normalize/index.ts` | `normalizeIdentity` |
| `packages/shared/src/normalize/*.test.ts` | Unit tests |
| `packages/db/src/ledger.ts` | Ledger service + four-point check |

### Ledger service API

- `ledgerLookup` / `ledgerIsContacted`
- `ledgerInsert` (idempotent)
- `ledgerBulkImport`
- `fourPointCheck` → `{ allowed, reason }`
