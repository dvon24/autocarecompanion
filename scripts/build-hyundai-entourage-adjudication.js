/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-entourage-adjudication-2026-08-06.json');
const IDS = {
  alternator: 'hyundai-entourage-alternator-2007',
  crankSensor: 'hyundai-entourage-crankshaft-sensor-2007',
  engineKnock: 'hyundai-entourage-engine-knock-2007',
  slidingDoor: 'hyundai-entourage-sliding-door-2007',
};
const MISMATCH_SOURCES = {
  hyundaiServicePortal: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10061024-2273.pdf',
  txxmEngineWarranty: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10227316-0001.pdf',
  nhtsaRecalls2007: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Hyundai&model=Entourage&modelYear=2007',
};
const KEEP_REASONS = {
  [IDS.alternator]: 'Forum and generic complaint references do not establish one 2007-2009 Entourage defect combining alternator failure, 60,000-80,000-mile incidence, sliding-door-module sleep behavior and a Hyundai BCM update. Hyundai\'s service-information index offers generic parasitic-draw diagnostics but no exact campaign for this identity, so the row remains byte-for-byte unchanged.',
  [IDS.crankSensor]: 'The cited TSB has no URL and its title describes crankshaft-position-sensor diagnostics, not one Entourage sensor defect, heat-soak failure population or replacement remedy. NHTSA\'s 2007 Entourage recall set includes a wiring-harness recall that can cause stalling or no-start, but it is not a crankshaft sensor and cannot replace this indexed identity.',
  [IDS.engineKnock]: 'The frozen row claims a Lambda 3.8L connecting-rod-bearing defect and a 15-year/200,000-mile settlement without a primary citation. Hyundai warranty extension TXXM lists other Hyundai engines and models but not Entourage, so it cannot support this page and the row remains byte-for-byte unchanged.',
  [IDS.slidingDoor]: 'Forum and complaint references do not establish one 2007-2009 cable/motor defect, named part numbers, reversal mechanism or maintenance remedy. Hyundai\'s service-information index provides an Entourage sliding-door troubleshooting diagram but does not establish the frozen failure narrative or a campaign, so the row remains unchanged.',
};

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Entourage');
  if (modelRows.length !== 4) throw new Error(`expected 4 Hyundai Entourage rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    if (!KEEP_REASONS[current.id]) throw new Error(`missing Entourage decision: ${current.id}`);
    const evidence = [];
    if ([IDS.alternator, IDS.crankSensor, IDS.slidingDoor].includes(current.id)) evidence.push({ kind: 'diagnostic-index-not-defect-source', url: MISMATCH_SOURCES.hyundaiServicePortal, verifiedOn: '2026-08-06', observation: 'Hyundai\'s service-information index provides diagnostic resources but does not establish the frozen defect, population or remedy.' });
    if (current.id === IDS.crankSensor) evidence.push({ kind: 'component-mismatch', url: MISMATCH_SOURCES.nhtsaRecalls2007, verifiedOn: '2026-08-06', observation: 'NHTSA\'s 2007 recall list contains a stop-lamp wiring-harness chafe condition that may stall or prevent starting, not a crankshaft-position-sensor defect.' });
    if (current.id === IDS.engineKnock) evidence.push({ kind: 'model-scope-mismatch', url: MISMATCH_SOURCES.txxmEngineWarranty, verifiedOn: '2026-08-06', observation: 'Hyundai TXXM engine-warranty coverage does not list Entourage or its 3.8L Lambda engine.' });
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content or publication-state changes; a diagnostic guide, different component, warranty program or symptom overlap cannot replace this indexed issue.', commerceDecision: 'unchanged-pending-audit', changedFields: [], evidence, beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Hyundai', model: 'Entourage',
    completionStatement: 'This packet reconciles all four frozen Hyundai Entourage rows. No same-identity primary-source rewrite cleared the gate; all four remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.', 'All four rows remain published and byte-for-byte unchanged.', 'An unrelated recall, diagnostic guide, component, warranty program or shared symptom may never replace the issue named by an existing indexed page.', 'Existing commerce remains frozen rather than being silently rewritten without exact repair-role evidence.', 'Independent row-by-row approval is required before any separate correction path may be created.'],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, entourageRecordCount: modelRows.length },
    observations: [
      { code: 'diagnostic-guides-not-defect-proof', severity: 'independent-review-required', recordIds: [IDS.alternator, IDS.crankSensor, IDS.slidingDoor], detail: 'Hyundai diagnostic resources do not establish the frozen defect populations, mechanisms or remedies.' },
      { code: 'wiring-stall-not-crank-sensor', severity: 'independent-review-required', recordIds: [IDS.crankSensor], detail: 'Recall 06V356 can cause stalling or no-start through chafed stop-lamp wiring, but it is not the crankshaft-sensor identity.' },
      { code: 'entourage-excluded-from-engine-extension', severity: 'independent-review-required', recordIds: [IDS.engineKnock], detail: 'The located Hyundai engine warranty extension does not include Entourage or its 3.8L Lambda engine.' },
      { code: 'unsupported-commerce-frozen', severity: 'independent-review-required', recordIds: [IDS.alternator, IDS.slidingDoor], detail: 'Replacement-part and service advice remain frozen because no exact primary repair document supports them.' },
    ],
    mismatchSources: MISMATCH_SOURCES,
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, MISMATCH_SOURCES, fullRecord, hashValue, normalizedFileHash };
