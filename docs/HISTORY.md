# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Phase 12 – Scoring model + analytics taxonomy + security headers

**Goal:** Rank leads reproducibly; expand first-party analytics types; harden HTTP headers.

**Agent actions:**
- Package `@leadpilot/scoring`: weighted score (audit, rating, reviews, website, email, phone, job signal, ICP fit), normalized weights, breakdown with labels, qualified threshold, unit tests for reproducibility.
- `POST /api/leads/[id]/score` persists LeadScore and updates lead status QUALIFIED/SCORED.
- Analytics: event taxonomy (traffic, behavior, conversion, performance, content), `track()` client helper, BehaviorTracker (scroll depth, CTA/phone clicks, navigation timing).
- Security: middleware applies CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS in production.
- Admin analytics aggregates by event name and category.
- docs/SECURITY.md, docs/ANALYTICS.md, PLAN/HISTORY updated.

**Achieved:**
- Same inputs yield same score; operators get breakdown details.
- Consent-gated behavior and conversion events.
- Baseline security headers on responses.

**Open items:**
- Weights UI for operators (API accepts weights body already).
- Full Core Web Vitals (INP/CLS) library optional later.
- External WAF/CDN remains operational concern.

**Commit:** feat(phase-12): scoring model + first-party analytics types + security headers

---

## Prior entries

Cookie consent, marketing site, phases 0–11 on main.
