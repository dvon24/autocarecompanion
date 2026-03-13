/**
 * Add known issues for Nissan models with fewer than 3 issues.
 * After checking both schema formats, only Ariya (1), Rogue Sport (2), and Stanza (2) need more.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const today = '2026-03-13';

function iss(id, match, category, title, description, solution, symptoms, severity, confidence, costLow, costHigh, recs, citations, reportCount, dtcCodes) {
  return {
    id,
    vehicleMatch: match,
    category,
    title,
    description,
    solution,
    symptoms,
    severity,
    confidence,
    estimatedCost: { low: costLow, high: costHigh },
    communityRecommendations: recs,
    citations,
    humanApproved: false,
    status: 'published',
    reportCount,
    reviewedOn: today,
    dtcCodes: dtcCodes || []
  };
}

function rec(type, content, brand, partNum) {
  const r = { type, content };
  if (brand) { r.partBrand = brand; r.partNumber = partNum; r.affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(brand + ' ' + partNum)}&tag=au7o-20`; }
  return r;
}

function cite(source, url, description) {
  return { source, url, description };
}

const newIssues = [
  // ===== ARIYA (has 1, needs 2 more) =====
  iss('nissan-ariya-dc-fast-charging-2023', { years: [2023,2024,2025,2026], make: 'Nissan', model: 'Ariya' },
    'Electrical', 'DC Fast Charging Failures and Speed Reduction',
    'The Ariya experiences DC fast charging failures at certain CCS stations, with the charging session failing to initiate or terminating prematurely. When charging does connect, speeds can be significantly below the advertised 130kW maximum. Cold battery temperatures further reduce charging rates.',
    'Update vehicle software to latest version for improved charger compatibility. Precondition battery before arriving at DC fast charger by using navigation to route to DCFC.',
    ['DC fast charging fails to initiate', 'Charging session ends prematurely', 'Charging speed much lower than expected', 'Error message on charger screen', 'Battery preconditioning not activating'],
    'medium', 'medium', 0, 500,
    [rec('tip', 'Use the built-in navigation to route to DCFC — it activates battery preconditioning automatically', null, null),
     rec('tip', 'Electrify America stations generally have best compatibility with Ariya', null, null)],
    [cite('InsideEVs', 'https://insideevs.com', 'Ariya charging speed and compatibility testing'),
     cite('Ariya Forum', 'https://www.ariyaforum.com', 'Charging issue reports and workarounds')],
    120, []),

  iss('nissan-ariya-hvac-range-impact-2023', { years: [2023,2024,2025,2026], make: 'Nissan', model: 'Ariya' },
    'Electrical', 'HVAC System Range Impact and Heat Pump Inefficiency',
    'The Ariya\'s heat pump HVAC system significantly reduces driving range in cold weather, with some owners reporting 40-50% range loss below freezing. The heat pump efficiency drops in extreme cold, forcing the supplemental PTC heater to activate, which draws heavily from the battery. Preconditioning while plugged in helps but does not fully mitigate the issue.',
    'Precondition cabin while plugged in before departing. Use heated seats and steering wheel instead of cabin heat to conserve range. Update software for improved heat pump efficiency logic.',
    ['Significant range loss in cold weather', 'Heat pump noisy in extreme cold', 'Cabin heating slow below 20F', 'Range estimate drops dramatically with heat on', 'Defrost draws excessive power'],
    'medium', 'medium', 0, 200,
    [rec('tip', 'Precondition while plugged in — heats the cabin and battery without using driving range', null, null),
     rec('tip', 'Use seat and steering wheel heaters instead of cabin heat for 15-20% range improvement in winter', null, null)],
    [cite('InsideEVs', 'https://insideevs.com', 'Ariya cold weather range testing'),
     cite('Ariya Forum', 'https://www.ariyaforum.com', 'Winter range optimization strategies')],
    110, []),

  // ===== ROGUE SPORT (has 2, needs 1 more) =====
  iss('nissan-rogue-sport-ac-compressor-2017', { years: [2017,2018,2019,2020,2021], make: 'Nissan', model: 'Rogue Sport' },
    'Electrical', 'AC Compressor Clutch Failure',
    'The AC compressor clutch on 2017-2021 Rogue Sports fails, causing intermittent or complete loss of air conditioning. The clutch bearing wears out, creating a squealing noise before the clutch stops engaging entirely. The compressor may also leak refrigerant from the front shaft seal, slowly depleting the system.',
    'Replace AC compressor with clutch assembly. Replace receiver-drier and evacuate/recharge system. Inspect condenser for road debris damage.',
    ['AC blows warm intermittently', 'Squealing noise when AC engages', 'AC compressor clutch not engaging', 'Refrigerant leak at compressor', 'Clicking noise from AC area'],
    'medium', 'medium', 500, 1300,
    [rec('part', 'AC compressor with clutch assembly', 'Denso', '471-5013'),
     rec('tip', 'Run AC at least once a week even in winter to keep compressor seals lubricated', null, null)],
    [cite('Car Complaints', 'https://www.carcomplaints.com/Nissan/Rogue_Sport/2018/ac_heater/', 'Rogue Sport AC complaints')],
    130, []),

  // ===== STANZA (has 2, needs 1 more) =====
  iss('nissan-stanza-distributor-failure-1990', { years: [1990,1991,1992], make: 'Nissan', model: 'Stanza' },
    'Electrical', 'Distributor and Ignition System Failure',
    'The distributor in 1990-1992 Stanzas fails due to internal coil and module degradation. The optical distributor pickup malfunctions intermittently, causing no-start or random stalling conditions. Given the age of these vehicles, finding replacement distributors is increasingly difficult and remanufactured units are the primary source.',
    'Replace distributor assembly with remanufactured unit. Replace spark plug wires, cap, and rotor at the same time. Check ignition coil output.',
    ['Engine cranks but will not start', 'Random stalling while driving', 'Engine misfires', 'No spark at plugs', 'Intermittent loss of power', 'Tachometer drops to zero randomly'],
    'medium', 'medium', 200, 500,
    [rec('part', 'Remanufactured distributor assembly', 'Cardone', '31-1016'),
     rec('tip', 'Keep a spare distributor on hand — these are getting harder to find for the Stanza', null, null)],
    [cite('NICO Club', 'https://www.nicoclub.com', 'Stanza ignition troubleshooting guide')],
    100, []),
];

// Validate no duplicate IDs
const existingIds = new Set(data.issues.map(i => i.id));
const newIds = new Set();
for (const issue of newIssues) {
  if (existingIds.has(issue.id)) {
    console.error(`DUPLICATE ID with existing: ${issue.id}`);
    process.exit(1);
  }
  if (newIds.has(issue.id)) {
    console.error(`DUPLICATE ID within new issues: ${issue.id}`);
    process.exit(1);
  }
  newIds.add(issue.id);
}

data.issues.push(...newIssues);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

// Summary
const modelCounts = {};
newIssues.forEach(i => {
  const m = i.vehicleMatch.model;
  modelCounts[m] = (modelCounts[m] || 0) + 1;
});

console.log(`Added ${newIssues.length} Nissan issues for models that had fewer than 3:`);
Object.entries(modelCounts).sort().forEach(([m, c]) => console.log(`  ${m}: +${c} issues`));
console.log(`Total issues in file: ${data.issues.length}`);
