/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./infiniti-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-infiniti-g35-adjudication-2026-08-06.json');
const IDS = {
  oil: 'infiniti-g35-oil-consumption-vq35de',
  steeringLock: 'infiniti-g35-steering-wheel-lock',
  window: 'infiniti-g35-window-regulator-failure',
};
const RECALL_QUERIES = Object.fromEntries([2003, 2004, 2005, 2006, 2007].map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=G35&modelYear=${year}`]));
const KEEP_REASONS = {
  [IDS.oil]: 'The row has no citation, and no exact Infiniti/NHTSA bulletin or campaign was found for one 2003-2007 G35 VQ35DE oil-consumption defect, the asserted one-quart rate, valve-seal/ring mechanism or short-block repair. Recall 03V-455 concerns camshaft/crankshaft sensor solder joints, not oil consumption, so the row remains byte-for-byte unchanged.',
  [IDS.steeringLock]: 'The row has no citation, and no exact 2003-2007 G35 bulletin or campaign was found for the indexed electronic steering-lock-actuator no-start identity, BCM reprogramming or bypass remedy. No later-model steering-lock program may be transferred to this page, so the row remains byte-for-byte unchanged.',
  [IDS.window]: 'The row has no citation, and no exact Infiniti/NHTSA bulletin or campaign was found for one 2003-2007 G35 regulator cable/clip defect, hot-climate mechanism or aftermarket replacement pathway. The row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  const observations = {
    [IDS.oil]: 'The official G35 recall inventory includes 03V-455 for sensor solder-joint failure, but no oil-consumption, valve-stem-seal, piston-ring or short-block campaign.',
    [IDS.steeringLock]: 'The official 2003-2007 G35 recall inventory contains no electronic steering-lock-actuator or BCM no-start campaign.',
    [IDS.window]: 'The official 2003-2007 G35 recall inventory contains no power-window-regulator, cable or guide-clip campaign.',
  };
  return [{ kind: 'official-recall-set-unrelated', url: RECALL_QUERIES[2003], verifiedOn: '2026-08-06', observation: observations[id], supportingUrls: Object.values(RECALL_QUERIES) }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'G35');
  if (modelRows.length !== 3) throw new Error(`expected 3 Infiniti G35 rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id]) throw new Error(`missing G35 decision: ${current.id}`);
    const before = fullRecord(current);
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content or publication-state changes; an absent citation or unrelated campaign cannot replace the indexed issue.', commerceDecision: 'unchanged-pending-audit', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Infiniti', model: 'G35',
    completionStatement: 'This packet reconciles all three frozen Infiniti G35 rows. No exact primary-source rewrite cleared the gate; all three remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All three G35 rows remain published and byte-for-byte unchanged.',
      'An unrelated sensor recall cannot be substituted into an oil-consumption, steering-lock or window-regulator page.',
      'The separately discovered 2003 sensor campaign is deferred until the post-audit new-known-issues phase.',
      'Independent row-by-row approval is required before any separate correction or addition path may be created.',
    ],
    source: { snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, g35RecordCount: modelRows.length },
    observations: [
      { code: 'three-g35-identities-frozen', severity: 'independent-review-required', recordIds: Object.values(IDS), detail: 'None of the three existing indexed identities has an exact primary source; all remain byte-for-byte unchanged.' },
      { code: 'deferred-new-sensor-issue-candidate', severity: 'post-audit-proposal-only', recordIds: [], detail: 'NHTSA recall 03V-455 covers certain 2003 G35 camshaft/crankshaft sensor circuit-board solder-joint failures. It is a distinct missing issue candidate and is not added, substituted or applied during the remaining-make audit.', sourceUrl: RECALL_QUERIES[2003], campaignNumber: '03V455000' },
      { code: 'three-g35-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'All three indexed G35 records remain published with identical IDs, titles, categories, content, citations and commerce.' },
    ],
    mismatchSources: { recallQueries: RECALL_QUERIES },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 3, deferred_new_issue_candidates: 1, total: 3 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, RECALL_QUERIES, evidenceFor };
