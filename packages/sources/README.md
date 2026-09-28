# @leadpilot/sources

Source adapter framework + official registry adapters (Phase 8–9).

## Framework

- `SourceAdapter` interface: `discover`, optional `enrich`
- `httpJson` – timeout, retries, circuit breaker, cost hook
- `registerAdapter` / `getAdapter` / `listAdapters`
- All adapters honour `ctx.simulation`

## Built-in adapters

| ID | Country | Notes |
|----|---------|-------|
| `NPI_US` | US | CMS NPI public API |
| `STATE_LICENSE_US` | US | Pattern + configurable board endpoint |
| `COMPANIES_HOUSE_UK` | UK | Ltd/LLP filter enforced; needs `COMPANIES_HOUSE_API_KEY` |
| `ABN_ASIC_AU` | AU | ABR name search; needs `ABN_LOOKUP_GUID` |
| `HEALTH_REGISTER_AU` | AU | Simulation until licensed feed |
| `DUMMY` | all | Framework tests |

## Usage

```ts
import { getAdapter } from '@leadpilot/sources';

const npi = getAdapter('NPI_US');
const { leads } = await npi!.discover(
  { vertical: 'DENTAL_ORTHO', region: 'CA', limit: 10, simulation: true },
  { simulation: true }
);
```
