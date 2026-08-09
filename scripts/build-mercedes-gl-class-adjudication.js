/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./known-issue-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercedes-benz-gl-class-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  suspension: 'mercedes-gl-class-air-suspension-compressor-2007',
  oilCooler: 'mercedes-gl-class-om642-oil-cooler-leak-2007',
  tailgate: 'mercedes-gl-class-tailgate-strut-failure-2007',
  transferCase: 'mercedes-gl-class-transfer-case-actuator-2007',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const BLOCKER_IDS = ALL_IDS;
const FABRICATED_REPORT_COUNT_IDS = ALL_IDS;
const MODEL_ALIASES = Object.freeze([
  'GL-CLASS', 'GL CLASS', 'GL320', 'GL 320', 'GL350', 'GL 350', 'GL450', 'GL 450',
  'GL550', 'GL 550', 'GL63 AMG', 'GL 63 AMG', 'AMG GL63', 'AMG GL 63',
]);
const SEARCH_TERMS = Object.freeze([
  'AIRMATIC', 'air suspension', 'compressor', 'level control', 'OM642', 'oil cooler',
  'oil leak', 'seal', 'tailgate', 'liftgate', 'strut', 'latch', 'transfer case',
  'actuator', 'chain', '4MATIC',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10023232', '10028024', '10028625', '10032727', '10038024', '10166980',
  '11005331', '11010455', '11025100', '11028270',
]);
const CAMPAIGNS = Object.freeze([
  '13V166000', '14V158000', '16V081000', '16V900000', '16V903000', '17V081000',
  '17V177000', '17V241000', '18V272000', '19V787000', '22V315000', '24V298000',
]);
const OTHER_SOURCES = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa', url: NHTSA_DATASET_URL,
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, searchTerms: SEARCH_TERMS,
  periodCounts: {
    '1995-1999': 0, '2000-2004': 0, '2005-2009': 70, '2010-2014': 204,
    '2015-2019': 83, '2020-2024': 190, '2025-2026': 163,
  },
  totalRows: 710, relevantRowCount: 114, uniqueRelevantCommunications: 35,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 169 },
  totalRows: 169, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const CONTENT = Object.freeze({
  [IDS.suspension]: {
    description: 'Communication 10028024 directly supports a narrow GL-Class air-suspension compressor condition on model-year 2006-2008 GL 320, GL 450 and GL 550 vehicles: damage to the compressor pressure disk can cause insufficient air pressure, and the compressor is checked and replaced if necessary. Communications 10032727 and 10038024 instead identify defective drain-valve wiring. These records do not establish the frozen 2007-2016 five-trim population, overwork from air-spring leaks, a vehicle-weight mechanism or universal compressor, relay and air-spring replacement.',
    solution: 'Document vehicle level, compressor operation and all AIRMATIC faults. Check the exact pressure-disk, drain-valve wiring, relay, power supply and air-leak paths under the VIN-specific Mercedes procedure before identifying a failed component. Do not buy a compressor, relay or air spring from this page; the condition and fitment are not universal.',
    symptoms: ['vehicle level and compressor operation documented', 'AIRMATIC faults preserved', 'pressure, wiring and leak paths tested separately'],
    affectedSystems: ['AIRMATIC compressor', 'air-suspension pressure supply', 'drain-valve wiring'],
    conflict: 'Exact 2006-2008 compressor and wiring records are much narrower than the frozen 2007-2016 five-trim failure identity.',
    evidence: ['10028024 identifies compressor pressure-disk damage on 2006-2008 GL 320/450/550 vehicles.', '10032727/10038024 identify drain-valve wiring faults, not compressor overwork.', 'No exact source supports the frozen air-spring-leak mechanism, later years or stored 1,800-owner total.'],
    summary: 'Bounded the exact early compressor evidence and held the overbroad years, trims, mechanism, aftermarket and owner-count claims.',
  },
  [IDS.oilCooler]: {
    description: 'Communication 10166980 supports traces of oil in the inner-V oil-cooler area on engine 642 for model-year 2013-2015 GL 350 vehicles. It does not establish the frozen 2007-2016 GL 320 / GL 350 population, oil entering the coolant, overheating, head-gasket damage, thermostat replacement or replacement of the whole oil-cooler assembly. An external inner-V oil trace cannot be expanded into coolant contamination or a universal ten-year remedy without exact evidence.',
    solution: 'Clean and locate the oil source, confirm the OM642 variant and pressure-test the lubrication and cooling systems separately. Check whether oil is external, in the intake path or actually present in coolant before selecting a repair. Do not buy oil-cooler seals, an oil cooler, thermostat or coolant parts from this page; the leak path and fitment are not established across the frozen population.',
    symptoms: ['oil source cleaned and documented', 'engine variant confirmed', 'external oil and coolant contamination tested separately'],
    affectedSystems: ['OM642 oil cooler', 'inner-V oil sealing', 'engine cooling system'],
    conflict: 'The exact 2013-2015 GL 350 oil-trace record is narrower than the frozen ten-year identity and does not support coolant/head-gasket claims.',
    evidence: ['10166980 states only traces of oil in the oil-cooler inner-V area on engine 642.', 'Its listed applicability is 2013-2015 GL 350.', 'No exact source supports oil-in-coolant, overheating, head-gasket damage or the stored 1,200-owner total.'],
    summary: 'Held the overbroad oil-cooler identity and separated exact inner-V oil traces from unsupported coolant and engine-damage claims.',
  },
  [IDS.tailgate]: {
    description: 'The reviewed GL-Class corpus does not establish frozen gas-strut and electric-latch failure across model years 2007-2016. Communication 10028625 concerns a 2008 rear-SAM software condition in which opening or closing the tailgate by remote while locked can drain the battery; it does not identify weak gas struts, a dropping tailgate or latch wear. No exact record supports replacing struts in pairs, a lock actuator, periodic lubrication, Stabilus fitment or the stored owner total.',
    solution: 'Document whether the tailgate drops, will not stay open, fails to unlatch, reverses or causes a battery draw. Test the gas supports, hinges, latch, wiring, rear SAM and remote-command behavior separately under the VIN-specific procedure. Do not buy gas struts, a latch, lock actuator or control module from this page; the failure path and fitment are not established.',
    symptoms: ['drop, unlatch, reversal and battery-draw behaviors separated', 'mechanical supports and latch inspected', 'rear-SAM and remote commands tested'],
    affectedSystems: ['tailgate gas supports', 'tailgate latch', 'rear SAM and remote control'],
    conflict: 'The exact tailgate-related record is a 2008 software/battery-drain condition, not the frozen strut-and-latch failure identity.',
    evidence: ['10028625 concerns rear-SAM rest-current logic after remote tailgate operation.', 'It does not identify gas-strut pressure loss, dropping or latch wear.', 'No exact source supports aftermarket Stabilus fitment or the stored 520-owner total.'],
    summary: 'Held the unsupported strut/latch identity and separated the exact rear-SAM battery-drain condition from mechanical tailgate diagnosis.',
  },
  [IDS.transferCase]: {
    description: 'The reviewed GL-Class records do not establish frozen transfer-case actuator and chain wear across model years 2007-2016. Communication 10023232 concerns fault 2950 and a low-range service message on off-road-package GL 450 vehicles produced only through June 2006, outside the frozen starting year. Later communications 11005331, 11010455, 11025100 and 11028270 are listed for 2017 vehicles and identify modified transfer-case oil quality causing light-load vibration, not chain stretch, bearing wear or actuator failure. None supports one decade-wide hardware identity.',
    solution: 'Record the exact warning, noise, load, speed and temperature and preserve transfer-case and drivetrain faults. Confirm hardware and production date, then separate low-range control, oil-quality vibration, actuator, chain, bearing and adjacent driveline paths. Do not buy an actuator, chain, bearing, transfer case or fluid kit from this page; the frozen failure identity and fitment are not established.',
    symptoms: ['warning and operating conditions documented', 'production date and transfer-case hardware confirmed', 'control, oil and mechanical paths separated'],
    affectedSystems: ['4MATIC transfer case', 'low-range control', 'transfer-case oil and mechanical drive'],
    conflict: 'Exact records either fall outside the frozen years or describe oil-quality vibration, not the frozen actuator/chain-wear identity.',
    evidence: ['10023232 is limited to off-road-package GL 450 production through June 2006.', '11005331/11010455/11025100/11028270 are listed for 2017 and identify modified oil quality.', 'No exact source supports the stored chain/actuator mechanism, 40,000-mile interval or 680-owner total.'],
    summary: 'Held the actuator/chain identity and separated out-of-range low-range control and later oil-quality evidence.',
  },
});

