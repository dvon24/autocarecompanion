#!/usr/bin/env node
/**
 * Add part-type community recommendations to engine issues that currently have none.
 *
 * Analyzes each engine issue's title + solution to determine relevant parts,
 * then appends 1-2 part recommendations with Amazon affiliate search URLs.
 *
 * Usage: node scripts/add-part-recs-engine.js [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const AFFILIATE_TAG = 'au7o-20';
const dryRun = process.argv.includes('--dry-run');

function buildAmazonUrl(make, model, partBrand, partName) {
  const terms = [make, model, partBrand, partName].filter(Boolean).join(' ').trim();
  return `https://www.amazon.com/s?k=${encodeURIComponent(terms)}&tag=${AFFILIATE_TAG}`;
}

function makeRec(make, model, content, partBrand, partName, partNumber) {
  const rec = {
    type: 'part',
    content,
    partBrand,
    partName,
    affiliateUrl: buildAmazonUrl(make, model, partBrand, partName),
  };
  if (partNumber) rec.partNumber = partNumber;
  return rec;
}

/**
 * Keyword-match engine issue text and return 1-2 part recommendations.
 */
function getPartRecs(issue) {
  const text = `${issue.title} ${issue.solution}`.toLowerCase();
  const { make, model } = issue;
  const recs = [];

  // Oil consumption / oil leak
  if (/oil\s*(consumption|burning|leak|seep|loss|dilut)/i.test(text)) {
    recs.push(makeRec(make, model,
      'High-quality synthetic oil helps reduce consumption and protect worn engines',
      'Mobil 1', 'Extended Performance Full Synthetic Motor Oil'));
    recs.push(makeRec(make, model,
      'Premium oil filter ensures proper filtration with high-mileage engines',
      'Wix', 'Oil Filter'));
    return recs;
  }

  // Timing chain / timing belt
  if (/timing\s*(chain|belt|tensioner|guide)/i.test(text)) {
    if (/belt/i.test(text)) {
      recs.push(makeRec(make, model,
        'Complete timing belt kit with water pump for a comprehensive replacement',
        'Gates', 'Timing Belt Kit with Water Pump'));
    } else {
      recs.push(makeRec(make, model,
        'Complete timing chain kit includes chains, guides, and tensioners',
        'Cloyes', 'Timing Chain Kit'));
    }
    recs.push(makeRec(make, model,
      'High-quality engine oil is critical after timing service',
      'Castrol', 'Edge Full Synthetic Motor Oil'));
    return recs;
  }

  // Ignition coil / misfire
  if (/ignition\s*coil|misfire|coil\s*(pack|failure|crack)/i.test(text)) {
    recs.push(makeRec(make, model,
      'OE-quality ignition coils restore reliable spark and eliminate misfires',
      'Denso', 'Ignition Coil'));
    recs.push(makeRec(make, model,
      'Replace spark plugs alongside coils for best results',
      'NGK', 'Iridium Spark Plugs'));
    return recs;
  }

  // Spark plugs
  if (/spark\s*plug/i.test(text)) {
    recs.push(makeRec(make, model,
      'Iridium spark plugs offer long life and consistent performance',
      'NGK', 'Iridium IX Spark Plugs'));
    recs.push(makeRec(make, model,
      'Anti-seize compound prevents spark plugs from seizing in aluminum heads',
      'Permatex', 'Anti-Seize Lubricant'));
    return recs;
  }

  // Turbo / turbocharger
  if (/turbo(charger)?|boost\s*(leak|loss|issue)|wastegate/i.test(text)) {
    recs.push(makeRec(make, model,
      'Turbo gasket kit prevents boost leaks and oil seepage at the turbo flanges',
      'Dorman', 'Turbocharger Gasket Kit'));
    recs.push(makeRec(make, model,
      'Boost gauge helps monitor turbo performance and catch problems early',
      'AutoMeter', 'Mechanical Boost Gauge'));
    return recs;
  }

  // Coolant / overheating / water pump / radiator
  if (/coolant|overheat|water\s*pump|radiator|thermostat/i.test(text)) {
    if (/water\s*pump/i.test(text)) {
      recs.push(makeRec(make, model,
        'Reliable water pump replacement to restore proper coolant circulation',
        'Gates', 'Water Pump'));
    } else if (/radiator/i.test(text)) {
      recs.push(makeRec(make, model,
        'Direct-fit replacement radiator for reliable cooling performance',
        'Denso', 'Radiator'));
    } else if (/thermostat/i.test(text)) {
      recs.push(makeRec(make, model,
        'OE-spec thermostat restores proper operating temperature',
        'Stant', 'Thermostat'));
    } else {
      recs.push(makeRec(make, model,
        'Premium radiator provides improved cooling capacity',
        'Mishimoto', 'Aluminum Radiator'));
    }
    recs.push(makeRec(make, model,
      'Pre-mixed coolant ready for top-off or full flush',
      'Prestone', 'Extended Life Antifreeze Coolant'));
    return recs;
  }

  // Head gasket
  if (/head\s*gasket/i.test(text)) {
    recs.push(makeRec(make, model,
      'Multi-layer steel head gasket set for a reliable, long-lasting seal',
      'Fel-Pro', 'Head Gasket Set'));
    recs.push(makeRec(make, model,
      'High-strength head studs provide even clamping force and prevent repeat failures',
      'ARP', 'Head Stud Kit'));
    return recs;
  }

  // Catalytic converter
  if (/catalytic\s*converter|cat\s*(failure|efficiency|code)/i.test(text)) {
    recs.push(makeRec(make, model,
      'Direct-fit catalytic converter meets federal emissions standards',
      'MagnaFlow', 'Catalytic Converter'));
    recs.push(makeRec(make, model,
      'Upstream O2 sensor should be replaced with the catalytic converter',
      'Denso', 'Oxygen Sensor'));
    return recs;
  }

  // Valve cover / PCV
  if (/valve\s*cover|pcv\s*(valve|system)|crankcase/i.test(text)) {
    recs.push(makeRec(make, model,
      'Valve cover gasket set stops oil leaks at the top of the engine',
      'Fel-Pro', 'Valve Cover Gasket Set'));
    recs.push(makeRec(make, model,
      'Replacement PCV valve restores proper crankcase ventilation',
      'Dorman', 'PCV Valve'));
    return recs;
  }

  // Intake manifold
  if (/intake\s*manifold/i.test(text)) {
    recs.push(makeRec(make, model,
      'Intake manifold gasket set seals coolant and vacuum leaks',
      'Fel-Pro', 'Intake Manifold Gasket Set'));
    recs.push(makeRec(make, model,
      'Replacement intake manifold for cracked or warped originals',
      'Dorman', 'Intake Manifold'));
    return recs;
  }

  // Fuel pump / fuel injector
  if (/fuel\s*(pump|injector|pressure|delivery|rail)/i.test(text)) {
    if (/injector/i.test(text)) {
      recs.push(makeRec(make, model,
        'OE-quality fuel injectors restore proper fuel delivery and spray pattern',
        'Bosch', 'Fuel Injector'));
    } else {
      recs.push(makeRec(make, model,
        'Reliable fuel pump assembly for consistent fuel pressure',
        'Delphi', 'Fuel Pump Module Assembly'));
    }
    recs.push(makeRec(make, model,
      'Fuel filter replacement prevents repeat fuel system issues',
      'Wix', 'Fuel Filter'));
    return recs;
  }

  // O2 sensor / MAF / sensor
  if (/o2\s*sensor|oxygen\s*sensor|maf\s*sensor|mass\s*air\s*flow|map\s*sensor|knock\s*sensor|cam(shaft)?\s*sensor|crank(shaft)?\s*sensor/i.test(text)) {
    if (/maf|mass\s*air/i.test(text)) {
      recs.push(makeRec(make, model,
        'OE-quality MAF sensor restores accurate airflow readings',
        'Denso', 'Mass Air Flow Sensor'));
      recs.push(makeRec(make, model,
        'MAF sensor cleaner can resolve intermittent issues before replacement',
        'CRC', 'MAF Sensor Cleaner'));
    } else if (/o2|oxygen/i.test(text)) {
      recs.push(makeRec(make, model,
        'Direct-fit oxygen sensor for accurate fuel mixture readings',
        'Denso', 'Oxygen Sensor'));
      recs.push(makeRec(make, model,
        'Anti-seize for O2 sensor threads prevents future removal difficulty',
        'Permatex', 'Anti-Seize Lubricant'));
    } else if (/cam|crank/i.test(text)) {
      recs.push(makeRec(make, model,
        'OE-spec position sensor restores reliable engine timing signals',
        'Bosch', 'Camshaft Position Sensor'));
    } else if (/knock/i.test(text)) {
      recs.push(makeRec(make, model,
        'Replacement knock sensor eliminates false detonation readings',
        'Bosch', 'Knock Sensor'));
    } else {
      recs.push(makeRec(make, model,
        'OE-quality engine sensor replacement',
        'Denso', 'Engine Sensor'));
    }
    return recs;
  }

  // Rod bearing / engine bearing
  if (/rod\s*bearing|engine\s*bearing|bearing\s*(failure|spin|knock)/i.test(text)) {
    recs.push(makeRec(make, model,
      'Performance engine bearing set for reliable bottom-end protection',
      'ACL', 'Engine Bearing Set'));
    recs.push(makeRec(make, model,
      'Assembly lube protects bearings during initial startup after rebuild',
      'Permatex', 'Engine Assembly Lube'));
    return recs;
  }

  // Compression / piston / ring
  if (/compression|piston\s*(ring|slap)|ring\s*(wear|gap|failure)/i.test(text)) {
    recs.push(makeRec(make, model,
      'Piston ring set restores compression and reduces oil consumption',
      'Mahle', 'Piston Ring Set'));
    recs.push(makeRec(make, model,
      'Engine assembly lube for proper ring break-in',
      'Permatex', 'Engine Assembly Lube'));
    return recs;
  }

  // Exhaust / exhaust manifold
  if (/exhaust\s*manifold|exhaust\s*(leak|crack|stud|bolt)|header\s*crack/i.test(text)) {
    recs.push(makeRec(make, model,
      'Exhaust manifold gasket set seals exhaust leaks at the head',
      'Fel-Pro', 'Exhaust Manifold Gasket Set'));
    recs.push(makeRec(make, model,
      'Exhaust manifold stud kit replaces broken or corroded studs',
      'Dorman', 'Exhaust Manifold Stud Kit'));
    return recs;
  }

  // Engine mount
  if (/engine\s*mount|motor\s*mount/i.test(text)) {
    recs.push(makeRec(make, model,
      'Hydraulic engine mount reduces vibration and restores smooth operation',
      'Anchor', 'Engine Mount'));
    return recs;
  }

  // VANOS / VVT / variable valve timing
  if (/vanos|vvt|variable\s*valve|cam\s*(phas|adjust)/i.test(text)) {
    recs.push(makeRec(make, model,
      'VVT solenoid restores proper variable valve timing operation',
      'Dorman', 'Variable Valve Timing Solenoid'));
    recs.push(makeRec(make, model,
      'Fresh oil is critical for VVT system performance',
      'Mobil 1', 'Full Synthetic Motor Oil'));
    return recs;
  }

  // EGR
  if (/egr\s*(valve|system|cooler|failure)/i.test(text)) {
    recs.push(makeRec(make, model,
      'Replacement EGR valve restores exhaust gas recirculation',
      'Dorman', 'EGR Valve'));
    return recs;
  }

  // Throttle body
  if (/throttle\s*body/i.test(text)) {
    recs.push(makeRec(make, model,
      'Throttle body cleaner can resolve hesitation and idle issues',
      'CRC', 'Throttle Body Cleaner'));
    recs.push(makeRec(make, model,
      'Replacement throttle body for units with failed motors or sensors',
      'Dorman', 'Throttle Body Assembly'));
    return recs;
  }

  // Oil pan / oil pump
  if (/oil\s*(pan|pump)/i.test(text)) {
    if (/pump/i.test(text)) {
      recs.push(makeRec(make, model,
        'Replacement oil pump restores proper oil pressure',
        'Melling', 'Oil Pump'));
    } else {
      recs.push(makeRec(make, model,
        'Replacement oil pan gasket seals leaks at the bottom of the engine',
        'Fel-Pro', 'Oil Pan Gasket Set'));
    }
    return recs;
  }

  // Serpentine belt / drive belt
  if (/serpentine|drive\s*belt|belt\s*(tensioner|squeal|noise)/i.test(text)) {
    recs.push(makeRec(make, model,
      'OE-quality serpentine belt for reliable accessory drive',
      'Gates', 'Serpentine Belt'));
    recs.push(makeRec(make, model,
      'Belt tensioner ensures proper belt tension and quiet operation',
      'Gates', 'Belt Tensioner Assembly'));
    return recs;
  }

  // Default engine fallback
  recs.push(makeRec(make, model,
    'Bluetooth OBD-II scanner for reading engine codes and monitoring live data',
    'BlueDriver', 'Bluetooth OBD2 Diagnostic Scan Tool'));
  recs.push(makeRec(make, model,
    'Quality synthetic oil and filter combo for engine maintenance',
    'Mobil 1', 'Full Synthetic Oil and Filter Bundle'));
  return recs;
}

