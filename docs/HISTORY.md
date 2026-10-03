# HISTORY – LeadPilot Retainer Edition

Living changelog. Newest entries at the top.

---

## [2026-10-03] Phase 30 – Meeting calendar export

**Goal:** Export meetings to calendar clients without OAuth calendar sync.

**Agent actions:**
- Package `@leadpilot/calendar`: ICS builder, Google Calendar and Outlook web links
- `GET /api/meetings/:id/ics` download
- `GET /api/meetings/:id/calendar-links` JSON links
- Meetings UI: Download ICS, Google Calendar, Outlook buttons
- Unit tests for ICS and Google URL

**Achieved:**
- Operators can add meetings to local or web calendars.

**Open items:**
- Full Google/Outlook OAuth sync remains optional later.

**Commit:** feat(phase-30): meeting ICS export + calendar booking links

---

## Prior

Phases 0–29 on main.
