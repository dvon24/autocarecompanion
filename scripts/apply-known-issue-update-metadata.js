#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- One-off Node script runs as CommonJS. */
/**
 * Ensures the two public KnownIssue correction-notice columns exist.
 *
 * Production has schema drift and no Prisma migration history, so this uses
 * small idempotent DDL like the existing apply-secondary-email script. Run
 * --apply before deploying Prisma code that selects the new columns.
 *
 * Usage:
 *   node scripts/apply-known-issue-update-metadata.js --check
 *   node scripts/apply-known-issue-update-metadata.js --apply
 */
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ path: '.env', quiet: true });
const pg = require('pg');

const { Pool } = pg;
const mode = process.argv.includes('--apply') ? 'apply'
  : process.argv.includes('--check') ? 'check'
    : null;

if (!mode || (process.argv.includes('--apply') && process.argv.includes('--check'))) {
  console.error('Choose exactly one mode: --check or --apply');
  process.exit(1);
}

const url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('No POSTGRES_PRISMA_URL or DATABASE_URL set.');
  process.exit(1);
}

const EXPECTED = ['contentUpdatedOn', 'contentUpdateSummary'];
const pool = new Pool({ connectionString: url, max: 1 });
pool.on('error', () => {});

async function inspect(client = pool) {
  const result = await client.query(
    `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'KnownIssue'
        AND column_name = ANY($1::text[])
      ORDER BY column_name`,
    [EXPECTED],
  );
  return new Map(result.rows.map((row) => [row.column_name, row]));
}

function validate(columns) {
  const errors = [];
  for (const name of EXPECTED) {
    const column = columns.get(name);
    if (!column) errors.push(`${name}: missing`);
    else if (column.data_type !== 'text' || column.is_nullable !== 'NO') {
      errors.push(`${name}: expected non-null text, got ${column.data_type}/${column.is_nullable}`);
    } else if (!/^''(?:::text)?$/.test(String(column.column_default || '').replace(/[()\s]/g, ''))) {
      errors.push(`${name}: expected empty-string default, got ${column.column_default || '<none>'}`);
    }
  }
  return errors;
}

async function main() {
  if (mode === 'apply') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `ALTER TABLE "KnownIssue"
           ADD COLUMN IF NOT EXISTS "contentUpdatedOn" TEXT NOT NULL DEFAULT '',
           ADD COLUMN IF NOT EXISTS "contentUpdateSummary" TEXT NOT NULL DEFAULT ''`,
      );
      await client.query(
        `ALTER TABLE "KnownIssue"
           ALTER COLUMN "contentUpdatedOn" SET DEFAULT '',
           ALTER COLUMN "contentUpdateSummary" SET DEFAULT ''`,
      );
      const errors = validate(await inspect(client));
      if (errors.length > 0) throw new Error(errors.join('; '));
      await client.query('COMMIT');
      console.log('Applied and verified KnownIssue public update metadata columns.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return;
  }

  const errors = validate(await inspect());
  if (errors.length > 0) {
    console.error(`Schema check failed: ${errors.join('; ')}`);
    process.exitCode = 2;
    return;
  }
  console.log('Schema check passed: KnownIssue public update metadata columns exist.');
}

main()
  .then(() => pool.end())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    pool.end();
    process.exit(1);
  });
