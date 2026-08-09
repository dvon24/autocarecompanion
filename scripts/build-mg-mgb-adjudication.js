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

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mg-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mg-mgb-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  charging: 'mg-mgb-lucas-charging-system-weak-dynamo-positive-earth-wiring',
  cooling: 'mg-mgb-marginal-cooling-old-radiator-smog-era-heat-soak-cause-overh',
  sill: 'mg-mgb-sill-rocker-rot-structural-cancer-that-lets-body-sag',
  scrollSeal: 'mg-mgb-three-main-bearing-rear-scroll-seal-always-weeps-oil',
  gearbox: 'mg-mgb-weak-three-synchro-gearbox-2nd-gear-crunch-layshaft-wear',
  dampers: 'mg-mgb-worn-lever-arm-dampers-let-front-rear-float',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.dampers]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const MODEL_ALIASES = Object.freeze(['MGB']);
const SEARCH_TERMS = Object.freeze([
  'dynamo', 'positive earth', 'charging', 'radiator', 'cooling', 'overheat', 'sill',
  'rocker', 'corrosion', 'rear main', 'scroll seal', 'gearbox', 'layshaft', 'synchro',
  'damper', 'shock absorber',
]);
const CAMPAIGNS = Object.freeze([
  '68V055000', '69V024000', '72V010000', '74V094000',
  '78V089000', '78V164000', '82V072000', '85V059000',
]);
const PDF_SOURCES = Object.freeze({
  workshopManual: {
    title: 'Leyland Cars MGB Workshop Manual - Publication AKD 3259, 14th Edition',
    type: 'manufacturer',
    url: 'https://www.canevet.org/IMG/pdf/mgb_workshop_manual_ocr_index.pdf',
    sha256: 'b5cbb32f62fbc04ca022cc88982ef5bef2f80f66630ea63c3608bb80016adbf5',
    pageCount: 417,
    visuallyReviewedPages: [1, 51, 58, 91, 130, 132, 247, 248, 269, 271, 380],
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
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
  totalRows: 0,
  relevantRowCount: 0,
  uniqueRelevantCommunications: 0,
  requiredDocumentIds: [],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 16, post: 0 },
  totalRows: 16,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  scopeFinding: 'The eight MGB campaigns concern brake-warning switch leakage, tire markings, glove-box lock compliance, fan clearance, carburetor leakage, overdrive wiring, VIN labels and seat belts; none establishes one of the six frozen issue identities.',
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const CONTENT = Object.freeze({
  [IDS.charging]: {
    description: 'The Leyland AKD 3259 workshop manual confirms that early MGB electrical systems were 12-volt positive-earth and later systems were negative-earth, and it gives separate on-car tests for the dynamo, belt, wiring and control box. It does not establish a recurring weak-dynamo failure rate or make positive-earth wiring a defect, and the frozen year list crosses changing electrical configurations.',
    solution: 'Identify the car number, present polarity and whether the car still uses a dynamo and control box or has been converted to an alternator. Load-test the batteries, inspect belt tension, measure voltage drop and grounds, and follow the manual dynamo output, field, brush and control-box tests before changing hardware. Do not buy a dynamo, alternator, control box, wiring harness or polarity-conversion kit from this page; configuration, diagnosis and conversion history determine the repair.',
    symptoms: ['car number, polarity and charging-device configuration recorded', 'battery, belt, grounds and voltage drop tested', 'dynamo, wiring and control-box paths separated'],
    affectedSystems: ['12-volt charging system', 'dynamo or alternator', 'control box, batteries and wiring'],
    dtcCodes: [],
    conflict: 'The official manual supports distinct early and later configurations and diagnostic procedures, not the frozen weak-dynamo or positive-earth-defect identity across its year set.',
    evidence: ['AKD 3259 page 269 distinguishes early positive-earth from later negative-earth systems.', 'Pages 271-272 specify belt, dynamo, brush, field, armature, wiring and control-box tests.', 'No NHTSA manufacturer communication exists for MGB, and no reviewed recall establishes this recurring identity.'],
    summary: 'Held the weak-dynamo and positive-earth-defect identity while preserving configuration-specific factory diagnosis.',
  },
  [IDS.cooling]: {
    description: 'The Leyland AKD 3259 manual provides different cooling-system procedures and components for early and later MGB cars, including flushing, radiator, thermostat, water-pump and electric-fan service by car number. It does not establish that the cooling system is inherently marginal, that an old radiator is the cause on every listed year, or that smog-era heat soak is one primary failure mechanism.',
    solution: 'Confirm the car number and current cooling configuration, then pressure-test the system and cap, verify coolant level and mixture, thermostat operation, water-pump circulation, fan operation and belt condition, and measure radiator temperature drop and flow. Check ignition timing, mixture and exhaust restriction before attributing heat to the radiator. Do not buy a radiator, water pump, thermostat, fan or conversion kit from this page; the measured failure and exact configuration determine the repair.',
    symptoms: ['car number and early or later cooling configuration confirmed', 'pressure, cap, flow, thermostat and fan operation tested', 'cooling fault separated from ignition, fueling and exhaust heat'],
    affectedSystems: ['radiator and coolant circuit', 'thermostat and water pump', 'belt-driven or electric fan system'],
    dtcCodes: [],
    conflict: 'Factory service procedures do not establish the frozen marginal-cooling, old-radiator and smog-heat mechanism across 1968-1980.',
    evidence: ['AKD 3259 pages 84 and 91-96 separate early and later cooling procedures by car number.', 'The manual specifies flushing, leak checks, radiator, pump, thermostat and fan tests rather than one universal cause.', 'The reviewed MGB recall corpus does not establish the frozen recurring overheating identity.'],
    summary: 'Held the marginal-cooling identity and replaced parts-first advice with configuration-specific heat diagnosis.',
  },
  [IDS.sill]: {
    description: 'The Leyland AKD 3259 body section treats the sill as a structural datum and seat-belt anchorage area and publishes body-alignment dimensions. The reviewed official material does not establish a recurring sill or rocker corrosion rate, the frozen "structural cancer" characterization, or body sag across every 1962-1980 MGB.',
    solution: 'Before purchase or repair, have the body supported correctly and inspect the outer and inner sill structure, floor interfaces, jacking areas and seat-belt anchorage for perforation, previous patches and distortion. Check door gaps and compare body datum measurements before cutting structural panels. Do not buy a sill, rocker or complete body-panel kit from this page; corrosion extent, body alignment and Tourer-versus-GT structure must be established by a qualified repairer first.',
    symptoms: ['inner and outer sill structure inspected for perforation and prior patches', 'door gaps and body datum measurements checked', 'seat-belt anchorage and floor interfaces assessed before cutting'],
    affectedSystems: ['structural sill and rocker area', 'floor and body alignment', 'seat-belt sill anchorage'],
    dtcCodes: [],
    conflict: 'The official manual establishes structural locations and dimensions, not the frozen recurrence, "cancer" or universal body-sag claim.',
    evidence: ['AKD 3259 page 372 locates the seat-belt anchorage in the sill.', 'Page 380 uses the bottom sill as a body-alignment datum.', 'No reviewed primary source establishes a model-wide corrosion frequency or universal panel replacement.'],
    summary: 'Held the unsupported structural-corrosion frequency claim and required measured body assessment before panels.',
  },
  [IDS.scrollSeal]: {
    description: 'The Leyland AKD 3259 engine section specifies sealing the rear main-bearing-cap horizontal joints and separately identifies a rear engine-mounting-plate oil seal on 18GB engines. It does not state that every early three-main-bearing engine "always" leaks, and the frozen page does not distinguish a rear-cap joint, sump, breather-related leak or another oil source.',
    solution: 'Confirm the engine prefix and whether the installed engine is the original three-main unit, clean the area, verify oil level and crankcase ventilation, and use dye or tracing powder to identify the highest wet point before engine removal. Measure crankshaft condition and inspect cap joints, sump and adjacent sources during teardown. Do not buy a scroll-seal conversion, rear-seal kit, sump gasket or engine assembly from this page; engine identity and the proven leak path determine the repair.',
    symptoms: ['engine prefix and three-main or 18GB configuration confirmed', 'oil level, crankcase ventilation and highest leak point documented', 'rear-cap, sump and adjacent leak paths separated'],
    affectedSystems: ['rear main-bearing-cap joints', 'crankcase ventilation and oil control', 'rear engine plate and sump sealing'],
    dtcCodes: [],
    conflict: 'The factory manual does not support the absolute "always weeps" claim or prove the frozen scroll-seal mechanism for every listed car.',
    evidence: ['AKD 3259 page 51 specifies jointing compound on rear main-bearing-cap horizontal joints.', 'Page 58 separately identifies a rear engine-mounting-plate oil seal on 18GB engines.', 'The manual does not characterize all three-main engines as inevitably leaking.'],
    summary: 'Held the absolute scroll-seal claim and required engine-prefix and leak-source proof before a conversion kit.',
  },
  [IDS.gearbox]: {
    description: 'The Leyland AKD 3259 manual confirms that the early gearbox synchronizes second, third and top gears while first and reverse are sliding gears, and it gives separate inspection procedures for baulk rings, layshaft, laygear, needle bearings, bushes and end-float. It does not establish that the gearbox is inherently weak or that second-gear crunch and layshaft wear are one recurring failure across every frozen year.',
    solution: 'Identify the gearbox and overdrive configuration, verify the specified oil level and clutch release, and reproduce the symptom by gear, temperature, load and coast condition. Check linkage and detents before teardown; during overhaul measure laygear end-float and inspect the second-gear baulk ring, bushes, layshaft, laygear and needle bearings individually. Do not buy a synchro set, layshaft, laygear or rebuild kit from this page; gearbox identity and measured component wear determine the repair.',
    symptoms: ['gearbox and overdrive configuration identified', 'oil level, clutch release and shift linkage checked', 'baulk-ring, layshaft, bearing, bush and end-float wear measured separately'],
    affectedSystems: ['three-synchro gearbox', 'second-gear baulk ring and bushes', 'layshaft, laygear and needle bearings'],
    dtcCodes: [],
    conflict: 'The factory manual supports component inspection and service, not the frozen weak-gearbox frequency or one combined second-gear and layshaft mechanism.',
    evidence: ['AKD 3259 page 130 describes synchromesh on second, third and top gears.', 'Pages 129 and 131-134 identify layshaft, laygear, bearings, baulk rings and end-float checks.', 'The manual does not call the unit weak or establish a recurring failure population.'],
    summary: 'Held the weak-gearbox identity while separating clutch, baulk-ring, layshaft and bearing diagnosis.',
  },
  [IDS.dampers]: {
    description: 'The Leyland AKD 3259 manual identifies Armstrong double-acting lever-arm dampers at the front and rear. It says erratic resistance or free body movement requires the damper to be removed, checked and topped up; if fluid does not restore resistance, the damper should be replaced. This supports the generic worn or ineffective lever-arm-damper identity but not a universal failure rate.',
    solution: 'Inspect each damper for leakage and secure mountings, bounce each corner for uniform resistance, and check links, bushes, springs and tires before blaming the damper. If resistance is erratic or free, remove the unit upright, check fluid and work the arm through its stroke to expel air; replace the damper only if correct fluid does not restore moderate, even resistance. Do not buy a front or rear damper from this page; failed position, linkage condition and exact fitment must be confirmed first.',
    symptoms: ['corner-specific bounce and resistance compared', 'leakage, mounting, link and bush condition inspected', 'bench resistance rechecked after correct fluid and air purge'],
    affectedSystems: ['front and rear lever-arm dampers', 'damper links and mountings', 'front coil and rear leaf spring control'],
    dtcCodes: [],
    conflict: null,
    evidence: ['AKD 3259 page 247 identifies Armstrong double-acting front and rear dampers and the prescribed inspection.', 'Pages 247-248 specify bounce and bench resistance tests, topping-up and replacement only if fluid gives no improvement.', 'No failure frequency or owner count is inferred.'],
    summary: 'Retained the factory-supported ineffective lever-arm-damper identity with position-specific tests and no universal part.',
  },
});

function citationsFor() {
  return [clone(PDF_SOURCES.workshopManual), clone(OTHER_SOURCES.datasets)];
}
function commerceDecisionFor(id) {
  if (id === IDS.dampers) return 'failed damper position, linkage condition and exact fitment remain unresolved; no universal retail part';
  return 'configuration, failure path, component and fitment remain diagnosis-dependent; no universal retail part';
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
    .filter((row) => row.make === 'MG' && row.model === 'MGB')
    .sort((left, right) => left.id.localeCompare(right.id));
  if (frozenRows.length !== 6 || frozenRows.map((row) => row.id).join('|') !== ALL_IDS.join('|')) throw new Error('Frozen MGB coverage does not match the 6-row adjudication contract');
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor({ id: record.id, ...before });
    const retained = RETAIN_IDS.includes(record.id);
    return {
      id: record.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: CONTENT[record.id].conflict,
      reason: retained
        ? 'The factory workshop manual supports the generic indexed identity after bounded technical cleanup.'
        : 'The frozen indexed identity materially exceeds the exact factory and federal primary evidence and remains published pending review.',
      evidence: { primaryEvidence: clone(CONTENT[record.id].evidence), limitations: 'No owner-frequency rate, repair price, universal mechanism or retail fitment is inferred.' },
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
    make: 'MG',
    model: 'MGB',
    completionStatement: 'All six frozen MG MGB pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: BLOCKER_IDS,
      reason: 'Five frozen identities materially exceed exact evidence; only the generic ineffective lever-arm-damper identity is eligible for independent approval.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      'All six pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'All frozen report counts are zero and remain zero; unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'Recall, campaign, manual procedure and complaint populations are not converted into owner-report totals or recurrence rates.',
      'Factory service instructions are used to bound diagnosis; they are not treated as proof that a failure is common.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic or configuration boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: 'data/_mg-deeplink-snapshot-2026-08-09.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: [
      { code: 'mgb-damper-identity-retained', severity: 'accuracy-cleanup', recordIds: RETAIN_IDS, detail: 'Factory pages 247-248 support the generic ineffective lever-arm-damper identity and exact test sequence.' },
      { code: 'mgb-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Five frozen frequency, mechanism or applicability claims exceed exact primary evidence.' },
      { code: 'mgb-recall-corpus-nonmatching', severity: 'source-scope', recordIds: ALL_IDS, detail: 'Eight federal MGB campaigns exist, but none establishes one of the six frozen identities.' },
      { code: 'all-mgb-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No MGB page is removed, merged, redirected or allowed to lose its indexed identity while reviewed.' },
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

module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, CONTENT, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RETAIN_IDS, REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
