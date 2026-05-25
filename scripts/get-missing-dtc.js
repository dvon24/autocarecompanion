// scripts/get-missing-dtc.js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  const issues = await prisma.knownIssue.findMany({
    where: { NOT: { dtcCodes: { isEmpty: true } } },
    select: { dtcCodes: true }
  });
  const allCodes = new Set();
  issues.forEach(i => i.dtcCodes.forEach(c => allCodes.add(c)));

  const refs = await prisma.dTCCode.findMany({ select: { code: true } });
  const refCodes = new Set(refs.map(r => r.code));

  const missing = [...allCodes].filter(c => !refCodes.has(c)).sort();

  // Group by prefix
  const groups = {};
  missing.forEach(code => {
    let prefix;
    if (code.startsWith('P0A')) prefix = 'P0A (Hybrid/EV)';
    else if (code.startsWith('P0')) prefix = 'P0 (Generic Powertrain)';
    else if (code.startsWith('P1')) prefix = 'P1 (Manufacturer Powertrain)';
    else if (code.startsWith('P2') || code.startsWith('P3')) prefix = 'P2/P3 (Extended Powertrain)';
    else if (code.startsWith('C')) prefix = 'C (Chassis)';
    else if (code.startsWith('B')) prefix = 'B (Body)';
    else if (code.startsWith('U')) prefix = 'U (Network)';
    else prefix = 'Non-standard';
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(code);
  });

  console.log(`\nTotal DTC codes referenced in known issues: ${allCodes.size}`);
  console.log(`Total DTC codes in reference table: ${refCodes.size}`);
  console.log(`Missing from reference: ${missing.length}`);

  Object.entries(groups).forEach(([prefix, codes]) => {
    console.log(`\n=== ${prefix} (${codes.length} codes) ===`);
    console.log(JSON.stringify(codes));
  });

  await prisma.$disconnect();
  await pool.end();
})();
