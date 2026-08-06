/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-element-adjudication-2026-08-06.json');

const IDS = {
  ac: 'honda-element-ac-compressor-failure-2003',
  alternator: 'honda-element-alternator-failure-2003',
  doorLock: 'honda-element-door-lock-actuator-2003',
  oilConsumption: 'honda-element-oil-consumption-k24-2003',
  paint: 'honda-element-paint-clearcoat-peeling-2005',
  steeringLeak: 'honda-element-power-steering-leaks-2003',
  differential: 'honda-element-rear-differential-noise-awd-2003',
  waterLeak: 'honda-element-sunroof-water-leaks-2007',
  tailgate: 'honda-element-tailgate-hinge-problems-2003',
  timing: 'honda-element-timing-chain-k24-2003',
  transmission: 'honda-element-transmission-harsh-shifts-2003',
};

const MISMATCH_SOURCES = {
  vtcBulletin: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10204264-9999.pdf',
  accordTransmissionRecall: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V176-3885.pdf',
};

const RESEARCH_NOTES = {
  [IDS.ac]: 'The generic NHTSA vehicle page and replacement video do not establish an Element compressor defect, failure mechanism, scope or Honda remedy. The row remains byte-for-byte unchanged.',
  [IDS.alternator]: 'The Element forum and generic electrical-complaint page do not establish a 2003-2011 alternator defect rate or Honda remedy. The row remains unchanged.',
  [IDS.doorLock]: 'The frozen citation names a hard-to-turn mechanical lock-cylinder bulletin, while the indexed page claims power lock-actuator failure. Those are different components and no substitution is proposed.',
  [IDS.oilConsumption]: 'Generic NHTSA complaints, a nonexistent-looking forum path and a repair video do not establish an Element-wide K24 oil-consumption defect or the claimed repair hierarchy.',
  [IDS.paint]: 'The frozen Bulletin 10-069 citation has no URL and an exact Honda Element paint-extension record was not verified. The generic vehicle page cannot establish the claimed defect or warranty remedy.',
  [IDS.steeringLeak]: 'The generic NHTSA page and repair video do not establish a model-wide rack, pump and hose leak aggregation or Honda remedy.',
  [IDS.differential]: 'Honda Bulletin 07-024 applies to specified 2002-2007 CR-V vehicles, not Element. It cannot be substituted into this Element rear-differential page.',
  [IDS.waterLeak]: 'The generic vehicle page and video do not establish the claimed 2007-2011 SC sunroof/hatch leak scope, drain routing or Honda remedy.',
  [IDS.tailgate]: 'The generic vehicle page and lift-support video do not establish the combined hinge, support, latch and weatherstrip defect claimed by this row.',
  [IDS.timing]: 'Honda Bulletin 09-010 lists Accord, CR-V and Crosstour applications; it does not list Element. It supports a VTC actuator on other models, not this Element timing-chain/tensioner aggregation.',
  [IDS.transmission]: 'Honda Bulletin 04-037 is an Accord V6 automatic-transmission second-gear safety-recall bulletin, not an Element harsh-shift/judder bulletin. The row remains unchanged.',
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function evidenceFor(id) {
  if (id === IDS.timing) return [{ kind: 'citation-model-and-identity-mismatch', url: MISMATCH_SOURCES.vtcBulletin, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 09-010 lists Accord, CR-V and Crosstour applications and a VTC-actuator cold-start rattle; it does not list Element or establish timing-chain/tensioner failure.' }];
  if (id === IDS.transmission) return [{ kind: 'citation-model-and-identity-mismatch', url: MISMATCH_SOURCES.accordTransmissionRecall, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 04-037 covers an Accord V6 automatic-transmission second-gear safety recall, not Element harsh shifting.' }];
  return [];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Element');
  if (modelRows.length !== 11) throw new Error(`expected 11 Honda Element rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: RESEARCH_NOTES[current.id],
      identityRule: 'No content or publication-state changes; a different model, component, generic complaint page, video or forum cannot replace this issue.',
      commerceDecision: 'unchanged-pending-audit',
      changedFields: diffFields(before, before),
      evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(before),
      before,
      proposal: before,
    };
  });
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Honda',
    model: 'Element',
    completionStatement: 'This packet reconciles all 11 frozen Honda Element rows. No same-identity primary-source rewrite cleared the gate; all 11 rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All 11 rows remain published and byte-for-byte unchanged.',
      'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.',
      'Existing commerce remains frozen rather than being silently rewritten without exact repair-role evidence.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      elementRecordCount: modelRows.length,
    },
    observations: [
      { code: 'door-lock-component-mismatch', severity: 'independent-review-required', recordIds: [IDS.doorLock], detail: 'The frozen citation names a mechanical door-lock-cylinder condition, but the indexed card claims a power lock-actuator failure.' },
      { code: 'differential-bulletin-model-mismatch', severity: 'independent-review-required', recordIds: [IDS.differential], detail: 'Bulletin 07-024 applies to specified CR-V vehicles, not Element; the cited bulletin cannot support the frozen Element card.' },
      { code: 'vtc-bulletin-model-mismatch', severity: 'independent-review-required', recordIds: [IDS.timing], detail: 'Bulletin 09-010 does not list Element and supports VTC-actuator rattle rather than the broader timing-chain/tensioner narrative.' },
      { code: 'transmission-bulletin-model-mismatch', severity: 'independent-review-required', recordIds: [IDS.transmission], detail: 'Bulletin 04-037 is an Accord V6 second-gear recall, not an Element harsh-shift bulletin.' },
      { code: 'generic-source-cluster', severity: 'independent-review-required', recordIds: [IDS.ac, IDS.alternator, IDS.oilConsumption, IDS.steeringLeak, IDS.waterLeak, IDS.tailgate], detail: 'Generic NHTSA model pages, forums and videos do not establish the exact Element-wide defect, mechanism and remedy claims.' },
    ],
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 11, total: 11 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, MISMATCH_SOURCES, RESEARCH_NOTES, fullRecord, hashValue, normalizedFileHash };
