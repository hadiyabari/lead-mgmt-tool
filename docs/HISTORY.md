# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-09-28] Marketing site, multi-tenant rules, legal pages, site analytics

**Goal:** Public marketing site with Contact Sales only; multi-tenant with SUPER_ADMIN provisioning; legal pages; analytics for super admin.

**Agent actions:**
- AGENT_RULES: ban em dashes, ban Roman Urdu in product copy, ban guidance text in UI, SUPER_ADMIN-only tenant provisioning, no public signup.
- PLAN: commercial plans $100 / $300 / Enterprise, Contact Sales phone 03293318181, multi-tenant model.
- Schema: Role SUPER_ADMIN, SiteEvent, workspace.planCode, migration.
- Marketing: home (11 sections), how-it-works, pricing with deliverables, premium contact, privacy, cookies, terms, refunds (no refunds except payment failure with no work or duplicate payment), data deletion.
- Cookie banner and page-view analytics API.
- Contact sales API stores inquiries as site events.
- Public register disabled (403).
- SUPER_ADMIN analytics at /admin/analytics.
- RBAC helpers: isSuperAdmin, canProvisionTenants.

**Achieved:**
- Public CTAs are Contact Sales only.
- Legal and pricing pages live.
- Super admin can view site traffic metrics.

**Open items / risks:**
- SUPER_ADMIN user seed and workspace provision UI API still to wire for day-to-day ops.
- Apply DB migration for Role enum and site_events before analytics persists.

**Commit:** feat(marketing-saas) series

---

## Prior phases 0–11

Bootstrap through audit client completed earlier on main.
