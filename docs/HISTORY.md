# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Cookie consent logic

**Goal:** Correct essential vs analytics gating for marketing analytics.

**Agent actions:**
- Added `lib/cookie-consent.ts`: versioned JSON consent (v2), migrate legacy string keys, acceptAll / rejectNonEssential, hasAnalyticsConsent, consent change CustomEvent.
- CookieBanner uses the module; footer Cookie preferences clears decision and reopens banner.
- PageViewTracker sends page_view only when analytics is true (no tracking on unknown/reject); tracks after accept via consent event; session id in sessionStorage when allowed.
- Unit tests for consent store.
- Cookie policy page updated to match behaviour.

**Achieved:**
- No analytics until explicit Accept all.
- Essential-only path blocks page_view.
- Re-consent when version bumps.

**Open items / risks:**
- Contact form still stores inquiry server-side (intentional service request).

**Commit:** feat(cookies): versioned consent store, analytics gate, reopen preferences

---

## Prior

Marketing site, multi-tenant rules, phases 0–11 on main.
