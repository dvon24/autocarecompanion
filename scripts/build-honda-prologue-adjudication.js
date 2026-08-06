/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-honda-prologue-adjudication-2026-08-06.json');

const IDS = {
  axle: 'honda-prologue-cv-axle-clicking-2024',
  display: 'honda-prologue-display-blackout-2024',
  highVoltage: 'honda-prologue-hv-system-failure-2024',
  phantomBraking: 'honda-prologue-phantom-braking-2024',
};
const SOURCES = {
  axleTechLine: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11026973-0001.pdf',
  displayRecallAcknowledgment: 'https://static.nhtsa.gov/odi/rcl/2026/RCAK-26V112-4017.pdf',
  displayRecallReport: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V112-2534.pdf',
};
const MISMATCH_SOURCES = {
  hvClimateBulletin: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11015699-0001.pdf',
  hvBatteryDischargeBulletin: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11019250-0001.pdf',
  aebInvestigationExcludesPrologue: 'https://static.nhtsa.gov/odi/inv/2025/INOA-EA25002-10006.pdf',
};

const REWRITE_CARDS = {
  [IDS.axle]: {
    years: [2024, 2025, 2026], category: 'drivetrain', severity: 'low', confidence: 'high',
    title: 'Clicking or Ratcheting From Drive Axles When Turning - Honda Tech Line ATS30070',
    description: 'Honda Tech Line Summary Article ATS30070 applies to all trims of the 2024-2026 Prologue. Customers may report a clicking or ratcheting noise when turning. Honda directs technicians who isolate the noise to the drive axles to inspect for damage. If no damage is found, Honda says the noise does not affect normal driving and the symptom is still under investigation; the article is not a recall or a final defect determination.',
    solution: 'Have a Honda dealer reproduce the noise, isolate it to the drive axles and inspect for damage under ATS30070. Repair damage when found. If no damage is present, Honda directs technicians not to attempt a repair while the investigation continues.',
    symptoms: ['Clicking or ratcheting noise when turning'],
    affectedSystems: ['Drive axles'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Tech Line Summary ATS30070 - 2024-2026 Prologue Clicking or Ratcheting When Turning', url: SOURCES.axleTechLine }],
    identityTerms: ['clicking or ratcheting', 'drive axles'],
    summary: 'Replaced complaint counts, presumed CV-joint defects, backorder and lemon-law claims with Honda Tech Line ATS30070\'s exact 2024-2026 all-trim scope, inspection direction and explicit under-investigation status.',
  },
  [IDS.display]: {
    years: [2024], category: 'electrical', severity: 'high', confidence: 'high',
    title: 'Instrument Panel or Rearview Camera Display May Fail - Recall 26V112',
    description: 'Recall 26V112 covers certain 2024 Honda Prologue vehicles. A software error can cause the instrument panel display to fail, preventing critical information such as speed or warning lights from appearing. A software error can also make the rearview camera show a blank screen in Reverse, reducing rear visibility.',
    solution: 'Have a Honda dealer check the VIN for recall 26V112. The recall remedy updates the vehicle\'s Radio Control Module with improved software.',
    symptoms: ['Instrument panel display may fail', 'Speedometer or warning information may not appear', 'Rearview camera may show a blank screen in Reverse'],
    affectedSystems: ['Instrument panel display', 'Rearview camera display', 'Radio Control Module software'], dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Recall Acknowledgment 26V112 - 2024 Prologue Display Failures', url: SOURCES.displayRecallAcknowledgment },
      { type: 'recall', title: 'Honda Part 573 Report 26V112 - Radio Control Module Software Remedy', url: SOURCES.displayRecallReport },
    ],
    identityTerms: ['instrument panel', 'rearview camera'],
    summary: 'Replaced secondary articles and complaint counts with exact recall 26V112, limiting the page to instrument-panel and rearview-camera display failures and the Radio Control Module software remedy; removed unsupported infotainment, climate and restart claims.',
  },
};

