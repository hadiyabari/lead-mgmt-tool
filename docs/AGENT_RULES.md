# AGENT_RULES – LeadPilot Retainer Edition

**STRICT – NEVER RELAX**

These rules apply to every coding agent (Grok or otherwise) working on this repository.

## Living Documents (mandatory)

- Always update the five living documents in the **same commit** as the code change:
  1. `docs/AGENT_RULES.md` (this file)
  2. `docs/HISTORY.md`
  3. `docs/README.md`
  4. `docs/FILEMAP.md`
  5. `docs/PLAN.md`

## Code Quality

- Never commit placeholders, hardcoded fake data that looks real, or "coming soon" features.
- Large files (>400 lines) must be written in chunks with intermediate commits and documentation updates.
- The `placeholder-scan` script must pass on every commit that lands on main.

## Cost & Credits

- Before any paid API call (email finder, enrichment, LLM), check remaining credit budget and the run's `max_credits`.
- Simulation mode must be available for the entire pipeline so the agent can test without sending real emails or spending credits.

## Contact-History Ledger (single source of truth)

- The contact-history ledger is the single source of truth for "already contacted".
- Check it **before** enrichment, **before** scoring, **before** writing email, and **again immediately before send**.

## HTTP & External Calls

- All external HTTP clients must have timeouts, retries with exponential backoff, and circuit breakers.
- Prefer official APIs and licensed data providers. Scraping is only allowed when robots.txt permits and rate limits are respected; **never** for LinkedIn or Instagram.

## Secrets

- Secrets never live in code or in the repository. Use environment variables + a secrets manager pattern.

## API Security

- Every public or authenticated API endpoint must have rate limiting, input validation, and proper authorization checks.

## Learning Features

- When learning features exist, they must be evaluated against a random-order + simple rule baseline.
- Until proven, show "NOT YET PROVEN" badge in UI.

## Open Source

- Code copied or adapted from open-source repos must be documented in `docs/REFERENCES.md` with license notes.
- Prefer design ideas over copy-paste.

## History Entry Format

Every commit message and every HISTORY entry must follow this exact format:

```
## [YYYY-MM-DD] Phase X – Short Title
**Goal:** What we set out to achieve in this phase.
**Agent actions:** Exact list of what was implemented, files created/changed, tests written.
**Achieved:** Concrete outcomes, acceptance criteria that passed, any metrics.
**Open items / risks:** Anything deferred or discovered.
**Commit:** hash or message.
```
