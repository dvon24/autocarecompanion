-- Standalone intent deliberately survives User/Vehicle cascades.
CREATE TABLE "MaintenanceReceiptCleanup" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "vehicleId" TEXT,
  "receiptPath" TEXT,
  "retiredAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "generation" TEXT NOT NULL,
  "cursor" TEXT,
  "sweepHadReferences" BOOLEAN NOT NULL DEFAULT FALSE,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MaintenanceReceiptCleanup_receipt_scope" CHECK ("receiptPath" IS NULL OR "vehicleId" IS NOT NULL)
);
CREATE INDEX "MaintenanceReceiptCleanup_nextAttemptAt_idx" ON "MaintenanceReceiptCleanup"("nextAttemptAt");
CREATE INDEX "MaintenanceReceiptCleanup_userId_idx" ON "MaintenanceReceiptCleanup"("userId");