function citationsFor() {
  return [{
    url: OTHER_SOURCES.datasets.url, type: OTHER_SOURCES.datasets.type,
    title: OTHER_SOURCES.datasets.title,
  }];
}
function commerceDecisionFor(id) {
  const values = {
    [IDS.suspension]: 'AIRMATIC condition and compressor fitment are unresolved; no universal retail part',
    [IDS.oilCooler]: 'oil-leak path and OM642 fitment are unresolved; no universal retail part',
    [IDS.tailgate]: 'tailgate failure path and component fitment are unresolved; no universal retail part',
    [IDS.transferCase]: 'transfer-case failure identity and fitment are unresolved; no universal retail part',
  };
  return values[id];
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before); delete frozen.id;
  return {
    ...frozen, description: content.description, solution: content.solution, confidence: 'low',
    symptoms: clone(content.symptoms), affectedSystems: clone(content.affectedSystems),
    dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, citations: citationsFor(),
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}
function buildPacket(snapshot) {
  const frozenRows = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz' && row.model === 'GL-Class')
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 4 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen GL-Class coverage does not match the 4-row adjudication contract');
  }
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor({ id: record.id, ...before });
    return {
      id: record.id,
      action: 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: true, identityConflict: CONTENT[record.id].conflict,
      reason: 'The frozen identity or applicability materially exceeds exact primary evidence and remains published pending review.',
      evidence: {
        primaryEvidence: clone(CONTENT[record.id].evidence),
        limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.',
      },
      commerceDecision: commerceDecisionFor(record.id), before, beforeSha256: hashValue(before),
      proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mercedes-Benz', model: 'GL-Class',
    completionStatement: 'All four frozen GL-Class pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked', blockerRecordIds: BLOCKER_IDS,
      reason: 'All four identities or frozen applicability fields materially exceed exact evidence; no catalog write is authorized before independent review.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All four pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The unsupported 1,800-, 1,200-, 520- and 680-owner totals are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign and manufacturer-communication populations are not converted into owner-report totals.',
      'No PDF is selected because no exact reviewed PDF supports any frozen full-scope identity; evidence is frozen to row-level NHTSA datasets.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mercedes-benz-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'gl-class-all-identities-held', severity: 'identity-hold', recordIds: ALL_IDS, detail: 'Every frozen title or applicability set exceeds the exact row-level primary evidence.' },
      { code: 'gl-class-tailgate-condition-separated', severity: 'accuracy-cleanup', recordIds: [IDS.tailgate], detail: 'The exact tailgate record is a 2008 rear-SAM battery-drain condition, not gas-strut or latch failure.' },
      { code: 'gl-class-transfer-evidence-out-of-range', severity: 'scope-conflict', recordIds: [IDS.transferCase], detail: 'Exact low-range evidence ends in June 2006, while later oil-quality records are listed for 2017; neither supports frozen 2007-2016 chain/actuator wear.' },
      { code: 'gl-class-report-counts-proposed-zero', severity: 'accuracy-correction', recordIds: ALL_IDS, detail: 'All four positive owner totals lack reviewed owner-report sources and are proposal-only zero corrections.' },
      { code: 'all-gl-class-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No GL-Class page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: {}, otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: {
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 4,
      fabricated_report_counts_proposed_zero: 4, total: 4,
    },
    rows,
  };
}

if (require.main === module) {
  const packet = buildPacket(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({
    output: OUTPUT, rows: packet.rows.length, summary: packet.summary,
    applicationGate: packet.applicationGate,
  }, null, 2));
}
module.exports = {
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS,
  IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE,
  SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor,
};
