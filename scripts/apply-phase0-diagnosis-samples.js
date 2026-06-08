#!/usr/bin/env node
/**
 * Phase 0 (visual data flywheel) — applies the DiagnosisSample table and
 * the two User opt-in columns to production.
 *
 * Idempotent. Uses CREATE TABLE / ADD COLUMN / CREATE INDEX IF NOT EXISTS,
 * and inlines the FK so re-runs are safe.
 *
 * Why direct SQL instead of `prisma migrate deploy`: production has drift
 * against the local migration history (same path used for subscriptionTier
 * and onboardingCompletedAt). The DDL below was generated VERBATIM by
 * `prisma migrate diff --from-empty --to-schema prisma/schema.prisma
 * --script`, so it cannot drift from the generated Prisma Client — the two
 * come from the same schema.prisma.
 *
 * Both changes are purely ADDITIVE (a new table + two new nullable/defaulted
 * User columns), so existing rows and flows are untouched, and behavior is
 * identical for every existing user until they actively opt in
 * (visualDatasetOptIn defaults to false).
 *
 * Usage:  node scripts/apply-phase0-diagnosis-samples.js
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import pg from 'pg';

const { Pool } = pg;

const url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('No POSTGRES_PRISMA_URL or DATABASE_URL set.');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
pool.on('error', () => {});

async function main() {
  // 1. User opt-in columns (separate, default-off consent).
  await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "visualDatasetOptIn" BOOLEAN NOT NULL DEFAULT false;`);
  await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "visualDatasetConsentAt" TIMESTAMP(3);`);
  console.log('Columns ensured: User.visualDatasetOptIn, User.visualDatasetConsentAt');

  // 2. DiagnosisSample table (FK inlined so re-runs are safe).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "DiagnosisSample" (
      "id" TEXT NOT NULL,
      "userId" TEXT,
      "anonId" TEXT,
      "year" INTEGER,
      "make" TEXT,
      "model" TEXT,
      "trim" TEXT,
      "mode" TEXT NOT NULL DEFAULT 'photo',
      "primaryCategory" TEXT,
      "primaryPartName" TEXT,
      "dtcCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "confidence" DOUBLE PRECISION,
      "vehicleMatch" TEXT,
      "diagnosisJson" JSONB,
      "imageStored" BOOLEAN NOT NULL DEFAULT false,
      "storageKey" TEXT,
      "cropApplied" BOOLEAN NOT NULL DEFAULT false,
      "exifStripped" BOOLEAN NOT NULL DEFAULT true,
      "contentType" TEXT,
      "byteSize" INTEGER,
      "consentSource" TEXT NOT NULL,
      "consentVersion" TEXT NOT NULL DEFAULT 'v1',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DiagnosisSample_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "DiagnosisSample_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  console.log('Table ensured: DiagnosisSample');

  // 3. Indexes.
  await pool.query(`CREATE INDEX IF NOT EXISTS "DiagnosisSample_userId_idx" ON "DiagnosisSample"("userId");`);
  await pool.query(`CREATE INDEX IF NOT EXISTS "DiagnosisSample_make_model_idx" ON "DiagnosisSample"("make", "model");`);
  await pool.query(`CREATE INDEX IF NOT EXISTS "DiagnosisSample_primaryCategory_idx" ON "DiagnosisSample"("primaryCategory");`);
  await pool.query(`CREATE INDEX IF NOT EXISTS "DiagnosisSample_createdAt_idx" ON "DiagnosisSample"("createdAt");`);
  console.log('Indexes ensured: userId, make_model, primaryCategory, createdAt');

  // 4. Verify the shape (catches any drift before the silent fire-and-forget
  //    capture path is trusted in prod).
  const cols = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'DiagnosisSample' ORDER BY ordinal_position;`,
  );
  console.log(`\nDiagnosisSample columns (${cols.rows.length}):`);
  console.log('  ' + cols.rows.map((r) => r.column_name).join(', '));

  const userCols = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name IN ('visualDatasetOptIn','visualDatasetConsentAt') ORDER BY column_name;`,
  );
  console.log(`\nUser opt-in columns present: ${userCols.rows.map((r) => r.column_name).join(', ') || '(NONE — FAILED)'}`);

  const count = await pool.query(`SELECT COUNT(*)::int AS n FROM "DiagnosisSample";`);
  console.log(`\nExisting DiagnosisSample rows: ${count.rows[0].n}`);
  console.log('\nDone. Phase 0.0 schema is live.');
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
