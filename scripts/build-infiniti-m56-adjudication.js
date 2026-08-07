/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs'); const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./infiniti-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-infiniti-m56-adjudication-2026-08-06.json');
const IDS = {
  controlArm: 'infiniti-m56-front-lower-control-arm-tension-rod-bushing-wear',
  cooling: 'infiniti-m56-radiator-cooling-fan-module-failure',
  steering: 'infiniti-m56-steering-rack-power-steering-leak-and-noise',
  timing: 'infiniti-m56-timing-chain-guide-wear-chain-noise',
  tpms: 'infiniti-m56-tpms-sensor-battery-failure',
};
const SOURCES = { timing: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10091401-2280.pdf' };
const SOURCE_SHA256 = { timing: '9307d5db85364d690d9f97cce65eca57d083bd01fbce39650bd7bd0686c95db7' };
const RECALL_QUERIES = Object.fromEntries([2011, 2012, 2013].map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=M56&modelYear=${year}`]));
const EXPECTED_CAMPAIGNS = { 2011: ['20V755000', '24V470000'], 2012: ['14V683000', '20V755000', '24V470000'], 2013: ['14V683000', '20V755000', '24V470000'] };
const KEEP_REASONS = {
  [IDS.controlArm]: 'The NHTSA complaints URL does not establish one 2011-2013 M56 lower-control-arm/tension-rod-bushing wear defect, its cause or whole-arm repair. No exact Infiniti/NHTSA bulletin or campaign cleared the identity gate, so the row remains byte-for-byte unchanged.',
  [IDS.cooling]: 'The NHTSA complaints URL does not establish one 2011-2013 M56 radiator/cooling-fan-module failure, the combined DTC set or replacement rule. No exact Infiniti/NHTSA bulletin or campaign cleared the identity gate, so the row remains byte-for-byte unchanged.',
  [IDS.steering]: 'The NHTSA complaints URL does not establish an M56 steering-rack/power-steering leak-and-noise defect, its rack-seal cause or replacement rule. No exact Infiniti/NHTSA bulletin or campaign cleared the identity gate, so the row remains byte-for-byte unchanged.',
  [IDS.timing]: 'Infiniti campaign P6305 covers selected 2011-2013 M56 vehicles and directs replacement of timing chains, chain guides and crank sprockets with countermeasure parts plus oil-jet inspection. It does not state guide wear or chain noise, so it is partial evidence for the broader indexed title and cannot authorize a rewrite; the row remains byte-for-byte unchanged.',
  [IDS.tpms]: 'The NHTSA complaints URL does not establish one 2011-2013 M56 TPMS-sensor battery-failure defect or a campaign-wide replacement rule. The official recall inventory contains no matching TPMS campaign, so the row remains byte-for-byte unchanged.',
};
function evidenceFor(id) {
  if (id === IDS.timing) return [{ kind: 'official-service-campaign-partial-identity', url: SOURCES.timing, verifiedOn: '2026-08-06', documentSha256: SOURCE_SHA256.timing, visuallyInspectedPages: [1, 4, 5, 13], observation: 'ITB16-015a/P6305 applies to selected 2011-2013 M56 vehicles and replaces timing chains, chain guides and crank sprockets with countermeasure parts while inspecting chain oil jets, but it does not state guide wear or chain noise.' }];
  return [{ kind: 'official-recall-set-unrelated-and-no-exact-bulletin', url: RECALL_QUERIES[2011], verifiedOn: '2026-08-06', observation: `The complete 2011-2013 M56 recall inventory covers driveshaft fracture and a fuel-pressure-sensor leak, not the existing catalog identity ${id}; no exact same-identity bulletin cleared the gate.`, supportingUrls: Object.values(RECALL_QUERIES) }];
}
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const modelRows = snapshot.records.filter((row) => row.make === 'Infiniti' && row.model === 'M56');
  if (modelRows.length !== 5) throw new Error(`expected 5 Infiniti M56 rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => { if (!KEEP_REASONS[current.id]) throw new Error(`missing M56 decision: ${current.id}`); const before = fullRecord(current); return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content or publication-state changes; a complaint page, partial bulletin, absent source or unrelated campaign cannot replace the indexed issue.', commerceDecision: 'unchanged-pending-audit', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before }; });
  const packet = { schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Infiniti', model: 'M56',
    completionStatement: 'This packet reconciles all five frozen Infiniti M56 rows. No exact full-identity primary-source rewrite cleared the gate; all five remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All five M56 rows remain published and byte-for-byte unchanged.', 'A partial timing-chain campaign cannot substantiate guide wear or chain noise that it does not state.', 'Distinct recall identities are deferred until the post-audit new-known-issues phase.', 'Independent row-by-row approval is required before any separate correction or addition path may be created.'],
    source: { snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, m56RecordCount: modelRows.length },
    observations: [
      { code: 'timing-campaign-partial-identity', severity: 'high', recordIds: [IDS.timing], detail: 'The visually inspected P6305 campaign establishes chain/guide/countermeasure replacement but not the indexed guide-wear or chain-noise assertions, so the row is held unchanged.' },
      { code: 'five-m56-identities-frozen', severity: 'independent-review-required', recordIds: Object.values(IDS), detail: 'None of the five existing indexed identities has an exact full-identity primary source; all remain byte-for-byte unchanged.' },
      { code: 'deferred-new-m56-recall-candidates', severity: 'post-audit-proposal-only', recordIds: [], campaignNumbers: ['14V683000', '20V755000', '24V470000'], detail: 'M56 fuel-pressure-sensor leakage and driveshaft-fracture campaigns are distinct missing-issue candidates. They are logged only and are not added or substituted during the current make audit.' },
      { code: 'all-m56-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'All five indexed M56 records remain published with identical IDs, titles, models, years, categories, content, citations and commerce.' },
    ], reviewSources: { timingPartial: SOURCES.timing }, mismatchSources: { recallQueries: RECALL_QUERIES, expectedCampaigns: EXPECTED_CAMPAIGNS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 5, deferred_new_issue_candidates: 3, total: 5 }, rows };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { EXPECTED_CAMPAIGNS, IDS, KEEP_REASONS, RECALL_QUERIES, SOURCES, SOURCE_SHA256, evidenceFor };
