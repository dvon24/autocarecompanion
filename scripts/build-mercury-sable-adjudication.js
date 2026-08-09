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
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mercury-sable-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  cooling: 'mercury-sable-3-0l-vulcan-duratec-head-gasket-intake-timing-cover-gasket-c',
  transmission: 'mercury-sable-ax4n-ax4s-automatic-transmission-premature-failure',
  spring: 'mercury-sable-front-coil-spring-fracture-recall-04v332',
  lean: 'mercury-sable-lean-condition-codes-rough-idle-stalling',
  steering: 'mercury-sable-power-steering-pump-whine-leaks-rack-failure',
  throttle: 'mercury-sable-stuck-throttle-unintended-acceleration-from-fractured-cruise',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.spring, IDS.throttle].sort());
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const MODEL_ALIASES = Object.freeze(['SABLE']);
const SEARCH_TERMS = Object.freeze([
  'coolant', 'head gasket', 'intake gasket', 'timing cover', 'AX4S', 'AX4N', '4F50N',
  'P0732', 'P0734', 'P0741', 'P0760', 'P0763', 'P1744', 'coil spring', '04V332',
  'P0171', 'P0174', 'rough idle', 'power steering', 'rack', 'speed control cable',
  'cruise control', 'throttle', '13B04',
]);
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '50370', '50962', '50998', '51107', '51670', '51734', '51763', '601289',
  '601316', '602158', '6090222', '609053', '613143', '615159', '615372',
  '620222', '625049', '627927', '637556', '10001934', '10002684', '10011157',
  '10011176', '10016806', '10052600', '10056656', '10058102', '10183769', '10205033',
]);
const CAMPAIGNS = Object.freeze([
  '00V240000', '00V242000', '00V396000', '01I011000', '01V075000', '01V078000',
  '01V144000', '01V258000', '01V390000', '02V266000', '03V087000', '04V105000',
  '04V106000', '04V330000', '04V332000', '16E026000', '16V247000', '85V172000',
  '86V039000', '86V144000', '86V148000', '87V017000', '87V139000', '88V190000',
  '89V171000', '90E043001', '91V036000', '91V134000', '92V065000', '92V113000',
  '93V023000', '93V106000', '94E036000', '94V198000', '96V016000', '96V086000',
  '96V166000', '96V176000', '97I003000', '97V019000', '97V025000', '97V097000',
  '98I002000', '98V009000', '98V028000', '98V067000', '98V094000', '98V198000',
  '98V204000', '98V288000', '98V323000', '99V250000',
]);
const PDF_SOURCES = Object.freeze({
  springInvestigation: {
    title: 'NHTSA PE04-044 Close Resume - Front Suspension Coil Spring Fracture',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/inv/2004/INCLA-PE04044-18742P.pdf',
    sha256: '781f05ea1d64adbd5180c5c02468a7389d8c97420e002c691a09211e39abc8f6',
    pageCount: 1,
    visuallyReviewedPages: [1],
  },
  throttleInvestigation: {
    title: 'NHTSA PE12-033 Close Resume - Speed Control Cable Damage',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/inv/2012/INCLA-PE12033-4697.PDF',
    sha256: 'eaa207d5120bad786a5d1de910b15d1361695e3e3e12094b68560b89a12c432b',
    pageCount: 6,
    visuallyReviewedPages: [1, 2, 6],
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: NHTSA_DATASET_URL,
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  searchTerms: SEARCH_TERMS,
  periodCounts: { '1995-1999': 335, '2000-2004': 357, '2005-2009': 39, '2010-2014': 6, '2015-2019': 11, '2020-2024': 2, '2025-2026': 0 },
  totalRows: 750,
  relevantRowCount: 124,
  uniqueRelevantCommunications: 124,
  requiredDocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 105, post: 6 },
  totalRows: 111,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.cooling]: {
    description: 'NHTSA communications 602158, 613143, 615159 and 615372 document coolant contamination, overheating and blown-head-gasket diagnosis on 1996-1997 Sable vehicles, while 627927 identifies intake or engine-vacuum leaks on 1997-2002 vehicles. The reviewed corpus does not establish one combined head-gasket, intake-gasket and timing-cover coolant-leak identity across every frozen 1996-2005 model year.',
    solution: 'Pressure-test the cooling system cold and hot, inspect the exact leak path with dye where appropriate, and use combustion-gas, compression and leak-down testing before cylinder-head work. Separate an external intake, timing-cover, hose or pump leak from combustion sealing, and confirm engine and build data before teardown. Do not buy a head-gasket, intake-gasket or timing-cover kit from this page; the leak location, engine and damage determine the repair.',
    symptoms: ['cooling-system pressure loss and leak path documented', 'combustion-gas, compression and leak-down results recorded', 'external gasket, hose, pump and internal sealing paths separated'],
    affectedSystems: ['3.0L cooling system', 'cylinder-head sealing', 'intake and timing-cover sealing'],
    dtcCodes: [],
    conflict: 'Exact evidence is split between 1996-1997 cooling or head-gasket diagnosis and 1997-2002 air-leak diagnosis; it does not establish the frozen combined 1996-2005 identity.',
    evidence: ['602158, 613143, 615159 and 615372 identify 1996-1997 coolant or head-gasket diagnostic paths.', '627927 identifies 1997-2002 intake or engine-vacuum leaks.', 'No reviewed exact communication supports the combined three-gasket identity through 2005.'],
    summary: 'Held the combined cooling-leak identity and separated exact leak-path diagnosis before any gasket purchase.',
  },
  [IDS.transmission]: {
    description: 'NHTSA communications document distinct AX4S, AX4N and 4F50N conditions rather than one universal premature-failure mechanism: 50998 covers a 1996-1997 AX4S 2-3 concern; 609053 and 6090222 cover 1999 AX4S P0734 or loss of overdrive; 601316 and 10002684 cover P0741/P1744 converter-clutch paths; 620222 covers a 2000-2001 AX4N/4F50N fluid leak; 637556 covers a 1998-2002 3-4 shudder; and 10011157 and 10016806 cover later gear-ratio or harness paths. The primary corpus does not establish the frozen blanket premature-failure claim.',
    solution: 'Identify the transmission by tag and build data, preserve all codes and freeze-frame data, document which gears or engagements are lost, and test fluid level and condition, line pressure, converter slip, solenoid circuits and harness integrity before teardown. Follow the symptom- and unit-specific Ford procedure. Do not buy a transmission, valve body, solenoid, harness or rebuild kit from this page; the failed path and exact unit must be established first.',
    symptoms: ['transmission tag and build data confirmed', 'codes, freeze-frame, gear loss and slip documented', 'hydraulic, electrical, converter and hard-part paths separated'],
    affectedSystems: ['AX4S, AX4N and 4F50N transaxles', 'converter clutch and hydraulic controls', 'shift solenoids, harness and internal hard parts'],
    dtcCodes: ['P0732', 'P0734', 'P0741', 'P0760', 'P0763', 'P1744'],
    conflict: 'The exact corpus supports multiple build- and symptom-specific transmission conditions, not one recurring premature-failure identity across 1996-2005.',
    evidence: ['50998, 609053, 6090222, 601316 and 10002684 identify separate AX4S and converter-clutch paths.', '620222 and 637556 identify separate AX4N/4F50N leak and shudder paths.', '10011157 and 10016806 concern later ratio-code and internal-harness paths.'],
    summary: 'Held the blanket premature-transmission-failure identity and separated exact AX4S, AX4N and 4F50N diagnostic paths.',
  },
  [IDS.spring]: {
    description: 'NHTSA investigation PE04-044 and recall 04V332000 establish corrosion-related front coil-spring fractures on certain 1999-2001 Taurus and Sable vehicles sold or registered in specified salt-belt jurisdictions. A fractured spring can damage or puncture the adjacent tire. The recall remedy installed spring shields; the separate extended spring warranty was limited to ten years or 150,000 miles and is no longer an open-ended current promise.',
    solution: 'Check the VIN and recall-completion history with Ford or a dealer before paid repair. If the recall remains incomplete, arrange the specified dealer remedy; if a spring is already fractured or contacting the tire, stop driving and tow the vehicle for inspection of both front springs, shields, tires and related damage. Confirm current assistance and VIN-specific parts before any paid work. Do not buy a spring or shield from this page; recall status, damage and fitment control the remedy.',
    symptoms: ['VIN and 04V332 completion status checked', 'front springs, shields and adjacent tires inspected', 'fracture or tire contact treated as a stop-driving condition'],
    affectedSystems: ['front coil springs', 'spring shields', 'adjacent front tires'],
    dtcCodes: [],
    conflict: null,
    evidence: ['PE04-044 covers MY1999-2001 Taurus/Sable spring fractures and closes with recall 04V332.', 'More than 75% of reviewed reports alleged a broken spring damaged or punctured the adjacent tire.', 'The recall was geographically bounded; the separate extended warranty was ten years or 150,000 miles.'],
    summary: 'Retained the exact 04V332 spring-fracture identity while bounding geography, current remedy and tire-safety guidance.',
  },
  [IDS.lean]: {
    description: 'NHTSA communications 50370, 627927, 625049 and 10011176 support P0171/P0174 and rough-idle diagnosis on portions of the 1996-2004 Sable range, with vacuum or air leaks and low fuel pressure among possible causes. The reviewed exact corpus does not extend the same evidence to frozen model year 2005 and does not support replacing a MAF sensor, PCV part, EGR part, fuel pump or idle-air component without diagnosis.',
    solution: 'Preserve P0171/P0174 freeze-frame data and compare short- and long-term fuel trims at idle and under load. Smoke-test the intake and crankcase-ventilation paths, verify fuel pressure and volume, and compare MAF data and oxygen-sensor response before choosing a repair. Do not buy a MAF sensor, PCV part, EGR part, fuel pump or idle-air valve from this page; the lean source and model-year applicability remain unresolved.',
    symptoms: ['P0171/P0174 and freeze-frame preserved', 'fuel trims compared at idle and load', 'air-leak, fuel-pressure, MAF and sensor-response paths separated'],
    affectedSystems: ['intake and crankcase ventilation', 'fuel delivery and metering', 'MAF and oxygen-sensor feedback'],
    dtcCodes: ['P0171', 'P0174'],
    conflict: 'Exact communications support portions of 1996-2004, not the full frozen 1996-2005 range or a universal replacement part.',
    evidence: ['50370 identifies 1996 P0171/P0174 with vacuum-leak and low-fuel-pressure paths.', '627927 and 625049 cover 1997-2002 intake or rough-idle paths.', '10011176 covers 2002-2004 P0171/P0174 diagnosis; no reviewed exact record extends the claim to 2005.'],
    summary: 'Held the overbroad lean-code identity and required measured air, fuel and sensor diagnosis before parts.',
  },
  [IDS.steering]: {
    description: 'NHTSA communications 50962, 51107, 51670, 51734, 51763 and 601289 document steering groan, moan, reduced assist or service procedures on portions of the 1996-1998 Sable range. The reviewed exact corpus does not establish recurring pump leaks and steering-rack failure across every frozen 1996-2009 model year.',
    solution: 'Verify fluid level and condition and inspect for aeration and the exact leak source, then test belt drive, hose restriction, pump pressure and flow, steering effort, rack boots and inner seals before condemning a component. Do not buy a pump, rack, pressure hose or seal kit from this page; the noise or leak source and generation-specific fitment remain unresolved.',
    symptoms: ['fluid level, aeration and exact leak source documented', 'pump pressure, flow and steering effort tested', 'hose, pump and rack paths separated'],
    affectedSystems: ['power-steering pump and reservoir', 'pressure and return hoses', 'steering rack and seals'],
    dtcCodes: [],
    conflict: 'Exact primary support is concentrated in 1996-1998 noise or assist concerns and does not establish the frozen pump-leak and rack-failure identity through 2009.',
    evidence: ['50962, 51107, 51670, 51734, 51763 and 601289 document 1996-1998 steering noise or assist paths.', 'Those communications do not establish universal pump or rack replacement.', 'No reviewed exact source supports the full 1996-2009 recurring-failure population.'],
    summary: 'Held the multi-component steering identity and required exact leak, pressure and assist diagnosis before parts.',
  },
  [IDS.throttle]: {
    description: 'NHTSA investigation PE12-033 and Ford Customer Satisfaction Program 13B04 establish speed-control-cable collar damage on certain 2000-2003 Taurus and Sable vehicles equipped with the 3.0L 4V Duratec engine and built at the Chicago assembly plant. Damage or partial disconnection during underhood maintenance can prevent full return to idle; this evidence does not apply to every engine or build in the frozen years.',
    solution: 'If the throttle sticks, shift to neutral, apply steady firm braking, steer to a safe stop and switch the engine off only after control is secured. Check VIN, engine, plant and CSP 13B04 history, then inspect both collar retention tabs and cable ferrule. The program called for replacing a cable with a missing tab and installing a reinforcement clip. Do not buy a speed-control cable or clip from this page; affected-build status, current assistance and exact fitment must be confirmed first.',
    symptoms: ['stuck or high-idle event treated as an immediate safety condition', 'VIN, 3.0L 4V Duratec and Chicago-build applicability checked', 'collar tabs, ferrule position and prior 13B04 work inspected'],
    affectedSystems: ['speed-control cable collar', 'cable ferrule and retention tabs', 'throttle return to idle'],
    dtcCodes: [],
    conflict: null,
    evidence: ['PE12-033 identifies MY2000-2003 Taurus/Sable vehicles with Duratec engines.', '13B04 was limited to certain 3.0L 4V Duratec vehicles built at Chicago.', 'Ford instructed inspection, cable replacement for missing tabs and reinforcement-clip installation.'],
    summary: 'Retained the exact speed-control-cable identity while bounding engine, plant, VIN, safety response and repair fitment.',
  },
});

