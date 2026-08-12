/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_gmc-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-gmc-adjudication-2026-08-05.json');
const DECISIONS_DIR = path.join(PROJECT_ROOT, 'data', 'known-issues-catalog-deeplink-decisions');

const FULL_RECORD_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'description', 'solution',
  'severity', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow',
  'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations',
  'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'status',
  'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary', 'relatedIssueIds',
];

const REWRITE_IDS = new Set([
  'gmc-acadia-fuel-pump-mixing-tube-burr-causing-engine-stall-low-fuel',
  'gmc-acadia-incorrect-transmission-sun-gear-causing-driver-side-half-sha',
  'gmc-acadia-infotainment-system-lockup-black-screen-random-reboots',
  'gmc-acadia-power-steering-failure-2007',
  'gmc-acadia-shift-to-park-message-no-shutdown-door-lock-lockout-battery',
  'gmc-acadia-start-stop-transmission-accumulator-missing-bolts-fluid-leak',
  'gmc-acadia-surround-vision-rearview-camera-coaxial-cable-crimp-failure',
  'gmc-acadia-timing-chain-2007',
  'gmc-acadia-water-pump-failure-2007',
  'gmc-canyon-2024-headlight-flicker-2023-2024-seat-belt-buckle-bolt-recal',
  'gmc-canyon-driver-airbag-inflator-misalignment-sdm-reprogram',
  'gmc-canyon-front-brake-caliper-brake-fluid-leak',
  'gmc-canyon-power-steering-assist-loss-from-corroded-steering-gear-conne',
  'gmc-hummer-ev-a-pillar-leak-2022',
  'gmc-hummer-ev-battery-seal-water-2022',
  'gmc-terrain-start-stop-transmission-accumulator-endcap-missing-bolts-flu',
  'gmc-yukon-10l80-10-speed-transmission-harsh-shifting-shudder-rear-whee',
  'gmc-yukon-6-2l-l87-v8-rod-bearing-failure-loss-propulsion',
  'gmc-yukon-brake-vacuum-pump-failure-causing-hard-brake-pedal',
  'gmc-yukon-xl-takata-passenger-airbag-inflator-rupture-risk-recall-174-nhtsa-21v-050',
  'gmc-yukonxl-fuel-pump-module-failure-2000',
]);

const RECALL_SCOPES = {
  'gmc-acadia-fuel-pump-mixing-tube-burr-causing-engine-stall-low-fuel': { campaign: '20V639', years: [2020], model: 'ACADIA', terms: ['jet nozzle', 'fuel pump module', 'engine stall'] },
  'gmc-acadia-incorrect-transmission-sun-gear-causing-driver-side-half-sha': { campaign: '23V172', years: [2023], model: 'ACADIA', terms: ['sun gear', 'half-shaft', 'replace the sun gears'] },
  'gmc-acadia-start-stop-transmission-accumulator-missing-bolts-fluid-leak': { campaign: '20V668', years: [2019, 2020], model: 'ACADIA', terms: ['start/stop accumulator', 'missing bolts', 'replace it'] },
  'gmc-acadia-surround-vision-rearview-camera-coaxial-cable-crimp-failure': { campaign: '22V709', years: [2020, 2021], model: 'ACADIA', terms: ['rearview camera', 'coaxial', 'replace the coaxial cables'] },
  'gmc-canyon-2024-headlight-flicker-2023-2024-seat-belt-buckle-bolt-recal': { campaign: '24V673', years: [2024], model: 'CANYON', terms: ['headlights may flicker', 'replace a module in the headlight'] },
  'gmc-canyon-driver-airbag-inflator-misalignment-sdm-reprogram': { campaign: '15V157', years: [2015], model: 'CANYON', terms: ['air bag inflator', 'misaligned', 'inspect the driver air bag'] },
  'gmc-canyon-front-brake-caliper-brake-fluid-leak': { campaign: '15V278', years: [2015], model: 'CANYON', terms: ['brake calipers', 'leaking brake fluid'] },
  'gmc-canyon-power-steering-assist-loss-from-corroded-steering-gear-conne': { campaign: '21V213', years: [2015], model: 'CANYON', terms: ['power steering assist', 'poor electrical connection', 'steering gear torque sensor'] },
  'gmc-hummer-ev-battery-seal-water-2022': { campaign: '22V771', years: [2022, 2023], model: 'HUMMER EV', terms: ['battery pack enclosure', 'water to enter'] },
  'gmc-terrain-start-stop-transmission-accumulator-endcap-missing-bolts-flu': { campaign: '20V668', years: [2018, 2019, 2020], model: 'TERRAIN', terms: ['start/stop accumulator', 'missing bolts', 'replace it'] },
  'gmc-yukon-10l80-10-speed-transmission-harsh-shifting-shudder-rear-whee': { campaign: '24V797', years: [2021], model: 'YUKON', terms: ['transmission control valve', 'rear wheels to lock-up'] },
  'gmc-yukon-6-2l-l87-v8-rod-bearing-failure-loss-propulsion': { campaign: '25V274', years: [2021, 2022, 2023, 2024], model: 'YUKON', terms: ['connecting rod', 'crankshaft', '6.2l v8 gas engine'] },
  'gmc-yukon-brake-vacuum-pump-failure-causing-hard-brake-pedal': { campaign: '19V645', years: [2015, 2016, 2017, 2018], model: 'YUKON', terms: ['vacuum pump', 'reprogram the electronic brake control module'] },
  'gmc-yukon-xl-takata-passenger-airbag-inflator-rupture-risk-recall-174-nhtsa-21v-050': { campaign: '21V050', years: [2007, 2008, 2009, 2010, 2011], model: 'YUKON XL', terms: ['passenger frontal inflators', 'may explode', 'replace the front passenger air bag inflator'] },
  'gmc-yukonxl-fuel-pump-module-failure-2000': { campaign: '05V155', years: [2000, 2001], model: 'YUKON XL', terms: ['fuel pump wires connectors', 'overheat', 'install a new service kit'] },
};

