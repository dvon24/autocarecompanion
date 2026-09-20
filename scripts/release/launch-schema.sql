-- LOCAL REHEARSAL CANDIDATE. Production execution requires separate approval.
-- One transaction; no subscriber mapping/backfill, no downgrade journal.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='60s';
SET LOCAL search_path=public,pg_catalog;
-- Source: scripts/sql/2026-09-05-visual-signups.sql
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

-- Source: scripts/sql/2026-09-07-verified-paid-signup.sql
-- REVIEW ONLY. Do not apply without explicit production migration approval.
-- Additive: preserves every existing user, subscription, reservation and password.

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

-- Before release: review existing Stripe-bound subscriber IDs and prices, then
-- explicitly backfill legacySubscriptionTier='plus'/'pro' for those exact IDs.
-- Configure STRIPE_REVIEWED_LEGACY_PRICE_IDS with their reviewed Stripe prices.
-- No blanket active/unknown-tier upgrade and no emailVerified/password backfill.

-- Source: scripts/sql/2026-09-09-signup-recovery.sql
-- Additive only. Apply to the verified isolated signup database first.
-- Production application requires separate release approval.

ALTER TABLE "AccountEnrollment" ADD COLUMN IF NOT EXISTS "returnTo" TEXT;
ALTER TABLE "BillingAttempt" ADD COLUMN IF NOT EXISTS "returnTo" TEXT;