function citationsFor(id) {
  if (id === IDS.spring) return [clone(PDF_SOURCES.springInvestigation), clone(OTHER_SOURCES.datasets)];
  if (id === IDS.throttle) return [clone(PDF_SOURCES.throttleInvestigation), clone(OTHER_SOURCES.datasets)];
  return [clone(OTHER_SOURCES.datasets)];
}
function commerceDecisionFor(id) {
  if (id === IDS.spring) return 'recall completion, current assistance, damage and VIN-specific spring or shield fitment remain unresolved; no universal retail part';
  if (id === IDS.throttle) return '13B04 applicability, current assistance and VIN-specific cable or clip fitment remain unresolved; no universal retail part';
  return 'failure path, component and fitment remain diagnosis-dependent; no universal retail part';
}
function proposalFor(before) {
  const content = CONTENT[before.id];
  const frozen = clone(before);
  delete frozen.id;
  return {
    ...frozen,
    description: content.description,
    solution: content.solution,
    confidence: RETAIN_IDS.includes(before.id) ? 'high' : 'low',
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
    .filter((row) => row.make === 'Mercury' && row.model === 'Sable')
    .sort((left, right) => left.id.localeCompare(right.id));
  if (frozenRows.length !== 6 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) {
    throw new Error('Frozen Sable coverage does not match the 6-row adjudication contract');
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
        ? 'Exact primary evidence supports the indexed identity after bounded technical cleanup.'
        : 'The frozen indexed identity or applicability materially exceeds exact primary evidence and remains published pending review.',
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
    model: 'Sable',
    completionStatement: 'All six frozen Mercury Sable pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'Four frozen identities or applicability sets exceed exact evidence; the spring recall and speed-control-cable identities are eligible for independent approval.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All six pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'All frozen report counts are zero and remain zero; unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, investigation, manufacturer-communication and complaint populations are not converted into owner-report totals.',
      'Recall 04V332 is geographically bounded and CSP 13B04 is engine-, plant- and VIN-dependent; neither is presented as an open-ended universal free remedy.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic or VIN-fitment boundary.',
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
      { code: 'sable-safety-identities-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Exact NHTSA investigation evidence supports the bounded spring-fracture and speed-control-cable identities.' },
      { code: 'sable-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Four frozen identities or applicability sets exceed exact primary evidence.' },
      { code: 'sable-04v332-geography-bounded', severity: 'safety-accuracy', recordIds: [IDS.spring], detail: '04V332 is limited to certain salt-belt sale or registration jurisdictions and an expired extended-warranty window.' },
      { code: 'sable-13b04-build-bounded', severity: 'safety-accuracy', recordIds: [IDS.throttle], detail: '13B04 applies to certain 3.0L 4V Duratec Chicago-built vehicles, not every 2000-2003 Sable.' },
      { code: 'all-sable-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Sable page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
    ],
    pdfSources: clone(PDF_SOURCES),
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
  PDF_SOURCES,
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
