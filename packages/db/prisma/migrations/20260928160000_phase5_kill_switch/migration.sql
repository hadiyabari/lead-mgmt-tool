-- Phase 5: workspace kill switch flag
ALTER TABLE "workspaces" ADD COLUMN "killSwitch" BOOLEAN NOT NULL DEFAULT false;
