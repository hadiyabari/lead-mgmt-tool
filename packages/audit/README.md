# @leadpilot/audit

Agency audit tool client: **URL → structured score + findings**.

```ts
import { runAudit } from '@leadpilot/audit';

const result = await runAudit('https://clinic.example', { simulation: true });
// result.score, result.findings[], result.summary
```

Env:
- `AUDIT_TOOL_URL` – base URL of the audit API (`POST /audit`)
- `AUDIT_TOOL_API_KEY` – optional bearer
- `SIMULATION_MODE=true` – force simulated audits

Cache: in-memory 7 days per URL.