async function main() {
  console.log(dryRun ? '[DRY RUN] No changes will be written.\n' : '');
  console.log('Fetching engine issues without part recommendations...\n');

  const allEngineIssues = await prisma.knownIssue.findMany({
    where: {
      status: 'published',
      category: 'engine',
    },
    select: {
      id: true,
      make: true,
      model: true,
      title: true,
      solution: true,
      communityRecommendations: true,
    },
  });

  // Filter to those with no "part" type recommendations
  const issues = allEngineIssues.filter(issue => {
    const recs = issue.communityRecommendations || [];
    if (!Array.isArray(recs)) return true;
    return !recs.some(r => r.type === 'part');
  });

  console.log(`Total engine issues: ${allEngineIssues.length}`);
  console.log(`Engine issues without part recs: ${issues.length}\n`);

  let updated = 0;
  let errors = 0;
  const matchCategories = {};

  for (const issue of issues) {
    const newRecs = getPartRecs(issue);
    if (newRecs.length === 0) continue;

    // Track which category matched
    const cat = newRecs[0].partBrand + ' ' + newRecs[0].partName;
    matchCategories[cat] = (matchCategories[cat] || 0) + 1;

    // Append to existing recs (preserve tips/warnings)
    const existing = Array.isArray(issue.communityRecommendations)
      ? issue.communityRecommendations
      : [];
    const merged = [...existing, ...newRecs];

    if (!dryRun) {
      try {
        await prisma.knownIssue.update({
          where: { id: issue.id },
          data: { communityRecommendations: merged },
        });
      } catch (err) {
        console.error(`  Error updating ${issue.id}: ${err.message}`);
        errors++;
        continue;
      }
    }
    updated++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`Issues updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nPart match distribution:`);

  const sorted = Object.entries(matchCategories).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    console.log(`  ${cat}: ${count}`);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were written. Run without --dry-run to apply.');
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
