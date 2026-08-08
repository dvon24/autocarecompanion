/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-aviator-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['AVIATOR', 'AVIATOR PHEV']);
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

const IDS = Object.freeze({
  earlyRecalls: 'lincoln-aviator-2020-multiple-recalls',
  cable: 'lincoln-aviator-high-voltage-battery-cable-chafing-c-compressor-pulley',
  sunroof: 'lincoln-aviator-panoramic-sunroof-drain-clog-causing-headliner-interior-wate',
  rearAir: 'lincoln-aviator-rear-air-suspension',
  adas: 'lincoln-aviator-unexpected-acceleration-phantom-braking-driver-assist-engage',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());

const PDF_SOURCES = Object.freeze({
  driveshaft: { title: 'Lincoln Recall 20S65 / NHTSA 20V693 Owner Notice', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2020/RCONL-20V693-9749.pdf', localPath: 'C:/tmp/lincoln-aviator-20V693.pdf', pages: 4, bytes: 85536, sha256: '0ca7e06e1e95b688c288af80609a5afb68f00219f5b7189f640ad9a9a70e082c' },
  rearSeat: { title: 'NHTSA Part 573 Report 19V633: Aviator Rear-Outboard Manual Seat Recliners', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V633-9876.PDF', localPath: 'C:/tmp/lincoln-aviator-19V633.pdf', pages: 5, bytes: 217628, sha256: '1f6170e98edd25f402f3ff96fe3a8ab7fd19366a738f70d123565f489baca07e' },
  frontSeat: { title: 'NHTSA Part 573 Report 20V497: Aviator Front Seat-Back Fastener Torque', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V497-7322.PDF', localPath: 'C:/tmp/lincoln-aviator-20V497.pdf', pages: 4, bytes: 215960, sha256: '80b8f5dc333a35b2c545412d402b7f619bdc337e3116441a70f4ee65c08b892f' },
  cableReport: { title: 'NHTSA Part 573 Report 21V534 / Ford 21S34: Gas-Engine Battery-Cable Harness', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V534-4350.PDF', localPath: 'C:/tmp/lincoln-aviator-21V534-report.pdf', pages: 3, bytes: 214354, sha256: 'cb033aeadb57294ff2429209ea7f23a511b51945bb44ee954c6aaf497914a0e2' },
  cableOwner: { title: 'Lincoln Recall 21S34 / NHTSA 21V534 Owner Notice', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCONL-21V534-9924.pdf', localPath: 'C:/tmp/lincoln-aviator-21V534-owner.pdf', pages: 4, bytes: 84855, sha256: '8de06136d8566bb18489cc8bf0e8cb2ccaa35ab073d00190d6633f0cc190ffc9' },
  water: { title: 'Ford TSB 23-2181: Rear-Liftgate or Spare-Tire Water Leak and Audio Loss', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10238283-0001.pdf', localPath: 'C:/tmp/lincoln-aviator-23-2181.pdf', pages: 17, bytes: 1991149, sha256: 'd845895c6fe5ca95e2a81dd9b9846e39e11ff3ebe5155cc62b31d74512fd3e40' },
  suspensionCode: { title: 'Ford SSM 51621: B1041/U2100 Diagnostic Service Mode', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10236334-0001.pdf', localPath: 'C:/tmp/lincoln-aviator-51621.pdf', pages: 1, bytes: 28215, sha256: 'b34c1ae68fab526828c78bd1d23731013b9807a95e5c64b9c273f0f87492c5f3' },
  suspensionPart: { title: 'Ford SSM 51640: Front Air Spring/Strut Full Assemblies', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10236341-0001.pdf', localPath: 'C:/tmp/lincoln-aviator-51640.pdf', pages: 1, bytes: 27869, sha256: 'bdbecb1e21bc550e7dde4e7f3cc0915b49906ed7a638ef27b8e37cb81916540b' },
});

const COMPLAINT_SOURCES = Object.freeze({
  cruise2021: { title: 'NHTSA ODI 11644108: 2021 Aviator cruise set-speed allegation', type: 'nhtsa', odiNumber: 11644108, year: 2021, url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11644108' },
  brake2021: { title: 'NHTSA ODI 11554066: 2021 Aviator automatic-braking allegation', type: 'nhtsa', odiNumber: 11554066, year: 2021, url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11554066' },
  acceleration2022: { title: 'NHTSA ODI 11623452: 2022 Aviator unintended-acceleration allegation', type: 'nhtsa', odiNumber: 11623452, year: 2022, url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11623452' },
  cruise2025: { title: 'NHTSA ODI 11734097: 2025 Aviator cruise-speed and false-warning allegation', type: 'nhtsa', odiNumber: 11734097, year: 2025, url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11734097' },
  brake2025: { title: 'NHTSA ODI 11677763: 2025 Aviator automatic-braking allegation', type: 'nhtsa', odiNumber: 11677763, year: 2025, url: 'https://api.nhtsa.gov/complaints/odinumber?odinumber=11677763' },
});

const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 0, '2000-2004': 45, '2005-2009': 37, '2010-2014': 0, '2015-2019': 2, '2020-2024': 357, '2025-2026': 136 }, totalRows: 577, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 1, post: 386 }, totalRows: 387, campaignCount: 52, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.earlyRecalls]: [PDF_SOURCES.driveshaft, PDF_SOURCES.rearSeat, PDF_SOURCES.frontSeat, { url: 'https://www.nhtsa.gov/recalls', type: 'nhtsa', title: 'NHTSA VIN-Specific Recall Lookup' }],
    [IDS.cable]: [PDF_SOURCES.cableReport, PDF_SOURCES.cableOwner, { url: 'https://www.nhtsa.gov/recalls', type: 'nhtsa', title: 'NHTSA VIN-Specific Recall Lookup' }],
    [IDS.sunroof]: [PDF_SOURCES.water],
    [IDS.rearAir]: [PDF_SOURCES.suspensionCode, PDF_SOURCES.suspensionPart],
    [IDS.adas]: [...Object.values(COMPLAINT_SOURCES), { url: 'https://www.nhtsa.gov/report-a-safety-problem', type: 'nhtsa', title: 'NHTSA Report a Safety Problem' }],
  };
  if (!map[id]) throw new Error(`Unexpected Aviator correction ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.earlyRecalls]: {
      confidence: 'high',
      description: 'Official recall documents establish several separate, VIN-scoped early-build Aviator actions. Recall 20S65/NHTSA 20V693 covers certain 2020 Aviators whose rear driveshaft weld may fracture. Recall 19C07/NHTSA 19V633 covers certain 2020 Aviators with a rear-outboard manual seat recliner that may be missing a strength pawl. Recall 20S48/NHTSA 20V497 covers certain 2020 Aviators whose front seat-back side-airbag or seat-back-module fasteners may have incorrect torque. These documents do not support this page’s former brake-hose, battery-fastener, repeated-dealer-visit, or all-vehicle claims. The 20V693 Part 573 report contains a mixed-population engine description, so engine eligibility must not be inferred from it.',
      solution: 'Check the VIN in the NHTSA and Lincoln recall systems, then follow only the campaign that is open for that vehicle. Recall 20S65 calls for driveshaft inspection and repair or replacement when required; 19C07 calls for rear-seat recliner inspection and repair when required; 20S48 calls for dealer verification and correction of the specified seat-back fasteners. These are free, VIN-scoped dealer remedies. Do not buy a driveshaft, seat, airbag, fastener, brake-hose, battery, or other part from this page.',
      summary: 'Replaced a mixed and partly unsupported early-build aggregation with three exact VIN-scoped Aviator recall defects and remedies.',
    },
    [IDS.cable]: {
      confidence: 'high',
      description: 'Despite the frozen page title, Ford recall 21S34/NHTSA 21V534 is not a high-voltage traction-battery-cable campaign. The Part 573 report limits it to certain 2020-2021 Aviators with 3.0-liter gas engines. An improperly secured battery-cable wire harness can contact the A/C compressor pulley, which may damage the harness or belt and expose the unfused positive battery circuit, creating a short-circuit and fire risk. The PHEV engine still present in this page’s frozen metadata is outside the cited campaign and must not be used to infer recall eligibility.',
      solution: 'Check the VIN for recall 21S34/21V534. The free Lincoln remedy installs a tie strap to keep the battery-cable harness away from the A/C compressor pulley, inspects the harness and belt, and repairs or replaces damaged items as necessary. This is a VIN-scoped dealer campaign, not a high-voltage battery repair. Do not purchase a harness, belt, compressor, traction-battery cable, or other part from this page.',
      summary: 'Corrected the false high-voltage/PHEV framing and bound the page to the gas-engine 21S34 battery-cable harness recall.',
    },
    [IDS.sunroof]: {
      confidence: 'low',
      description: 'The reviewed Ford bulletin does not establish the page title’s universal sunroof-drain-clog diagnosis. TSB 23-2181 covers 2020-2023 Aviator lack of audio and water in the rear liftgate or spare-tire area after rain or a wash; its service procedure traces several rear-body leak paths. It is not a panoramic-roof drain bulletin. The reviewed evidence does not prove that rear sunroof drains commonly clog, that water follows one pillar path, that interior switches fail from this cause, or that every 2020-2024 vehicle shares one defect.',
      solution: 'Preserve the first wet-point evidence and have the vehicle water-tested in controlled sections. Inspect roof drains and connections, roof glass and seals, body seams, and the separate rear-liftgate/spare-tire paths according to where water first appears. Do not force compressed air through an unverified drain because it can disconnect or damage a hose, and do not promise warranty coverage, annual flushing, or mold work without inspection. This is leak-path-specific body diagnosis; no universal drain tube, seal, headliner, electrical part, cleaning service, or retail part is asserted.',
      summary: 'Removed an unsupported universal drain-clog diagnosis, compressed-air prescription, warranty promise, prevalence, costs, and automatic mold claim.',
    },
    [IDS.rearAir]: {
      confidence: 'medium',
      description: 'Ford SSM 51621 covers one software/diagnostic-service-mode condition on 2020-2023 air-suspension Aviators: B1041/U2100 with a drive-malfunction or suspension-fault message after an on-demand SUMA self-test. Ford SSM 51640 says complete front air spring/strut assemblies are available when a front spring or strut actually requires service. Neither source establishes rear-first air-bag leaks, compressor burnout, a 40,000-80,000-mile pattern, shared Explorer component identity, Wabco/Continental branding, or the frozen price estimates.',
      solution: 'Record ride height, physical symptoms and every suspension-module code before clearing anything. For the exact B1041/U2100 service-mode condition, use Ford’s continuous-memory path and transport/factory-mode deactivation instead of repeating the on-demand test. For other codes or physical sag, follow Workshop Manual air-suspension leak, pressure, electrical, compressor, valve and height-sensor diagnosis. A complete front spring/strut assembly is an option only after that corner is proven to require service and the exact gas/hybrid, side and VIN application is confirmed. No universal rear air spring, compressor, dryer, front strut, conversion kit, or retail part is asserted.',
      summary: 'Replaced unsupported rear-first leak, compressor, brand, mileage and cost claims with the two exact Ford service-document boundaries.',
    },
    [IDS.adas]: {
      confidence: 'low',
      description: 'The NHTSA complaints API contains individual Aviator allegations, not proof of one common defect. ODI 11644108 alleges a 2021 vehicle changed its cruise set speed upward; ODI 11554066 alleges automatic braking with no nearby obstacle; ODI 11623452 alleges a 2022 vehicle accelerated from Park while pre-collision braking did not engage; ODI 11734097 alleges 2025 cruise acceleration/deceleration and false crash warnings; and ODI 11677763 alleges automatic braking with ABS and pre-collision faults. These reports describe different events and do not establish one Co-Pilot360/BlueCruise cause, a failure across every indexed year or engine, or a repair. The exact API replay found no matching 2024 complaint under the audit’s acceleration/braking/driver-assistance terms.',
      solution: 'If the vehicle accelerates or brakes unexpectedly, take control, disengage driver assistance when it can be done safely, and stop in a safe location if warnings or control problems persist. Preserve the date, time, road, speed, selected assistance mode, warnings, weather and full diagnostic scan; report the event to Lincoln and NHTSA. Have camera, radar, braking, powertrain and driver-assistance systems diagnosed against the exact event and stored data. Do not promise sensor cleaning, calibration, module software, a brake repair, or any replacement part without a matching fault and Ford procedure. No universal sensor, camera, radar, module, brake component, software update or retail part is asserted.',
      summary: 'Replaced a broad defect narrative with five exact complaint allegations, separated unlike events, and removed unsupported 2024, engine, cause, calibration, software and cost claims.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Aviator correction ${id}`);
  return content[id];
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  if (!BLOCKER_IDS.includes(row.id)) return proposal;
  const content = contentFor(row.id);
  Object.assign(proposal, {
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(row.id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    lastReportedByOwners: '',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  });
  return proposal;
}

function evidenceFor(row) {
  const inventory = `Complete model inventory: ${BULLETIN_INVENTORY.totalRows} exact Aviator/Aviator PHEV communications and ${RECALL_INVENTORY.totalRows} exact recall rows across ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  if (!BLOCKER_IDS.includes(row.id)) return [inventory, 'Every existing static NHTSA citation resolves to this exact model inventory or to the separately verified 23-2181 Aviator document; no search-style commerce link is present.'];
  const details = {
    [IDS.earlyRecalls]: ['Three visually inspected recall documents establish the exact driveshaft, rear-seat-recliner and front-seat-fastener defects.', 'Former brake-hose, battery-fastener, visit-count and universal applicability claims are unsupported.'],
    [IDS.cable]: ['The visually inspected Part 573 report says 3.0-liter gas engine and ordinary unfused positive battery circuit.', 'The frozen title and PHEV metadata are explicitly excluded from recall applicability pending separate identity review.'],
    [IDS.sunroof]: ['Visual review of TSB 23-2181 confirms rear-liftgate/spare-tire water paths, not a panoramic-roof drain bulletin.', 'The rewrite removes blind compressed-air advice and all universal cause, warranty, cost and prevalence claims.'],
    [IDS.rearAir]: ['Visual review of SSM 51621 proves a diagnostic-service-mode code condition; SSM 51640 concerns complete front assemblies only after service need.', 'Neither supports the frozen rear-first bag/compressor failure pattern or its prices and mileage.'],
    [IDS.adas]: ['Five exact NHTSA complaint IDs are quoted only as allegations, not verified defect findings.', 'The audit found no matching 2024 complaint and no primary source establishing one cross-year cause or repair.'],
  };
  return [inventory, ...details[row.id], 'No universal retail part or search-style commerce link is introduced.'];
}

function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'Aviator').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(row); const changed = BLOCKER_IDS.includes(row.id);
    return { id: row.id, action: changed ? 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source' : 'keep_published_no_change', commerceDecision: changed ? 'dealer-diagnosis-or-complaint-specific-no-universal-retail-part' : 'preserve-current-no-search-commerce', evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-and-complaint-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lincoln',
    model: 'Aviator',
    completionStatement: 'All 28 frozen Aviator pages are accounted for: 23 remain byte-for-byte unchanged and five older pages receive bounded safety and source corrections without changing indexed identity.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Five material safety/source corrections and two frozen metadata conflicts require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 28 IDs, titles, categories, indexed year sets, trim sets, engine sets, related issue links, canonical severities and publication states remain unchanged.',
      'A recall is VIN-scoped; a complaint is an allegation; a TSB or SSM is limited to its exact model, build, symptom, code and procedure.',
      'The false high-voltage cable framing and unsupported 2.7-liter Aviator metadata are exposed but not silently corrected in indexed metadata.',
      'No replaceable part is promoted without exact diagnosis and VIN/side/powertrain fitment; every changed row has an explicit no-universal-commerce boundary.',
      'Unknown owner totals remain zero and the production UI hides them rather than presenting fake social proof.',
    ],
    source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'aviator-five-legacy-pages-corrected', severity: 'accuracy-safety', recordIds: BLOCKER_IDS, detail: 'Five older pages had not received the evidence-bounded July 20 treatment applied to the other 23 pages.' },
      { code: 'aviator-high-voltage-title-is-false', severity: 'critical-correction', recordIds: [IDS.cable], detail: '21V534 concerns the ordinary unfused battery positive circuit on 3.0-liter gas vehicles, not a PHEV high-voltage traction cable.' },
      { code: 'aviator-frozen-engine-metadata-conflicts', severity: 'metadata-hold', recordIds: [IDS.cable, IDS.adas], detail: 'The cable page still indexes PHEV and the ADAS page still indexes a nonexistent 2.7-liter Aviator because this proposal freezes engine metadata; neither is used as evidence applicability.' },
      { code: 'aviator-water-source-boundary-corrected', severity: 'critical-correction', recordIds: [IDS.sunroof], detail: 'TSB 23-2181 is a rear-liftgate/spare-tire water-path bulletin and cannot prove a universal panoramic-roof drain clog.' },
      { code: 'aviator-air-suspension-sources-do-not-prove-failure-pattern', severity: 'critical-correction', recordIds: [IDS.rearAir], detail: 'The two cited SSMs support a service-mode code path and front assembly availability, not rear-first leaks, compressor burnout, brands, costs or mileage.' },
      { code: 'aviator-adas-allegations-bounded', severity: 'safety', recordIds: [IDS.adas], detail: 'Five exact complaint IDs replace uncited broad claims; no common defect, 2024 event or universal repair is asserted.' },
      { code: 'all-aviator-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Aviator page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(),
    complaintSources: COMPLAINT_SOURCES,
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { keep_published_no_change: rows.length - BLOCKER_IDS.length, retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: BLOCKER_IDS.length, total: rows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, COMPLAINT_SOURCES, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, contentFor, evidenceFor, proposalFor, publicPdfSources };
