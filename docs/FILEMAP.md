# FILEMAP – LeadPilot Retainer Edition

## Auth (Phase 4)

| Path | Purpose |
|------|---------|
| `apps/web/src/auth.ts` | Auth.js config – credentials, JWT, callbacks |
| `apps/web/src/middleware.ts` | Protect /dashboard, /settings |
| `apps/web/src/lib/password.ts` | Argon2id hash/verify + strength policy |
| `apps/web/src/lib/mfa.ts` | TOTP secret, verify, QR |
| `apps/web/src/lib/rate-limit.ts` | Sliding-window limiter (auth endpoints) |
| `apps/web/src/lib/rbac.ts` | Role rank helpers |
| `apps/web/src/app/api/auth/[...nextauth]/route.ts` | Auth.js handlers |
| `apps/web/src/app/api/auth/register/route.ts` | Bootstrap register |
| `apps/web/src/app/api/auth/password-reset/*` | Request + confirm |
| `apps/web/src/app/api/auth/mfa/*` | Setup, confirm, disable |
| `apps/web/src/app/login/page.tsx` | Login + MFA step |
| `apps/web/src/app/register/page.tsx` | Register |
| `apps/web/src/app/reset-password/page.tsx` | Reset flow |
| `apps/web/src/app/dashboard/page.tsx` | Protected dashboard stub |

## packages/db tables

See previous Phase 2–3 entries. Auth uses `users`, `accounts`, `sessions`, `verification_tokens`.
