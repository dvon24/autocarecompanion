/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-miata-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['MIATA', 'MX-5', 'MX5', 'MX-5 MIATA', 'MX 5 MIATA']);
const SEARCH_TERMS = Object.freeze([
  'slave', 'clutch', 'hydraulic', 'convertible', 'soft top', 'rear window', 'zipper',
  'crank angle', 'cam angle', 'o-ring', 'oil leak', 'valve cover', 'thrust', 'end play',
  'endplay', 'keyway', 'crankshaft', 'rust', 'corrosion', 'frame rail', 'rocker',
]);

const IDS = Object.freeze({
  slave: 'mazda-miata-clutch-slave-cylinder-hydraulic-failure',
  top: 'mazda-miata-convertible-top-rear-plastic-window-cracking-zipper-failure',
  oil: 'mazda-miata-crank-angle-sensor-o-ring-valve-cover-gasket-oil-leaks',
  thrust: 'mazda-miata-crankshaft-thrust-bearing-failure',
  shortNose: 'mazda-miata-short-nose-crankshaft-keyway-wear',
  rust: 'mazda-miata-structural-rust-rear-rocker-panels-front-frame-rails',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([]);
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '52995', '603880', '605848', '615640', '634361', '10002064', '10002352',
  '10003940', '11035599',
]);
const CAMPAIGNS = Object.freeze([
  '00V004000', '00V032000', '03V206000', '06E026000', '06V103000', '19V072000',
  '19V496000', '21V875000', '24V695000', '25V336000', '91V079000', '92V159000',
  '98V066000',
]);
const PDF_SOURCES = Object.freeze({});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 46, '2000-2004': 31, '2005-2009': 20, '2010-2014': 15, '2015-2019': 440, '2020-2024': 346, '2025-2026': 93 },
  totalRows: 991,
  searchTerms: SEARCH_TERMS,
  relevantPre2006DocumentIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 25, post: 18 },
  totalRows: 43,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.slave]: [OTHER_SOURCES.datasets],
    [IDS.top]: [OTHER_SOURCES.datasets],
    [IDS.oil]: [OTHER_SOURCES.datasets],
    [IDS.thrust]: [OTHER_SOURCES.datasets],
    [IDS.shortNose]: [OTHER_SOURCES.datasets],
    [IDS.rust]: [OTHER_SOURCES.datasets],
  };
  if (!map[id]) throw new Error(`Unexpected Miata row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.slave]: {
      confidence: 'low',
      description: 'The complete reviewed Mazda/NHTSA inventory did not establish a recurring 1990-2005 Miata clutch-slave-cylinder seal defect, a model-wide failure rate, or the frozen assertion that a clutch hydraulic leak changes brake-pedal feel through a shared reservoir. A soft clutch pedal, difficulty selecting a gear, or visible hydraulic fluid still requires diagnosis, but those symptoms do not by themselves identify the slave cylinder rather than the master cylinder, line, hose, clutch assembly, or transmission.',
      solution: 'Inspect the clutch hydraulic circuit for the actual leak and verify pedal travel, fluid condition, master-cylinder operation, slave-cylinder travel, hose condition and clutch release before replacing anything. Treat brake-system symptoms as a separate safety diagnosis. Do not buy a slave cylinder, master cylinder, hose, clutch kit or fluid from this page; the failed component and vehicle-specific fitment have not been established.',
      symptoms: ['soft or sinking clutch pedal', 'difficulty engaging or disengaging a gear', 'visible fluid at a clutch hydraulic component'],
      summary: 'Removed unsupported prevalence, shared-reservoir, price and bleeding claims and held the broad slave-cylinder identity pending independent review.',
    },
    [IDS.top]: {
      confidence: 'low',
      description: 'Mazda communications for the frozen 1990-1997 population address a vibrating soft-top boot hook and a 1996 water-leak concern, but the reviewed inventory did not establish a model-wide plastic-window cracking and zipper defect, an age-based universal failure claim, or a universal rear-window replacement specification. Window material, zipper construction and prior top replacement can vary from the frozen assumptions.',
      solution: 'Inspect the top fabric, clear rear window, zipper halves, slider, stitching, rain rail and drains as separate items before choosing a repair. Confirm whether the installed top is original, replacement, plastic-window or glass-window and match any upholstery work to that exact assembly. Do not buy a window panel, zipper slider, complete top, rain rail or installation kit from this page; the installed top configuration and compatible repair have not been established.',
      symptoms: ['clouding, cracking or splitting of a clear rear window', 'zipper separation or binding', 'water entry around the top or rear-window opening'],
      summary: 'Bounded the page to inspection-led top and window diagnosis and removed unsupported universal-failure, price and part-number claims.',
    },
    [IDS.oil]: {
      confidence: 'low',
      description: 'The complete reviewed Mazda/NHTSA inventory did not establish a model-wide combined crank-angle-sensor O-ring and valve-cover-gasket defect across 1990-2005, or the frozen universal prevalence claim for B6 and BP Miatas. Oil visible at the rear or top of the engine can travel from more than one possible source, so its location after running down the engine does not by itself identify a rear-main seal, sensor seal or valve-cover gasket.',
      solution: 'Clean the suspected area, run the engine and trace the highest fresh oil source using the Mazda workshop procedure. Inspect the valve-cover perimeter, sensor and plug locations applicable to the exact year and engine, PCV and oil-cap sealing points, cam and crank seals, oil pan and rear-main-seal area only as the evidence directs. Do not buy an O-ring, valve-cover gasket, seal kit, PCV part or oil product from this page; the leak source, exact component and vehicle fitment must be confirmed first.',
      symptoms: ['fresh oil at the rear or top of the engine', 'oil odor or smoke when leaked oil reaches a hot surface', 'oil residue that can be mistaken for a rear-main-seal leak'],
      summary: 'Removed universal-failure and component-assumption claims and held the combined oil-leak identity pending an exact, directly revalidated primary source.',
    },
    [IDS.thrust]: {
      confidence: 'low',
      description: 'The reviewed Mazda/NHTSA inventory did not establish the frozen claim of a 1999-2000 BP-4W manufacturing defect caused by an excessively deep No. 4 main-cap thrust-bearing recess, a 40,000-80,000-mile failure window, or the listed oversize-washer dimensions. A clutch-pedal-related idle change, noise or suspected crankshaft movement can be serious, but those symptoms do not prove the frozen machining mechanism.',
      solution: 'Stop driving if clutch operation causes stalling, severe noise or obvious crankshaft movement. Have an engine specialist measure crankshaft axial play with the Mazda workshop procedure and inspect the thrust surfaces, crankshaft, bearings and clutch system before deciding whether a bearing repair, machining, rebuild or engine replacement is justified. Do not buy thrust bearings, oversize washers, a crankshaft, clutch kit or engine from this page; the mechanism, dimensions and repair scope have not been established.',
      symptoms: ['engine-speed change or stalling associated with clutch operation', 'abnormal engine noise associated with clutch operation', 'suspected crankshaft axial movement requiring measurement'],
      summary: 'Removed unsupported defect-mechanism, mileage, clearance and oversize-washer claims and held the thrust-bearing identity pending exact primary evidence.',
    },
    [IDS.shortNose]: {
      confidence: 'low',
      description: 'The reviewed Mazda/NHTSA inventory did not establish the frozen short-nose-crank defect narrative, VIN boundary, keyway-wear prevalence, or a universal torque specification. The frozen copy is also internally unsafe: its description urges 116 ft-lb while its solution says that value is for later large-nose cranks and gives a different range. Crank-pulley wobble or timing drift requires exact engine and crankshaft identification before service.',
      solution: 'If the crank pulley visibly wobbles, timing changes, or the crank bolt/keyway condition is unknown, stop relying on generic torque advice and have the crank nose, key, sprocket, pulley and bolt inspected. Verify the VIN, installed crankshaft design and current Mazda workshop specification before loosening or tightening the bolt. Do not buy a crankshaft, pulley, key, sprocket, oil pump, seal or short block from this page; identity, damage and fitment have not been established.',
      symptoms: ['visible crank-pulley wobble', 'timing drift or abnormal pulley movement', 'damaged crank key or keyway found during inspection'],
      summary: 'Removed contradictory torque instructions and unsupported VIN/prevalence claims and held the short-nose-crank identity pending exact primary evidence.',
    },
    [IDS.rust]: {
      confidence: 'low',
      description: 'The reviewed Mazda/NHTSA inventory did not establish a universal 1990-2005 structural-rust defect at both rear rockers and front frame rails, the claim that one or two winters can affect any car, or the frozen repair-price ranges. Corrosion severity depends on location, exposure, drainage, prior repair and the exact structure involved, so paint bubbles or surface rust cannot establish hidden structural loss without inspection.',
      solution: 'Have a body or frame specialist perform a structural inspection of the rocker cavities, pinch welds, floor attachment points, front rails, suspension mounting areas and convertible-top drainage paths. Remove trim or use a borescope only where the workshop procedure permits, and distinguish surface corrosion from perforation or load-path damage before planning repair. Do not buy rocker panels, frame-rail sections, rust converter, cavity coating or welding supplies from this page; the affected structure and repair design have not been established.',
      symptoms: ['paint bubbling or perforation near a rocker or wheel arch', 'corrosion or deformation at a frame rail or mounting point', 'water accumulation associated with blocked or damaged drainage'],
      summary: 'Removed universal-prevalence, one-winter and price claims and held the combined rocker/frame-rail identity pending exact evidence and structural inspection.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Miata row ${id}`);
  return content[id];
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.slave]: 'No universal retail part; diagnose the clutch hydraulic circuit and verify the failed component and fitment first.',
    [IDS.top]: 'No universal retail part; identify the installed top, window and zipper construction before selecting upholstery parts.',
    [IDS.oil]: 'No universal retail part; localize the oil source and verify year, engine and seal fitment first.',
    [IDS.thrust]: 'No universal retail part; measure axial play and establish the damaged engine components before repair.',
    [IDS.shortNose]: 'No universal retail part; verify crankshaft design, specification, damage and fitment before service.',
    [IDS.rust]: 'No universal retail part; a structural inspection and repair design are required before selecting panels or coatings.',
  };
  return map[id];
}

