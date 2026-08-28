/*
 * Idempotent schema-only deploy helper for the approved Vehicle transmission
 * field. This intentionally performs no backfill: an unknown gearbox must stay
 * null until the owner chooses it or a valid claim copies the reservation.
 *
 * Run separately from an explicitly approved deployment:
 *   node scripts/apply-vehicle-transmission.js
 */
const dotenv = require('dotenv');

// Match the app/Prisma CLI environment precedence when this helper is run
// locally. Loading `.env.local` first prevents a stale `.env` connection from
// silently targeting a different database; `.env` still supplies any missing
// values without overriding the local deployment configuration.
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

function validateVehicleTransmissionColumn(rows) {
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error('Vehicle.transmission column was not found after the additive DDL.');
  }
  const column = rows[0];
  if (
    column.dataType !== 'text'
    || column.isNullable !== 'YES'
    || column.columnDefault != null
    || column.isGenerated !== 'NEVER'
    || column.isIdentity !== 'NO'
  ) {
    throw new Error(
      `Vehicle.transmission has an unsafe schema shape: ${JSON.stringify(column)}`,
    );
  }
  return true;
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    max: 1,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "transmission" TEXT',
    );
    const columns = await prisma.$queryRawUnsafe(`
      SELECT
        data_type AS "dataType",
        is_nullable AS "isNullable",
        column_default AS "columnDefault",
        is_generated AS "isGenerated",
        is_identity AS "isIdentity"
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'Vehicle'
        AND column_name = 'transmission'
    `);
    validateVehicleTransmissionColumn(columns);
    console.log('Vehicle.transmission is nullable text with no default (no rows changed).');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = { main, validateVehicleTransmissionColumn };
