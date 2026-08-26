#!/usr/bin/env node
/**
 * Correct the Triumph Bonneville fuel-pump subharness issue persisted from the motorcycle re-run.
 *
 * THE DEFECT: the row was written with trims ["Street Twin", "Bonneville T120"], but NHTSA campaign
 * 16V163 covers ONLY the 2016 Street Twin - the API returns exactly one model line, `STREET TWIN
 * 2016`. The two news citations the agent used both say "Street Twin and Bonneville T120 recalled",
 * which is where the T120 came from; press coverage of the launch platform conflated the family.
 *
 * This matters in the opposite direction from the wave-8 Sequoia miscitation. That one UNDERSTATED
 * recall coverage and cost owners a free repair. This one OVERSTATES it: a T120 owner reading the
 * page would go to a dealer expecting a no-charge fuel-pump harness replacement and be turned away.
 * Over-claiming a recall is the more damaging of the two errors, so the trim comes out.
 *
 * Also adds the campaign number itself. The agent cited only the two news articles and never named
 * 16V163, which left the strongest and most durable evidence for the issue off the page - news URLs
 * rot, campaign numbers do not.
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const ID = 'triumph-bonneville-fuel-pump-subharness-insulation-damage-allows-fuel-to-wick-t';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const row = await prisma.knownIssue.findUnique({ where: { id: ID } });
  if (!row) {
    console.error(`row not found: ${ID}`);
    process.exit(1);
  }
  if (row.vehicleType !== 'motorcycle') {
    console.error(`refusing to touch a ${row.vehicleType} row`);
    process.exit(1);
  }

  const trims = (row.trims || []).filter((t) => !/T120/i.test(t));

  const solution =
    (row.solution || '').replace(/\s+$/, '') +
    ' The campaign number is NHTSA 16V163 (Triumph reference SRAN 452), and it covers 2016 Street ' +
    'Twin machines built 7 September to 21 November 2015 only. Check your VIN against it before ' +
    'paying for anything: within that population the fuel pump subharness is replaced free of ' +
    'charge regardless of age or mileage.';

  const citations = [
    ...(row.citations || []),
    {
      type: 'nhtsa',
      title: 'NHTSA Recall 16V163 - Triumph Street Twin, fuel pump wiring insulation',
      url: 'https://www.nhtsa.gov/recalls?nhtsaId=16V163000',
    },
  ];

  console.log('trims   ', JSON.stringify(row.trims), '->', JSON.stringify(trims));
  console.log('cites   ', (row.citations || []).length, '->', citations.length);

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply.');
  } else {
    await prisma.knownIssue.update({ where: { id: ID }, data: { trims, solution, citations } });
    console.log('\napplied.');
  }

  await prisma.$disconnect();
  await pool.end();
})();