function identityConflictFor(id) {
  const map = {
    [IDS.slave]: 'The frozen title asserts a recurring slave-cylinder failure across 1990-2005, but the complete inventory does not establish that defect and the body adds an unsupported shared-reservoir safety claim.',
    [IDS.top]: 'The frozen title asserts a defined NA plastic-window and zipper defect, while Mazda communications found for that population address different top concerns and do not establish universal cracking or zipper failure.',
    [IDS.thrust]: 'The frozen title asserts a specific 1999-2000 BP-4W thrust-bearing manufacturing defect, but no exact Mazda communication or campaign was found to establish that mechanism or scope.',
    [IDS.shortNose]: 'The frozen title asserts a 1990-1991 keyway-wear defect, while the reviewed inventory provides no exact primary support and the frozen body contains contradictory torque advice.',
    [IDS.rust]: 'The frozen title combines rear-rocker and front-frame-rail structural rust across every 1990-2005 year, but the reviewed inventory does not establish that combined universal identity.',
    [IDS.oil]: 'The frozen title combines crank-angle-sensor O-ring and valve-cover-gasket failure across 1990-2005, but the reviewed inventory does not establish that model-wide combined identity.',
  };
  return map[id] || '';
}

function evidenceFor(id) {
  const map = {
    [IDS.slave]: ['No exact Mazda communication or recall in the 991-row/43-recall alias inventory establishes the frozen slave-cylinder recurrence or shared-reservoir narrative.'],
    [IDS.top]: ['Relevant older communications identify a soft-top boot hook, 1996 water leakage, 1999 top staining and rear-window defroster service—not the frozen universal window/zipper defect.'],
    [IDS.oil]: ['No exact, directly revalidated Mazda communication or campaign in the complete alias inventory establishes the frozen model-wide combined oil-leak identity.'],
    [IDS.thrust]: ['No exact Mazda communication or campaign in the complete alias inventory establishes the asserted main-cap machining defect or oversize-washer dimensions.'],
    [IDS.shortNose]: ['No exact Mazda communication or campaign establishes the frozen keyway-defect scope; the frozen copy itself conflicts on bolt torque.'],
    [IDS.rust]: ['No exact 1990-2005 Mazda communication or campaign establishes the combined rear-rocker/front-frame-rail structural-rust identity or universal prevalence.'],
  };
  return { primaryEvidence: map[id], limitations: 'Owner-frequency rates, current part fitment, repair cost and failed components are not inferred beyond the exact source boundary.' };
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before), description: content.description, solution: content.solution,
    confidence: content.confidence, symptoms: clone(content.symptoms), affectedSystems: [],
    dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null,
    typicalMileageHigh: null, citations: citationsFor(id), communityRecommendations: [],
    fixParts: [], humanApproved: false, source: 'ai-researched', reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Miata').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 6) throw new Error(`Expected 6 frozen Miata rows, found ${frozenRows.length}`);
  const retained = new Set(RETAIN_IDS);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id); const content = contentFor(row.id);
    return {
      id: row.id,
      action: retained.has(row.id) ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained.has(row.id), identityConflict: identityConflictFor(row.id),
      reason: content.summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id),
      before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Mazda', model: 'Miata',
    completionStatement: 'All 6 frozen Miata pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All six frozen identities materially exceed directly revalidated primary evidence; no catalog write is authorized.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 6 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'No defect, repair threshold, torque, price, part number or prevalence is inferred beyond exact primary evidence.',
      'Every selected PDF page must be rendered and visually inspected; this packet selects no PDFs and therefore has zero unreviewed PDF pages.',
      'Every named replaceable item has an explicit no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'miata-all-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'All six frozen pages assert mechanisms or population scopes not established by directly revalidated exact primary evidence; all remain indexed and published.' },
      { code: 'miata-oil-source-held', severity: 'source-hold', recordIds: [IDS.oil], detail: 'A promising Mazda Motorsports source was independently indexed but its host timed out under both Node and curl during direct verification, so the identity remains held.' },
      { code: 'miata-unsafe-claims-removed', severity: 'safety-correction', recordIds: [IDS.slave, IDS.shortNose], detail: 'The proposal removes the shared clutch/brake reservoir assertion and contradictory crank-bolt torque advice.' },
      { code: 'all-miata-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Miata page is removed, merged, redirected or allowed to lose its indexed identity while this packet is reviewed.' },
    ],
    pdfSources: {}, otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 6, total: 6 },
    rows,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES,
  OTHER_SOURCES, OUTPUT, PDF_SOURCES, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS,
  REVIEW_DATE, SEARCH_TERMS, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor,
  contentFor, evidenceFor, identityConflictFor, proposalFor,
};