const TSB_SCOPES = {
  'gmc-acadia-infotainment-system-lockup-black-screen-random-reboots': {
    years: [2019],
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10217855-0001.pdf',
  },
  'gmc-acadia-power-steering-failure-2007': {
    years: [2007, 2008, 2009, 2010, 2011],
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10248773-9999.pdf',
  },
  'gmc-acadia-shift-to-park-message-no-shutdown-door-lock-lockout-battery': {
    years: [2017, 2018, 2019],
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251901-0001.pdf',
  },
  'gmc-acadia-timing-chain-2007': {
    years: [2007, 2008, 2009, 2010, 2011, 2012],
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10245795-9999.pdf',
  },
  'gmc-acadia-water-pump-failure-2007': {
    years: [2009, 2010, 2011, 2012, 2013],
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10246712-9999.pdf',
  },
  'gmc-hummer-ev-a-pillar-leak-2022': {
    years: [2022],
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10217073-0001.pdf',
  },
};

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function hashValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function cleanText(value) {
  if (typeof value === 'string') {
    return value
      .replaceAll('â€™', "'")
      .replaceAll('â€”', '—')
      .replaceAll('â€“', '–')
      .replaceAll('â€œ', '“')
      .replaceAll('â€', '”');
  }
  if (Array.isArray(value)) return value.map(cleanText);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanText(item)]));
  }
  return value;
}

function fullRecord(row) {
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, cleanText(row[field])]));
}

function loadLegacyDecisions() {
  const published = new Map();
  const reasons = new Map();
  const files = fs.readdirSync(DECISIONS_DIR)
    .filter((name) => /^_config-gmc-.*-full-record\.cjs$/.test(name));
  for (const file of files) {
    const source = fs.readFileSync(path.join(DECISIONS_DIR, file), 'utf8');
    const sandbox = {
      module: { exports: {} },
      exports: {},
      require: (request) => {
        if (request.includes('_config-buick-remaining-factory')) return { buildConfig: (value) => value };
        return require(request);
      },
    };
    vm.runInNewContext(source, sandbox, { filename: file });
    for (const [id, decision] of Object.entries(sandbox.module.exports.published || {})) {
      if (published.has(id) || reasons.has(id)) throw new Error(`${id}: duplicate legacy decision`);
      published.set(id, cleanText(decision));
    }
    for (const [id, reason] of Object.entries(sandbox.module.exports.reasons || {})) {
      if (published.has(id) || reasons.has(id)) throw new Error(`${id}: duplicate legacy decision`);
      reasons.set(id, cleanText(reason));
    }
  }
  return { published, reasons };
}

function safeApplicabilityValues(values) {
  if (!Array.isArray(values)) return [];
  return values.filter((value) => !/\b(?:20\d{2}|vehicles?|covered|equipped|applicable|production|campaign|bulletin|vin)\b/i.test(value));
}

function campaignUrl(campaign) {
  return `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}000`;
}

function exactCitation(id, citation) {
  const recall = RECALL_SCOPES[id];
  if (recall) {
    return {
      type: 'recall',
      title: `NHTSA Campaign ${recall.campaign} - ${citation.title.replace(/^.*?\s-\s/, '')}`,
      url: campaignUrl(recall.campaign),
    };
  }
  return citation;
}

