#!/usr/bin/env node
/**
 * Add Pontiac known issues — GM "excitement" division (defunct 2010).
 *
 * Audit-before-publish: every entry lands as status='pending_review',
 * flipped to published only after WebSearch verification.
 *
 * Source bias: well-documented GM platform issues that hit Pontiac
 * variants (3800 V6 LIM gasket — Bonneville, Grand Prix; Ecotec timing
 * chain — G6 / Solstice; GMT257 wiper recall — Aztek; Aztek/Rendezvous
 * shared issues). Holden-imported G8 + GTO have their own known issues.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const ISSUES = [
  // === 3800 LIM Gasket (Bonneville, Grand Prix) ===
  {
    id: 'pontiac-bonneville-3800-lim-gasket',
    make: 'Pontiac',
    model: 'Bonneville',
    years: range(1995, 2005),
    trims: ['SE', 'SSE', 'SSEi', 'SLE', 'GXP'],
    engines: ['3.8L L36 (Series II/III)', '3.8L L67 Supercharged'],
    category: 'engine',
    title: 'Bonneville 3800 V6 Lower Intake Manifold (LIM) Gasket Failure',
    description: '1995-2005 Bonneville with the 3800 Series II / III V6 (L36 NA or L67 supercharged) suffers the same LIM gasket failure that hit Buick Park Avenue/LeSabre, Olds 88, Chevy Monte Carlo, etc. Plastic intake material softens under coolant exposure (especially Dex-Cool); coolant migrates into the valley and oil. Catastrophic if undetected.',
    solution: 'Replace LIM gasket with updated Fel-Pro MS98003T (improved metal-reinforced) — $400-$800 at independent. Replace upper intake plenum if cracked. Drain Dex-Cool and refill with Zerex G-05. Check oil for coolant at every change.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['coolant loss with no external leak', 'milky oil', 'overheating', 'sweet exhaust', 'rough idle'],
    affectedSystems: ['intake manifold', 'cooling system', 'lubrication'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    typicalMileageLow: 60000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'pontiac-grand-prix-3800-lim-gasket',
    make: 'Pontiac',
    model: 'Grand Prix',
    years: range(1997, 2008),
    trims: ['SE', 'GT', 'GTP', 'GTP Daytona 500', 'GT1', 'GT2'],
    engines: ['3.8L L36 (Series II/III)', '3.8L L67 Supercharged'],
    category: 'engine',
    title: 'Grand Prix 3800 V6 Lower Intake Manifold (LIM) Gasket Failure',
    description: '1997-2008 Grand Prix with the 3800 V6 (NA L36 or supercharged L67) — same LIM gasket failure mode as Bonneville and Buick variants. Particularly common on the supercharged GTP because higher boost pulls coolant past the eroded gasket faster.',
    solution: 'Updated Fel-Pro MS98003T gasket replacement ($400-$800). Replace UIM plenum simultaneously if cracked, and EGR stovepipe gasket. Drain Dex-Cool and switch to Zerex G-05 / Sierra HOAT. Check oil monthly for milky discoloration.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['coolant loss', 'milky oil', 'overheating', 'sweet exhaust smell', 'rough idle'],
    affectedSystems: ['intake manifold', 'cooling system'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    typicalMileageLow: 60000,
    typicalMileageHigh: 150000,
  },

  // === Ecotec timing chain (G6, Solstice) ===
  {
    id: 'pontiac-g6-2.4-timing-chain-leda',
    make: 'Pontiac',
    model: 'G6',
    years: range(2007, 2010),
    trims: ['Base', 'SE', 'GT', 'GTP'],
    engines: ['2.4L Ecotec LE5 / LAT (Hybrid)'],
    category: 'engine',
    title: 'G6 2.4L Ecotec (LE5/LAT) Timing Chain Stretch',
    description: 'The 2.4L Ecotec LE5 in 2007-2010 G6 (and shared Cobalt SS, Malibu, HHR, Saturn Aura/Ion, Solstice) develops timing chain stretch — GM eventually issued PI0808 / Special Coverage Adjustment covering an extension of warranty for affected vehicles. Original 7,500-15,000-mile OLM intervals starved the chain.',
    solution: 'Full timing chain kit replacement (chain, tensioner, guides) ~$1,200-$2,000. Check for the GM Special Coverage Adjustment — some VINs qualified for warranty extension or partial reimbursement. Use dexos1 full-synthetic 5W-30 and stick to 5,000-mile intervals going forward.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['cold start rattle', 'misfire', 'check engine light', 'reduced power'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0300'],
    estimatedCostLow: 1200,
    estimatedCostHigh: 2500,
    typicalMileageLow: 70000,
    typicalMileageHigh: 140000,
  },
  {
    id: 'pontiac-solstice-trunk-leak',
    make: 'Pontiac',
    model: 'Solstice',
    years: range(2006, 2009),
    trims: ['Base', 'GXP'],
    engines: ['all'],
    category: 'body',
    title: 'Solstice Trunk Leak with Top Down (Kappa Platform)',
    description: '2006-2009 Solstice (and Saturn Sky/Opel GT — all Kappa platform) has the trunk lid integrate with the soft top stowage; with the top down, the trunk seal is exposed and frequently leaks in rain. Tiny trunk space (only 3.8 cu ft with top stowed) compounds the issue. Water pools at the spare tire area and rusts the floor panel.',
    solution: 'Inspect trunk seal annually; replace if cracked ($60-$120 part). 3M weatherstrip adhesive helps reseal. Always check spare tire well after heavy rain. Some owners install a small bilge-pump style drain. Permanent fix is to confirm rain gutters at the top stowage area aren\'t clogged.',
    severity: 'low',
    confidence: 'high',
    symptoms: ['wet trunk after rain', 'standing water in spare tire well', 'mildew smell from trunk'],
    affectedSystems: ['body seals', 'trunk drainage'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 200,
    typicalMileageLow: 0,
    typicalMileageHigh: 200000,
  },

  // === GTO (Holden Monaro) ===
  {
    id: 'pontiac-gto-rear-tire-rub-2005-2006',
    make: 'Pontiac',
    model: 'GTO',
    years: range(2005, 2006),
    trims: ['Base'],
    engines: ['6.0L LS2 V8'],
    category: 'suspension',
    title: 'GTO LS2 Rear Tire Rub Under Hard Cornering',
    description: '2005-2006 GTO (LS2 6.0L) with the Holden VZ Monaro chassis has limited rear suspension travel and the wide 245/45R17 rear tires can rub the inner fender liner under hard cornering or with two adults in the back seat plus a trunk load. Some owners report cuts on the inner sidewall. Independent solution: roll the fender lips and trim the splash liner.',
    solution: 'Inspect rear inner fender liner for cut marks at each tire rotation. Roll the rear fender lips ($150-$300 specialist) and trim back the plastic splash guard. Avoid maxing out cargo + passengers simultaneously. Aftermarket shorter springs without other geometry changes makes the rub WORSE, not better.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['rubbing noise from rear wheel', 'tire wear on inner sidewall', 'cuts in fender liner'],
    affectedSystems: ['suspension', 'body'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 400,
    typicalMileageLow: 0,
    typicalMileageHigh: 200000,
  },

  // === G8 (Holden VE Commodore) ===
  {
    id: 'pontiac-g8-fuel-pump-recall',
    make: 'Pontiac',
    model: 'G8',
    years: range(2008, 2009),
    trims: ['Base', 'GT', 'GXP'],
    engines: ['3.6L V6', '6.0L L76 V8', '6.2L LS3 V8'],
    category: 'fuel',
    title: 'G8 Fuel-Tank-Module Issues + Brake Lamp Switch Recall',
    description: '2008-2009 G8 was the subject of multiple recalls including the GM-wide brake-lamp switch failure (NHTSA 14V-355 family covers many GM vehicles for the same switch). Australian-built G8s also had several fuel-tank module / fuel-pump related TSBs. Both are common at 60,000-120,000 miles.',
    solution: 'Brake-lamp switch is a 15-minute DIY replacement ($30-$50). Fuel pump assembly is more involved — $400-$700 OEM part, install via the tank-top access plate (no need to drop the tank). Confirm any open recalls on your VIN — Pontiac/GM recalls remain open for free dealer repair indefinitely.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['brake lights stay on', 'cruise control inoperative', 'extended cranking', 'fuel pump whine'],
    affectedSystems: ['brake light switch', 'fuel pump'],
    dtcCodes: ['P0087', 'P0171'],
    estimatedCostLow: 30,
    estimatedCostHigh: 800,
    typicalMileageLow: 50000,
    typicalMileageHigh: 130000,
  },

  // === Aztek / Rendezvous ===
  {
    id: 'pontiac-aztek-intermediate-steering-shaft',
    make: 'Pontiac',
    model: 'Aztek',
    years: range(2001, 2005),
    trims: ['Base', 'GT', 'AWD', 'Rally'],
    engines: ['3.4L LA1 V6'],
    category: 'steering',
    title: 'Aztek/Rendezvous Intermediate Steering Shaft Clunk',
    description: '2001-2005 Aztek and 2002-2005 Buick Rendezvous (GMT257 platform) develop a pronounced clunk from the steering column when turning the wheel from lock to lock or going over bumps. Cause: the intermediate steering shaft splines dry out and bind/release. Not a safety issue but very noticeable.',
    solution: 'Disassemble the intermediate shaft, clean and re-lubricate with synthetic grease ($0 if DIY, ~$80 shop labor). If splines are visibly worn, replace the shaft ($150-$300 part). Some independents have a "GM steering shaft kit" that includes a snap-in lube collar — durable fix.',
    severity: 'low',
    confidence: 'high',
    symptoms: ['clunk from steering column', 'clunk when turning over bumps', 'lock-to-lock noise'],
    affectedSystems: ['steering column'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 350,
    typicalMileageLow: 60000,
    typicalMileageHigh: 200000,
  },

  // === Vibe (Toyota Matrix) ===
  {
    id: 'pontiac-vibe-1zz-oil-consumption',
    make: 'Pontiac',
    model: 'Vibe',
    years: range(2003, 2008),
    trims: ['Base', 'GT', 'AWD'],
    engines: ['1.8L 1ZZ-FE'],
    category: 'engine',
    title: 'Vibe (1ZZ-FE) Oil Consumption — Stuck Piston Rings',
    description: '2003-2008 Pontiac Vibe (and Toyota Matrix/Corolla — all NUMMI-built) with the 1.8L 1ZZ-FE engine commonly develops excessive oil consumption (often 1 qt per 1,000 miles) due to stuck/coked piston oil control rings. Toyota issued a TSB and warranty extension for some affected vehicles; Pontiac owners benefited indirectly through GM-Toyota cross-coverage.',
    solution: 'Top-end engine cleaner (BG EPR, AMSOIL Engine and Transmission Flush) on a cycle can sometimes free stuck rings. Failing that, piston ring replacement (~$1,800-$3,000) or full short-block swap (~$3,000-$4,500). Monitor oil level weekly until consumption rate is known.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['oil consumption', 'blue smoke at startup', 'low oil pressure warning', 'piston slap noise'],
    affectedSystems: ['piston rings', 'lubrication'],
    dtcCodes: ['P0300', 'P0521', 'P0524'],
    estimatedCostLow: 50,
    estimatedCostHigh: 4500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 200000,
  },

  // === Grand Am ===
  {
    id: 'pontiac-grand-am-3.4l-intake-gasket',
    make: 'Pontiac',
    model: 'Grand Am',
    years: range(1999, 2005),
    trims: ['SE', 'SE1', 'SE2', 'GT', 'GT1', 'GT-V6'],
    engines: ['3.4L LA1 V6'],
    category: 'engine',
    title: 'Grand Am 3.4L V6 Upper/Lower Intake Gasket Failure',
    description: 'The 3.4L LA1 "3400 SFI" V6 in 1999-2005 Grand Am, Alero, Malibu, Venture, Montana, Aztek, Rendezvous, Impala has a notorious upper/lower intake gasket failure mode similar to the 3800 V6 but with a different gasket part. Coolant leaks externally (under the throttle body area), into the lifter valley, and/or onto the timing cover. Often co-fails with the plastic upper intake plenum cracking.',
    solution: 'Updated Fel-Pro MS98010T LIM gasket (metal-reinforced) plus the matching UIM gasket and plenum repair/replacement. $500-$900 at independent. Replace coolant temperature sensor and thermostat at the same time. Drain Dex-Cool, switch to G-05.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['coolant under intake', 'coolant loss', 'rough idle', 'milky oil', 'overheating'],
    affectedSystems: ['intake manifold', 'cooling system'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 500,
    estimatedCostHigh: 1200,
    typicalMileageLow: 70000,
    typicalMileageHigh: 150000,
  },

  // === Firebird / Trans Am ===
  {
    id: 'pontiac-firebird-lt1-optispark',
    make: 'Pontiac',
    model: 'Firebird',
    years: range(1993, 1997),
    trims: ['Base', 'Formula', 'Trans Am', 'WS6'],
    engines: ['5.7L LT1 V8'],
    category: 'engine',
    title: 'Firebird LT1 Optispark Distributor Failure',
    description: '1993-1997 Firebird/Trans Am with the LT1 5.7L V8 (same engine in Camaro Z28, Corvette C4, and some Buick Roadmaster/Caprice/Impala SS) suffers infamous Optispark distributor failure. The distributor sits at the front of the engine behind the water pump — coolant leaks from the water pump (or condensation from the front of the engine) drip directly into the Optispark and short the optical sensors. Symptoms: misfire, no-start, rough running in wet weather.',
    solution: 'Replace Optispark with a 1995+ vented Delco unit ($250-$500 part). ALWAYS replace the water pump at the same time ($150-$250 part) — they are the same labor job (water pump must come off to access the Optispark). Total job ~$400-$900 at independent. Confirm the vent tube routing on later "vented" Optispark.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['misfire', 'no-start when wet', 'rough idle', 'random cylinder misfire codes'],
    affectedSystems: ['ignition', 'water pump'],
    dtcCodes: ['P0300', 'P0351', 'P0352', 'P0353', 'P0354'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1000,
    typicalMileageLow: 60000,
    typicalMileageHigh: 180000,
  },

  // === Sunfire ===
  {
    id: 'pontiac-sunfire-2.2-ecotec-head-gasket',
    make: 'Pontiac',
    model: 'Sunfire',
    years: range(2002, 2005),
    trims: ['SE', 'GT'],
    engines: ['2.2L L61 Ecotec'],
    category: 'engine',
    title: 'Sunfire 2.2L Ecotec (L61) Head Gasket / Head Crack',
    description: 'The first-generation 2.2L Ecotec L61 in 2002-2005 Sunfire (and Cobalt, Cavalier, Saturn Ion) is prone to head gasket failure and cylinder head cracking — particularly if overheated once. Aluminum head warps easily. Often presents as bubbles in coolant reservoir, white smoke, and overheating.',
    solution: 'Pressure-test cooling system to confirm. Head gasket replacement ~$1,000-$1,800 — but ALWAYS have the head pressure-tested and resurfaced (~$150-$250 machine shop) since cracking is so common. If head is cracked, a used head is often the most economical replacement ($200-$400 from yard). Driving while overheating destroys the head; tow it.',
    severity: 'critical',
    confidence: 'medium',
    symptoms: ['white smoke', 'overheating', 'bubbles in coolant', 'milky oil', 'rough idle after warm-up'],
    affectedSystems: ['cylinder head', 'cooling system'],
    dtcCodes: ['P0301', 'P0302', 'P0303', 'P0304'],
    estimatedCostLow: 1000,
    estimatedCostHigh: 2500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 180000,
  },

  // === Montana / Trans Sport ===
  {
    id: 'pontiac-montana-3.4l-intake-gasket',
    make: 'Pontiac',
    model: 'Montana',
    years: range(1999, 2005),
    trims: ['Base', 'Vista', 'MontanaVision'],
    engines: ['3.4L LA1 V6'],
    category: 'engine',
    title: 'Montana 3.4L V6 Intake Gasket — Same as Grand Am',
    description: 'Same 3.4L LA1 V6 upper/lower intake gasket failure as Grand Am. The U-body minivans (Pontiac Montana, Chevy Venture, Olds Silhouette) all share the engine and the failure pattern. Often presents earlier on the minivans due to higher load duty cycles.',
    solution: 'Same fix — updated Fel-Pro MS98010T LIM gasket + UIM gasket + plenum repair/replacement. $500-$1,000 at independent (minivan labor slightly higher due to packaging). Drain Dex-Cool, refill with Zerex G-05.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['coolant under intake', 'coolant loss', 'milky oil', 'rough idle', 'overheating'],
    affectedSystems: ['intake manifold', 'cooling system'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 500,
    estimatedCostHigh: 1200,
    typicalMileageLow: 70000,
    typicalMileageHigh: 150000,
  },
];

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Add Pontiac Issues to pending_review`);
  console.log(`  Drafts: ${ISSUES.length}`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  let added = 0, dup = 0, errors = 0;
  for (const draft of ISSUES) {
    try {
      if (await issueExists(pool, draft.id)) {
        console.log(`  ~ ${draft.id} — already exists, skipping`);
        dup++;
        continue;
      }
      await insertPendingIssue(pool, draft);
      console.log(`  ✓ ${draft.id} → pending_review`);
      added++;
    } catch (err) {
      console.error(`  ✗ ${draft.id} — ${err.message}`);
      errors++;
    }
  }

  console.log(`\nAdded: ${added}, Duplicates: ${dup}, Errors: ${errors}`);
  console.log(`\nNext: node scripts/list-pending-issues.js --make Pontiac`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
