/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  FULL_RECORD_FIELDS,
  fullRecord,
  hashValue,
} = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-accord-adjudication-2026-08-05.json');

const FUEL_PUMP_ID = 'honda-accord-10th-gen-fuel-pump-recall-2018';

const RECALL_SCOPES = [
  {
    id: 'honda-accord-12-volt-battery-management-sensor-corrosion-fire-risk',
    campaign: '17V418', models: ['ACCORD'], years: [2013, 2014, 2015, 2016],
    terms: ['battery sensor', 'water', 'replace the sensor'],
  },
  {
    id: 'honda-accord-backup-rearview-camera-blank-screen-software-defect',
    campaign: '18V629', models: ['ACCORD'], years: [2018],
    terms: ['back-up camera', 'display audio unit software'],
  },
  {
    id: 'honda-accord-bcm-software-malfunction',
    campaign: '20V771', models: ['ACCORD', 'ACCORD HYBRID'], years: [2018, 2019, 2020],
    terms: ['body control module', 'update the bcm software'],
  },
  {
    id: 'honda-accord-v6-power-steering-pressure-hose-deterioration-leak-under-hoo',
    campaign: '12V222', models: ['ACCORD'], years: [2003, 2004, 2005, 2006, 2007],
    terms: ['power steering hose', 'heat resistant power steering hose'],
  },
  {
    id: 'honda-accord-ignition-switch-wear-park-shift-interlock-defect',
    campaign: '03V423', models: ['ACCORD'], years: [1998, 1999],
    terms: ['ignition switch', 'cylinder body wear'],
  },
  {
    id: 'honda-accord-ignition-interlock-key-removal-allows-rollaway',
    campaign: '05V025', models: ['ACCORD'], years: [1999, 2000, 2001, 2002],
    terms: ['interlock', 'redesigned interlock lever'],
  },
  {
    id: FUEL_PUMP_ID, campaign: '20V314', models: ['ACCORD'], years: [2018, 2019],
    terms: ['fuel pump', 'replace the fuel pump assembly'],
  },
  {
    id: FUEL_PUMP_ID, campaign: '21V215', models: ['ACCORD', 'ACCORD HYBRID'], years: [2019, 2020],
    terms: ['fuel pump', 'replace the fuel pump assembly'],
  },
  {
    id: FUEL_PUMP_ID, campaign: '23V858', models: ['ACCORD', 'ACCORD HYBRID'], years: [2018, 2019, 2020, 2021],
    terms: ['fuel pump', 'replace the fuel pump module'],
  },
];

const PDF_SCOPES = [
  {
    id: 'honda-accord-10th-gen-ac-condenser-leak-2018',
    document: 'Honda Service Bulletin 21-018 / NHTSA MC-10194961-0001',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10194961-0001.pdf',
  },
  {
    id: 'honda-accord-9th-gen-starter-failure-2013',
    document: 'Honda Service Bulletin 16-002 / NHTSA MC-10115802-9999',
    url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10115802-9999.pdf',
  },
  {
    id: 'honda-accord-aeb-false-activation',
    document: 'NHTSA Engineering Analysis EA24-002 opening resume',
    url: 'https://static.nhtsa.gov/odi/inv/2024/INOA-EA24002-11766P1.pdf',
  },
  {
    id: 'honda-accord-2-4l-k24-i-vtec-excessive-oil-consumption-sticking-piston-oi',
    document: 'Honda Service Bulletin 12-087 / NHTSA MC-10108586-9999',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10108586-9999.pdf',
  },
  {
    id: 'honda-accord-eps-failure',
    document: 'Honda Service Bulletin / NHTSA MC-10152445-0001',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10152445-0001.pdf',
  },
  {
    id: 'honda-accord-p0011-intake-cam-over-advanced-from-defective-vtc-actuator',
    document: 'Honda Service Bulletin 09-010 / NHTSA MC-10204264-9999',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10204264-9999.pdf',
  },
];

function campaignUrl(campaign) {
  return `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}000`;
}

function recallCitation(campaign, title) {
  return { type: 'recall', title: `NHTSA Campaign ${campaign} - ${title}`, url: campaignUrl(campaign) };
}

function bulletinCitation(documentId, title, url) {
  return { type: 'tsb', title: `Honda/NHTSA Document ${documentId} - ${title}`, url };
}