function takataCard() {
  return {
    years: RECALL_SCOPES['gmc-yukon-xl-takata-passenger-airbag-inflator-rupture-risk-recall-174-nhtsa-21v-050'].years,
    trims: [],
    engines: [],
    category: 'safety',
    title: 'Takata Passenger-Airbag Inflator Rupture Recall',
    description: 'NHTSA campaign 21V050 covers certain 2007-2011 GMC Yukon XL vehicles in specified U.S. states and territories. Long-term heat and humidity exposure can degrade the non-desiccated passenger frontal-airbag inflator propellant and cause the inflator to explode during deployment.',
    solution: 'Check the VIN with GMC or NHTSA because geographic registration history determines coverage. Dealers replace the front passenger-airbag inflator with an alternate inflator free of charge.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['No warning symptom may occur before an inflator rupture during deployment'],
    affectedSystems: ['front passenger-airbag inflator', 'airbag module'],
    dtcCodes: [],
    citations: [{
      type: 'recall',
      title: 'NHTSA Campaign 21V050 - Yukon XL Passenger-Airbag Inflator',
      url: campaignUrl('21V050'),
    }],
    summary: 'Restored the exact campaign named by the original issue and rejected the unrelated seat-belt recall used by the earlier audit.',
  };
}

function scopedCard(current, legacy) {
  let card = current.id === 'gmc-yukon-xl-takata-passenger-airbag-inflator-rupture-risk-recall-174-nhtsa-21v-050'
    ? takataCard()
    : cleanText(legacy.after);
  if (!card) throw new Error(`${current.id}: missing same-identity rewrite card`);
  const scope = RECALL_SCOPES[current.id] || TSB_SCOPES[current.id];
  card = { ...card, years: [...scope.years] };

  if (current.id === 'gmc-acadia-infotainment-system-lockup-black-screen-random-reboots') {
    card = {
      ...card,
      trims: [],
      engines: [],
      description: 'GM bulletin 22-NA-033 covers 2019 GMC Acadia vehicles equipped with IOS, IOU or IOT radios that can reset or reboot and display the GMC splash animation. Bluetooth-call or touch-input symptoms can occur immediately before the reboot.',
      solution: 'Have a GMC retailer confirm the radio software version. The bulletin directs a USB radio-software update to version V809 when the installed version is V808 or earlier.',
      summary: 'Narrowed the broad infotainment aggregation to the exact 2019 radio/RPO scope and V809 remedy in GM bulletin 22-NA-033.',
    };
  }
  if (current.id === 'gmc-acadia-shift-to-park-message-no-shutdown-door-lock-lockout-battery') {
    card = {
      ...card,
      trims: [],
      engines: [],
      solution: 'Have a GMC retailer reproduce the message and check for DTC B000A. GM bulletin 19-NA-206 directs removal and reinstallation of the transmission control, installation of a shifter harness, and an inline harness jumper; it does not support the frozen door-lock and battery-drain claims.',
      summary: 'Limited the card to the documented 2017-2019 intermittent Shift-to-Park condition, DTC and harness remedy.',
    };
  }
  if (current.id === 'gmc-acadia-timing-chain-2007') {
    card = {
      ...card,
      trims: [],
      engines: ['3.6L High Feature V6 (RPO LY7 or LLT)'],
      description: 'GM bulletin 12-06-01-009D covers 2007-2012 GMC Acadia vehicles with 3.6L High Feature V6 engines (RPO LY7 or LLT) and timing-chain correlation DTCs P0008, P0009, P0016, P0017, P0018 or P0019.',
      solution: 'Complete the GM diagnostic procedure before ordering parts. When a stretched timing chain is confirmed, use the applicable GM timing-chain kit. The bulletin says guides, sprockets, actuators and the crank gear should not be replaced automatically unless separately worn or diagnosed.',
      affectedSystems: ['timing chains', 'camshaft and crankshaft timing'],
      summary: 'Preserved the same timing-chain identity while correcting the engine scope and removing the unsupported automatic guide replacement.',
    };
  }
  if (current.id === 'gmc-acadia-water-pump-failure-2007') {
    card = {
      ...card,
      trims: [],
      engines: ['3.6L High Feature V6 (RPO LY7 or LLT)'],
      description: 'GM customer-satisfaction bulletin 13079 covers certain 2009-2013 GMC Acadia vehicles with 3.6L High Feature V6 engines (RPO LY7 or LLT) that may experience leakage from the water-pump shaft seal, often after operation with low coolant.',
      solution: 'Check the VIN and current eligibility with GMC. Bulletin 13079 directs dealers to verify and correct coolant level with the proper DEX-COOL mixture; it does not establish the frozen claim that the pump is internal or must be combined with timing-chain work.',
      affectedSystems: ['water-pump shaft seal', 'engine cooling system'],
      summary: 'Corrected the pump design, engine scope and remedy to the VIN-scoped GM coolant-level program.',
    };
  }
  if (current.id === 'gmc-yukon-10l80-10-speed-transmission-harsh-shifting-shudder-rear-whee') {
    card = {
      ...card,
      trims: [],
      engines: ['Diesel engine'],
      title: 'Diesel Transmission Control-Valve Rear-Wheel Lockup Recall',
      summary: 'Narrowed the broad harsh-shift and shudder aggregation to the exact diesel control-valve rear-wheel-lockup recall.',
    };
  }
  if (current.id === 'gmc-yukon-6-2l-l87-v8-rod-bearing-failure-loss-propulsion') {
    card = { ...card, trims: [], engines: ['6.2L V8 gasoline engine'] };
  }
  return card;
}

