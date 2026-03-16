/**
 * Fix 3 models that are at 4 issues instead of 5:
 * Hyundai Equus, Audi Q5 Sportback, Audi A4 Avant
 * The skipped issues already existed, so we add different ones.
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function yrs(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const issues = [
  // Hyundai Equus — needs 1 more (had 3, we added 1, 1 skipped)
  {
    id: 'hyundai-equus-seat-motor-2011',
    make: 'Hyundai', model: 'Equus', years: yrs(2011, 2016),
    category: 'electrical',
    title: 'Power Seat Motor and Memory Position Failure',
    description: 'Multi-way power seat motors fail, particularly on the driver side. The seat memory positions stop storing correctly or the seat moves to incorrect positions. Individual motors (recline, lumbar, tilt) fail independently.',
    solution: 'Diagnose which seat motor has failed using seat module scan data. Replace individual seat motor or entire seat track assembly. Recalibrate seat memory module after motor replacement. Check seat wiring harness under seat for chafing.',
    severity: 'medium',
    symptoms: ['Seat won\'t move in one direction', 'Memory positions incorrect', 'Clicking sound from seat', 'Seat moves intermittently', 'Seat stuck in position'],
    affectedSystems: ['Power seat system', 'Seat memory module'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 600
  },

  // Audi Q5 Sportback — needs 1 more
  {
    id: 'audi-q5-sportback-virtual-cockpit-glitch-2021',
    make: 'Audi', model: 'Q5 Sportback', years: yrs(2021, 2025),
    category: 'electrical',
    title: 'Virtual Cockpit Display Flickering and Black Screen',
    description: 'The Audi Virtual Cockpit digital instrument cluster intermittently flickers, goes black, or shows graphical artifacts. Usually related to a software glitch or loose LVDS cable connection behind the cluster.',
    solution: 'Perform software update at dealer. If flickering persists, check LVDS cable connection behind instrument cluster. In some cases, the instrument cluster unit itself requires replacement. A hard reset (disconnect 12V battery for 30 minutes) may temporarily resolve.',
    severity: 'medium',
    symptoms: ['Instrument cluster goes black', 'Display flickering while driving', 'Graphical glitches on gauges', 'Cluster reboots randomly'],
    affectedSystems: ['Virtual Cockpit', 'Instrument cluster'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 800
  },

  // Audi A4 Avant — needs 1 more
  {
    id: 'audi-a4-avant-cargo-cover-latch-2009',
    make: 'Audi', model: 'A4 Avant', years: yrs(2009, 2025),
    category: 'interior',
    title: 'Retractable Cargo Cover Latch and Spring Failure',
    description: 'The retractable cargo cover latch mechanisms on either side break, preventing the cover from staying attached to the D-pillars. The internal spring that retracts the cover also weakens or breaks, leaving the cover hanging loose.',
    solution: 'Replace broken latch clips (available individually from Audi parts). If the retract spring is broken, the entire cargo cover cassette must be replaced. Aftermarket covers are available at lower cost than OEM.',
    severity: 'low',
    symptoms: ['Cargo cover won\'t stay latched', 'Cover hangs loose', 'Cover won\'t retract', 'Rattling from cargo area'],
    affectedSystems: ['Cargo cover', 'Interior trim'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 300
  }
];

async function main() {
  // First list what exists for these 3 models
  for (const [make, model] of [['Hyundai','Equus'],['Audi','Q5 Sportback'],['Audi','A4 Avant']]) {
    const existing = await prisma.knownIssue.findMany({ where: { make, model }, select: { id: true, title: true } });
    console.log(make + ' ' + model + ' (currently ' + existing.length + '):');
    existing.forEach(x => console.log('  ' + x.id));
  }

  console.log('\nAdding missing issues...');
  let created = 0;

  for (const issue of issues) {
    try {
      const existing = await prisma.knownIssue.findUnique({ where: { id: issue.id } });
      if (existing) {
        console.log('  SKIP (exists): ' + issue.id);
        continue;
      }
      await prisma.knownIssue.create({
        data: {
          id: issue.id,
          make: issue.make,
          model: issue.model,
          years: issue.years,
          category: issue.category,
          title: issue.title,
          description: issue.description,
          solution: issue.solution,
          severity: issue.severity,
          confidence: 'medium',
          symptoms: issue.symptoms,
          affectedSystems: issue.affectedSystems,
          dtcCodes: issue.dtcCodes,
          estimatedCostLow: issue.estimatedCostLow,
          estimatedCostHigh: issue.estimatedCostHigh,
          citations: [],
          communityRecommendations: [],
          status: 'published'
        }
      });
      console.log('  OK: ' + issue.id);
      created++;
    } catch (err) {
      console.error('  FAIL: ' + issue.id + ' - ' + err.message);
    }
  }

  console.log('\nCreated: ' + created);

  // Verify
  for (const [make, model] of [['Hyundai','Equus'],['Audi','Q5 Sportback'],['Audi','A4 Avant']]) {
    const count = await prisma.knownIssue.count({ where: { make, model } });
    console.log(make + ' ' + model + ': ' + count + ' issues');
  }

  const total = await prisma.knownIssue.count();
  console.log('Total issues in DB: ' + total);

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
