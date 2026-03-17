#!/usr/bin/env node
/**
 * Add part-type community recommendations to issues in categories
 * that currently have no recommendations: body, drivetrain, cooling,
 * fuel, safety, interior, steering, other, exhaust, exterior.
 *
 * Uses keyword matching on issue title/description to pick relevant parts.
 * Appends to existing communityRecommendations (does not overwrite).
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TAG = 'au7o-20';

function amazonUrl(terms) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(terms)}&tag=${TAG}`;
}

function rec(content, partBrand, partName, searchTerms) {
  return {
    type: 'part',
    content,
    partBrand,
    partName,
    affiliateUrl: amazonUrl(searchTerms),
  };
}

function tipRec(content) {
  return { type: 'tip', content };
}

// ─── Category → keyword → part mapping ───────────────────────────────

function getBodyExteriorRecs(text) {
  const recs = [];
  if (/rust|corrosion/i.test(text)) {
    recs.push(rec('POR-15 rust preventive coating stops rust permanently', 'POR-15', 'Rust Preventive Coating', 'POR-15 rust preventive coating'));
    recs.push(rec('Rust-Oleum rust converter spray for treating corroded panels', 'Rust-Oleum', 'Rust Converter Spray', 'Rust-Oleum rust converter spray'));
  }
  if (/door.*(latch|lock)|latch.*door/i.test(text) || /\blatch\b/i.test(text)) {
    recs.push(rec('Dorman OE-replacement door latch assembly — direct fit', 'Dorman', 'Door Latch Assembly', 'Dorman door latch assembly'));
    recs.push(rec('Dorman replacement door handle — matches OEM spec', 'Dorman', 'Door Handle', 'Dorman door handle'));
  }
  if (/window|seal|weatherstrip/i.test(text)) {
    recs.push(rec('Dorman weatherstrip seal prevents water leaks and wind noise', 'Dorman', 'Weatherstrip Seal', 'Dorman weatherstrip seal'));
    recs.push(rec('3M Super Weatherstrip Adhesive for reattaching loose seals', '3M', 'Weatherstrip Adhesive', '3M super weatherstrip adhesive'));
  }
  if (/hatch|liftgate|strut/i.test(text)) {
    recs.push(rec('StrongArm liftgate struts — easy bolt-on replacement', 'StrongArm', 'Liftgate Support Struts', 'StrongArm liftgate struts'));
    recs.push(rec('Sachs OE-quality liftgate gas struts', 'Sachs', 'Liftgate Gas Struts', 'Sachs liftgate gas struts'));
  }
  if (/paint|clear coat|clearcoat/i.test(text)) {
    recs.push(rec('Dupli-Color touch-up paint kit for scratch and chip repair', 'Dupli-Color', 'Touch-Up Paint Kit', 'Dupli-Color touch up paint kit'));
    recs.push(rec('Dupli-Color clear coat finish for paint protection', 'Dupli-Color', 'Clear Coat Spray', 'Dupli-Color clear coat spray'));
  }
  if (recs.length === 0) {
    recs.push(rec('Trim removal tool set for body panel work without damage', 'MICTUNING', 'Trim Removal Tool Set', 'trim removal tool set automotive'));
    recs.push(rec('Bondo body filler for dent and panel repair', 'Bondo', 'Body Filler Kit', 'Bondo body filler kit'));
  }
  return recs;
}

function getDrivetrainRecs(text) {
  const recs = [];
  if (/differenti|diff fluid|diff cover/i.test(text)) {
    recs.push(rec('Royal Purple Max-Gear differential fluid for superior protection', 'Royal Purple', 'Max-Gear Differential Fluid', 'Royal Purple Max-Gear differential fluid'));
    recs.push(rec('Dorman differential cover gasket — direct OE replacement', 'Dorman', 'Differential Cover Gasket', 'Dorman differential cover gasket'));
  }
  if (/\baxle\b|CV joint|CV boot/i.test(text)) {
    recs.push(rec('TRQ CV axle assembly — complete replacement with new joints', 'TRQ', 'CV Axle Assembly', 'TRQ CV axle assembly'));
    recs.push(rec('Dorman CV boot kit to prevent grease loss and joint failure', 'Dorman', 'CV Boot Kit', 'Dorman CV boot kit'));
  }
  if (/driveshaft|carrier bearing|u-joint/i.test(text)) {
    recs.push(rec('Spicer U-joint — OEM supplier for most domestic vehicles', 'Spicer', 'Universal Joint', 'Spicer u-joint'));
    recs.push(rec('Anchor carrier bearing for driveshaft vibration fix', 'Anchor', 'Driveshaft Carrier Bearing', 'Anchor driveshaft carrier bearing'));
  }
  if (recs.length === 0) {
    recs.push(rec('Mobil 1 75W-90 synthetic gear oil for differential and transfer case', 'Mobil 1', 'Synthetic Gear Oil 75W-90', 'Mobil 1 75W-90 synthetic gear oil'));
    recs.push(rec('Fel-Pro gasket kit for drivetrain service', 'Fel-Pro', 'Gasket Kit', 'Fel-Pro drivetrain gasket kit'));
  }
  return recs;
}

function getCoolingRecs(text) {
  const recs = [];
  if (/\bradiator\b/i.test(text)) {
    recs.push(rec('Denso OE-quality radiator — direct fit replacement', 'Denso', 'Radiator', 'Denso radiator'));
    recs.push(rec('Mishimoto performance aluminum radiator for improved cooling', 'Mishimoto', 'Aluminum Radiator', 'Mishimoto aluminum radiator'));
  }
  if (/water pump/i.test(text)) {
    recs.push(rec('Gates water pump — OE-quality replacement with gasket', 'Gates', 'Water Pump', 'Gates water pump'));
    recs.push(rec('GMB water pump — reliable OEM alternative', 'GMB', 'Water Pump', 'GMB water pump'));
  }
  if (/thermostat/i.test(text)) {
    recs.push(rec('Stant thermostat — OE-spec temperature control', 'Stant', 'Thermostat', 'Stant thermostat'));
    recs.push(rec('Gates thermostat with housing for complete replacement', 'Gates', 'Thermostat', 'Gates thermostat housing'));
  }
  if (/\bhose\b|coolant leak|coolant loss/i.test(text)) {
    recs.push(rec('Gates coolant hose — OEM-grade reinforced rubber', 'Gates', 'Coolant Hose', 'Gates coolant hose'));
    recs.push(rec('Prestone 50/50 pre-mixed coolant — compatible with all colors', 'Prestone', 'Coolant Antifreeze 50/50', 'Prestone 50 50 coolant antifreeze'));
  }
  if (/\bfan\b|fan clutch|fan motor/i.test(text)) {
    recs.push(rec('TYC cooling fan assembly — complete bolt-on replacement', 'TYC', 'Cooling Fan Assembly', 'TYC cooling fan assembly'));
    recs.push(rec('Dorman cooling fan motor — OE replacement', 'Dorman', 'Cooling Fan Motor', 'Dorman cooling fan motor'));
  }
  if (recs.length === 0) {
    recs.push(rec('Prestone coolant flush kit for complete cooling system service', 'Prestone', 'Coolant Flush Kit', 'Prestone coolant flush kit'));
    recs.push(rec('Stant thermostat — preventive replacement during coolant service', 'Stant', 'Thermostat', 'Stant thermostat'));
  }
  return recs;
}

function getFuelRecs(text) {
  const recs = [];
  if (/fuel pump/i.test(text)) {
    recs.push(rec('Delphi fuel pump module — OE-quality direct replacement', 'Delphi', 'Fuel Pump Module', 'Delphi fuel pump module'));
    recs.push(rec('Bosch fuel pump — reliable OEM alternative', 'Bosch', 'Fuel Pump', 'Bosch fuel pump'));
  }
  if (/fuel inject|injector/i.test(text)) {
    recs.push(rec('Bosch fuel injector set — OEM replacement for precise fuel delivery', 'Bosch', 'Fuel Injector', 'Bosch fuel injector'));
    recs.push(rec('Chevron Techron fuel injector cleaner — restores injector flow', 'Chevron', 'Techron Fuel Injector Cleaner', 'Chevron Techron fuel injector cleaner'));
  }
  if (/fuel filter/i.test(text)) {
    recs.push(rec('Wix fuel filter — OE-grade filtration', 'Wix', 'Fuel Filter', 'Wix fuel filter'));
    recs.push(rec('ACDelco fuel filter — GM OEM spec', 'ACDelco', 'Fuel Filter', 'ACDelco fuel filter'));
  }
  if (/fuel tank/i.test(text)) {
    recs.push(rec('Spectra Premium fuel tank — direct OE replacement', 'Spectra Premium', 'Fuel Tank', 'Spectra Premium fuel tank'));
  }
  if (recs.length === 0) {
    recs.push(rec('Chevron Techron fuel system cleaner — cleans injectors, intake valves, combustion chambers', 'Chevron', 'Techron Fuel System Cleaner', 'Chevron Techron fuel system cleaner'));
    recs.push(rec('Wix fuel filter — routine replacement for fuel system health', 'Wix', 'Fuel Filter', 'Wix fuel filter'));
  }
  return recs;
}

function getExhaustRecs(text) {
  const recs = [];
  if (/catalytic converter|cat converter/i.test(text)) {
    recs.push(rec('Walker catalytic converter — EPA-compliant direct fit', 'Walker', 'Catalytic Converter', 'Walker catalytic converter'));
    recs.push(rec('MagnaFlow catalytic converter — high-flow performance option', 'MagnaFlow', 'Catalytic Converter', 'MagnaFlow catalytic converter'));
  }
  if (/exhaust manifold|manifold crack|manifold leak/i.test(text)) {
    recs.push(rec('Dorman exhaust manifold — solves cracking issues on many models', 'Dorman', 'Exhaust Manifold', 'Dorman exhaust manifold'));
    recs.push(rec('Dorman exhaust manifold bolt and stud kit', 'Dorman', 'Exhaust Manifold Hardware Kit', 'Dorman exhaust manifold bolts studs'));
  }
  if (/muffler|exhaust pipe|tailpipe/i.test(text)) {
    recs.push(rec('Walker Quiet-Flow muffler — OE-quality sound reduction', 'Walker', 'Quiet-Flow Muffler', 'Walker Quiet-Flow muffler'));
    recs.push(rec('Exhaust clamp for leak-free pipe connections', 'Walker', 'Exhaust Clamp', 'Walker exhaust clamp'));
  }
  if (/\bEGR\b/i.test(text)) {
    recs.push(rec('Dorman EGR valve — fixes rough idle and check engine light', 'Dorman', 'EGR Valve', 'Dorman EGR valve'));
    recs.push(rec('Standard Motor Products EGR valve — OE-equivalent', 'Standard Motor Products', 'EGR Valve', 'Standard Motor Products EGR valve'));
  }
  if (recs.length === 0) {
    recs.push(rec('Fel-Pro exhaust gasket set for leak-free exhaust service', 'Fel-Pro', 'Exhaust Gasket Set', 'Fel-Pro exhaust gasket set'));
    recs.push(rec('Permatex exhaust sealant for minor exhaust leaks', 'Permatex', 'Exhaust Sealant', 'Permatex exhaust sealant'));
  }
  return recs;
}

function getSteeringRecs(text) {
  const recs = [];
  if (/power steering|steering pump|PS pump|PS fluid/i.test(text)) {
    recs.push(rec('Cardone remanufactured power steering pump — OE-spec', 'Cardone', 'Power Steering Pump', 'Cardone power steering pump'));
    recs.push(rec('Prestone power steering fluid — compatible with most systems', 'Prestone', 'Power Steering Fluid', 'Prestone power steering fluid'));
  }
  if (/steering rack|rack and pinion/i.test(text)) {
    recs.push(rec('Cardone remanufactured steering rack — tested and ready to install', 'Cardone', 'Steering Rack', 'Cardone steering rack'));
    recs.push(rec('Moog tie rod ends — premium chassis parts for steering precision', 'Moog', 'Tie Rod Ends', 'Moog tie rod ends'));
  }
  if (/steering column|steering shaft|intermediate shaft/i.test(text)) {
    recs.push(rec('Dorman steering shaft — fixes clunking and binding', 'Dorman', 'Steering Shaft', 'Dorman steering shaft'));
    recs.push(rec('Dorman intermediate steering shaft — solves steering play', 'Dorman', 'Intermediate Steering Shaft', 'Dorman intermediate steering shaft'));
  }
  if (recs.length === 0) {
    recs.push(rec('Moog tie rod end — premium chassis component for steering repair', 'Moog', 'Tie Rod End', 'Moog tie rod end'));
    recs.push(rec('Prestone power steering fluid for system top-off and service', 'Prestone', 'Power Steering Fluid', 'Prestone power steering fluid'));
  }
  return recs;
}

function getInteriorRecs(text) {
  const recs = [];
  if (/dashboard|dash crack|dash warp/i.test(text)) {
    recs.push(rec('DashMat dash cover — protects and covers cracked dashboards', 'DashMat', 'Dashboard Cover', 'DashMat dashboard cover'));
    recs.push(rec('Coverlay dash cover — custom-molded replacement overlay', 'Coverlay', 'Dashboard Cover', 'Coverlay dashboard cover'));
  }
  if (/\bseat\b|seat motor|seat track/i.test(text)) {
    recs.push(rec('Dorman seat motor — fixes stuck or slow power seats', 'Dorman', 'Power Seat Motor', 'Dorman power seat motor'));
  }
  if (/\bA\/C\b|\bAC\b|HVAC|blower|heater/i.test(text)) {
    recs.push(rec('TYC blower motor — direct replacement for HVAC fan', 'TYC', 'Blower Motor', 'TYC blower motor'));
    recs.push(rec('Wix cabin air filter — filters dust, pollen, and odors', 'Wix', 'Cabin Air Filter', 'Wix cabin air filter'));
  }
  if (recs.length === 0) {
    recs.push(rec('Interior trim removal tool set for dash and panel work', 'MICTUNING', 'Interior Trim Tool Set', 'interior trim removal tool set automotive'));
  }
  return recs;
}

function getSafetyRecs(text) {
  const recs = [];
  if (/airbag|SRS|air bag/i.test(text)) {
    recs.push(rec('Dorman clock spring — restores airbag and horn function', 'Dorman', 'Clock Spring', 'Dorman clock spring'));
  }
  if (/recall/i.test(text)) {
    recs.push(tipRec('Check NHTSA.gov for active recalls — repairs are performed free at authorized dealers'));
  }
  if (/ABS|anti-lock|wheel speed sensor/i.test(text)) {
    recs.push(rec('Dorman ABS wheel speed sensor — fixes ABS warning light', 'Dorman', 'ABS Wheel Speed Sensor', 'Dorman ABS wheel speed sensor'));
  }
  if (recs.length === 0) {
    recs.push(rec('BlueDriver OBD-II scanner — reads ABS, SRS, and engine codes', 'BlueDriver', 'Bluetooth OBD-II Scanner', 'BlueDriver OBD2 scanner'));
  }
  return recs;
}

function getOtherRecs(text) {
  return [
    rec('BlueDriver Bluetooth OBD-II scanner — professional diagnostics from your phone', 'BlueDriver', 'Bluetooth OBD-II Scanner', 'BlueDriver OBD2 scanner'),
    rec('Haynes repair manual — step-by-step procedures for your vehicle', 'Haynes', 'Repair Manual', 'Haynes repair manual'),
  ];
}

// ─── Main mapping ─────────────────────────────────────────────────────

function getRecsForIssue(issue) {
  const text = `${issue.title} ${issue.description || ''}`;
  const cat = (issue.category || '').toLowerCase();

  switch (cat) {
    case 'body':
    case 'exterior':
      return getBodyExteriorRecs(text);
    case 'drivetrain':
      return getDrivetrainRecs(text);
    case 'cooling':
      return getCoolingRecs(text);
    case 'fuel':
      return getFuelRecs(text);
    case 'exhaust':
      return getExhaustRecs(text);
    case 'steering':
      return getSteeringRecs(text);
    case 'interior':
      return getInteriorRecs(text);
    case 'safety':
      return getSafetyRecs(text);
    case 'other':
      return getOtherRecs(text);
    default:
      return [];
  }
}

// ─── Run ──────────────────────────────────────────────────────────────

const TARGET_CATEGORIES = [
  'body', 'drivetrain', 'cooling', 'fuel', 'safety',
  'interior', 'steering', 'other', 'exhaust', 'exterior',
];

async function main() {
  console.log('Fetching issues with no part recommendations in target categories...');

  // Get all issues in target categories
  const issues = await prisma.knownIssue.findMany({
    where: {
      category: { in: TARGET_CATEGORIES },
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      communityRecommendations: true,
    },
  });

  console.log(`Found ${issues.length} total issues in target categories`);

  // Filter to only those with no "part" type recs
  const needsRecs = issues.filter((issue) => {
    const existing = Array.isArray(issue.communityRecommendations)
      ? issue.communityRecommendations
      : [];
    return !existing.some((r) => r.type === 'part');
  });

  console.log(`${needsRecs.length} issues need part recommendations\n`);

  const stats = {};
  let updated = 0;
  let errors = 0;

  for (const issue of needsRecs) {
    const cat = issue.category.toLowerCase();
    const newRecs = getRecsForIssue(issue);
    if (newRecs.length === 0) continue;

    const existing = Array.isArray(issue.communityRecommendations)
      ? issue.communityRecommendations
      : [];
    const merged = [...existing, ...newRecs];

    try {
      await prisma.knownIssue.update({
        where: { id: issue.id },
        data: { communityRecommendations: merged },
      });
      updated++;
      stats[cat] = (stats[cat] || 0) + 1;

      if (updated % 50 === 0) {
        console.log(`  ...updated ${updated}/${needsRecs.length}`);
      }
    } catch (err) {
      errors++;
      console.error(`  Error updating issue ${issue.id}: ${err.message}`);
    }
  }

  console.log(`\nDone! Updated ${updated} issues (${errors} errors)\n`);
  console.log('By category:');
  for (const [cat, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
