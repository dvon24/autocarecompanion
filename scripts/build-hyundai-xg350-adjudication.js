/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-hyundai-xg350-adjudication-2026-08-06.json',
);

const IDS = {
  intake: 'hyundai-xg350-intake-manifold-gasket-2002',
  steering: 'hyundai-xg350-power-steering-2002',
  timing: 'hyundai-xg350-timing-belt-tensioner-2001',
  window: 'hyundai-xg350-window-regulator-2002',
};

const RECALL_QUERIES = Object.fromEntries(
  [2001, 2002, 2003, 2004, 2005].map((year) => [
    year,
    `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Hyundai&model=XG350&modelYear=${year}`,
  ]),
);

const KEEP_REASONS = {
  [IDS.intake]:
    'A generic NHTSA vehicle page and unverified video do not establish one 2002-2005 XG350 intake-manifold-gasket defect, upper-plenum failure pattern, DTC set, repair scope or commerce fitment. The official recall set contains only unrelated sub-frame and fuel-tank-valve campaigns, so the row remains byte-for-byte unchanged.',
  [IDS.steering]:
    'A forum homepage does not establish one XG350 power-steering pump and pressure-line defect, hot-weather mechanism, failure pattern or repair cost. The official sub-frame recall may mention steering pull but concerns lower-control-arm attachment and cannot support a pump or line-leak identity, so the row remains byte-for-byte unchanged.',
  [IDS.timing]:
    'A generic vehicle page and placeholder-style forum and video URLs do not establish one XG350 hydraulic timing-belt-tensioner defect, interference-engine outcome, 60,000-mile interval, DTC set or repair cost. No official XG350 recall matches the identity, so the row remains byte-for-byte unchanged.',
  [IDS.window]:
    'A generic complaint page and placeholder-style forum and video URLs do not establish one 2002-2005 XG350 regulator-cable defect, front-window frequency or the asserted motor, lubrication and wiring repair bundle. No official XG350 recall matches the identity, so the row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  const detail =
    id === IDS.steering
      ? 'The official XG350 recall set covers salt-belt front-subframe corrosion and fuel-tank valves. The sub-frame campaign may mention steering pull from control-arm mounting damage, but none concerns a power-steering pump or hydraulic line leak.'
      : 'The official XG350 recall set covers salt-belt front-subframe corrosion and fuel-tank valves; none concerns the indexed intake-gasket, timing-tensioner or window-regulator identity.';
  return [
    {
      kind: 'official-recall-set-unrelated',
      url: RECALL_QUERIES[2001],
      verifiedOn: '2026-08-06',
      observation: detail,
      supportingUrls: Object.values(RECALL_QUERIES),
      observedCampaignNumbers: ['04V178000', '04V369000', '09V124000'],
    },
  ];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Hyundai' && row.model === 'XG350',
  );
  if (modelRows.length !== 4) {
    throw new Error(`expected 4 Hyundai XG350 rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    if (!KEEP_REASONS[current.id]) throw new Error(`missing XG350 decision: ${current.id}`);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule:
        'No content or publication-state changes; a generic page, placeholder-style URL or unrelated recall cannot replace this indexed issue.',
      commerceDecision: 'unchanged-pending-audit',
      changedFields: [],
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
    make: 'Hyundai',
    model: 'XG350',
    completionStatement:
      'This packet reconciles all four frozen Hyundai XG350 rows. No same-identity primary-source rewrite cleared the gate; all four remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All four rows remain published and byte-for-byte unchanged.',
      'An unrelated recall, generic vehicle page or placeholder-style secondary URL may never replace an indexed issue.',
      'Existing commerce remains frozen rather than being silently rewritten without exact identity and fitment evidence.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      xg350RecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'official-recall-set-unrelated',
        severity: 'independent-review-required',
        recordIds: Object.values(IDS),
        detail:
          'NHTSA API results for 2001-2005 contain only front-subframe corrosion and fuel-tank-valve campaigns, plus no 2005 campaign; none supports these four indexed identities.',
      },
      {
        code: 'steering-pull-not-hydraulic-steering-defect',
        severity: 'high',
        recordIds: [IDS.steering],
        detail:
          'The sub-frame recall may mention steering pull from control-arm mounting damage, but it cannot establish pump wear or pressure-line leakage.',
      },
      {
        code: 'generic-and-placeholder-sources-frozen',
        severity: 'independent-review-required',
        recordIds: Object.values(IDS),
        detail:
          'Generic vehicle pages, a forum homepage and placeholder-style forum or video URLs do not establish model-wide failure, diagnostic, repair or commerce claims.',
      },
      {
        code: 'four-xg350-pages-preserved',
        severity: 'seo-safety',
        recordIds: Object.values(IDS),
        detail:
          'All four indexed XG350 records remain published with identical titles, categories, content, citations and commerce.',
      },
    ],
    mismatchSources: { recallQueries: RECALL_QUERIES },
    summary: {
      rewrite_same_identity: 0,
      keep_published_pending_source: 4,
      total: 4,
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
  IDS,
  KEEP_REASONS,
  RECALL_QUERIES,
  evidenceFor,
  fullRecord,
  hashValue,
  normalizedFileHash,
};
