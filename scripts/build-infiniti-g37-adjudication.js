/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./infiniti-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-infiniti-g37-adjudication-2026-08-06.json');
const IDS = { csc: 'infiniti-g37-concentric-slave-cylinder', gallery: 'infiniti-g37-galley-gasket-oil-leak', steeringLock: 'infiniti-g37-steering-lock-malfunction' };
const SOURCES = { clutchPedal: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10051925-8330.pdf' };
const SOURCE_SHA256 = { clutchPedal: 'e6aacece362bdb12b545d08ce07d82fdaf9edd86bc98fc9fe699a16d050e0644' };
const RECALL_QUERIES = Object.fromEntries([2008, 2009, 2010, 2011, 2012, 2013].map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=G37&modelYear=${year}`]));
const KEEP_REASONS = {
  [IDS.csc]: 'Infiniti ITB13-005A covers a clutch pedal that does not return on 2008-2013 six-speed-manual G37 vehicles only when there are no hydraulic leaks, and directs a fluid change and bleed. It does not establish the indexed leaking concentric-slave-cylinder identity, internal-seal mechanism, transmission-removal replacement or aftermarket upgrade, so the row remains byte-for-byte unchanged.',
  [IDS.gallery]: 'The row has no citation, and no exact Infiniti/NHTSA bulletin or campaign was found for the indexed VQ37VHR oil-gallery-gasket leak, its stated location between oil pans, exhaust/fire outcome or short repair procedure. The location narrative conflicts with known front-cover service architecture, but without an exact approved replacement identity the row remains byte-for-byte unchanged.',
  [IDS.steeringLock]: 'An Infiniti homepage does not establish one 2008-2013 G37 steering-lock-actuator defect, internal motor/BCM communication cause, campaign eligibility or repair. No exact G37 steering-lock bulletin or campaign was found, and Nissan programs for other models cannot be transferred, so the row remains byte-for-byte unchanged.',
};
function evidenceFor(id) {
  if (id === IDS.csc) return [{ kind: 'official-record-partial-and-contradictory', url: SOURCES.clutchPedal, verifiedOn: '2026-08-06', documentSha256: SOURCE_SHA256.clutchPedal, visuallyInspectedPages: [1], observation: 'ITB13-005A applies to 2008-2013 G37 six-speed manual vehicles with a clutch pedal that does not return and explicitly requires no leaks in the clutch hydraulic system. It directs a fluid change/bleed and does not establish a leaking concentric slave cylinder or transmission-removal replacement.' }];
  const observation = id === IDS.gallery ? 'The official 2008-2013 G37 recall inventory contains no oil-gallery-gasket, front-cover oil-pressure or oil-leak campaign.' : 'The official 2008-2013 G37 recall inventory contains no electronic steering-lock-actuator or BCM no-start campaign.';
  return [{ kind: 'official-recall-set-unrelated', url: RECALL_QUERIES[2008], verifiedOn: '2026-08-06', observation, supportingUrls: Object.values(RECALL_QUERIES) }];
}
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'G37');
  if (modelRows.length !== 3) throw new Error(`expected 3 Infiniti G37 rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => { if (!KEEP_REASONS[current.id]) throw new Error(`missing G37 decision: ${current.id}`); const before = fullRecord(current); return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content or publication-state changes; a partial/contradictory bulletin, absent citation or unrelated campaign cannot replace the indexed issue.', commerceDecision: 'unchanged-pending-audit', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before }; });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Infiniti', model: 'G37',
    completionStatement: 'This packet reconciles all three frozen Infiniti G37 rows. No exact primary-source rewrite cleared the gate; all three remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All three G37 rows remain published and byte-for-byte unchanged.', 'A no-leak clutch-pedal bulletin cannot substantiate a leaking CSC identity.', 'The separately discovered power-window-switch campaign is deferred until the post-audit new-known-issues phase.', 'Independent row-by-row approval is required before any separate correction or addition path may be created.'],
    source: { snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, g37RecordCount: modelRows.length },
    observations: [
      { code: 'clutch-bulletin-does-not-prove-csc-failure', severity: 'high', recordIds: [IDS.csc], detail: 'The visually inspected ITB13-005A requires no hydraulic leak and specifies fluid service, so the CSC-leak/replacement page is held unchanged.' },
      { code: 'three-g37-identities-frozen', severity: 'independent-review-required', recordIds: Object.values(IDS), detail: 'None of the three existing indexed identities has an exact full-identity primary source; all remain byte-for-byte unchanged.' },
      { code: 'deferred-new-power-window-switch-candidate', severity: 'post-audit-proposal-only', recordIds: [], detail: 'NHTSA recall 11V-538 covers certain 2011-2012 G37 Coupe power-window switch controllers manufactured out of specification. It is a distinct missing issue candidate and is not added, substituted or applied during this audit.', sourceUrl: RECALL_QUERIES[2011], campaignNumber: '11V538000' },
      { code: 'three-g37-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'All three indexed G37 records remain published with identical IDs, titles, categories, content, citations and commerce.' },
    ],
    reviewSources: { clutchPedalPartial: SOURCES.clutchPedal }, mismatchSources: { recallQueries: RECALL_QUERIES },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 3, deferred_new_issue_candidates: 1, total: 3 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, RECALL_QUERIES, SOURCES, SOURCE_SHA256, evidenceFor };
