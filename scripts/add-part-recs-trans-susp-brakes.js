#!/usr/bin/env node
/**
 * Add part-type community recommendations to transmission, suspension, and brakes
 * issues that currently have no part recommendations.
 *
 * Uses keyword matching on title/description to pick relevant parts.
 * Appends to existing communityRecommendations (never overwrites).
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

function hasPartRec(recs) {
  if (!Array.isArray(recs)) return false;
  return recs.some(r => r.type === 'part');
}

function textMatch(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function getTransmissionRecs(issue) {
  const text = `${issue.title} ${issue.description}`.toLowerCase();
  const make = issue.make;
  const model = issue.model;
  const vehicle = `${make} ${model}`;
  const recs = [];

  if (textMatch(text, ['cvt', 'continuously variable'])) {
    recs.push(rec(
      'CVT fluid specifically formulated for continuous variable transmissions',
      'Valvoline',
      'CVT Transmission Fluid',
      `Valvoline CVT fluid ${vehicle}`
    ));
    recs.push(rec(
      'Replacement CVT transmission filter to maintain fluid cleanliness',
      'ATP',
      'CVT Transmission Filter Kit',
      `${vehicle} CVT transmission filter kit`
    ));
  } else if (textMatch(text, ['shudder', 'torque converter'])) {
    recs.push(rec(
      'Transmission flush kit for complete fluid exchange to address shudder',
      'Liqui Moly',
      'Transmission Flush Kit',
      `${vehicle} transmission flush kit`
    ));
    recs.push(rec(
      'Full synthetic ATF designed to reduce shudder in automatic transmissions',
      'Valvoline',
      'MaxLife ATF Full Synthetic',
      `Valvoline MaxLife ATF full synthetic transmission fluid`
    ));
  } else if (textMatch(text, ['shift', 'solenoid', 'valve body'])) {
    recs.push(rec(
      'Replacement shift solenoid to restore proper gear engagement',
      'Dorman',
      'Transmission Shift Solenoid',
      `Dorman shift solenoid ${vehicle}`
    ));
    recs.push(rec(
      'Transmission filter kit with gasket for fluid service after solenoid replacement',
      'ATP',
      'Transmission Filter Kit',
      `${vehicle} transmission filter kit with gasket`
    ));
  } else if (textMatch(text, ['clutch', 'slave cylinder', 'master cylinder'])) {
    if (textMatch(text, ['slave cylinder'])) {
      recs.push(rec(
        'Replacement clutch slave cylinder to restore pedal feel and engagement',
        'Dorman',
        'Clutch Slave Cylinder',
        `Dorman clutch slave cylinder ${vehicle}`
      ));
    }
    if (textMatch(text, ['master cylinder']) && textMatch(text, ['clutch'])) {
      recs.push(rec(
        'Clutch master cylinder for hydraulic clutch system repair',
        'Dorman',
        'Clutch Master Cylinder',
        `Dorman clutch master cylinder ${vehicle}`
      ));
    }
    recs.push(rec(
      'Complete clutch replacement kit with disc, pressure plate, and throwout bearing',
      'Exedy',
      'OEM Replacement Clutch Kit',
      `Exedy clutch kit ${vehicle}`
    ));
  } else if (textMatch(text, ['dct', 'dual clutch', 'dual-clutch', 'powershift'])) {
    recs.push(rec(
      'DCT-specific fluid formulated for dual-clutch transmissions',
      'Pentosin',
      'DCT Transmission Fluid',
      `Pentosin DCT fluid ${vehicle}`
    ));
    recs.push(rec(
      'Dual-clutch assembly for DCT transmission repair',
      'LuK',
      'Dual Clutch Assembly',
      `LuK dual clutch assembly ${vehicle}`
    ));
  } else if (textMatch(text, ['transfer case'])) {
    recs.push(rec(
      'Transfer case fluid for proper lubrication of the AWD/4WD system',
      textMatch(text, ['ram', 'dodge', 'chrysler', 'jeep'].map(m => m)) ? 'Mopar' : 'GM',
      'Transfer Case Fluid',
      `${vehicle} transfer case fluid`
    ));
    recs.push(rec(
      'Transfer case encoder motor for shift-on-the-fly 4WD systems',
      'Dorman',
      'Transfer Case Encoder Motor',
      `Dorman transfer case encoder motor ${vehicle}`
    ));
  } else {
    // Default transmission recs
    recs.push(rec(
      'Quality automatic transmission fluid for routine service',
      'Valvoline',
      'MaxLife ATF Full Synthetic',
      `Valvoline MaxLife ATF ${vehicle}`
    ));
    recs.push(rec(
      'Transmission filter kit with pan gasket for complete fluid service',
      'ATP',
      'Transmission Filter Kit',
      `${vehicle} transmission filter kit`
    ));
    recs.push(rec(
      'OBD-II scanner with transmission live data for diagnosing shift issues',
      'BlueDriver',
      'Bluetooth Pro OBD2 Scan Tool',
      'BlueDriver Bluetooth Pro OBD2 scan tool'
    ));
  }

  return recs;
}

function getSuspensionRecs(issue) {
  const text = `${issue.title} ${issue.description}`.toLowerCase();
  const make = issue.make;
  const model = issue.model;
  const vehicle = `${make} ${model}`;
  const recs = [];

  if (textMatch(text, ['strut', 'shock', 'damper'])) {
    const isPerformance = textMatch(text, ['sport', 'performance', 'm sport', 'amg', 's-line', 'rs', 'nismo']);
    recs.push(rec(
      isPerformance
        ? 'Performance monotube shocks/struts for sport-tuned suspension'
        : 'Quality replacement struts for ride comfort and handling restoration',
      isPerformance ? 'Bilstein' : 'Monroe',
      isPerformance ? 'B8 Sport Shocks/Struts' : 'Quick-Strut Complete Assembly',
      `${isPerformance ? 'Bilstein B8' : 'Monroe Quick-Strut'} ${vehicle}`
    ));
    recs.push(rec(
      'Strut mount and bearing for noise-free strut operation',
      'Moog',
      'Strut Mount Assembly',
      `Moog strut mount ${vehicle}`
    ));
  } else if (textMatch(text, ['air spring', 'air suspension', 'air ride', 'air bag suspension', 'compressor'])) {
    recs.push(rec(
      'Replacement air spring to restore proper ride height and comfort',
      'Arnott',
      'Air Spring Assembly',
      `Arnott air spring ${vehicle}`
    ));
    recs.push(rec(
      'Air-to-coil spring conversion kit as a permanent fix for air suspension failures',
      'Strutmasters',
      'Air Suspension Conversion Kit',
      `Strutmasters air suspension conversion ${vehicle}`
    ));
  } else if (textMatch(text, ['ball joint', 'control arm'])) {
    recs.push(rec(
      'Premium ball joint with grease fitting for extended service life',
      'Moog',
      'Ball Joint',
      `Moog ball joint ${vehicle}`
    ));
    recs.push(rec(
      'Complete control arm assembly with ball joint and bushings pre-installed',
      'Mevotech',
      'Control Arm Assembly',
      `Mevotech control arm ${vehicle}`
    ));
  } else if (textMatch(text, ['bushing', 'sway bar', 'stabilizer'])) {
    recs.push(rec(
      'Polyurethane bushing kit for longer life and tighter handling than OEM rubber',
      'Energy Suspension',
      'Bushing Kit',
      `Energy Suspension bushing kit ${vehicle}`
    ));
    recs.push(rec(
      'Sway bar end links to eliminate clunking over bumps',
      'Moog',
      'Sway Bar Link Kit',
      `Moog sway bar link ${vehicle}`
    ));
  } else if (textMatch(text, ['wheel bearing', 'hub', 'hub assembly'])) {
    recs.push(rec(
      'Quality wheel bearing/hub assembly for noise-free and safe wheel rotation',
      'Timken',
      'Wheel Bearing and Hub Assembly',
      `Timken wheel bearing hub assembly ${vehicle}`
    ));
  } else if (textMatch(text, ['tie rod', 'steering rack', 'steering gear'])) {
    recs.push(rec(
      'Inner and outer tie rod ends for steering precision restoration',
      'Moog',
      'Tie Rod End',
      `Moog tie rod end ${vehicle}`
    ));
    recs.push(rec(
      'Remanufactured power steering rack for complete steering system repair',
      'Cardone',
      'Remanufactured Steering Rack',
      `Cardone steering rack ${vehicle}`
    ));
  } else {
    // Default suspension recs
    recs.push(rec(
      'Complete strut and shock absorber set for full suspension refresh',
      'KYB',
      'Excel-G Strut/Shock Set',
      `KYB Excel-G struts shocks ${vehicle}`
    ));
    recs.push(rec(
      'Four-wheel alignment kit with cam bolts for proper tire wear correction',
      'Moog',
      'Alignment Cam Bolt Kit',
      `Moog alignment cam bolt kit ${vehicle}`
    ));
  }

  return recs;
}

function getBrakesRecs(issue) {
  const text = `${issue.title} ${issue.description}`.toLowerCase();
  const make = issue.make;
  const model = issue.model;
  const vehicle = `${make} ${model}`;
  const recs = [];

  if (textMatch(text, ['caliper', 'seize', 'seized', 'sticking'])) {
    recs.push(rec(
      'Remanufactured brake caliper for reliable clamping force',
      'Cardone',
      'Remanufactured Brake Caliper',
      `Cardone remanufactured brake caliper ${vehicle}`
    ));
    recs.push(rec(
      'Brake caliper bracket and hardware for smooth caliper slide operation',
      'Dorman',
      'Brake Caliper Bracket',
      `Dorman brake caliper bracket ${vehicle}`
    ));
    recs.push(rec(
      'Synthetic brake caliper grease to prevent future seizing',
      'Permatex',
      'Ultra Disc Brake Caliper Lube',
      'Permatex Ultra Disc Brake Caliper Lube'
    ));
  } else if (textMatch(text, ['brake line', 'brake hose', 'brake fluid leak'])) {
    recs.push(rec(
      'Pre-bent brake line kit for rust-free replacement',
      'Dorman',
      'Brake Hydraulic Line Kit',
      `Dorman brake line kit ${vehicle}`
    ));
    recs.push(rec(
      'Flexible brake hose for caliper connection point',
      'Raybestos',
      'Brake Hydraulic Hose',
      `Raybestos brake hose ${vehicle}`
    ));
  } else if (textMatch(text, ['abs', 'wheel speed sensor', 'traction control'])) {
    recs.push(rec(
      'ABS wheel speed sensor to restore anti-lock brake and stability control function',
      'Bosch',
      'ABS Wheel Speed Sensor',
      `Bosch ABS wheel speed sensor ${vehicle}`
    ));
    recs.push(rec(
      'ABS sensor replacement — aftermarket alternative with OE fitment',
      'Dorman',
      'ABS Speed Sensor',
      `Dorman ABS speed sensor ${vehicle}`
    ));
  } else if (textMatch(text, ['brake pad', 'brake rotor', 'brake', 'rotor', 'warped'])) {
    recs.push(rec(
      'Premium ceramic brake pads for quiet, low-dust braking performance',
      'Wagner',
      'ThermoQuiet Ceramic Brake Pads',
      `Wagner ThermoQuiet ceramic brake pads ${vehicle}`
    ));
    recs.push(rec(
      'Drilled and slotted brake rotors for improved heat dissipation and stopping power',
      'StopTech',
      'Sport Drilled/Slotted Brake Rotor',
      `StopTech drilled slotted brake rotor ${vehicle}`
    ));
  } else {
    // Default brakes recs
    recs.push(rec(
      'Ceramic brake pad and rotor kit for complete brake service',
      'Power Stop',
      'Z23 Evolution Sport Brake Kit',
      `Power Stop Z23 brake kit ${vehicle}`
    ));
  }

  return recs;
}

async function main() {
  console.log('Fetching transmission, suspension, and brakes issues without part recs...\n');

  const categories = ['transmission', 'suspension', 'brakes'];
  const allIssues = await prisma.knownIssue.findMany({
    where: { category: { in: categories } },
    select: {
      id: true,
      make: true,
      model: true,
      title: true,
      description: true,
      category: true,
      communityRecommendations: true,
    },
  });

  // Filter to those without any part-type recs
  const needsRecs = allIssues.filter(issue => {
    const recs = issue.communityRecommendations;
    return !hasPartRec(recs);
  });

  console.log(`Total issues in these categories: ${allIssues.length}`);
  console.log(`Issues needing part recs: ${needsRecs.length}`);

  const counts = { transmission: 0, suspension: 0, brakes: 0 };
  let totalRecsAdded = 0;
  let errors = 0;

  for (const issue of needsRecs) {
    let newRecs;
    if (issue.category === 'transmission') {
      newRecs = getTransmissionRecs(issue);
    } else if (issue.category === 'suspension') {
      newRecs = getSuspensionRecs(issue);
    } else if (issue.category === 'brakes') {
      newRecs = getBrakesRecs(issue);
    } else {
      continue;
    }

    // Append to existing recs
    const existing = Array.isArray(issue.communityRecommendations)
      ? issue.communityRecommendations
      : [];
    const merged = [...existing, ...newRecs];

    try {
      await prisma.knownIssue.update({
        where: { id: issue.id },
        data: { communityRecommendations: merged },
      });
      counts[issue.category]++;
      totalRecsAdded += newRecs.length;
    } catch (err) {
      console.error(`  ERROR updating ${issue.id}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n--- Results ---');
  console.log(`Transmission issues updated: ${counts.transmission}`);
  console.log(`Suspension issues updated:   ${counts.suspension}`);
  console.log(`Brakes issues updated:       ${counts.brakes}`);
  console.log(`Total issues updated:        ${counts.transmission + counts.suspension + counts.brakes}`);
  console.log(`Total part recs added:       ${totalRecsAdded}`);
  if (errors) console.log(`Errors: ${errors}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
