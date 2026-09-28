-- Phase 3: Leads, Ledger, Messaging, Meetings, Runs, Cost, Suppression

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('DISCOVERED', 'ENRICHING', 'ENRICHED', 'SCORED', 'QUALIFIED', 'EMAIL_RESOLVED', 'IN_CAMPAIGN', 'CONTACTED', 'REPLIED', 'MEETING_BOOKED', 'WON', 'LOST', 'SUPPRESSED', 'ARCHIVED');

CREATE TYPE "ContactChannel" AS ENUM ('EMAIL', 'PHONE', 'OTHER');

CREATE TYPE "ContactOrigin" AS ENUM ('LEDGER_IMPORT_CSV', 'LEDGER_IMPORT_GMAIL', 'LEDGER_IMPORT_CRM', 'OUTBOUND_SEND', 'REPLY', 'MANUAL', 'SUPPRESSION');

CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

CREATE TYPE "OutboxStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED', 'SIMULATED');

CREATE TYPE "ReplyClassification" AS ENUM ('INTERESTED', 'OBJECTION', 'UNSUBSCRIBE', 'OUT_OF_OFFICE', 'BOUNCE', 'OTHER', 'UNCLASSIFIED');

CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'BUDGET_EXHAUSTED');

CREATE TYPE "CostCategory" AS ENUM ('EMAIL_FINDER', 'ENRICHMENT', 'LLM', 'AUDIT', 'OTHER');

-- CreateTable leads
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "normalizedName" TEXT,
    "website" TEXT,
    "domain" TEXT,
    "country" "CountryCode",
    "region" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "vertical" "Vertical",
    "status" "LeadStatus" NOT NULL DEFAULT 'DISCOVERED',
    "sourceProvider" "SourceProvider",
    "sourceRef" TEXT,
    "sourceMeta" JSONB,
    "primaryEmail" TEXT,
    "primaryPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lead_enrichments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "raw" JSONB,
    "enrichedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_enrichments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lead_scores" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB NOT NULL,
    "weightsUsed" JSONB,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_results" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "findings" JSONB NOT NULL,
    "rawReport" JSONB,
    "auditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_history_ledger" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "normalizedEmail" TEXT,
    "normalizedPhone" TEXT,
    "domain" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "origin" "ContactOrigin" NOT NULL,
    "channel" "ContactChannel" NOT NULL DEFAULT 'EMAIL',
    "sourceOfTruth" TEXT,
    "firstContactedAt" TIMESTAMP(3) NOT NULL,
    "lastContactedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_history_ledger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "playbookId" TEXT,
    "name" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sequences" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "campaignId" TEXT,
    "name" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "emails_outbox" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "leadId" TEXT NOT NULL,
    "campaignId" TEXT,
    "toEmail" TEXT NOT NULL,
    "toName" TEXT,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "factsUsed" JSONB,
    "status" "OutboxStatus" NOT NULL DEFAULT 'DRAFT',
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "emails_outbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "emails_sent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "campaignId" TEXT,
    "outboxId" TEXT,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "mailboxId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "emails_sent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "replies" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "emailSentId" TEXT,
    "fromEmail" TEXT NOT NULL,
    "subject" TEXT,
    "bodyText" TEXT,
    "classification" "ReplyClassification" NOT NULL DEFAULT 'UNCLASSIFIED',
    "raw" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "replies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "title" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "calendarEventId" TEXT,
    "meetingUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "suppression_list" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "normalizedEmail" TEXT,
    "normalizedPhone" TEXT,
    "domain" TEXT,
    "reason" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "suppression_list_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cost_ledger" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "runId" TEXT,
    "category" "CostCategory" NOT NULL,
    "provider" TEXT,
    "units" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cost_ledger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "icpId" TEXT,
    "name" TEXT,
    "goalLeadCount" INTEGER,
    "maxCredits" INTEGER,
    "creditsUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leadsFound" INTEGER NOT NULL DEFAULT 0,
    "leadsQualified" INTEGER NOT NULL DEFAULT 0,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "isSimulation" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- Indexes: leads
CREATE INDEX "leads_workspaceId_idx" ON "leads"("workspaceId");
CREATE INDEX "leads_workspaceId_status_idx" ON "leads"("workspaceId", "status");
CREATE INDEX "leads_workspaceId_domain_idx" ON "leads"("workspaceId", "domain");
CREATE INDEX "leads_workspaceId_normalizedName_idx" ON "leads"("workspaceId", "normalizedName");
CREATE INDEX "leads_primaryEmail_idx" ON "leads"("primaryEmail");

CREATE INDEX "lead_enrichments_leadId_idx" ON "lead_enrichments"("leadId");
CREATE INDEX "lead_scores_leadId_idx" ON "lead_scores"("leadId");
CREATE INDEX "lead_scores_totalScore_idx" ON "lead_scores"("totalScore");
CREATE INDEX "audit_results_leadId_idx" ON "audit_results"("leadId");
CREATE INDEX "audit_results_score_idx" ON "audit_results"("score");

