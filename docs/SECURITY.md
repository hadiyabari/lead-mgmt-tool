# Security baseline – LeadPilot

## Implemented in app

- HTTPS expected in production; HSTS header when `NODE_ENV=production`
- Security headers via middleware: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP, `X-DNS-Prefetch-Control`
- Auth: Argon2id passwords, MFA TOTP, JWT sessions, rate limits on auth endpoints
- RBAC including SUPER_ADMIN; public registration disabled
- Input validation with Zod on APIs
- Kill switch for sending and enrichment
- Secrets via environment variables only
- Cookie consent gate for analytics
- IP hashed (not stored raw) on site events

## Operational (hosting)

- Terminate TLS at CDN or reverse proxy; enable WAF and DDoS (e.g. Cloudflare)
- Keep dependencies updated; run `pnpm audit` in CI
- Backups for PostgreSQL with tested restore
- Restrict admin routes and database network access

## Not bundled as third-party products

GA4, Hotjar, Snyk, etc. can be added later under consent and DPA. First-party analytics and headers ship in-repo.