const KEEP_REASONS = {
  [IDS.highVoltage]: 'Honda Bulletins 25-026 and 25-043 establish narrower software conditions involving a Service High Voltage message with cabin heating/cooling loss or a specific complete DTC set with 12-volt-battery discharge. They do not establish the frozen page\'s DC-fast-charging disablement, reduced acceleration, onboard-charger/junction-box causes, tow instruction or blanket warranty claim. Substituting either narrower bulletin would change the indexed identity, so the row remains byte-for-byte unchanged.',
  [IDS.phantomBraking]: 'NHTSA Engineering Analysis EA25002 covers 2019-2022 Insight and 2019-2023 Passport vehicles, not Prologue. No exact official Prologue source was found for the frozen AEB population, highway-speed claim, sensor-stack theory or suggested setting change, so the row remains byte-for-byte unchanged.',
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}
function rewriteProposal(current, card) {
  return fullRecord({
    ...current, ...card, make: 'Honda', model: 'Prologue', trims: [], engines: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual',
    status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06',
    contentUpdateSummary: card.summary, relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Prologue');
  if (modelRows.length !== 4) throw new Error(`expected 4 Honda Prologue rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const proposal = card ? rewriteProposal(before, card) : before;
    const mismatchEvidence = current.id === IDS.highVoltage
      ? [
        { kind: 'scope-mismatch', url: MISMATCH_SOURCES.hvClimateBulletin, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 25-026 covers 2024 Prologue DTC B2BAA with intermittent cabin heating/cooling loss and a BECM software update, not the frozen charging-and-performance identity.' },
        { kind: 'scope-mismatch', url: MISMATCH_SOURCES.hvBatteryDischargeBulletin, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 25-043 covers 2024-2025 vehicles with one complete DTC set and possible 12-volt-battery discharge, not the frozen charging-and-performance identity.' },
      ]
      : current.id === IDS.phantomBraking
        ? [{ kind: 'model-mismatch', url: MISMATCH_SOURCES.aebInvestigationExcludesPrologue, verifiedOn: '2026-08-06', observation: 'NHTSA EA25002 names Insight and Passport only; it does not include Prologue.' }]
        : [];
    return {
      id: current.id, model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card ? 'The indexed issue identity stays on the same ID; only exact Honda/NHTSA scope, mechanism, symptoms and remedy replace unsupported claims.' : 'No content or publication-state changes; a narrower or different official condition cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: item.type === 'recall' ? 'government-recall-record' : 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : mismatchEvidence,
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const summary = {
    rewrite_same_identity: rows.filter((row) => row.action === 'rewrite_same_identity').length,
    keep_published_pending_source: rows.filter((row) => row.action === 'keep_published_pending_source').length,
    total: rows.length,
  };
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Honda', model: 'Prologue',
    completionStatement: 'This packet reconciles all four frozen Honda Prologue rows. Two same-identity Honda/NHTSA corrections are proposed; two rows remain byte-for-byte unchanged because the available official records establish different or narrower identities.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All four rows remain published. Two are byte-for-byte unchanged.',
      'An unrelated investigation, narrower bulletin, component, symptom or model may never replace the issue named by an existing indexed page.',
      'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'The axle article is labeled as an active investigation and not a final defect finding or recall.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, prologueRecordCount: modelRows.length },
    observations: [
      { code: 'axle-condition-remains-under-investigation', severity: 'independent-review-required', recordIds: [IDS.axle], detail: 'Honda ATS30070 says the clicking noise does not affect normal driving when no damage is found and that the symptom is being investigated. The proposal does not call it a defect or recall.' },
      { code: 'display-recall-limited-to-exact-functions', severity: 'independent-review-required', recordIds: [IDS.display], detail: 'Recall 26V112 establishes instrument-panel and rearview-camera display failures. It does not establish loss of infotainment, navigation or climate controls, so those claims are removed from the proposal.' },
      { code: 'high-voltage-bulletins-not-substituted', severity: 'independent-review-required', recordIds: [IDS.highVoltage], detail: 'Bulletins 25-026 and 25-043 support narrower BECM/software identities. Neither is substituted for the frozen broad charging-and-performance page.' },
      { code: 'aeb-investigation-excludes-prologue', severity: 'independent-review-required', recordIds: [IDS.phantomBraking], detail: 'EA25002 covers Insight and Passport, not Prologue. The Prologue row remains frozen rather than inheriting another model\'s investigation.' },
    ],
    mismatchSources: MISMATCH_SOURCES, summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, KEEP_REASONS, MISMATCH_SOURCES, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