function proposedRewrite(current, legacy) {
  const card = scopedCard(current, legacy);
  const proposal = {
    ...fullRecord(current),
    ...card,
    make: current.make,
    model: current.model,
    years: [...current.years],
    trims: safeApplicabilityValues(current.trims),
    engines: safeApplicabilityValues(current.engines),
    category: current.category,
    title: current.title,
    severity: current.severity,
    citations: (card.citations || []).map((citation) => exactCitation(current.id, citation)),
    communityRecommendations: [],
    fixParts: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-05',
    contentUpdatedOn: '2026-08-05',
    contentUpdateSummary: card.summary || 'Narrowed the card to the cited same-identity GMC/NHTSA condition.',
    relatedIssueIds: [...current.relatedIssueIds],
  };
  return fullRecord(proposal);
}

function keepReason(current, legacyDecision, legacyArchiveReason) {
  if (legacyDecision?.after?.title) {
    return `Rejected the earlier proposal to replace "${current.title}" with "${cleanText(legacyDecision.after.title)}" because it changes the component or symptom identity. The current published page remains unchanged until a same-identity primary source is reviewed.`;
  }
  return `The earlier audit proposed removal because primary-source support was not found, but absence of that source does not prove the page false or duplicative. The current published page remains unchanged pending deeper review. Earlier note: ${cleanText(legacyArchiveReason)}`;
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const legacy = loadLegacyDecisions();
  const legacyIds = new Set([...legacy.published.keys(), ...legacy.reasons.keys()]);
  const snapshotIds = new Set(snapshot.records.map((row) => row.id));
  const missingLeads = [...snapshotIds].filter((id) => !legacyIds.has(id));
  const extraLeads = [...legacyIds].filter((id) => !snapshotIds.has(id));
  if (missingLeads.length || extraLeads.length) {
    throw new Error(`GMC lead/snapshot mismatch; missing=${missingLeads.join(',')} extra=${extraLeads.join(',')}`);
  }

  const rows = snapshot.records.map((current) => {
    const before = fullRecord(current);
    const legacyDecision = legacy.published.get(current.id);
    const legacyArchiveReason = legacy.reasons.get(current.id);
    const action = REWRITE_IDS.has(current.id) ? 'rewrite_then_publish' : 'keep_published_pending_source';
    const proposal = action === 'rewrite_then_publish' ? proposedRewrite(current, legacyDecision || {}) : before;
    const reason = action === 'rewrite_then_publish'
      ? cleanText(legacyDecision?.decision || 'The same component and symptom identity is supported by the exact primary source.')
      : keepReason(current, legacyDecision, legacyArchiveReason);
    return {
      id: current.id,
      model: current.model,
      action,
      reason,
      identityRule: action === 'rewrite_then_publish'
        ? 'The rewrite retains the original component/symptom identity and narrows it to an exact campaign or bulletin.'
        : 'No content or publication state changes; an unrelated official source cannot replace this issue.',
      commerceDecision: 'no-commerce',
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const actions = ['rewrite_then_publish', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const byModel = {};
  for (const model of [...new Set(rows.map((row) => row.model))].sort()) {
    const scoped = rows.filter((row) => row.model === model);
    byModel[model] = Object.fromEntries(actions.map((action) => [action, scoped.filter((row) => row.action === action).length]));
    byModel[model].total = scoped.length;
  }

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-05',
    make: 'GMC',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, or public-page change is authorized by this packet.',
      'An unrelated official campaign may never replace the component or symptom named by an existing ID.',
      'Rows without a same-identity primary source remain published and byte-for-byte unchanged.',
      'All rewrites remain no-commerce until exact repair role and fitment are independently verified.',
      'Trim and engine arrays may contain names only, never applicability prose.',
    ],
    source: {
      snapshotFile: 'data/_gmc-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: sha256File(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      productionRecordCount: snapshot.records.length,
    },
    summary,
    byModel,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: sha256File(OUTPUT), summary, byModel }, null, 2));
}

if (require.main === module) main();

module.exports = {
  FULL_RECORD_FIELDS,
  RECALL_SCOPES,
  REWRITE_IDS,
  TSB_SCOPES,
  fullRecord,
  hashValue,
  safeApplicabilityValues,
};