const REWRITE_CARDS = {
  'honda-accord-10th-gen-ac-condenser-leak-2018': {
    years: [2018, 2019, 2020],
    category: 'hvac',
    title: 'A/C Condenser Corrosion and Refrigerant Leak',
    description: 'Honda bulletin 21-018 covers factory A/C condensers whose tube walls can corrode into pinholes and release refrigerant on certain VIN-eligible 2018-2020 Accord vehicles.',
    solution: 'Confirm the leak is from condenser corrosion or another manufacturing condition rather than impact damage. Honda extended eligible condenser coverage to 10 years with unlimited mileage and directs replacement of a qualifying leaking condenser.',
    severity: 'medium', confidence: 'high',
    symptoms: ['A/C blows warm air', 'Low refrigerant', 'Leak visible at the condenser'],
    affectedSystems: ['A/C condenser', 'condenser tube walls', 'refrigerant circuit'],
    dtcCodes: [],
    citations: [bulletinCitation('10194961', 'A/C Condenser Corrosion and Refrigerant Leak', 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10194961-0001.pdf')],
    identityTerms: ['condenser', 'leak'],
    summary: 'Narrowed the condenser card to Honda bulletin 21-018 and its 2018-2020 VIN, corrosion/manufacturing-defect and impact-damage gates.',
  },
  [FUEL_PUMP_ID]: {
    years: [2018, 2019, 2020, 2021],
    category: 'fuel',
    title: 'Low-Pressure Fuel-Pump Failure Recall Campaigns',
    description: 'NHTSA campaigns 20V314, 21V215 and 23V858 cover VIN-specific Accord populations that include model years 2018-2021. The low-pressure fuel pump inside the fuel tank may fail, which can produce a no-start or an engine stall while driving.',
    solution: 'Check the VIN against all applicable Honda/NHTSA campaigns. Dealers replace the affected fuel-pump assembly or module free of charge; this is a recall repair, not a retail-parts recommendation.',
    severity: 'high', confidence: 'high',
    symptoms: ['Engine may not start', 'Engine may stall while driving', 'Malfunction indicator may illuminate'],
    affectedSystems: ['low-pressure in-tank fuel pump', 'fuel delivery'],
    dtcCodes: [],
    citations: [
      recallCitation('20V314', '2018-2019 Accord Fuel-Pump Impeller'),
      recallCitation('21V215', '2019-2020 Accord Fuel-Pump Impeller Expansion'),
      recallCitation('23V858', 'Accord Fuel-Pump Module Expansion'),
    ],
    identityTerms: ['fuel pump'],
    summary: 'Corrected the campaign identifiers and bounded the same fuel-pump identity to NHTSA campaigns 20V314, 21V215 and 23V858.',
  },
  'honda-accord-12-volt-battery-management-sensor-corrosion-fire-risk': {
    years: [2013, 2014, 2015, 2016],
    category: 'electrical',
    title: '12-Volt Battery Sensor Corrosion Fire-Risk Recall',
    description: 'NHTSA campaign 17V418 covers certain 2013-2016 Accord vehicles whose battery-sensor case may admit water, potentially causing an electrical short.',
    solution: 'Check the VIN with Honda or NHTSA. Dealers replace the affected sensor free of charge; the campaign also documented an interim adhesive remedy before replacement parts were available.',
    severity: 'critical', confidence: 'high',
    symptoms: ['The short may occur without a useful advance warning', 'Smoke or an electrical burning odor may indicate an urgent fault'],
    affectedSystems: ['12-volt battery sensor', 'battery management system'],
    dtcCodes: [],
    citations: [recallCitation('17V418', '12-Volt Battery Sensor Corrosion')],
    identityTerms: ['battery', 'sensor', 'corrosion'],
    summary: 'Bounded the existing battery-sensor fire-risk card to exact NHTSA campaign 17V418 and its free dealer remedy.',
  },
  'honda-accord-9th-gen-starter-failure-2013': {
    years: [2013, 2014, 2015, 2016],
    category: 'engine',
    title: 'V6 Automatic Starter-to-Ring-Gear Clearance Fault',
    description: 'Honda bulletin 16-002 covers 2013-2016 Accord V6 vehicles with automatic transmission whose starter-to-torque-converter ring-gear clearance is not optimal, producing grinding or free-spinning at startup.',
    solution: 'Confirm the documented startup symptom. Honda directs replacement of the starter and rotation of the torque converter clockwise by one bolt hole under the bulletin procedure.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Starter grinds at startup', 'Starter spins without engaging'],
    affectedSystems: ['starter motor gear', 'torque-converter ring gear'],
    dtcCodes: [],
    citations: [bulletinCitation('10115802', 'Starter-to-Ring-Gear Clearance Fault', 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10115802-9999.pdf')],
    identityTerms: ['starter', 'ring gear'],
    summary: 'Narrowed the starter card to Honda bulletin 16-002, 2013-2016 V6 automatic vehicles and the exact starter/torque-converter indexing repair.',
  },
  'honda-accord-aeb-false-activation': {
    years: [2018, 2019, 2020, 2021, 2022],
    category: 'safety',
    title: 'Inadvertent CMBS/AEB Activation - NHTSA Engineering Analysis',
    description: 'NHTSA engineering analysis EA24-002 evaluates complaints of inadvertent Collision Mitigation Braking System activation in 2018-2022 Accord vehicles. The reports allege unexpected braking without an imminent collision hazard; an open investigation is not a recall or a final defect determination.',
    solution: 'Do not treat this investigation as a parts diagnosis. Document the event and conditions, have Honda inspect the driver-assistance system, check the VIN for campaigns, and report a safety concern to NHTSA when appropriate. No retail remedy is supported by the investigation.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Unexpected automatic braking with no obstacle in the vehicle path', 'Sudden speed reduction'],
    affectedSystems: ['Collision Mitigation Braking System', 'automatic emergency braking'],
    dtcCodes: [],
    citations: [{ type: 'investigation', title: 'NHTSA Engineering Analysis EA24-002 - Inadvertent AEB Activation', url: 'https://static.nhtsa.gov/odi/inv/2024/INOA-EA24002-11766P1.pdf' }],
    identityTerms: ['braking', 'activation'],
    summary: 'Reframed the card as an open NHTSA engineering analysis across 2018-2022 and removed any implication of a confirmed defect or retail fix.',
  },
  'honda-accord-2-4l-k24-i-vtec-excessive-oil-consumption-sticking-piston-oi': {
    years: [2008, 2009, 2010, 2011],
    category: 'engine',
    title: 'L4 Sticking Oil-Control Rings and High Oil Consumption',
    description: 'Honda bulletin 12-087 covers eligible 2008-2011 four-cylinder Accord vehicles in which deposits can make the oil-control rings stick and cause unusually high engine-oil consumption.',
    solution: 'Perform Honda\'s oil-consumption test. When an eligible vehicle exceeds the limit and receives the required approval, follow the bulletin\'s piston-and-ring repair procedure.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Low oil level on the dipstick', 'Oil warning lamp may illuminate', 'Frequent oil top-offs'],
    affectedSystems: ['pistons', 'oil-control rings', 'engine lubrication'],
    dtcCodes: [],
    citations: [bulletinCitation('10108586', 'L4 Sticking Oil-Control Rings', 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10108586-9999.pdf')],
    identityTerms: ['oil consumption', 'rings'],
    summary: 'Narrowed the oil-consumption card to Honda bulletin 12-087, its 2008-2011 L4 population and diagnosis-first piston/ring remedy.',
  },
  'honda-accord-backup-rearview-camera-blank-screen-software-defect': {
    years: [2018],
    category: 'electrical',
    title: 'Rearview-Camera Display Software Recall',
    description: 'NHTSA campaign 18V629 covers certain 2018 Accord vehicles whose center display may fail to show the rearview-camera image in certain scenarios, violating rear-visibility requirements.',
    solution: 'Check VIN eligibility. Honda dealers reprogram the display-audio unit software free of charge.',
    severity: 'high', confidence: 'high',
    symptoms: ['Rearview-camera image is blank or unavailable when reversing'],
    affectedSystems: ['rearview camera', 'center display', 'display-audio software'],
    dtcCodes: [],
    citations: [recallCitation('18V629', 'Rearview-Camera Display Software')],
    identityTerms: ['camera', 'software'],
    summary: 'Bounded the rearview-camera card to exact NHTSA campaign 18V629 and its free display-audio software remedy.',
  },
  'honda-accord-bcm-software-malfunction': {
    years: [2018, 2019, 2020],
    category: 'electrical',
    title: 'Body-Control Module Communication Software Recall',
    description: 'NHTSA campaign 20V771 covers certain 2018-2020 Accord vehicles. A BCM software error may disrupt communication with components including the wipers, defroster, rearview camera, exterior lights, warning sound and power windows.',
    solution: 'Check the VIN with Honda or NHTSA. Dealers update the body-control module software free of charge.',
    severity: 'high', confidence: 'high',
    symptoms: ['Intermittent wiper or defroster malfunction', 'Rearview-camera or exterior-light malfunction', 'Power-window or stopped-vehicle warning malfunction'],
    affectedSystems: ['body-control module', 'vehicle network communication', 'BCM-controlled safety systems'],
    dtcCodes: [],
    citations: [recallCitation('20V771', 'Body-Control Module Communication Software')],
    identityTerms: ['body control module', 'software'],
    summary: 'Bounded the BCM card to exact NHTSA campaign 20V771, its 2018-2020 population and free software update.',
  },
  'honda-accord-eps-failure': {
    years: [2013, 2014],
    category: 'steering',
    title: 'EPS Torque-Sensor Signal Failure',
    description: 'Honda product-update and warranty-extension material covers a manufacturing defect that can make the EPS torque sensor send an incorrect signal and cause the control unit to disable power assist on certain 2013-2014 Accord vehicles.',
    solution: 'Check for DTC 53-01 or 53-02. Honda directs an EPS software update and steering-gearbox replacement when the applicable torque-sensor code is stored, subject to VIN eligibility.',
    severity: 'high', confidence: 'high',
    symptoms: ['EPS warning lamp', 'Loss of steering assist', 'DTC 53-01 or 53-02'],
    affectedSystems: ['EPS torque sensor', 'EPS control unit', 'steering gearbox'],
    dtcCodes: ['53-01', '53-02'],
    citations: [bulletinCitation('10152445', 'EPS Torque-Sensor Signal Failure', 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10152445-0001.pdf')],
    identityTerms: ['steering', 'failure'],
    summary: 'Narrowed the EPS card to the 2013-2014 torque-sensor condition, exact DTC gates and Honda software/gearbox remedy.',
  },
  'honda-accord-ignition-interlock-key-removal-allows-rollaway': {
    years: [1999, 2000, 2001, 2002],
    category: 'electrical',
    title: 'Ignition-Key Park-Interlock Recall',
    description: 'NHTSA campaign 05V025 covers certain 1999-2002 Accord vehicles whose ignition-switch interlock may permit the key to be removed without shifting the transmission to Park.',
    solution: 'Check VIN eligibility. Dealers inspect interlock function and install a redesigned interlock lever free of charge.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Ignition key may be removable before the transmission is shifted to Park', 'Unsecured vehicle may roll away'],
    affectedSystems: ['ignition switch', 'park interlock'],
    dtcCodes: [],
    citations: [recallCitation('05V025', 'Ignition-Key Park Interlock')],
    identityTerms: ['interlock', 'key', 'roll'],
    summary: 'Corrected the interlock card to exact NHTSA campaign 05V025 and its 1999-2002 redesigned-lever remedy.',
  },
  'honda-accord-ignition-switch-wear-park-shift-interlock-defect': {
    years: [1998, 1999],
    category: 'electrical',
    title: 'Ignition-Switch Interlock Wear and Rollaway Recall',
    description: 'NHTSA campaign 03V423 covers certain 1998-1999 Accord vehicles whose ignition switch may wear excessively and permit key removal without shifting the transmission to Park.',
    solution: 'Check VIN eligibility. Dealers inspect cylinder-body wear and replace the cylinder body, collar and latch plate when wear is significant; otherwise they install a redesigned latch plate.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Ignition key may be removable before the transmission is shifted to Park', 'Unsecured vehicle may roll away'],
    affectedSystems: ['ignition switch', 'park interlock', 'latch plate'],
    dtcCodes: [],
    citations: [recallCitation('03V423', 'Ignition-Switch Interlock Wear')],
    identityTerms: ['ignition switch', 'interlock'],
    summary: 'Bounded the 1998-1999 interlock-wear card to exact NHTSA campaign 03V423 and its wear-based dealer remedy.',
  },
  'honda-accord-p0011-intake-cam-over-advanced-from-defective-vtc-actuator': {
    years: [2008, 2009, 2010, 2011, 2012],
    category: 'engine',
    title: 'Cold-Start VTC Actuator Rattle',
    description: 'Honda bulletin 09-010 covers a loud rattle for about two seconds at cold startup when the VTC actuator is defective on 2008-2012 Accord vehicles.',
    solution: 'Cold-soak the vehicle for at least six hours and confirm the brief startup rattle. If the documented symptom is present, Honda directs replacement of the VTC actuator; the bulletin does not establish P0011 as a required gate.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Loud engine rattle for about two seconds after cold startup'],
    affectedSystems: ['VTC actuator', 'camshaft timing system'],
    dtcCodes: [],
    citations: [bulletinCitation('10204264', 'Cold-Start VTC Actuator Rattle', 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10204264-9999.pdf')],
    identityTerms: ['vtc', 'actuator'],
    summary: 'Removed the unsupported P0011 gate and narrowed the VTC card to Honda bulletin 09-010, 2008-2012 and the two-second cold-start rattle.',
  },
  'honda-accord-v6-power-steering-pressure-hose-deterioration-leak-under-hoo': {
    years: [2003, 2004, 2005, 2006, 2007],
    category: 'steering',
    title: 'V6 Power-Steering Pressure-Hose Leak and Fire-Risk Recall',
    description: 'NHTSA campaign 12V222 covers certain 2003-2007 Accord V6 vehicles. Prolonged under-hood and power-steering-fluid temperatures can cause the pressure hose to crack and leak fluid.',
    solution: 'Check VIN eligibility. Honda dealers install a new heat-resistant power-steering hose free of charge.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Power-steering fluid leak', 'Smoke or odor if fluid reaches a hot catalytic converter'],
    affectedSystems: ['power-steering pressure hose', 'hydraulic power assist', 'catalytic-converter area'],
    dtcCodes: [],
    citations: [recallCitation('12V222', 'V6 Power-Steering Pressure-Hose Leak')],
    identityTerms: ['power steering', 'hose', 'leak'],
    summary: 'Bounded the pressure-hose card to exact NHTSA campaign 12V222 and its 2003-2007 Accord V6 free dealer remedy.',
  },
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Honda',
    model: 'Accord',
    trims: [],
    engines: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-05',
    contentUpdatedOn: '2026-08-05',
    contentUpdateSummary: card.summary,
    relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const accord = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Accord');
  if (accord.length !== 56) throw new Error(`expected 56 Accord rows, found ${accord.length}`);
  const missingRewriteIds = Object.keys(REWRITE_CARDS).filter((id) => !accord.some((row) => row.id === id));
  if (missingRewriteIds.length) throw new Error(`rewrite IDs missing from snapshot: ${missingRewriteIds.join(', ')}`);

  const rows = accord.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(current, card) : before;
    return {
      id: current.id,
      action,
      reason: card
        ? 'The current page and proposed source describe the same component and symptom identity. The proposal narrows scope and remedy to the reviewed Honda/NHTSA primary source without changing the slug or publication state.'
        : 'The earlier source lead changed component, symptom, generation, or model identity, or lacked primary-source support. The published row remains byte-for-byte unchanged pending a same-identity review.',
      identityTerms: card?.identityTerms || [],
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });
  const summary = {
    rewrite_same_identity: rows.filter((row) => row.action === 'rewrite_same_identity').length,
    keep_published_pending_source: rows.filter((row) => row.action === 'keep_published_pending_source').length,
    total: rows.length,
  };
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-05',
    make: 'Honda',
    model: 'Accord',
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotHash: snapshot.snapshotHash,
      snapshotGeneratedAt: snapshot.generatedAt,
      accordRecordCount: accord.length,
    },
    safetyContract: [
      'No production write, archive, deletion, cache purge or deployment is authorized by this packet.',
      'All 56 Accord rows remain published; 43 are byte-for-byte unchanged.',
      'A primary source may be assigned only when component and symptom identity match the existing page.',
      'All rewritten cards are no-commerce and contain no search/category/storefront URL.',
      'Applicability stays in prose; trim and engine arrays remain empty to avoid hiding valid cards through label mismatch.',
    ],
    rejectedLeadExamples: [
      'The prior sequence assigned an A/C condenser bulletin to a head-gasket/coolant-intrusion ID.',
      'The prior sequence assigned an Acura TSX piston-ring bulletin to an Accord VCM oil-consumption ID.',
      'The prior sequence assigned a 2017 P0741 bulletin to a 2003-2012 P0741 ID.',
      'The prior sequence assigned a front-wheel-bearing bulletin to a rear-wheel-bearing ID.',
    ],
    summary,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();

module.exports = {
  FUEL_PUMP_ID,
  FULL_RECORD_FIELDS,
  PDF_SCOPES,
  RECALL_SCOPES,
  REWRITE_CARDS,
  campaignUrl,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewriteProposal,
};
