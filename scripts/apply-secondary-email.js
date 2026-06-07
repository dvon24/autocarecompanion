#!/usr/bin/env node
/**
 * Adds the User.secondaryEmail column and (optionally) migrates one
 * user's login email back to their personal address while moving the
 * current value into secondaryEmail.
 *
 * Direct DDL — production has drift against the local migration
 * history, so `prisma migrate` is not safe. Idempotent: uses IF NOT
 * EXISTS, and the migration step is a no-op if the target user
 * already has the desired values.
 *
 * Usage:
 *   node scripts/apply-secondary-email.js
 *      Just adds the column. No data move.
 *
 *   node scripts/apply-secondary-email.js \
 *     --restoreEmail=devonsroberson24@yahoo.com \
 *     --secondary=dvoninvestllc@yahoo.com \
 *     --currentEmail=dvoninvestllc@yahoo.com
 *      Locates the row whose current `email` matches --currentEmail,
 *      sets email = --restoreEmail and secondaryEmail = --secondary.
 *      Refuses if --restoreEmail is already taken by a different row.
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

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const restoreEmail = arg('restoreEmail');
const secondary = arg('secondary');
const currentEmail = arg('currentEmail');

const pool = new Pool({ connectionString: url, max: 1 });
pool.on('error', () => {});

async function main() {
  await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "secondaryEmail" TEXT;`);
  console.log('Column ensured: User.secondaryEmail');

  if (!restoreEmail || !secondary || !currentEmail) {
    console.log('\nNo migration args supplied. Column ensured, nothing else to do.');
    return;
  }

  // Safety check — refuse to overwrite a different user's email.
  const conflict = await pool.query(
    `SELECT id, email FROM "User" WHERE email = $1 AND email <> $2`,
    [restoreEmail, currentEmail]
  );
  if (conflict.rows.length > 0) {
    console.error(`Refusing to migrate: --restoreEmail ${restoreEmail} already belongs to user ${conflict.rows[0].id}.`);
    process.exit(2);
  }

  const upd = await pool.query(
    `UPDATE "User"
       SET email = $1, "secondaryEmail" = $2
     WHERE email = $3
     RETURNING id, email, "secondaryEmail"`,
    [restoreEmail, secondary, currentEmail]
  );
  if (upd.rowCount === 0) {
    console.error(`No row matched --currentEmail=${currentEmail}. Nothing migrated.`);
    process.exit(3);
  }
  console.log(`Migrated ${upd.rowCount} row(s):`);
  for (const r of upd.rows) {
    console.log(`  id=${r.id}  email=${r.email}  secondaryEmail=${r.secondaryEmail}`);
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