-- Ledger uniqueness + indexes (NULL-safe unique: Postgres treats NULLs as distinct in unique constraints;
-- application layer must also guard empty normalized values)
CREATE UNIQUE INDEX "contact_history_ledger_workspaceId_normalizedEmail_key" ON "contact_history_ledger"("workspaceId", "normalizedEmail");
CREATE UNIQUE INDEX "contact_history_ledger_workspaceId_normalizedPhone_key" ON "contact_history_ledger"("workspaceId", "normalizedPhone");
CREATE INDEX "contact_history_ledger_workspaceId_idx" ON "contact_history_ledger"("workspaceId");
CREATE INDEX "contact_history_ledger_workspaceId_domain_idx" ON "contact_history_ledger"("workspaceId", "domain");
CREATE INDEX "contact_history_ledger_normalizedEmail_idx" ON "contact_history_ledger"("normalizedEmail");
CREATE INDEX "contact_history_ledger_normalizedPhone_idx" ON "contact_history_ledger"("normalizedPhone");

-- Campaigns / sequences / outbox / sent / replies
CREATE INDEX "campaigns_workspaceId_idx" ON "campaigns"("workspaceId");
CREATE INDEX "campaigns_workspaceId_status_idx" ON "campaigns"("workspaceId", "status");
CREATE INDEX "sequences_workspaceId_idx" ON "sequences"("workspaceId");
CREATE INDEX "sequences_campaignId_idx" ON "sequences"("campaignId");

CREATE INDEX "emails_outbox_leadId_idx" ON "emails_outbox"("leadId");
CREATE INDEX "emails_outbox_campaignId_idx" ON "emails_outbox"("campaignId");
CREATE INDEX "emails_outbox_status_scheduledAt_idx" ON "emails_outbox"("status", "scheduledAt");
CREATE INDEX "emails_outbox_toEmail_idx" ON "emails_outbox"("toEmail");

CREATE UNIQUE INDEX "emails_sent_outboxId_key" ON "emails_sent"("outboxId");
CREATE INDEX "emails_sent_leadId_idx" ON "emails_sent"("leadId");
CREATE INDEX "emails_sent_campaignId_idx" ON "emails_sent"("campaignId");
CREATE INDEX "emails_sent_toEmail_idx" ON "emails_sent"("toEmail");
CREATE INDEX "emails_sent_sentAt_idx" ON "emails_sent"("sentAt");

CREATE INDEX "replies_leadId_idx" ON "replies"("leadId");
CREATE INDEX "replies_classification_idx" ON "replies"("classification");
CREATE INDEX "replies_fromEmail_idx" ON "replies"("fromEmail");

CREATE INDEX "meetings_leadId_idx" ON "meetings"("leadId");
CREATE INDEX "meetings_startsAt_idx" ON "meetings"("startsAt");
CREATE INDEX "meetings_status_idx" ON "meetings"("status");

CREATE UNIQUE INDEX "suppression_list_workspaceId_normalizedEmail_key" ON "suppression_list"("workspaceId", "normalizedEmail");
CREATE UNIQUE INDEX "suppression_list_workspaceId_normalizedPhone_key" ON "suppression_list"("workspaceId", "normalizedPhone");
CREATE INDEX "suppression_list_workspaceId_idx" ON "suppression_list"("workspaceId");
CREATE INDEX "suppression_list_domain_idx" ON "suppression_list"("domain");

CREATE INDEX "cost_ledger_workspaceId_idx" ON "cost_ledger"("workspaceId");
CREATE INDEX "cost_ledger_runId_idx" ON "cost_ledger"("runId");
CREATE INDEX "cost_ledger_category_idx" ON "cost_ledger"("category");
CREATE INDEX "cost_ledger_createdAt_idx" ON "cost_ledger"("createdAt");

CREATE INDEX "runs_workspaceId_idx" ON "runs"("workspaceId");
CREATE INDEX "runs_workspaceId_status_idx" ON "runs"("workspaceId", "status");
CREATE INDEX "runs_icpId_idx" ON "runs"("icpId");

-- Foreign keys
ALTER TABLE "leads" ADD CONSTRAINT "leads_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_enrichments" ADD CONSTRAINT "lead_enrichments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_scores" ADD CONSTRAINT "lead_scores_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_history_ledger" ADD CONSTRAINT "contact_history_ledger_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "playbooks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sequences" ADD CONSTRAINT "sequences_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "emails_outbox" ADD CONSTRAINT "emails_outbox_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emails_outbox" ADD CONSTRAINT "emails_outbox_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "emails_sent" ADD CONSTRAINT "emails_sent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emails_sent" ADD CONSTRAINT "emails_sent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "replies" ADD CONSTRAINT "replies_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "replies" ADD CONSTRAINT "replies_emailSentId_fkey" FOREIGN KEY ("emailSentId") REFERENCES "emails_sent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "meetings" ADD CONSTRAINT "meetings_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "suppression_list" ADD CONSTRAINT "suppression_list_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cost_ledger" ADD CONSTRAINT "cost_ledger_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cost_ledger" ADD CONSTRAINT "cost_ledger_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "runs" ADD CONSTRAINT "runs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "runs" ADD CONSTRAINT "runs_icpId_fkey" FOREIGN KEY ("icpId") REFERENCES "icps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
