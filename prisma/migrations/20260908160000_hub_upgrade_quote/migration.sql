CREATE TABLE "HubUpgradeAttempt" (
  "subscriptionId" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dispatchStartedAt" TIMESTAMP(3),
  "invoiceId" TEXT,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "HubUpgradeAttempt_dispatch_before_result" CHECK ("completedAt" IS NULL OR "dispatchStartedAt" IS NOT NULL),
  CONSTRAINT "HubUpgradeAttempt_invoice_before_result" CHECK ("completedAt" IS NULL OR "invoiceId" IS NOT NULL)
);
CREATE INDEX "HubUpgradeAttempt_userId_idx" ON "HubUpgradeAttempt"("userId");
CREATE TABLE "HubUpgradeRetiredQuote" (
  "quoteHash" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "HubUpgradeRetiredQuote_userId_expiresAt_idx" ON "HubUpgradeRetiredQuote"("userId", "expiresAt");
