/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  RECALL_FILES,
  SOURCE_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercury-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercury-cougar-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  headGasket: 'mercury-cougar-3-8l-essex-v6-head-gasket-failure',
  aod: 'mercury-cougar-aod-transmission-overdrive-band-drum-failure',
  cd4e: 'mercury-cougar-cd4e-automatic-transmission-failure',
  fuelModule: 'mercury-cougar-fuel-delivery-module-contamination-causing-stalling',
  imrc: 'mercury-cougar-intake-manifold-runner-control-failure-2-5l-v6',
  window: 'mercury-cougar-power-window-regulator-relay-failures',
  alternator: 'mercury-cougar-premature-alternator-failure-buried-alternator-location-2-5l',
  suspension: 'mercury-cougar-rapid-front-suspension-wear-ball-joints-strut-rod-bushings-c',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.cd4e]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const MODEL_ALIASES = Object.freeze(['COUGAR']);
const SEARCH_TERMS = Object.freeze([
  'head gasket', 'AOD', 'overdrive', 'CD4E', 'fuel delivery', 'fuel pump', 'IMRC',
  'P1518', 'P1519', 'window', 'regulator', 'relay', 'alternator', 'battery cable',
  'ball joint', 'control arm', 'spring', 'suspension',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '50356', '605229', '607645', '6091763', '613315', '613868', '616506',
  '619324', '630631', '10007005',
]);
const CAMPAIGNS = Object.freeze([
  '00V075000', '01V031000', '01V032000', '01V230000', '04V421000', '06E022000',
  '07E064000', '08E019000', '08E033000', '66V004006', '67V056000', '68V095000',
  '69V077000', '69V100000', '69V116000', '70V115000', '73V221000', '74V011000',
  '75V042000', '75V043000', '76V067000', '77V043000', '77V141000', '78V108000',
  '79V013000', '79V117000', '79V262000', '80V144000', '81V002000', '81V151000',
  '82V031000', '83V012000', '83V028000', '83V050000', '83V134000', '84V078000',
  '85V025000', '86V065000', '87V139000', '88V165000', '89V080000', '89V081000',
  '90V026000', '91V048000', '91V076000', '96V007000', '96V070000', '96V071000',
  '97V159000', '99V194000', '99V226000', '99V275000',
]);
const OTHER_SOURCES = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: NHTSA_DATASET_URL,
  },
  recalls2000: {
    title: 'NHTSA recalls by vehicle — 2000 Mercury Cougar',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=mercury&model=cougar&modelYear=2000',
  },
  recalls2002: {
    title: 'NHTSA recalls by vehicle — 2002 Mercury Cougar',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=mercury&model=cougar&modelYear=2002',
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 210, '2000-2004': 235, '2005-2009': 10, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
  totalRows: 455,
  relevantRowCount: 36,
  uniqueRelevantCommunications: 36,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 78, post: 0 },
  totalRows: 78,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.headGasket]: {
    description: 'NHTSA manufacturer communications 613868 and 616506 support an owner-notification program and premature head-gasket leakage for 1994-1995 Cougar vehicles. The reviewed primary corpus does not establish the same program or failure identity for frozen model years 1989-1993, and it does not establish a universal failure rate for every 3.8L Essex engine.',
    solution: 'For a 1994-1995 3.8L vehicle, confirm VIN, engine and prior program or repair history, then pressure-test the cooling system and use combustion-gas, compression and leak-down testing before teardown. Measure head and block flatness and inspect overheating damage before choosing gaskets, bolts, machining or an engine assembly. Do not buy a head-gasket kit or replacement engine from this page; build data and damage determine the repair.',
    symptoms: ['coolant loss and overheating documented', 'combustion-gas, compression and leak-down tests completed', 'head and block flatness checked after teardown'],
    affectedSystems: ['3.8L cooling system', 'cylinder-head sealing', 'cylinder heads and short block'],
    dtcCodes: [],
    conflict: 'Exact primary support is limited to 1994-1995, while the frozen indexed scope begins in 1989.',
    evidence: ['Communication 613868 identifies the 1994-1995 owner-notification program.', 'Communication 616506 identifies premature head-gasket leakage and overheating for 1994-1995.', 'No reviewed exact communication extends that identity to 1989-1993.'],
    summary: 'Held the overbroad 1989-1995 head-gasket identity and bounded diagnosis to exact 1994-1995 primary evidence.',
  },
  [IDS.aod]: {
    description: 'The reviewed Cougar corpus does not establish an AOD overdrive-band and drum failure across frozen model years 1990-1993. Exact transmission communications such as 50356 concern AODE/4R70W service on later or overlapping vehicles, not the stored AOD mechanism, and the frozen engine list also includes a 4.6L application outside the indexed years.',
    solution: 'Identify the transmission by tag and build data before diagnosis. Record line pressure, throttle-valve or electronic control state, commanded gear, slip and debris, then follow the unit-specific service procedure. Do not buy an overdrive band, drum, servo, valve body or conversion kit from this page; the transmission identity and failed component are unresolved.',
    symptoms: ['transmission tag and build data confirmed', 'line pressure and control state recorded', 'gear, slip and debris evidence separated'],
    affectedSystems: ['AOD, AODE or 4R70W transmission', 'overdrive band and drum', 'throttle-valve or electronic controls'],
    dtcCodes: [],
    conflict: 'The exact corpus concerns AODE/4R70W paths and does not establish the frozen AOD band-and-drum identity.',
    evidence: ['Communication 50356 concerns AODE/4R70W main-control and case replacement.', 'The reviewed exact corpus does not identify the claimed 1990-1993 AOD band-and-drum population.', 'The frozen 4.6L engine entry conflicts with the frozen 1990-1993 year set.'],
    summary: 'Held the unsupported AOD band-and-drum identity and required transmission-tag verification before parts.',
  },
  [IDS.cd4e]: {
    description: 'NHTSA communications establish several distinct CD4E conditions on 1999-2002 Cougar vehicles: no-forward engagement in 605229 and 6091763, 1999 ring-gear side loading of the forward-clutch snap-ring retainer in 607645, intermittent loss of first and second gears with P0758 or P0740 in 619324, and harsh or delayed shifts after speed-sensor service in 630631. These records support the generic CD4E problem identity but not one universal valve-body or drum cause.',
    solution: 'Preserve all transmission codes and freeze-frame data, identify which gears are lost, test line pressure and solenoid circuits, verify fluid level and condition, and inspect the transmission tag and prior repairs. Follow the symptom- and build-specific Ford procedure before choosing a sensor, solenoid, valve-body repair, hard parts or a remanufactured unit. Do not buy a transmission or rebuild kit from this page; the failed CD4E path must be established first.',
    symptoms: ['no-forward or lost-gear condition identified', 'transmission codes and freeze-frame preserved', 'pressure, solenoid, sensor and hard-part paths separated'],
    affectedSystems: ['CD4E transaxle', 'forward clutch and ring gear', 'shift and converter-clutch solenoids', 'speed sensors and hydraulic controls'],
    dtcCodes: ['P0731', 'P0732', 'P0734', 'P0740', 'P0741', 'P0758'],
    conflict: null,
    evidence: ['605229 and 6091763 identify no-forward engagement.', '607645 identifies ring-gear side loading of the forward-clutch snap-ring retainer.', '619324 and 630631 identify separate solenoid-code and post-sensor-service paths.'],
    summary: 'Retained the bulletin-backed CD4E identity while separating its distinct diagnostic and repair paths.',
  },
  [IDS.fuelModule]: {
    description: 'NHTSA campaign 04V421000 and communication 10007005 cover 1999-2002 Cougar fuel-delivery-module filter contamination that can reduce fuel flow and cause hesitation, loss of power, surging or stalling. The campaign record explicitly describes this as a safety-improvement action not conducted under the Safety Act, with a no-charge remedy available for ten years from original purchase; it does not support presenting a current open-ended free recall remedy.',
    solution: 'Check the VIN and service history for campaign 04N02/04V421000, document symptoms and fuel level, and verify fuel pressure and flow before condemning the module. Because the original ten-year remedy window has expired, confirm current assistance with Ford or a dealer and obtain VIN-specific tank and module fitment before paid repair. Do not buy a fuel-pump module from this page; campaign status and build configuration must be checked first.',
    symptoms: ['hesitation, power loss, surging or stalling documented', 'fuel pressure and flow tested', 'campaign and prior-repair history checked by VIN'],
    affectedSystems: ['fuel delivery module filter', 'in-tank fuel pump module', 'fuel pressure and flow'],
    dtcCodes: [],
    conflict: 'The frozen title calls 04V421000 a recall although the exact record says the safety-improvement action was not conducted under the Safety Act.',
    evidence: ['Campaign 04V421000 covers 1999-2002 Cougar vehicles.', 'The remedy was symptom-triggered and free for ten years from original purchase.', 'Communication 10007005 identifies contamination-related hesitation, loss of power and surging.'],
    summary: 'Held the recall-label conflict while preserving the exact 04N02/04V421 fuel-module safety guidance.',
  },
  [IDS.imrc]: {
    description: 'Communication 613315 shows that a 1999 Cougar can set P1518 or P1519 among a broader group of powertrain codes, but the reviewed primary corpus does not establish a recurring 1999-2002 IMRC actuator failure or prove broken plastic bushings and stripped gears as the universal cause.',
    solution: 'Confirm the 2.5L engine and preserve P1518/P1519 freeze-frame data. Command the runners while checking linkage movement, actuator power and ground, wiring, vacuum where equipped, binding and carbon before selecting a repair. Do not buy bushings, an actuator or an intake assembly from this page; the failed IMRC path and fitment are unresolved.',
    symptoms: ['P1518 or P1519 and freeze-frame preserved', 'runner movement and binding checked', 'actuator, circuit, vacuum and linkage paths separated'],
    affectedSystems: ['intake manifold runner control', 'IMRC actuator and linkage', 'runner plates and wiring'],
    dtcCodes: ['P1518', 'P1519'],
    conflict: 'The exact communication supports diagnostic codes, not the frozen actuator, bushing and gear failure mechanism.',
    evidence: ['Communication 613315 includes P1518 and P1519 for 1999 Cougar vehicles.', 'It does not establish a universal actuator or plastic-linkage failure.', 'No exact reviewed source supports the full 1999-2002 mechanism.'],
    summary: 'Held the unsupported IMRC hardware identity while preserving exact P1518/P1519 diagnostic scope.',
  },
  [IDS.window]: {
    description: 'The reviewed primary corpus does not establish recurring regulator-cable and relay failures for 1999-2002 Cougar vehicles. Communications 50754 and 50794 concern a 1996 power-window pop noise in the previous generation and cannot support the frozen eighth-generation regulator-and-relay identity.',
    solution: 'Document which window and direction fail, then test switch input, relay and fuse output, wiring and grounds, motor current, glass binding, regulator cable and guides separately. Do not buy a regulator, motor, relay or repair kit from this page; the failed circuit or mechanism and side-specific fitment are unresolved.',
    symptoms: ['failed side and direction documented', 'switch, relay, wiring and motor current tested', 'glass binding and regulator mechanism inspected'],
    affectedSystems: ['power-window electrical circuit', 'window motor and regulator', 'relay, switches and wiring'],
    dtcCodes: [],
    conflict: 'The only exact window communications are for a 1996 pop noise, not the frozen 1999-2002 failure identity.',
    evidence: ['50754 and 50794 concern a 1996 power-window mechanism pop noise.', 'No exact reviewed communication identifies 1999-2002 regulator-cable failure.', 'No exact reviewed communication identifies the claimed relay-contact mechanism.'],
    summary: 'Held the unsupported eighth-generation window identity and separated electrical and mechanical diagnosis.',
  },
  [IDS.alternator]: {
    description: 'Recall 01V031000 applies only to certain 1999-2000 2.5L V6 Cougar vehicles with a misrouted or under-torqued battery-to-alternator cable that can short, stall or cause a no-start or fire. It does not establish premature alternator failure across 1999-2002 or support replacing the alternator solely because access is difficult.',
    solution: 'For a 1999-2000 2.5L vehicle, check VIN recall completion and inspect cable routing, insulation, added routing clip and alternator-terminal torque. Then load-test the battery and charging system and voltage-drop-test both cables before condemning the alternator. Do not buy an alternator or battery cable from this page; recall status, diagnosis and build-specific fitment control the repair.',
    symptoms: ['recall completion and cable routing checked', 'battery and charging output load-tested', 'positive and ground voltage drops measured'],
    affectedSystems: ['battery-to-alternator cable', 'charging system', 'alternator and battery'],
    dtcCodes: [],
    conflict: 'The exact recall concerns a cable defect on 1999-2000 2.5L vehicles, not premature alternator failure across 1999-2002.',
    evidence: ['01V031000 identifies cable misrouting and under-torque on 1999-2000 2.5L vehicles.', 'The remedy is cable inspection, routing correction, clip installation and terminal-torque verification.', 'The recall does not establish a recurring alternator-hardware defect.'],
    summary: 'Held the unsupported alternator-failure identity and preserved the exact 01V031 cable safety path.',
  },
  [IDS.suspension]: {
    description: 'The reviewed Cougar manufacturer-communication and recall corpus does not establish rapid ball-joint, strut-rod-bushing and control-arm wear across all 1989-1997 MN12 vehicles. A complaint or community pattern is not a primary-source failure rate, and the frozen record combines several components without an exact population or single repair.',
    solution: 'Perform a loaded steering-and-suspension inspection, measure ball-joint and bushing play against service limits, inspect strut-rod and control-arm bushings, tie rods, wheel bearings, springs, dampers and sway links, and align the vehicle only after the failed components are identified. Do not buy a full front-end kit from this page; position, component and fitment must be confirmed first.',
    symptoms: ['loaded suspension inspection completed', 'play and bushing movement measured', 'failed side and component identified before alignment'],
    affectedSystems: ['front control arms and ball joints', 'strut-rod bushings', 'tie rods, bearings and sway links'],
    dtcCodes: [],
    conflict: 'No exact primary source establishes the frozen multi-component rapid-wear identity or its full year range.',
    evidence: ['The reviewed recall corpus contains no matching MN12 multi-component wear campaign.', 'The reviewed manufacturer communications do not establish the stored rapid-wear frequency.', 'A complete control-arm replacement cannot be prescribed without identifying the failed joint, bushing and position.'],
    summary: 'Held the unsupported multi-component suspension identity and required measured component-level diagnosis.',
  },
});

