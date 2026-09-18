-- Additive release migration. Do not run until the release is approved.
-- No existing lead, account, subscription or reservation is changed.
CREATE TABLE IF NOT EXISTS "VisualSignup" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "product" TEXT NOT NULL DEFAULT 'visual-known-issues-all-models',
  "country" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsubscribeToken" TEXT NOT NULL UNIQUE,
  "unsubscribedAt" TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "VisualSignup_createdAt_idx" ON "VisualSignup"("createdAt");
