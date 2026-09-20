-- REVIEW ONLY. Do not apply without explicit production migration approval.
-- Additive: preserves every existing user, subscription, reservation and password.
BEGIN;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "legacySubscriptionTier" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "enrollmentProduct" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "enrollmentVehicleId" TEXT;
CREATE TABLE IF NOT EXISTS "AccountEnrollment" (
 "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL, "tokenHash" TEXT NOT NULL UNIQUE,
 "product" TEXT NOT NULL, "intent" TEXT, "vehicleId" TEXT,
 "expiresAt" TIMESTAMP(3) NOT NULL, "usedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AccountEnrollment_email_createdAt_idx" ON "AccountEnrollment" ("email", "createdAt");
CREATE TABLE IF NOT EXISTS "BillingAttempt" (
 "userId" TEXT PRIMARY KEY, "key" TEXT NOT NULL UNIQUE, "product" TEXT NOT NULL,
 "vehicleId" TEXT, "customerId" TEXT, "sessionId" TEXT UNIQUE, "subscriptionId" TEXT,
 "url" TEXT, "state" TEXT NOT NULL DEFAULT 'pending',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "BillingEvent" ("id" TEXT PRIMARY KEY, "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "TwinInvitationDelivery" (
 "id" TEXT PRIMARY KEY, "reservationId" TEXT NOT NULL UNIQUE,
 "status" TEXT NOT NULL DEFAULT 'pending', "providerId" TEXT, "reservationRevision" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
COMMIT;
-- Before release: review existing Stripe-bound subscriber IDs and prices, then
-- explicitly backfill legacySubscriptionTier='plus'/'pro' for those exact IDs.
-- Configure STRIPE_REVIEWED_LEGACY_PRICE_IDS with their reviewed Stripe prices.
-- No blanket active/unknown-tier upgrade and no emailVerified/password backfill.
