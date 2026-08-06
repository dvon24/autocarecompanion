/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-hyundai-tiburon-adjudication-2026-08-06.json',
);

const IDS = {
  clutchHydraulic: 'hyundai-tiburon-clutch-hydraulic-failure-1997',
  clutchSlave: 'hyundai-tiburon-clutch-slave-2003',
  rearCaliper: 'hyundai-tiburon-rear-caliper-seize-2003',
  rearCamber: 'hyundai-tiburon-rear-camber-bolt-seizure-2003',
  timingBelt: 'hyundai-tiburon-timing-belt-tensioner-1997',
};

const RECALL_QUERIES = Object.fromEntries(
  Array.from({ length: 12 }, (_, index) => 1997 + index).map((year) => [
    year,
    `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Hyundai&model=Tiburon&modelYear=${year}`,
  ]),
);

const EXPECTED_RECALL_COUNTS = {
  1997: 4,
  1998: 1,
  1999: 3,
  2000: 1,
  2001: 1,
  2002: 4,
  2003: 9,
  2004: 0,
  2005: 1,
  2006: 1,
  2007: 1,
  2008: 1,
};

const KEEP_REASONS = {
  [IDS.clutchHydraulic]:
    'A generic NHTSA vehicle page, placeholder-style forum URL and unverified video do not establish one Tiburon clutch-master/slave-cylinder defect, broad 1997-2008 scope, internal-versus-external leak pattern or replacement procedure. NHTSA campaign 99V-178 concerns an automatic-transmission pressure-control solenoid, a different identity. The row remains byte-for-byte unchanged.',
  [IDS.clutchSlave]:
    'A generic complaint page, placeholder-style forum URL and unverified video do not establish one 2003-2008 internal concentric-slave-cylinder defect, transmission-removal requirement or collateral clutch-parts replacement path. No same-identity official campaign was found, so the row remains byte-for-byte unchanged.',
  [IDS.rearCaliper]:
    'A generic complaint page and owner discussion do not establish one rear-caliper-slide-pin defect, salt-belt scope, parking-brake mechanism or repair cost. Campaigns 03V-257 and 03V-496 concern rear brake tubes contacting steering-gearbox brackets, not rear caliper seizure. The row remains byte-for-byte unchanged.',
  [IDS.rearCamber]:
    'A generic complaint page and unverified video do not establish one rear-camber-bolt defect, dissimilar-metal mechanism, alignment-shop outcome or cost. Campaign 09V-125 concerns corrosion of the front lower control arms, a different axle and component. The row remains byte-for-byte unchanged.',
  [IDS.timingBelt]:
    'A generic vehicle page, placeholder-style forum URL and unverified video do not establish one Tiburon timing-belt-tensioner defect, interference-engine outcome, DTC set, 60,000-mile interval, related-part bundle or cost across 1997-2008 vehicles. No same-identity official campaign was found, so the row remains byte-for-byte unchanged.',
};

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Hyundai' && row.model === 'Tiburon',
  );
  if (modelRows.length !== 5) {
    throw new Error(`expected 5 Hyundai Tiburon rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    if (!KEEP_REASONS[current.id]) throw new Error(`missing Tiburon decision: ${current.id}`);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule:
        'No content or publication-state changes; a generic source or official record for a different component cannot replace this indexed issue.',
      commerceDecision: 'unchanged-pending-audit',
      changedFields: [],
      evidence: [
        {
          kind: 'official-recall-set-different-identities',
          url: RECALL_QUERIES[2003],
          verifiedOn: '2026-08-06',
          observation:
            'NHTSA recall API checks for 1997-2008 Tiburon vehicles returned campaigns, but none matches these clutch-hydraulic, rear-caliper, rear-camber-bolt or timing-belt-tensioner identities.',
          supportingUrls: Object.values(RECALL_QUERIES),
          nearbyCampaigns: [
            '99V-178 - automatic-transmission pressure-control-solenoid seals',
            '03V-257 and 03V-496 - rear brake tubes contacting steering brackets',
            '09V-125 - front lower control-arm corrosion',
          ],
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
    model: 'Tiburon',
    completionStatement:
      'This packet reconciles all five frozen Hyundai Tiburon rows. No same-identity primary-source rewrite cleared the gate; all five remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All five rows remain published and byte-for-byte unchanged.',
      'A recall for a different transmission, brake or suspension component may never replace an indexed issue.',
      'Existing commerce remains frozen rather than being silently rewritten without exact repair-role and fitment evidence.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      tiburonRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'official-campaigns-are-different-identities',
        severity: 'high',
        recordIds: Object.values(IDS),
        detail:
          'The 1997-2008 NHTSA recall results contain campaigns, but none establishes the five indexed identities; nearby transmission, brake-tube and front-control-arm campaigns remain mismatch evidence only.',
      },
      {
        code: 'generic-and-unverified-sources-frozen',
        severity: 'independent-review-required',
        recordIds: Object.values(IDS),
        detail:
          'Generic vehicle pages, owner discussions, placeholder-style forum links and unverified videos do not establish model-wide defect, mileage, procedure, part or cost claims.',
      },
      {
        code: 'five-tiburon-pages-preserved',
        severity: 'seo-safety',
        recordIds: Object.values(IDS),
        detail:
          'All five indexed Tiburon records remain published with identical titles, categories, content, citations and commerce.',
      },
    ],
    mismatchSources: {
      recallQueries: RECALL_QUERIES,
      expectedRecallCounts: EXPECTED_RECALL_COUNTS,
    },
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
module.exports = {
  EXPECTED_RECALL_COUNTS,
  IDS,
  KEEP_REASONS,
  RECALL_QUERIES,
  fullRecord,
  hashValue,
  normalizedFileHash,
};