-- Source: prisma/migrations/20260907190000_maintenance_submission_ledger/migration.sql
CREATE TABLE IF NOT EXISTS "MaintenanceSubmission" (
  "id" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "recordIds" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MaintenanceSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MaintenanceSubmission_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "MaintenanceSubmission_vehicleId_idx" ON "MaintenanceSubmission"("vehicleId");

-- Source: prisma/migrations/20260908120000_maintenance_receipt_cleanup/migration.sql
-- Standalone intent deliberately survives User/Vehicle cascades.
CREATE TABLE IF NOT EXISTS "MaintenanceReceiptCleanup" (
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
CREATE INDEX IF NOT EXISTS "MaintenanceReceiptCleanup_nextAttemptAt_idx" ON "MaintenanceReceiptCleanup"("nextAttemptAt");
CREATE INDEX IF NOT EXISTS "MaintenanceReceiptCleanup_userId_idx" ON "MaintenanceReceiptCleanup"("userId");

-- Source: prisma/migrations/20260908140000_us_billing_review/migration.sql
-- Additive only: no existing account/subscription classification or backfill.
CREATE TABLE IF NOT EXISTS "BillingEnrollmentReview" (
  "subscriptionId" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "customerId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL UNIQUE,
  "attemptKey" TEXT NOT NULL,
  "state" TEXT NOT NULL CHECK ("state" IN ('confirmed', 'review_required')),
  "initialVerified" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "BillingEnrollmentReview_userId_idx" ON "BillingEnrollmentReview"("userId");

-- Source: prisma/migrations/20260908160000_hub_upgrade_quote/migration.sql
CREATE TABLE IF NOT EXISTS "HubUpgradeAttempt" (
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
CREATE INDEX IF NOT EXISTS "HubUpgradeAttempt_userId_idx" ON "HubUpgradeAttempt"("userId");
CREATE TABLE IF NOT EXISTS "HubUpgradeRetiredQuote" (
  "quoteHash" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "HubUpgradeRetiredQuote_userId_expiresAt_idx" ON "HubUpgradeRetiredQuote"("userId", "expiresAt");

-- Source: prisma/migrations/20260913000100_owner_reviewed_equipment/migration.sql
-- Source only: applying this migration requires separate provisioning approval.
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "reviewedEquipmentId" TEXT;

-- Source: prisma/migrations/20260908120000_multiple_owner_reservations/migration.sql
-- Reviewed release gate: run on production only with explicit operator approval.
-- Transactional DDL: collisions abort, leaving all legacy rows and uniqueness intact.

LOCK TABLE "Reservation" IN SHARE ROW EXCLUSIVE MODE;
-- Exact ECMAScript trim/\\s set (not locale-dependent PostgreSQL \\s).
DO $launch$
BEGIN
 IF to_regprocedure('public.reservation_whitespace()') IS NOT NULL THEN
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid='public.reservation_whitespace()'::regprocedure AND btrim(p.prosrc)=btrim($body$
  SELECT U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
$body$) AND p.provolatile='i' AND p.proparallel='s' AND NOT p.proisstrict AND p.prorettype='text'::regtype AND l.lanname='sql') THEN RAISE EXCEPTION 'Incompatible function public.reservation_whitespace'; END IF;
 ELSE EXECUTE $definition$CREATE FUNCTION public.reservation_whitespace() RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
$$;$definition$;
 END IF;
END $launch$;
DO $launch$
BEGIN
 IF to_regprocedure('public.reservation_normalize_text(text)') IS NOT NULL THEN
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid='public.reservation_normalize_text(text)'::regprocedure AND btrim(p.prosrc)=btrim($body$
  SELECT lower(btrim(regexp_replace(coalesce(value, ''), '[' || public.reservation_whitespace() || ']+', ' ', 'g')));
$body$) AND p.provolatile='i' AND p.proparallel='s' AND NOT p.proisstrict AND p.prorettype='text'::regtype AND l.lanname='sql') THEN RAISE EXCEPTION 'Incompatible function public.reservation_normalize_text'; END IF;
 ELSE EXECUTE $definition$CREATE FUNCTION public.reservation_normalize_text(value text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT lower(btrim(regexp_replace(coalesce(value, ''), '[' || public.reservation_whitespace() || ']+', ' ', 'g')));
$$;$definition$;
 END IF;
END $launch$;
-- Structured fields follow normalizeTwinIdentityField; free text stays separate.
DO $launch$
BEGIN
 IF to_regprocedure('public.reservation_normalize_fitment(text)') IS NOT NULL THEN
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid='public.reservation_normalize_fitment(text)'::regprocedure AND btrim(p.prosrc)=btrim($body$
  SELECT regexp_replace(lower(btrim(coalesce(value, ''), public.reservation_whitespace())), '[' || public.reservation_whitespace() || '_-]+', ' ', 'g');
$body$) AND p.provolatile='i' AND p.proparallel='s' AND NOT p.proisstrict AND p.prorettype='text'::regtype AND l.lanname='sql') THEN RAISE EXCEPTION 'Incompatible function public.reservation_normalize_fitment'; END IF;
 ELSE EXECUTE $definition$CREATE FUNCTION public.reservation_normalize_fitment(value text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT regexp_replace(lower(btrim(coalesce(value, ''), public.reservation_whitespace())), '[' || public.reservation_whitespace() || '_-]+', ' ', 'g');
$$;$definition$;
 END IF;
END $launch$;
DO $launch$
BEGIN
 IF to_regprocedure('public.reservation_request_key(boolean,integer,text,text,text,text,text)') IS NOT NULL THEN
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid='public.reservation_request_key(boolean,integer,text,text,text,text,text)'::regprocedure AND btrim(p.prosrc)=btrim($body$
  SELECT CASE WHEN verified AND yr IS NOT NULL AND yr <> 0
    AND public.reservation_normalize_fitment(mk) <> '' AND public.reservation_normalize_fitment(mdl) <> ''
    THEN jsonb_build_array('structured', yr, public.reservation_normalize_fitment(mk), public.reservation_normalize_fitment(mdl),
      public.reservation_normalize_fitment(trm), public.reservation_normalize_fitment(gearbox))::text
    ELSE jsonb_build_array('free', public.reservation_normalize_text(display), public.reservation_normalize_text(gearbox))::text END;
$body$) AND p.provolatile='i' AND p.proparallel='s' AND NOT p.proisstrict AND p.prorettype='text'::regtype AND l.lanname='sql') THEN RAISE EXCEPTION 'Incompatible function public.reservation_request_key'; END IF;
 ELSE EXECUTE $definition$CREATE FUNCTION public.reservation_request_key(verified boolean, yr integer, mk text, mdl text, trm text, gearbox text, display text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT CASE WHEN verified AND yr IS NOT NULL AND yr <> 0
    AND public.reservation_normalize_fitment(mk) <> '' AND public.reservation_normalize_fitment(mdl) <> ''
    THEN jsonb_build_array('structured', yr, public.reservation_normalize_fitment(mk), public.reservation_normalize_fitment(mdl),
      public.reservation_normalize_fitment(trm), public.reservation_normalize_fitment(gearbox))::text
    ELSE jsonb_build_array('free', public.reservation_normalize_text(display), public.reservation_normalize_text(gearbox))::text END;
$$;$definition$;
 END IF;
END $launch$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "Reservation"
    GROUP BY lower(btrim(email, public.reservation_whitespace())), public.reservation_request_key("vehicleVerified", year, make, model, trim, transmission, vehicle)
    HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Normalized exact reservation collisions require operator review; no rows were merged or deleted';
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "Reservation_email_exact_request_key"
  ON "Reservation" (lower(btrim(email, public.reservation_whitespace())), public.reservation_request_key("vehicleVerified", year, make, model, trim, transmission, vehicle));
CREATE INDEX IF NOT EXISTS "Reservation_email_idx" ON "Reservation" (email);
DROP INDEX IF EXISTS "Reservation_email_key";

-- Verify exact supported structures before accepting existing/partial state.
CREATE TEMP TABLE "__launch_VisualSignup" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "product" TEXT NOT NULL DEFAULT 'visual-known-issues-all-models',
  "country" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsubscribeToken" TEXT NOT NULL UNIQUE,
  "unsubscribedAt" TIMESTAMP(3)
) ON COMMIT DROP;
CREATE INDEX "__launch_VisualSignup_createdAt_idx" ON "__launch_VisualSignup"("createdAt");
CREATE TEMP TABLE "__launch_AccountEnrollment" (
 "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL, "tokenHash" TEXT NOT NULL UNIQUE,
 "product" TEXT NOT NULL, "intent" TEXT, "vehicleId" TEXT, "returnTo" TEXT,
 "expiresAt" TIMESTAMP(3) NOT NULL, "usedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
) ON COMMIT DROP;
CREATE INDEX "__launch_AccountEnrollment_email_createdAt_idx" ON "__launch_AccountEnrollment" ("email", "createdAt");
CREATE TEMP TABLE "__launch_BillingAttempt" (
 "userId" TEXT PRIMARY KEY, "key" TEXT NOT NULL UNIQUE, "product" TEXT NOT NULL,
 "vehicleId" TEXT, "returnTo" TEXT, "customerId" TEXT, "sessionId" TEXT UNIQUE, "subscriptionId" TEXT,
 "url" TEXT, "state" TEXT NOT NULL DEFAULT 'pending',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
) ON COMMIT DROP;
CREATE TEMP TABLE "__launch_BillingEvent" ("id" TEXT PRIMARY KEY, "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP) ON COMMIT DROP;
CREATE TEMP TABLE "__launch_TwinInvitationDelivery" (
 "id" TEXT PRIMARY KEY, "reservationId" TEXT NOT NULL UNIQUE,
 "status" TEXT NOT NULL DEFAULT 'pending', "providerId" TEXT, "reservationRevision" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
) ON COMMIT DROP;
CREATE TEMP TABLE "__launch_MaintenanceSubmission" (
  "id" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "recordIds" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MaintenanceSubmission_pkey" PRIMARY KEY ("id")
) ON COMMIT DROP;
CREATE INDEX "__launch_MaintenanceSubmission_vehicleId_idx" ON "__launch_MaintenanceSubmission"("vehicleId");
CREATE TEMP TABLE "__launch_MaintenanceReceiptCleanup" (
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
) ON COMMIT DROP;
CREATE INDEX "__launch_MaintenanceReceiptCleanup_nextAttemptAt_idx" ON "__launch_MaintenanceReceiptCleanup"("nextAttemptAt");
CREATE INDEX "__launch_MaintenanceReceiptCleanup_userId_idx" ON "__launch_MaintenanceReceiptCleanup"("userId");
CREATE TEMP TABLE "__launch_BillingEnrollmentReview" (
  "subscriptionId" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL UNIQUE,
  "attemptKey" TEXT NOT NULL,
  "state" TEXT NOT NULL CHECK ("state" IN ('confirmed', 'review_required')),
  "initialVerified" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
) ON COMMIT DROP;
CREATE INDEX "__launch_BillingEnrollmentReview_userId_idx" ON "__launch_BillingEnrollmentReview"("userId");
CREATE TEMP TABLE "__launch_HubUpgradeAttempt" (
  "subscriptionId" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dispatchStartedAt" TIMESTAMP(3),
  "invoiceId" TEXT,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "HubUpgradeAttempt_dispatch_before_result" CHECK ("completedAt" IS NULL OR "dispatchStartedAt" IS NOT NULL),
  CONSTRAINT "HubUpgradeAttempt_invoice_before_result" CHECK ("completedAt" IS NULL OR "invoiceId" IS NOT NULL)
) ON COMMIT DROP;
CREATE INDEX "__launch_HubUpgradeAttempt_userId_idx" ON "__launch_HubUpgradeAttempt"("userId");
CREATE TEMP TABLE "__launch_HubUpgradeRetiredQuote" (
  "quoteHash" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL
) ON COMMIT DROP;
CREATE INDEX "__launch_HubUpgradeRetiredQuote_userId_expiresAt_idx" ON "__launch_HubUpgradeRetiredQuote"("userId", "expiresAt");
DO $launch$
DECLARE name text; actual jsonb; expected jsonb; id oid; reference oid;
BEGIN
 FOREACH name IN ARRAY ARRAY['VisualSignup','AccountEnrollment','BillingAttempt','BillingEvent','TwinInvitationDelivery','MaintenanceSubmission','MaintenanceReceiptCleanup','BillingEnrollmentReview','HubUpgradeAttempt','HubUpgradeRetiredQuote'] LOOP
  id := to_regclass(format('public.%I',name)); reference:=to_regclass(format('pg_temp.%I','__launch_'||name));
  SELECT jsonb_agg(jsonb_build_array(a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull,pg_get_expr(d.adbin,d.adrelid)) ORDER BY a.attname) INTO actual FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid=id AND a.attnum>0 AND NOT a.attisdropped;
  SELECT jsonb_agg(jsonb_build_array(a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull,pg_get_expr(d.adbin,d.adrelid)) ORDER BY a.attname) INTO expected FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid=reference AND a.attnum>0 AND NOT a.attisdropped;
  IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Incompatible columns/defaults: %',name; END IF;
  SELECT jsonb_agg(jsonb_build_array(contype,pg_get_constraintdef(oid),convalidated,condeferrable,condeferred) ORDER BY contype,pg_get_constraintdef(oid)) INTO actual FROM pg_constraint WHERE conrelid=id AND contype<>'f';
  SELECT jsonb_agg(jsonb_build_array(contype,pg_get_constraintdef(oid),convalidated,condeferrable,condeferred) ORDER BY contype,pg_get_constraintdef(oid)) INTO expected FROM pg_constraint WHERE conrelid=reference AND contype<>'f';
  IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Incompatible constraints: %',name; END IF;
  SELECT jsonb_agg(jsonb_build_array(indisunique,indisvalid,indisready,substring(pg_get_indexdef(indexrelid) from ' USING .*')) ORDER BY substring(pg_get_indexdef(indexrelid) from ' USING .*')) INTO actual FROM pg_index WHERE indrelid=id;
  SELECT jsonb_agg(jsonb_build_array(indisunique,indisvalid,indisready,substring(pg_get_indexdef(indexrelid) from ' USING .*')) ORDER BY substring(pg_get_indexdef(indexrelid) from ' USING .*')) INTO expected FROM pg_index WHERE indrelid=reference;
  IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Incompatible indexes: %',name; END IF;
 END LOOP;
END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."VisualSignup"'::regclass AND contype='f') <> 0 THEN RAISE EXCEPTION 'Incompatible foreign keys: VisualSignup'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."AccountEnrollment"'::regclass AND contype='f') <> 0 THEN RAISE EXCEPTION 'Incompatible foreign keys: AccountEnrollment'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."BillingAttempt"'::regclass AND contype='f') <> 0 THEN RAISE EXCEPTION 'Incompatible foreign keys: BillingAttempt'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."BillingEvent"'::regclass AND contype='f') <> 0 THEN RAISE EXCEPTION 'Incompatible foreign keys: BillingEvent'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."TwinInvitationDelivery"'::regclass AND contype='f') <> 0 THEN RAISE EXCEPTION 'Incompatible foreign keys: TwinInvitationDelivery'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."MaintenanceSubmission"'::regclass AND contype='f') <> 1 OR NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE conrelid='public."MaintenanceSubmission"'::regclass AND contype='f' AND confrelid='public."Vehicle"'::regclass AND confdeltype='c' AND confupdtype='c' AND convalidated AND NOT condeferrable AND conkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=c.conrelid AND attname='vehicleId')] AND confkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=c.confrelid AND attname='id')]) THEN RAISE EXCEPTION 'Incompatible foreign keys: MaintenanceSubmission'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."MaintenanceReceiptCleanup"'::regclass AND contype='f') <> 0 THEN RAISE EXCEPTION 'Incompatible foreign keys: MaintenanceReceiptCleanup'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."BillingEnrollmentReview"'::regclass AND contype='f') <> 1 OR NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE conrelid='public."BillingEnrollmentReview"'::regclass AND contype='f' AND confrelid='public."User"'::regclass AND confdeltype='c' AND confupdtype='a' AND convalidated AND NOT condeferrable AND conkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=c.conrelid AND attname='userId')] AND confkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=c.confrelid AND attname='id')]) THEN RAISE EXCEPTION 'Incompatible foreign keys: BillingEnrollmentReview'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."HubUpgradeAttempt"'::regclass AND contype='f') <> 1 OR NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE conrelid='public."HubUpgradeAttempt"'::regclass AND contype='f' AND confrelid='public."User"'::regclass AND confdeltype='c' AND confupdtype='a' AND convalidated AND NOT condeferrable AND conkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=c.conrelid AND attname='userId')] AND confkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=c.confrelid AND attname='id')]) THEN RAISE EXCEPTION 'Incompatible foreign keys: HubUpgradeAttempt'; END IF; END $launch$;
DO $launch$ BEGIN IF (SELECT count(*) FROM pg_constraint WHERE conrelid='public."HubUpgradeRetiredQuote"'::regclass AND contype='f') <> 1 OR NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE conrelid='public."HubUpgradeRetiredQuote"'::regclass AND contype='f' AND confrelid='public."User"'::regclass AND confdeltype='c' AND confupdtype='a' AND convalidated AND NOT condeferrable AND conkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=c.conrelid AND attname='userId')] AND confkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=c.confrelid AND attname='id')]) THEN RAISE EXCEPTION 'Incompatible foreign keys: HubUpgradeRetiredQuote'; END IF; END $launch$;
DO $launch$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid='public."User"'::regclass AND a.attname='legacySubscriptionTier' AND a.atttypid='text'::regtype AND NOT a.attnotnull AND d.oid IS NULL) THEN RAISE EXCEPTION 'Incompatible nullable field User.legacySubscriptionTier'; END IF; END $launch$;
DO $launch$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid='public."User"'::regclass AND a.attname='enrollmentProduct' AND a.atttypid='text'::regtype AND NOT a.attnotnull AND d.oid IS NULL) THEN RAISE EXCEPTION 'Incompatible nullable field User.enrollmentProduct'; END IF; END $launch$;
DO $launch$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid='public."User"'::regclass AND a.attname='enrollmentVehicleId' AND a.atttypid='text'::regtype AND NOT a.attnotnull AND d.oid IS NULL) THEN RAISE EXCEPTION 'Incompatible nullable field User.enrollmentVehicleId'; END IF; END $launch$;
DO $launch$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid='public."Vehicle"'::regclass AND a.attname='reviewedEquipmentId' AND a.atttypid='text'::regtype AND NOT a.attnotnull AND d.oid IS NULL) THEN RAISE EXCEPTION 'Incompatible nullable field Vehicle.reviewedEquipmentId'; END IF; END $launch$;
CREATE TEMP TABLE "__launch_Reservation" (LIKE public."Reservation" INCLUDING DEFAULTS) ON COMMIT DROP;
CREATE UNIQUE INDEX "__launch_Reservation_email_exact_request_key"
  ON "__launch_Reservation" (lower(btrim(email, public.reservation_whitespace())), public.reservation_request_key("vehicleVerified", year, make, model, trim, transmission, vehicle));
CREATE INDEX "__launch_Reservation_email_idx" ON "__launch_Reservation" (email);
DO $launch$ DECLARE name text; BEGIN FOREACH name IN ARRAY ARRAY['Reservation_email_exact_request_key','Reservation_email_idx'] LOOP IF (SELECT jsonb_build_array(indisunique,indisvalid,indisready,substring(pg_get_indexdef(indexrelid) from ' USING .*')) FROM pg_index WHERE indexrelid=to_regclass(format('public.%I',name))) IS DISTINCT FROM (SELECT jsonb_build_array(indisunique,indisvalid,indisready,substring(pg_get_indexdef(indexrelid) from ' USING .*')) FROM pg_index WHERE indexrelid=to_regclass(format('pg_temp.%I','__launch_'||name))) THEN RAISE EXCEPTION 'Incompatible reservation index: %',name; END IF; END LOOP; END $launch$;

COMMIT;
