# @leadpilot/db

Prisma schema, migrations, client, seed, and **contact-history ledger service**.

## Ledger API (Phase 6)

```ts
import {
  ledgerLookup,
  ledgerIsContacted,
  ledgerInsert,
  ledgerBulkImport,
  fourPointCheck,
} from '@leadpilot/db';

// Four-point gate (before enrich / score / write email / send)
const gate = await fourPointCheck(workspaceId, { email: 'Dr.Smith@Clinic.com' });
if (!gate.allowed) {
  // reason: already_contacted | suppressed_email | …
}

await ledgerInsert(workspaceId, {
  email: 'dr.smith@clinic.com',
  origin: 'OUTBOUND_SEND',
});
```

Normalisation lives in `@leadpilot/shared` (email, phone, domain, company).
