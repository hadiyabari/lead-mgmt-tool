# First-party analytics taxonomy

Privacy-first. Events are stored in `site_events` only after analytics cookie consent (except server-side contact form service requests).

## Categories covered

| Category | In product |
|----------|------------|
| Traffic / audience | page_view, UTM, path, referrer, session id |
| User behavior | scroll_depth, cta_click, phone_click |
| Conversion / goals | contact_sales, contact_form_submit |
| Performance | web_vital (navigation timing snapshot) |
| Content | path popularity in admin analytics |
| Real-time (near) | eventsLast24h on admin dashboard |
| Privacy-focused | consent gate, hashed IP, no third-party pixels by default |
| Custom events | track() helper |

## Not in v1 (optional later)

Heatmaps/session replay, SEO rank tracking, full e-commerce, A/B framework, predictive ML. Prefer first-party or contracted tools under DPA.

## Admin

`GET /api/admin/analytics` and `/admin/analytics` (SUPER_ADMIN): page views, conversions, by event name, by category, top paths.