function citationsFor(id) {
  if (id === IDS.fuelModule) return [clone(OTHER_SOURCES.recalls2002), clone(OTHER_SOURCES.datasets)];
  if (id === IDS.alternator) return [clone(OTHER_SOURCES.recalls2000), clone(OTHER_SOURCES.datasets)];
  return [clone(OTHER_SOURCES.datasets)];
}
function commerceDecisionFor(id) {
  const component = id === IDS.cd4e ? 'CD4E failure path and build-specific repair' : 'failure path, component and fitment';
  return `${component} remain diagnosis-dependent; no universal retail part`;
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before);
  delete frozen.id;
  return {
    ...frozen,
    description: content.description,
    solution: content.solution,
    confidence: RETAIN_IDS.includes(before.id) ? 'medium' : 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems),
    dtcCodes: clone(content.dtcCodes),
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(before.id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mercury' && row.model === 'Cougar')
    .sort((left, right) => left.id.localeCompare(right.id));
  if (frozenRows.length !== 8 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen Cougar coverage does not match the 8-row adjudication contract');
  }
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor({ id: record.id, ...before });
    const retained = RETAIN_IDS.includes(record.id);
    return {
      id: record.id,
      action: retained
        ? 'retain_indexed_identity_and_accuracy_cleanup'
        : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: CONTENT[record.id].conflict,
      reason: retained
        ? 'Exact primary evidence supports the generic indexed identity after bounded technical cleanup.'
        : 'The frozen indexed identity materially exceeds exact primary evidence and remains published pending review.',
      evidence: {
        primaryEvidence: clone(CONTENT[record.id].evidence),
        limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.',
      },
      commerceDecision: commerceDecisionFor(record.id),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mercury',
    model: 'Cougar',
    completionStatement: 'All eight frozen Mercury Cougar pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'Seven frozen identities materially exceed exact evidence; only the generic CD4E identity is eligible for independent approval.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All eight pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'All frozen report counts are zero and remain zero; unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, manufacturer-communication and complaint populations are not converted into owner-report totals.',
      'Campaign 04V421000 is described exactly as a safety-improvement action not conducted under the Safety Act, not an open-ended current free recall remedy.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mercury-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'cougar-cd4e-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Exact CD4E communications support the generic identity while requiring distinct diagnostic paths.' },
      { code: 'cougar-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Seven frozen identities or applicability sets exceed exact primary evidence.' },
      { code: 'cougar-fdm-campaign-bounded', severity: 'safety-accuracy', recordIds: [IDS.fuelModule], detail: '04V421 is a ten-year safety-improvement campaign explicitly not conducted under the Safety Act.' },
      { code: 'cougar-alternator-cable-separated', severity: 'safety-accuracy', recordIds: [IDS.alternator], detail: '01V031 supports a battery-cable defect on 1999-2000 2.5L vehicles, not generic alternator failure.' },
      { code: 'all-cougar-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Cougar page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: {},
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: {
      retain_indexed_identity_and_accuracy_cleanup: RETAIN_IDS.length,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: BLOCKER_IDS.length,
      report_counts_preserved_zero: ALL_IDS.length,
      total: ALL_IDS.length,
    },
    rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  ALL_IDS,
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  CONTENT,
  IDS,
  MODEL_ALIASES,
  OTHER_SOURCES,
  OUTPUT,
  REQUIRED_COMMUNICATION_IDS,
  RETAIN_IDS,
  REVIEW_DATE,
  SEARCH_TERMS,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  proposalFor,
};
