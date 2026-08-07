/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs'); const path = require('node:path'); const { fullRecord, hashValue, normalizedFileHash } = require('./infiniti-adjudication-utils');
const ROOT = path.resolve(__dirname, '..'); const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json'); const OUTPUT = path.join(ROOT, 'data', 'known-issue-infiniti-q50-adjudication-2026-08-06.json');
const ID = 'infiniti-q50-intouch-infotainment-lag';
const SOURCES = { diagnostic: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10231853-0001.pdf', q50Update: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10179560-0001.pdf' };
const SOURCE_SHA256 = { diagnostic: '0a0a2d6b538e7892a1a0005188f3cc320c08d7857e7af700e1461dec7dbbdc9f', q50Update: '176795b2f2c461fe3d117e7aa278f7fd42149054bd177a9a85682a70b0b0a683' };
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 13 }, (_, index) => 2014 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=Q50&modelYear=${year}`]));
const EXPECTED_CAMPAIGNS = {
  2014: ['13V588000', '14V138000', '16V244000', '16V430000', '24V470000'], 2015: ['16V244000', '16V430000', '24V470000'], 2016: ['16V244000', '16V430000', '17V476000', '24V470000'],
  2017: ['16V244000', '17V476000', '17V571000', '24V470000'], 2018: ['17V476000', '19V654000', '24V470000'], 2019: ['19V654000'], 2020: [],
  2021: ['21V234000', '21V402000', '21V599000'], 2022: [], 2023: [], 2024: [], 2025: [], 2026: [],
};
const KEEP_REASON = 'Infiniti ITB21-011B describes intermittent freezes/reboots and blank screens for Infiniti infotainment systems, while ITB20-021 provides a stability update for the 2020 Q50. Those documents do not validate the frozen 2014-2026 scope or its navigation, Bluetooth, outdated-processor, reset, replacement-cost and aftermarket claims. Because the indexed identity cannot be narrowed in this proposal-only audit, the row remains byte-for-byte unchanged.';
function evidence() { return [
  { kind: 'official-service-bulletin-partial-symptom-identity', url: SOURCES.diagnostic, verifiedOn: '2026-08-06', documentSha256: SOURCE_SHA256.diagnostic, visuallyInspectedPages: [1, 2], observation: 'ITB21-011B applies to all Infiniti infotainment systems and distinguishes intermittent freezes/reboots from constant blank screens, but it is a diagnostic framework published in 2023 and does not establish the full 2014-2026 Q50 scope or the row’s claimed processor cause.' },
  { kind: 'official-model-bulletin-partial-year-scope', url: SOURCES.q50Update, verifiedOn: '2026-08-06', documentSha256: SOURCE_SHA256.q50Update, visuallyInspectedPages: [1], observation: 'ITB20-021 applies specifically to the 2020 Q50 and directs an AV-control-unit software update for stability improvements and bug fixes; it does not cover every frozen model year or authorize the row’s broader claims.' },
]; }
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const modelRows = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'Q50'); if (modelRows.length !== 1 || modelRows[0].id !== ID) throw new Error(`expected the frozen Infiniti Q50 row, found ${modelRows.length}`);
  const before = fullRecord(modelRows[0]); const row = { id: ID, model: 'Q50', action: 'keep_published_pending_source', reason: KEEP_REASON, identityRule: 'No content, year-scope or publication-state changes; partial symptoms and model-year-specific bulletins cannot be expanded across the frozen identity.', commerceDecision: 'unchanged-pending-audit', changedFields: [], evidence: evidence(), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  const packet = { schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Infiniti', model: 'Q50',
    completionStatement: 'This packet reconciles the one frozen Infiniti Q50 row. Official evidence is partial in scope, so the row remains byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'The indexed Q50 row remains published and byte-for-byte unchanged.', 'A 2020 model-specific update and a 2023 all-Infiniti diagnostic framework cannot establish a 2014-2026 defect scope.', 'The official recall inventory is deferred for the post-audit new-known-issues phase and is not substituted here.', 'Independent row-by-row approval is required before any separate correction or addition path may be created.'],
    source: { snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, q50RecordCount: 1 },
    observations: [
      { code: 'intouch-evidence-partial-scope', severity: 'high', recordIds: [ID], detail: 'Visually inspected official bulletins support some infotainment symptoms and a 2020 update but not the full frozen year scope or the row’s asserted mechanism and remedies.' },
      { code: 'q50-recall-inventory-deferred', severity: 'post-audit-review', recordIds: [], campaignNumbers: [...new Set(Object.values(EXPECTED_CAMPAIGNS).flat())].sort(), detail: 'The official recall inventory is distinct from the indexed infotainment identity and is preserved for the later new-issue/deduplication phase.' },
      { code: 'q50-page-preserved', severity: 'seo-safety', recordIds: [ID], detail: 'The indexed Q50 record remains published with identical ID, title, model, years, category, content, citations and commerce.' },
    ], reviewSources: SOURCES, mismatchSources: { recallQueries: RECALL_QUERIES, expectedCampaigns: EXPECTED_CAMPAIGNS }, summary: { rewrite_same_identity: 0, keep_published_pending_source: 1, total: 1 }, rows: [row] };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main(); module.exports = { EXPECTED_CAMPAIGNS, ID, KEEP_REASON, RECALL_QUERIES, SOURCES, SOURCE_SHA256, evidence };
