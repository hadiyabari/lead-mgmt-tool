-- SUPER_ADMIN role + site analytics events
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

CREATE TABLE IF NOT EXISTS "site_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "sessionId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "site_events_name_idx" ON "site_events"("name");
CREATE INDEX IF NOT EXISTS "site_events_createdAt_idx" ON "site_events"("createdAt");
CREATE INDEX IF NOT EXISTS "site_events_path_idx" ON "site_events"("path");
