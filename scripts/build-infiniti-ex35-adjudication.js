/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./infiniti-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_infiniti-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-infiniti-ex35-adjudication-2026-08-06.json',
);

const ID = 'infiniti-ex35-oil-consumption';
const RECALL_QUERIES = Object.fromEntries(
  [2008, 2009, 2010, 2011, 2012].map((year) => [
    year,
    `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Infiniti&model=EX35&modelYear=${year}`,
  ]),
);
const KEEP_REASON =
  'The existing forum-homepage citation does not establish one 2008-2012 EX35 VQ35HR oil-consumption defect, the asserted one-quart rate, valve-stem-seal and piston-ring mechanism, dealer threshold or repair scope. The official model-year recall set covers steering-column, air-bag and aftermarket-hitch defects only, so this indexed row remains published and byte-for-byte unchanged pending an exact primary source.';

function evidenceFor() {
  return [
    {
      kind: 'official-recall-set-unrelated',
      url: RECALL_QUERIES[2008],
      verifiedOn: '2026-08-06',
      observation:
        'NHTSA results for the 2008-2012 EX35 cover steering-column, passenger-air-bag, occupant-classification and aftermarket-hitch defects; none establishes engine-oil consumption, valve-stem-seal wear or piston-ring coking.',
      supportingUrls: Object.values(RECALL_QUERIES),
      observedCampaignNumbers: ['08V066000', '08V521000', '09E050000', '15V054000'],
    },
  ];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Infiniti' && row.model === 'EX35',
  );
  if (modelRows.length !== 1 || modelRows[0].id !== ID) {
    throw new Error(`expected the frozen Infiniti EX35 row, found ${modelRows.length}`);
  }

  const before = fullRecord(modelRows[0]);
  const rows = [
    {
      id: ID,
      model: 'EX35',
      action: 'keep_published_pending_source',
      reason: KEEP_REASON,
      identityRule:
        'No content or publication-state changes; an unrelated recall set and a forum homepage cannot substantiate or replace the indexed issue.',
      commerceDecision: 'unchanged-pending-audit',
      changedFields: [],
      evidence: evidenceFor(),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(before),
      before,
      proposal: before,
    },
  ];

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Infiniti',
    model: 'EX35',
    completionStatement:
      'This packet reconciles the one frozen Infiniti EX35 row. No exact primary-source rewrite cleared the gate, so the indexed page remains byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'The EX35 row remains published and byte-for-byte unchanged.',
      'An unrelated recall set or forum homepage may never replace an indexed issue.',
      'Existing citations and commerce remain frozen rather than being silently rewritten without exact identity and fitment evidence.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_infiniti-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      ex35RecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'official-recall-set-unrelated',
        severity: 'independent-review-required',
        recordIds: [ID],
        detail:
          'The 2008-2012 NHTSA recall results cover steering, air-bag and aftermarket-hitch defects, not the indexed oil-consumption identity.',
      },
      {
        code: 'unsupported-mechanism-and-threshold-frozen',
        severity: 'high',
        recordIds: [ID],
        detail:
          'No exact primary source was found for the claimed consumption rate, valve-seal and ring mechanism, dealer threshold or repair bundle.',
      },
      {
        code: 'one-ex35-page-preserved',
        severity: 'seo-safety',
        recordIds: [ID],
        detail:
          'The indexed EX35 record remains published with identical identity, content, citations and commerce.',
      },
    ],
    mismatchSources: { recallQueries: RECALL_QUERIES },
    summary: {
      rewrite_same_identity: 0,
      keep_published_pending_source: 1,
      total: 1,
    },
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(
    JSON.stringify(
      { output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary },
      null,
      2,
    ),
  );
}

if (require.main === module) main();
module.exports = {
  ID,
  KEEP_REASON,
  RECALL_QUERIES,
  evidenceFor,
  fullRecord,
  hashValue,
  normalizedFileHash,
};
