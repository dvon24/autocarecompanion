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
} = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-lx-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const MODEL_ALIASES = Object.freeze(['LX', 'LX 470', 'LX 570', 'LX600', 'LX 600']);
const IDS = Object.freeze({
  infotainment: 'lexus-lx-123-inch-infotainment-lexus-2022',
  ahc: 'lexus-lx-ahc-suspension-failure-2008',
  brakes: 'lexus-lx-brake-pedal-vibration--2022',
  centerDiff: 'lexus-lx-center-diff-lock-actuator-2008',
  occupant: 'lexus-lx-front-occupant-classification--2022',
  tailgate: 'lexus-lx-power-tailgate-rear-2022',
  engine: 'lexus-lx-v35a-fts-34l-twin-turbo-v6-2022',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const CAMPAIGNS = Object.freeze(['22V239000', '24V125000', '24V381000', '25V744000', '25V767000', '26V094000', '26V180000']);
const PDF_SOURCES = Object.freeze({
  headUnit: {
    title: 'L-SB-0006-23 Rev1 - Head Unit Software Update (Panasonic)',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251079-9999.pdf',
    localPath: 'C:/tmp/MC-10251079-9999.pdf',
    nhtsaDocumentId: '10251079',
    pages: 21,
    bytes: 940244,
    sha256: 'caf97d7f26e00aea013f422eb4a3bef2b9d7820f9779097abe8f306d5a647837',
  },
  brakeSqueal: {
    title: 'L-SB-0036-24 Rev1 - Front Brake Squeal Noise',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11016785-0001.pdf',
    localPath: 'C:/tmp/MC-11016785-0001.pdf',
    nhtsaDocumentId: '11016785',
    pages: 7,
    bytes: 1258084,
    sha256: '5ca83c608c7ccb0c5bd3345ceac77f4754ba5466011dff91a9a0962b8cc2c76e',
  },
  rearCameraRecall: {
    title: 'NHTSA recall acknowledgment 25V744 - Rearview Camera Image May Not Display',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V744-6918.pdf',
    localPath: 'C:/tmp/RCAK-25V744-6918.pdf',
    nhtsaDocumentId: '25V744',
    pages: 3,
    bytes: 128414,
    sha256: '30261eddaaf9f7b2cfe0521052713130b3449f9f913c5988e656552f234f1358',
  },
  occupantRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 26V180 - Occupant Classification System',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V180-9685.pdf',
    localPath: 'C:/tmp/RCLRPT-26V180-9685.pdf',
    nhtsaDocumentId: '26V180',
    pages: 4,
    bytes: 398711,
    sha256: '197822713297facbfd8e90029524a58b8eb2e8224b3cbf678b8950d28106a214',
  },
  engineRecall: {
    title: 'NHTSA Part 573 Safety Recall Report 25V767 - V35A Engine Main-Bearing Inspection',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V767-3307.pdf',
    localPath: 'C:/tmp/RCLRPT-25V767-3307.pdf',
    nhtsaDocumentId: '25V767',
    pages: 5,
    bytes: 484584,
    sha256: '52aac8113600537f145d415c770edf32d1f5f334b27fc9e12641324993e7e7c5',
  },
});
const SECONDARY_SOURCES = Object.freeze({
  ahcLeakReport: {
    title: '2010 Lexus LX570 AHC Failure Fluid Leak - IH8MUD',
    type: 'forum',
    url: 'https://forum.ih8mud.com/threads/2010-lexus-lx570-ahc-failure-fluid-leak.1285936/',
    liveAccess: 'reachable-200',
    assertedBoundary: 'One 2010 LX570 owner documented a corroded, ruptured AHC hydraulic line and loss of ride height; later inspection showed that the initially suspected core hydraulic components did not need replacement.',
  },
  ahcReliabilityDiscussion: {
    title: '2013 LX570 AHC ownership discussion - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/lx-3rd-gen-2008-2021/855717-2013-lx570-ahc.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'Several long-term owners describe the LX AHC system as robust or trouble-free; the discussion contradicts a fleet-wide failure characterization while acknowledging that individual repairs can be expensive.',
  },
  centerDiffReport: {
    title: 'LX570 center differential lock warning light flashing - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/lx-3rd-gen-2008-2021/966997-center-differential-lock-orange-light-warning-light-flashing-in-the-center-dash.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'A 2013 LX570 owner reported intermittent center-differential-lock warning flashes and a dealer diagnosis of a sensor and wire harness; other posters speculated about an actuator, so the failed component is not universal.',
  },
  tailgateReport: {
    title: 'LX600 tailgate opens but will not close automatically - ClubLexus',
    type: 'forum',
    url: 'https://www.clublexus.com/forums/lx-4th-gen-2022-present/1042372-tailgate-opens-automatically-but-won-t-close-automatically.html',
    liveAccess: 'protected-403-direct-url-reviewed',
    assertedBoundary: 'Owners of 2023 and 2024 LX600 vehicles reported intermittent two-beep failures to power-close; dealer diagnosis in the thread identified sticking or failed pinch sensors, not a universal latch, strut or control-module defect.',
  },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 3, '2005-2009': 6, '2010-2014': 10, '2015-2019': 83, '2020-2024': 181, '2025-2026': 52 },
  totalRows: 335,
  exactSourceDocumentIds: ['10251079', '11016785'],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: RECALL_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 363 },
  totalRows: 363,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  mappedCampaigns: ['25V744000', '25V767000', '26V180000'],
  relatedSupersededCampaigns: ['24V381000'],
  deferredCampaigns: ['22V239000', '24V125000', '26V094000'],
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { type: source.type, title: source.title, url: source.url }; }
function citationsFor(id) {
  if (id === IDS.infotainment) return [citation(PDF_SOURCES.headUnit), citation(PDF_SOURCES.rearCameraRecall)];
  if (id === IDS.ahc) return [citation(SECONDARY_SOURCES.ahcLeakReport), citation(SECONDARY_SOURCES.ahcReliabilityDiscussion)];
  if (id === IDS.brakes) return [citation(PDF_SOURCES.brakeSqueal)];
  if (id === IDS.centerDiff) return [citation(SECONDARY_SOURCES.centerDiffReport)];
  if (id === IDS.occupant) return [citation(PDF_SOURCES.occupantRecall)];
  if (id === IDS.tailgate) return [citation(SECONDARY_SOURCES.tailgateReport)];
  if (id === IDS.engine) return [citation(PDF_SOURCES.engineRecall)];
  throw new Error(`Unexpected LX record ${id}`);
}
function commerceDecisionFor(id) {
  if ([IDS.infotainment, IDS.occupant, IDS.engine].includes(id)) return 'vin-or-bulletin-specific-dealer-remedy-no-retail-part';
  return 'vehicle-specific-diagnosis-no-universal-retail-part';
}
function contentFor(id) {
  const content = {
    [IDS.infotainment]: {
      description: 'Lexus bulletin L-SB-0006-23 Rev1 covers 2022-2023 LX600 vehicles and documents head-unit black or white screens, flicker, freezes, reboots and phone-projection problems addressed by software. The bulletin explicitly says its black, flickering or frozen display conditions do not affect the backup camera. A separate VIN-specific recall, 25V744, covers a rearview-camera image that may freeze or fail to display on certain 2022-2025 LX vehicles because of Parking Assist ECU software. These are distinct conditions, and current primary evidence does not extend the head-unit bulletin itself to 2024-2025 LX vehicles.',
      solution: 'For center-display or phone-projection symptoms, record the behavior and have a Lexus-capable technician confirm the exact vehicle software version and bulletin applicability before updating the head unit. For a frozen or missing rearview image, check the VIN for recall 25V744 and obtain the free Parking Assist ECU software remedy if applicable. Do not infer that either condition requires display or head-unit replacement without diagnosis. These are bulletin- and VIN-specific dealer software remedies; no universal retail part is asserted.',
      confidence: 'high',
      summary: 'Separated the documented 2022-2023 head-unit software conditions from VIN-specific recall 25V744 and removed unsupported camera interruption, all-years software and routine hardware-replacement claims.',
    },
    [IDS.ahc]: {
      description: 'Direct owner evidence confirms that an LX570 can lose AHC fluid and ride height, but the documented 2010 case was traced to a corroded, ruptured hydraulic line. Follow-up inspection showed that several initially suspected core hydraulic components did not need replacement. Other long-term LX owners describe AHC as robust or trouble-free. This evidence supports retaining the reported AHC failure identity, but not a claim that actuators, accumulators and lines generally fail across every 2008-2021 LX570.',
      solution: 'If an AHC warning, fluid leak or abnormal ride height appears, avoid repeatedly operating the height control and have a qualified technician locate the exact leak, read system faults and test hydraulic pressure and height-sensor operation. Repair only the verified line, sensor, pump, accumulator, actuator or related component under the model-year procedure. Do not authorize a complete overhaul or conventional-suspension conversion from this page alone. This is vehicle-specific hydraulic diagnosis; no universal retail part is asserted.',
      confidence: 'low',
      summary: 'Retained the owner-reported AHC leakage/failure identity while removing fleet-wide component, universal overhaul, cost and conversion claims.',
    },
    [IDS.brakes]: {
      description: 'The exact Lexus bulletin found for 2022-2025 LX600 vehicles, L-SB-0036-24 Rev1, addresses front-brake squeal while driving forward or in reverse. Its dealer procedure replaces specified front discs, pads, shims and related hardware for that squeal condition. It does not document brake-pedal vibration, rotor warping, thickness variation, towing or urban-use causation. Current exact evidence therefore does not substantiate the frozen pulsation identity as a generation-wide pattern.',
      solution: 'For a pulsation or steering-wheel shake, a qualified brake technician should reproduce the symptom, inspect wheel and hub mounting surfaces, verify wheel-fastener torque, measure disc runout and thickness variation, and check caliper operation before selecting parts. Use L-SB-0036-24 only when its front-squeal condition and applicability are met. Do not infer upgraded pads, higher-quality rotors or a bulletin repair for pulsation from this page. This is condition- and vehicle-specific brake diagnosis; no universal retail part is asserted.',
      confidence: 'low',
      summary: 'Preserved the indexed title but disclosed that the exact Lexus source is squeal-only and removed unsupported pulsation prevalence, causation and upgrade prescriptions.',
    },
    [IDS.centerDiff]: {
      description: 'A direct 2013 LX570 report documents an intermittently flashing center-differential-lock warning and a dealer diagnosis involving a sensor and wire harness. Other participants speculated that an actuator may eventually require replacement, but the thread does not establish one universal cause. No exact Lexus communication in the complete inventory documents internal motor degradation or moisture intrusion as a model-wide defect.',
      solution: 'Follow the owner-manual procedure for an incomplete lock or unlock operation, and if the indicator continues flashing have a Lexus-capable technician read four-wheel-drive faults and test the switch, wiring, sensor, actuator and control circuit before replacing anything. Perform any required calibration or initialization under the exact model-year repair procedure. Do not assume an actuator or attempt impact-based workarounds from forum advice. This is vehicle-specific four-wheel-drive diagnosis; no universal retail part is asserted.',
      confidence: 'low',
      summary: 'Retained the reported center-differential malfunction while removing unsupported actuator, motor-degradation, moisture and automatic-replacement certainty.',
    },
    [IDS.occupant]: {
      description: 'NHTSA recall 26V180 covers certain 2022-2024 Lexus LX vehicles whose front-passenger seat-frame assembly may have insufficient clearance between the seat frame and a stopper. Interference can cause the occupant-classification sensor to measure the passenger load incorrectly, which may result in an improper passenger-airbag deployment strategy. The recall report does not establish persistent warning messages or repeated dealer visits as the identifying symptom.',
      solution: 'Check the VIN for recall 26V180. Lexus dealers will inspect the relevant seat parts and replace the front-passenger seat-frame assembly if necessary at no charge. Do not disturb under-seat restraint wiring or attempt sensor calibration from this page; unrelated SRS warnings still require code-based diagnosis under the exact service procedure. This is a VIN-specific safety-recall remedy; no retail part is asserted.',
      confidence: 'high',
      summary: 'Anchored the page to recall 26V180 and removed unsupported owner-warning, repeated-visit, generic sensor and connector-adjustment claims.',
    },
    [IDS.tailgate]: {
      description: 'Direct reports from 2023 and 2024 LX600 owners document an intermittent power tailgate that opens but will not close, gives two beeps and may work again at cooler times of day. In those reports, dealer diagnosis identified a sticking or failed pinch sensor and replacement restored operation. The evidence does not establish a model-wide latch, power-strut or control-module fault, nor the page\'s security, battery-drain or water-intrusion claims.',
      solution: 'Record the intermittent failure, check for an obstruction or damaged weatherstrip, and have a Lexus-capable technician read back-door faults and test both pinch sensors, alignment and the commanded close operation. Replace only the component confirmed by diagnosis under the exact model-year procedure. Do not assume the latch, struts or module from the symptom alone. This is vehicle-specific power-back-door diagnosis; no universal retail part is asserted.',
      confidence: 'medium',
      summary: 'Retained the reported power-close failure and direct pinch-sensor evidence while removing universal latch, strut, module, security, battery and water claims.',
    },
    [IDS.engine]: {
      description: 'NHTSA recall 25V767 expands the earlier 24V381 population and covers certain 2022-2024 Lexus LX vehicles with a specific V35A engine configuration. Manufacturing debris may contaminate the engine and cause the number-one main bearing to wear or fail, which can lead to engine stall and loss of drive power. The recall population is VIN- and production-specific; the report does not make every V35A engine defective or identify knocking, low-oil-pressure warnings and misfires as the required screening method.',
      solution: 'Check the VIN for recall 25V767 and arrange the free Lexus dealer remedy. Dealers use inspection software and collected vehicle data to evaluate the number-one main bearing; if the software cannot confirm that the bearing is free from abnormal wear, the dealer replaces the engine at no charge. Do not prescribe oil-filter inspection, a short block or automatic engine replacement outside that campaign procedure. This is a VIN-specific safety-recall remedy; no retail part is asserted.',
      confidence: 'high',
      summary: 'Updated the page to expanded recall 25V767 and its inspection-software remedy while removing all-V35A, symptom-screening, short-block and automatic-replacement claims.',
    },
  }[id];
  if (!content) throw new Error(`Unexpected LX record ${id}`);
  return content;
}
function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = content.confidence;
  proposal.symptoms = [];
  proposal.affectedSystems = [];
  proposal.dtcCodes = [];
  proposal.estimatedCostLow = null;
  proposal.estimatedCostHigh = null;
  proposal.typicalMileageLow = null;
  proposal.typicalMileageHigh = null;
  proposal.citations = citationsFor(row.id);
  proposal.communityRecommendations = [];
  proposal.fixParts = [];
  proposal.humanApproved = false;
  proposal.reportCount = 0;
  proposal.source = 'manual';
  proposal.lastReportedByOwners = '';
  proposal.reviewedOn = REVIEW_DATE;
  proposal.contentUpdatedOn = REVIEW_DATE;
  proposal.contentUpdateSummary = content.summary;
  proposal.relatedIssueIds = [];
  return proposal;
}
function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact LX communication rows plus ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  return {
    [IDS.infotainment]: [common, 'Visual review of L-SB-0006-23 Rev1 confirms 2022-2023 LX600 applicability and black, flickering or frozen displays plus head-unit reboots addressed by software.', 'The bulletin explicitly says those display conditions do not affect the backup camera; recall 25V744 separately covers the rearview-image software condition on certain 2022-2025 LX vehicles.', 'No primary source extends the head-unit bulletin itself to 2024-2025 or authorizes routine display/head-unit replacement.'],
    [IDS.ahc]: [common, 'A direct 2010 LX570 report confirms hydraulic leakage, a warning and loss of normal ride height; diagnosis identified a corroded, ruptured line.', 'The same case ultimately did not require the initially suspected core components, while a separate ownership discussion includes several long-term trouble-free reports.', 'No exact source supports fleet-wide actuator/accumulator/line failure, a $3,000-$6,000 universal cost or conversion as the standard remedy.'],
    [IDS.brakes]: [common, 'Visual review of L-SB-0036-24 Rev1 confirms a 2022-2025 LX600 front-squeal condition and a specified dealer parts procedure.', 'That bulletin does not document pedal vibration, rotor warping, thickness variation, low-mileage prevalence, towing or urban-use causation.', 'The frozen title is preserved for SEO pending review, while the body discloses the evidence mismatch and makes no parts prescription.'],
    [IDS.centerDiff]: [common, 'A direct 2013 LX570 report confirms an intermittent flashing center-differential-lock warning.', 'The dealer diagnosis reported by the owner involved a sensor and wire harness; actuator replacement appears only as participant speculation.', 'No exact source supports universal motor degradation, moisture intrusion or automatic OEM-actuator replacement.'],
    [IDS.occupant]: [common, 'Visual review of recall 26V180 confirms 2022-2024 LX applicability, insufficient seat-frame/stopper clearance and possible occupant-load mismeasurement.', 'The official remedy is dealer inspection and seat-frame replacement if necessary at no charge.', 'The recall report does not establish persistent SRS warnings, repeated visits or generic under-seat connector tension as the recall identity.'],
    [IDS.tailgate]: [common, 'A direct LX600 thread documents intermittent two-beep failures to power-close on 2023 and 2024 vehicles.', 'Dealer findings in the thread identify sticking or failed left/right pinch sensors and warranty replacement.', 'The source does not establish a universal latch, strut or module defect, security risk, battery drain or water intrusion.'],
    [IDS.engine]: [common, 'Visual review of 25V767 confirms a specific 2022-2024 LX V35A configuration and manufacturing debris that can damage the number-one main bearing and cause loss of drive power.', 'The official remedy uses inspection software and vehicle data, with engine replacement only when the software cannot confirm absence of abnormal wear.', 'The campaign does not authorize automatic engine/short-block replacement or the page\'s oil-filter and symptom-screening prescriptions.'],
  }[row.id];
}
function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))]));
}
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'LX').sort((left, right) => left.id.localeCompare(right.id));
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
      commerceDecision: commerceDecisionFor(row.id),
      evidence: evidenceFor(row),
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
    auditStage: 'model-primary-and-direct-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'LX',
    completionStatement: 'All seven frozen LX pages retain their indexed identities while exact Lexus/NHTSA documents and bounded direct owner reports separate documented conditions from unsupported causes, prevalence and parts prescriptions.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Seven safety, recall or owner-evidence rewrites require independent review before any body-copy write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.',
      'All seven LX IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain unchanged.',
      'Absence of an exact OEM bulletin is not treated as evidence that a bounded owner-reported condition is false.',
      'Recall applicability and remedies are VIN-specific and do not prove that every vehicle in the indexed year range is defective.',
      'No display, brake, suspension, four-wheel-drive, seat, tailgate or engine part is approved without exact diagnosis, campaign eligibility and fitment.',
    ],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'lx-primary-records-bounded', severity: 'source-safety', recordIds: [IDS.infotainment, IDS.brakes, IDS.occupant, IDS.engine], detail: 'Each primary record is constrained to its exact years, condition and remedy; distinct head-unit and backup-camera software conditions are not conflated.' },
      { code: 'lx-direct-reports-bounded', severity: 'accuracy-safety', recordIds: [IDS.ahc, IDS.centerDiff, IDS.tailgate], detail: 'Direct owner reports preserve the symptoms while single-case diagnoses are not generalized into fleet-wide component failures.' },
      { code: 'lx-unsupported-prescriptions-removed', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'Every repair remains recall-, bulletin- or diagnosis-specific; no guessed retail part or search URL is proposed.' },
      { code: 'lx-evidence-mismatch-disclosed', severity: 'critical-correction', recordIds: [IDS.brakes], detail: 'The exact Lexus bulletin supports squeal rather than the frozen pulsation/warping identity; that limitation is explicit pending independent title-preserving review.' },
      { code: 'all-lx-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'All seven IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain preserved.' },
    ],
    pdfSources: publicPdfSources(),
    secondarySourceReview: SECONDARY_SOURCES,
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = {
  BLOCKER_IDS,
  BULLETIN_INVENTORY,
  CAMPAIGNS,
  IDS,
  MODEL_ALIASES,
  OUTPUT,
  PDF_SOURCES,
  RECALL_INVENTORY,
  REVIEW_DATE,
  SECONDARY_SOURCES,
  SNAPSHOT,
  buildPacket,
  citationsFor,
  commerceDecisionFor,
  contentFor,
  evidenceFor,
  proposalFor,
  publicPdfSources,
};
