# AGENT_RULES – LeadPilot Retainer Edition

**STRICT – NEVER RELAX**

These rules apply to every coding agent working on this repository.

## Language and typography

- All product UI copy, marketing copy, docs intended for end users, and agent replies about the product must be in **clear professional English**.
- **Do not use Roman Urdu** (or mixed Urdu-English transliteration) in code comments that ship to users, UI strings, marketing pages, emails, or living documents that describe product behaviour.
- **Do not use em dashes** (the Unicode character U+2014, or the sequence `--` used as a substitute em dash in prose). Use commas, periods, colons, or parentheses instead.
- **Do not use guidance text** anywhere in the product UI or marketing site. No helper blurbs, no "this is where X will appear", no instructional filler, no placeholder explanations on empty states beyond a single factual line if data is empty.

## Tenancy and access

- The product is **multi-tenant** (one workspace per client agency).
- **Only a SUPER_ADMIN** may create workspaces and invite or create tenant users.
- There is **no public self-serve signup** for agencies. Public site CTAs are **Contact Sales** only (phone and contact form).
- Tenant OWNER/ADMIN may manage users **inside their own workspace only** after the workspace exists; they cannot create new tenant workspaces.

## Living Documents (mandatory)

- Always update the five living documents in the **same commit** as the code change:
  1. `docs/AGENT_RULES.md` (this file)
  2. `docs/HISTORY.md`
  3. `docs/README.md`
  4. `docs/FILEMAP.md`
  5. `docs/PLAN.md`

## Code Quality

- Never commit placeholders, hardcoded fake data that looks real, or unfinished features presented as complete.
- Large files (>400 lines) must be written in chunks with intermediate commits and documentation updates.
- The `placeholder-scan` script must pass on every commit that lands on main.

## Cost and Credits

- Before any paid API call (email finder, enrichment, LLM), check remaining credit budget and the run's `max_credits`.
- Simulation mode must be available for the entire pipeline so the agent can test without sending real emails or spending credits.

## Contact-History Ledger (single source of truth)

- The contact-history ledger is the single source of truth for "already contacted".
- Check it **before** enrichment, **before** scoring, **before** writing email, and **again immediately before send**.

## HTTP and External Calls

- All external HTTP clients must have timeouts, retries with exponential backoff, and circuit breakers.
- Prefer official APIs and licensed data providers. Scraping is only allowed when robots.txt permits and rate limits are respected; **never** for LinkedIn or Instagram.

## Secrets

- Secrets never live in code or in the repository. Use environment variables and a secrets manager pattern.

## API Security

- Every public or authenticated API endpoint must have rate limiting, input validation, and proper authorization checks.

## Learning Features

- When learning features exist, they must be evaluated against a random-order and simple rule baseline.
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
