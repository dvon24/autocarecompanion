require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
// iconic / popular 1990s nameplates
const CAND = [
  ['Honda','Civic'],['Honda','Accord'],['Honda','Prelude'],['Honda','del Sol'],['Honda','CRX'],['Honda','NSX'],
  ['Acura','Integra'],['Acura','NSX'],['Toyota','Camry'],['Toyota','Corolla'],['Toyota','Supra'],['Toyota','MR2'],['Toyota','Celica'],['Toyota','4Runner'],['Toyota','Land Cruiser'],['Toyota','Previa'],
  ['Nissan','240SX'],['Nissan','300ZX'],['Nissan','Maxima'],['Nissan','Pathfinder'],['Nissan','Sentra'],
  ['Mazda','MX-5 Miata'],['Mazda','Miata'],['Mazda','RX-7'],['Mazda','Protege'],['Mazda','626'],
  ['Ford','Mustang'],['Ford','Explorer'],['Ford','Ranger'],['Ford','Taurus'],['Ford','Bronco'],['Ford','Escort'],['Ford','Probe'],
  ['Chevrolet','Camaro'],['Chevrolet','Corvette'],['Chevrolet','S-10'],['Chevrolet','Blazer'],['Chevrolet','Tahoe'],['Chevrolet','Suburban'],
  ['Dodge','Viper'],['Dodge','Neon'],['Dodge','Dakota'],['Dodge','Stealth'],['Dodge','Intrepid'],
  ['Jeep','Cherokee'],['Jeep','Wrangler'],['Jeep','Grand Cherokee'],
  ['Subaru','Impreza'],['Subaru','Legacy'],['Subaru','SVX'],
  ['Mitsubishi','Eclipse'],['Mitsubishi','3000GT'],['Mitsubishi','Galant'],['Mitsubishi','Montero'],
  ['Volkswagen','Golf'],['Volkswagen','GTI'],['Volkswagen','Jetta'],['Volkswagen','Passat'],['Volkswagen','Corrado'],
  ['BMW','3 Series'],['BMW','5 Series'],['BMW','M3'],['Lexus','SC300'],['Lexus','LS400'],['Volvo','850'],['Saab','900'],
  ['Pontiac','Firebird'],['Pontiac','Trans Am'],['Buick','Roadmaster'],
];
(async () => {
  const out = [];
  for (const [make, model] of CAND) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int n FROM "KnownIssue" WHERE status='published' AND make ILIKE $1 AND model ILIKE $2 AND "years" && ARRAY[1990,1991,1992,1993,1994,1995,1996,1997,1998,1999]`, make, model);
    out.push({ v: `${make} ${model}`, n: rows[0].n });
  }
  out.sort((a,b)=>a.n-b.n);
  console.log('90s-year issue coverage (thinnest first):\n');
  out.forEach(o => console.log(`  ${o.v.padEnd(24)} ${o.n}`));
  await prisma.$disconnect(); await pool.end();
})();
