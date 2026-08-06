/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-hyundai-scoupe-adjudication-2026-08-06.json',
);

const IDS = {
  timingBelt: 'hyundai-scoupe-timing-belt-1991',
  alternator: 'hyundai-scoupe-alternator-failure-1991',
  transmission: 'hyundai-scoupe-auto-transmission-1991',
  headGasket: 'hyundai-scoupe-head-gasket-1991',
  rearStrut: 'hyundai-scoupe-rear-strut-mount-1991',
};

const RECALL_QUERIES = Object.fromEntries(
  [1991, 1992, 1993, 1994, 1995].map((year) => [
    year,
    `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Hyundai&model=Scoupe&modelYear=${year}`,
  ]),
);

const KEEP_REASONS = {
  [IDS.timingBelt]:
    'A forum homepage does not establish one Scoupe timing-belt-tensioner defect, interference-engine outcome, 60,000-mile interval, related-part bundle or repair cost across 1991-1995 vehicles. No exact Hyundai primary bulletin or campaign was found, so the row remains byte-for-byte unchanged.',
  [IDS.alternator]:
    'A generic NHTSA vehicle page and an unverified video do not establish one premature-alternator defect, voltage-regulator mechanism, broad 1991-1995 scope or replacement cost. The row remains byte-for-byte unchanged.',
  [IDS.transmission]:
    'A generic NHTSA vehicle page and an unverified video do not establish one Scoupe automatic-transmission clutch-pack defect, failure rate, fluid interval or rebuild procedure across 1991-1995 vehicles. The row remains byte-for-byte unchanged.',
  [IDS.headGasket]:
    'A generic NHTSA vehicle page, implausible forum URL and unverified video do not establish one shared-platform head-gasket defect, overheating mechanism or repair procedure across all 1991-1995 Scoupe engines. The row remains byte-for-byte unchanged.',
  [IDS.rearStrut]:
    'A generic NHTSA vehicle page and placeholder-style video URL do not establish one Scoupe rear-strut-mount-bearing defect, collapse mechanism, mileage pattern or replacement procedure. The row remains byte-for-byte unchanged.',
};

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Hyundai' && row.model === 'Scoupe',
  );
  if (modelRows.length !== 5) {
    throw new Error(`expected 5 Hyundai Scoupe rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    if (!KEEP_REASONS[current.id]) throw new Error(`missing Scoupe decision: ${current.id}`);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule:
        'No content or publication-state changes; a generic complaint page, unverified repair source or empty recall result cannot replace this indexed issue.',
      commerceDecision: 'unchanged-pending-audit',
      changedFields: [],
      evidence: [
        {
          kind: 'official-recall-set-empty',
          url: RECALL_QUERIES[1991],
          verifiedOn: '2026-08-06',
          observation:
            'NHTSA recall API checks returned zero Scoupe campaigns for every model year from 1991 through 1995, so no campaign supports this frozen issue.',
          supportingUrls: Object.values(RECALL_QUERIES),
        },
      ],
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
    make: 'Hyundai',
    model: 'Scoupe',
    completionStatement:
      'This packet reconciles all five frozen Hyundai Scoupe rows. No same-identity primary-source rewrite cleared the gate; all five remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All five rows remain published and byte-for-byte unchanged.',
      'An empty recall result, generic complaint page, unverified video or shared symptom may never replace an indexed issue.',
      'Existing commerce remains frozen rather than being silently rewritten without exact repair-role evidence.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      scoupeRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'official-recall-set-empty',
        severity: 'independent-review-required',
        recordIds: Object.values(IDS),
        detail:
          'NHTSA recall API queries for model years 1991-1995 each returned Count 0; no official recall supports any of the five indexed narratives.',
      },
      {
        code: 'generic-and-unverified-sources-frozen',
        severity: 'independent-review-required',
        recordIds: Object.values(IDS),
        detail:
          'Generic vehicle pages, forum homepages and unverified or placeholder-style videos do not establish model-wide defect, mileage, part or cost claims.',
      },
      {
        code: 'five-scoupe-pages-preserved',
        severity: 'seo-safety',
        recordIds: Object.values(IDS),
        detail:
          'All five indexed Scoupe records remain published with identical titles, categories, content, citations and commerce.',
      },
    ],
    mismatchSources: { recallQueries: RECALL_QUERIES },
    summary: {
      rewrite_same_identity: 0,
      keep_published_pending_source: 5,
      total: 5,
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
module.exports = { IDS, KEEP_REASONS, RECALL_QUERIES, fullRecord, hashValue, normalizedFileHash };
