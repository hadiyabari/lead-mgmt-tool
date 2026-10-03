# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 38 – Contact-sales inbox and suppression delete

**Goal:** Review marketing contact form submissions; remove suppression entries.

**Agent actions:**
- `GET /api/admin/contact-sales` from SiteEvent contact_sales
- UI `/admin/contact-sales` for OWNER/ADMIN/SUPER_ADMIN
- `DELETE /api/suppression/:id` + Remove button in Suppression UI

**Achieved:**
- Sales leads from the public form are visible in-app.

**Open items:**
- Email notify on new contact_sales optional.

**Commit:** feat(phase-38): contact-sales inbox + suppression delete

---

## Prior

Phases 0–37 on main.
