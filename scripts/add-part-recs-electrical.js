/**
 * Add part-type community recommendations to electrical issues that have none.
 * Matches keywords in title/description/solution to assign relevant parts.
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function buildAffiliateUrl(brand, part, make, model) {
  const terms = [brand, part, make, model].filter(Boolean).join(' ');
  return `https://www.amazon.com/s?k=${encodeURIComponent(terms)}&tag=au7o-20`;
}

function makeRec(content, partBrand, partName, make, model) {
  return {
    type: 'part',
    content,
    partBrand,
    partName,
    affiliateUrl: buildAffiliateUrl(partBrand, partName, make, model),
  };
}

function getRecsForIssue(issue) {
  const text = `${issue.title} ${issue.description} ${issue.solution}`.toLowerCase();
  const { make, model } = issue;
  const recs = [];

  // Battery / drain
  if (/\bbatter(y|ies)\b|12v|\bdrain\b|parasitic/.test(text)) {
    recs.push(makeRec('High-performance AGM battery with excellent cold cranking amps and deep cycle capability', 'Optima', 'RedTop AGM Battery', make, model));
    recs.push(makeRec('OEM-quality replacement battery with reliable performance', 'ACDelco', 'Professional AGM Battery', make, model));
    recs.push(makeRec('Automatic battery maintainer to prevent parasitic drain issues during storage', 'Battery Tender', 'Junior 12V Battery Charger Maintainer', make, model));
  }

  // Alternator
  if (/\balternator\b/.test(text)) {
    recs.push(makeRec('OEM-quality remanufactured alternator with high output for reliable charging', 'Denso', 'Remanufactured Alternator', make, model));
    recs.push(makeRec('Premium rebuilt alternator backed by extensive warranty coverage', 'Remy', 'Premium Remanufactured Alternator', make, model));
  }

  // Starter / no start / no crank
  if (/\bstarter\b|no[- ]start|no[- ]crank|cranking/.test(text)) {
    recs.push(makeRec('OEM-quality starter motor for reliable engine cranking', 'Denso', 'Starter Motor', make, model));
    recs.push(makeRec('Remanufactured starter with gear reduction for improved cranking performance', 'Remy', 'Remanufactured Starter Motor', make, model));
  }

  // Window regulator / window motor
  if (/\bwindow\b|regulator/.test(text)) {
    recs.push(makeRec('Direct-fit window regulator assembly with motor for easy installation', 'Dorman', 'Power Window Regulator and Motor Assembly', make, model));
  }

  // Infotainment / screen / display / radio
  if (/\binfotainment\b|\bscreen\b|\bdisplay\b|\bradio\b|\btouchscreen\b|\buconnect\b|\bsync\b|\bidrive\b|\bmmi\b|\bcomand\b/.test(text)) {
    recs.push(makeRec('Professional OBD-II diagnostic scanner for reading infotainment and body module codes', 'BlueDriver', 'Bluetooth Pro OBD2 Scan Tool', make, model));
  }

  // Wiring / harness / connector
  if (/\bwiring\b|\bharness\b|\bconnector\b|\bcorrosion\b|\bchafing\b/.test(text)) {
    recs.push(makeRec('Premium electrical tape for wiring repairs and harness wrapping', '3M', 'Super 33+ Vinyl Electrical Tape', make, model));
    recs.push(makeRec('Split wire loom tubing to protect repaired or exposed wiring harnesses', 'DEI', 'Split Wire Loom Tubing', make, model));
    recs.push(makeRec('Weatherproof terminal connector kit for reliable wiring repairs', 'Molex', 'Automotive Terminal Connector Kit', make, model));
  }

  // Fuse / relay / TIPM / module
  if (/\bfuse\b|\brelay\b|\btipm\b|\bmodule\b|\bbcm\b|\bpcm\b|\becm\b/.test(text)) {
    recs.push(makeRec('Automotive relay replacement set for common relay failures', 'Bosch', 'Automotive Relay 5-Pin 12V', make, model));
    recs.push(makeRec('Digital multimeter for diagnosing fuse, relay, and module electrical faults', 'Innova', 'Digital Multimeter', make, model));
  }

  // Headlight / LED / bulb / DRL
  if (/\bheadlight\b|\b(?:led|hid)\b|\bbulb\b|\bdrl\b|\bfog\s*light\b|\btail\s*light\b/.test(text)) {
    recs.push(makeRec('High-performance LED headlight bulbs with improved visibility and longevity', 'Sylvania', 'LED Headlight Bulbs', make, model));
    recs.push(makeRec('OEM-equivalent headlight assembly for complete headlight replacement', 'TYC', 'Headlight Assembly', make, model));
  }

  // Sensor / camera / ADAS
  if (/\bsensor\b|\bcamera\b|\badas\b|\bradar\b|\blidar\b|\bblind\s*spot\b/.test(text)) {
    recs.push(makeRec('OEM-quality replacement sensor for accurate readings and proper system function', 'Bosch', 'Replacement Sensor', make, model));
  }

  // Charging / charge port / EV
  if (/\bcharging\b|\bcharge\s*port\b|\bevse\b|\bev\s*charg/.test(text)) {
    recs.push(makeRec('Level 2 portable EV charger for reliable home or on-the-go charging', 'Lectron', 'Portable Level 2 EV Charger', make, model));
  }

  // Default fallback — if no specific match, add generic electrical tools
  if (recs.length === 0) {
    recs.push(makeRec('Professional Bluetooth OBD-II scanner for reading electrical system fault codes', 'BlueDriver', 'Bluetooth Pro OBD2 Scan Tool', make, model));
    recs.push(makeRec('Automotive digital multimeter for diagnosing electrical faults and testing circuits', 'Innova', '3340 Automotive Digital Multimeter', make, model));
    recs.push(makeRec('Electrical contact cleaner for restoring connections and preventing corrosion', 'CRC', 'QD Electronic Cleaner', make, model));
  }

  return recs;
}

async function main() {
  console.log('Fetching electrical issues without part recommendations...');

  // Get all electrical category issues
  const allElectrical = await prisma.knownIssue.findMany({
    where: { category: 'electrical' },
    select: {
      id: true,
      make: true,
      model: true,
      title: true,
      description: true,
      solution: true,
      communityRecommendations: true,
    },
  });

  console.log(`Total electrical issues: ${allElectrical.length}`);

  // Filter to those without any part-type recommendations
  const needsRecs = allElectrical.filter((issue) => {
    const recs = Array.isArray(issue.communityRecommendations)
      ? issue.communityRecommendations
      : [];
    return !recs.some((r) => r.type === 'part');
  });

  console.log(`Electrical issues without part recommendations: ${needsRecs.length}`);

  let updated = 0;
  let totalRecsAdded = 0;
  const categoryStats = {};

  for (const issue of needsRecs) {
    const newRecs = getRecsForIssue(issue);
    const existingRecs = Array.isArray(issue.communityRecommendations)
      ? issue.communityRecommendations
      : [];

    // Append new recs to existing ones
    const mergedRecs = [...existingRecs, ...newRecs];

    await prisma.knownIssue.update({
      where: { id: issue.id },
      data: { communityRecommendations: mergedRecs },
    });

    updated++;
    totalRecsAdded += newRecs.length;

    // Track which keyword categories matched
    for (const rec of newRecs) {
      const key = `${rec.partBrand} ${rec.partName}`.substring(0, 40);
      categoryStats[key] = (categoryStats[key] || 0) + 1;
    }

    if (updated % 50 === 0) {
      console.log(`  Updated ${updated}/${needsRecs.length}...`);
    }
  }

  console.log(`\nDone! Updated ${updated} issues with ${totalRecsAdded} part recommendations.`);
  console.log(`\nPart distribution:`);
  const sorted = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  for (const [part, count] of sorted) {
    console.log(`  ${part}: ${count}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
