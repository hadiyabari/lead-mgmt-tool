/**
 * First-party analytics event taxonomy (privacy-aware).
 * Only fire when cookie analytics consent is granted (client) or from server ops.
 */

export const AnalyticsCategory = {
  TRAFFIC: 'traffic',
  BEHAVIOR: 'behavior',
  CONVERSION: 'conversion',
  PERFORMANCE: 'performance',
  CONTENT: 'content',
  CUSTOM: 'custom',
  REALTIME: 'realtime',
} as const;

export type AnalyticsCategoryId = (typeof AnalyticsCategory)[keyof typeof AnalyticsCategory];

/** Canonical event names used by the marketing site and admin dashboards. */
export const AnalyticsEventName = {
  // Traffic / audience
  PAGE_VIEW: 'page_view',
  SESSION_START: 'session_start',
  // Behavior
  SCROLL_DEPTH: 'scroll_depth',
  CTA_CLICK: 'cta_click',
  OUTBOUND_CLICK: 'outbound_click',
  // Conversion / goals
  CONTACT_SALES: 'contact_sales',
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  CONTACT_FORM_ERROR: 'contact_form_error',
  PHONE_CLICK: 'phone_click',
  COOKIE_ACCEPT: 'cookie_accept',
  COOKIE_REJECT: 'cookie_reject',
  // Performance
  WEB_VITAL: 'web_vital',
  // Content
  SECTION_VIEW: 'section_view',
} as const;

export type AnalyticsEventNameId =
  (typeof AnalyticsEventName)[keyof typeof AnalyticsEventName];

export const EVENT_CATEGORY: Record<string, AnalyticsCategoryId> = {
  [AnalyticsEventName.PAGE_VIEW]: AnalyticsCategory.TRAFFIC,
  [AnalyticsEventName.SESSION_START]: AnalyticsCategory.TRAFFIC,
  [AnalyticsEventName.SCROLL_DEPTH]: AnalyticsCategory.BEHAVIOR,
  [AnalyticsEventName.CTA_CLICK]: AnalyticsCategory.BEHAVIOR,
  [AnalyticsEventName.OUTBOUND_CLICK]: AnalyticsCategory.BEHAVIOR,
  [AnalyticsEventName.CONTACT_SALES]: AnalyticsCategory.CONVERSION,
  [AnalyticsEventName.CONTACT_FORM_SUBMIT]: AnalyticsCategory.CONVERSION,
  [AnalyticsEventName.CONTACT_FORM_ERROR]: AnalyticsCategory.CONVERSION,
  [AnalyticsEventName.PHONE_CLICK]: AnalyticsCategory.CONVERSION,
  [AnalyticsEventName.COOKIE_ACCEPT]: AnalyticsCategory.CUSTOM,
  [AnalyticsEventName.COOKIE_REJECT]: AnalyticsCategory.CUSTOM,
  [AnalyticsEventName.WEB_VITAL]: AnalyticsCategory.PERFORMANCE,
  [AnalyticsEventName.SECTION_VIEW]: AnalyticsCategory.CONTENT,
};

export type ClientAnalyticsPayload = {
  name: string;
  path?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  sessionId?: string | null;
  meta?: Record<string, unknown> | null;
};
