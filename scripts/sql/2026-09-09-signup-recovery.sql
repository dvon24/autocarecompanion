-- Additive only. Apply to the verified isolated signup database first.
-- Production application requires separate release approval.
BEGIN;
ALTER TABLE "AccountEnrollment" ADD COLUMN IF NOT EXISTS "returnTo" TEXT;
ALTER TABLE "BillingAttempt" ADD COLUMN IF NOT EXISTS "returnTo" TEXT;
COMMIT;
