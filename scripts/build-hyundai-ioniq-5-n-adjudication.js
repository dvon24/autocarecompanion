/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs'); const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');
const ROOT = path.resolve(__dirname, '..'); const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-ioniq-5-n-adjudication-2026-08-06.json');
const IDS = {
  iccu: 'hyundai-ioniq-5-n-iccu-failure-2024', battery12v: 'hyundai-ioniq-5-n-12v-battery-drain-2024',
  brakeNoise: 'hyundai-ioniq-5-n-brake-transition-noise-2024', motorWhine: 'hyundai-ioniq-5-n-motor-whine-highway-2024',
};
const MISMATCH_SOURCES = {
  iccu: 'https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V868-3172.pdf',
  braking: 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V235-5140.pdf',
};
const KEEP_REASONS = {
  [IDS.iccu]: 'Recall 24V-868 covers 2022-2024 Ioniq 5 vehicles but does not identify the U.S.-market Ioniq 5 N, which NHTSA identifies as model year 2025 in N-specific recall 25V-235. It also does not establish the frozen DC-fast-charging, repeat-failure, backorder or post-repair claims, so the 2024 Ioniq 5 N row remains byte-for-byte unchanged.',
  [IDS.battery12v]: 'A consumer article about the E-GMP ICCU recall does not establish a separate 2024 Ioniq 5 N parasitic-draw defect involving Bluelink, security, N controllers, AGM sizing or the claimed parked-duration pattern. The row remains byte-for-byte unchanged.',
  [IDS.brakeNoise]: 'The two cited forum threads concern ordinary Ioniq 5 brake noise and do not establish an Ioniq 5 N-specific regenerative-to-friction transition defect, caliper-hardware remedy, rotor costs or rust progression. Recall 25V-235 concerns LFB/N e-Shift software, a different identity, so the row remains byte-for-byte unchanged.',
  [IDS.motorWhine]: 'A single forum thread does not establish an Ioniq 5 N front-drive-unit defect, comparative noise level, temperature pattern, repeat replacement history or warranty remedy. No exact Hyundai primary document was found, so the row remains byte-for-byte unchanged.',
};
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Ioniq 5 N');
  if (modelRows.length !== 4) throw new Error(`expected 4 Hyundai Ioniq 5 N rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const evidence = [];
    if (current.id === IDS.iccu) evidence.push({ kind: 'model-year-and-variant-mismatch', url: MISMATCH_SOURCES.iccu, verifiedOn: '2026-08-06', observation: 'Recall 24V-868 identifies 2022-2024 Ioniq 5 vehicles but does not establish the frozen 2024 Ioniq 5 N record or its full title/outcome scope.' });
    if (current.id === IDS.brakeNoise) evidence.push({ kind: 'different-failure-mode', url: MISMATCH_SOURCES.braking, verifiedOn: '2026-08-06', observation: 'Recall 25V-235 covers 2025 Ioniq 5 N LFB/N e-Shift software, not regenerative-to-friction transition noise.' });
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content or publication-state changes; a different model year, variant, component or failure mode cannot replace this indexed issue.', commerceDecision: 'unchanged-pending-audit', changedFields: [], evidence, beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Hyundai', model: 'Ioniq 5 N',
    completionStatement: 'This packet reconciles all four frozen Hyundai Ioniq 5 N rows. No exact same-identity primary-source rewrite cleared the gate; all four remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.', 'All four rows remain published and byte-for-byte unchanged.', 'A standard-Ioniq-5 recall, a different N failure mode or a different model year may never replace an existing indexed Ioniq 5 N page.', 'Existing commerce remains frozen rather than being silently rewritten without exact repair-role evidence.', 'Independent row-by-row approval is required before any separate correction path may be created.'],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, ioniq5nRecordCount: modelRows.length },
    observations: [
      { code: 'iccu-variant-year-mismatch', severity: 'independent-review-required', recordIds: [IDS.iccu], detail: 'Recall 24V-868 does not establish the frozen 2024 Ioniq 5 N identity or its full charging/repeat-failure narrative.' },
      { code: 'braking-recall-different-identity', severity: 'independent-review-required', recordIds: [IDS.brakeNoise], detail: 'Recall 25V-235 is a 2025 LFB/N e-Shift software issue, not the frozen brake-transition-noise page.' },
      { code: 'two-owner-narratives-frozen', severity: 'independent-review-required', recordIds: [IDS.battery12v, IDS.motorWhine], detail: 'The 12-volt drain and motor-whine narratives lack exact Ioniq 5 N primary evidence and remain unchanged.' },
    ], mismatchSources: MISMATCH_SOURCES, summary: { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, MISMATCH_SOURCES, fullRecord, hashValue, normalizedFileHash };
