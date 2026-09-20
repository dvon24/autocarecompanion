-- Additive only: no existing account/subscription classification or backfill.
CREATE TABLE "BillingEnrollmentReview" (
  "subscriptionId" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "customerId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL UNIQUE,
  "attemptKey" TEXT NOT NULL,
  "state" TEXT NOT NULL CHECK ("state" IN ('confirmed', 'review_required')),
  "initialVerified" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "BillingEnrollmentReview_userId_idx" ON "BillingEnrollmentReview"("userId");
