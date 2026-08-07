/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jeep-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-cj7-adjudication-2026-08-06.json');

const IDS = {
  axle: 'jeep-cj-7-amc-20-rear-axle-weak-two-piece-axle-shafts',
  body: 'jeep-cj-7-body-tub-floor-pans-rockers-firewall-rust',
  carb: 'jeep-cj-7-carter-bbd-carburetor-emissions-vacuum-maze',
  frame: 'jeep-cj-7-frame-rot-rear-spring-hangers-shackle-mounts-skid-plate-area',
  steering: 'jeep-cj-7-vague-steering-death-wobble-from-worn-linkage-geometry',
  transmission: 'jeep-cj-7-weak-light-duty-manual-transmissions',
};

const WEB_SOURCES = {
  axleKit: {
    url: 'https://eastcoastgearsupply.com/i-19205984-amc-20-one-piece-axle-kit-82-86-model-20-cj7-cj8.html',
    expectedStatus: 200,
    markers: ["82-'86 Model 20 CJ7 & CJ8", 'KR-YCJL', '29 spline', 'Replaces stock two piece axles'],
  },
  bodyPanels: {
    url: 'https://www.c2cfabrication.com/collections/jeep-cj-7-series-parts/front-floor-pan',
    expectedStatus: 200,
    markers: ['Jeep CJ7 Replacement Body Panels', 'replacement floor pans', 'rocker panels'],
  },
  frameRepair: {
    url: 'https://www.rustbuster.com/blogs/news/rusty-cj-jeep-frame-don-t-worry-it-can-be-saved',
    expectedStatus: 200,
    markers: ['CJ-7 1976-1986', 'Rear Shackle Mount Section', '76-86 CJ7'],
  },
  steeringKit: {
    url: 'https://mountainoffroad.com/products/tie-rod-drag-link-82-86-cj',
    expectedStatus: 200,
    markers: ['Jeep CJ (1982-86) Wide Track', '1&quot; O.D. x .219-wall DOM', 'Fits 1982-1986 CJs with Dana 30 front axle, wide track'],
  },
};

const EXPECTED_RECALLS = Object.fromEntries(Array.from({ length: 11 }, (_, index) => [1976 + index, { status: 400, campaigns: [] }]));
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JEEP&model=CJ-7&modelYear=${year}`]));

const KEEP_REASONS = {
  [IDS.axle]: 'The exact live axle-kit page supports KR-YCJL only for 1982-1986 CJ-7/CJ-8 with AMC Model 20, while the indexed record and its fix part span 1976-1986 and add hub, torque, key-load and wheel-separation claims. That partial 1982-1986 commerce fitment cannot authorize a rewrite of the 1976-1986 identity, so the row remains byte-for-byte unchanged.',
  [IDS.body]: 'The live manufacturer collection confirms that CJ-7 replacement body panels exist, but it does not establish the frozen corrosion mechanism, every structural location, complete 1976-1986 scope, repair sequence, full-tub threshold or part 8130679 fitment. The row and commerce remain byte-for-byte unchanged.',
  [IDS.carb]: 'No exact AMC/Jeep primary service or emissions source was pinned for the frozen 1978-1986 Carter BBD failure aggregation, float setting, vacuum-system claims, or its recommendation to delete computer and emissions equipment. Because emissions-delete and carburetor-fitment advice is safety and legal sensitive, the row remains byte-for-byte unchanged for manual review.',
  [IDS.frame]: 'The live repair-panel manufacturer page supports selected CJ rear shackle sections, but it does not prove the complete hidden-rot mechanism, all frozen locations, inspection method, cavity-treatment recipe or when a structural weld repair is safe. The structural weld and replacement-frame guidance remains byte-for-byte unchanged pending qualified source review.',
  [IDS.steering]: 'The cited live steering-kit page is explicitly for 1982-1986 wide-track CJ vehicles with a Dana 30 and specifies 1-inch by .219-wall tubing, while the indexed record spans 1976-1986 and claims a 1-1/8-inch by .250-wall kit plus part J5350586. This 1982-1986 fitment and specification mismatch requires a byte-for-byte hold.',
  [IDS.transmission]: 'No exact Jeep/AMC primary source was pinned for the broad SR4/T-4/T-5 durability ranking, second-gear failure pattern, direct T-176 interchange, or T-18/NP435/SM465 adapter and driveshaft claims across the frozen engine/year combinations. The row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  if (id === IDS.axle) return [{ kind: 'live-product-page-partial-year-fitment', url: WEB_SOURCES.axleKit.url, verifiedOn: '2026-08-06', observation: 'The exact product page says KR-YCJL fits 1982-1986 CJ-7/CJ-8 with AMC Model 20, not the full frozen 1976-1986 scope.' }];
  if (id === IDS.body) return [{ kind: 'live-manufacturer-collection-not-claim-proof', url: WEB_SOURCES.bodyPanels.url, verifiedOn: '2026-08-06', observation: 'The collection confirms CJ-7 replacement panels, but not the complete corrosion diagnosis, repair threshold or frozen part fitment.' }];
  if (id === IDS.frame) return [{ kind: 'live-manufacturer-page-partial-repair-product-scope', url: WEB_SOURCES.frameRepair.url, verifiedOn: '2026-08-06', observation: 'The manufacturer page supports selected CJ rear shackle sections but not the full structural diagnosis and weld procedure.' }];
  if (id === IDS.steering) return [{ kind: 'live-product-page-year-and-specification-mismatch', url: WEB_SOURCES.steeringKit.url, verifiedOn: '2026-08-06', observation: 'The cited product is 1982-1986 wide-track Dana 30 fitment with 1-inch by .219-wall tubing, not the page-wide scope and specification.' }];
  return [{ kind: 'nhtsa-api-boundary-not-negative-proof', url: RECALL_QUERIES[1976], supportingUrls: Object.values(RECALL_QUERIES), verifiedOn: '2026-08-06', observation: 'The NHTSA vehicle endpoint returns HTTP 400 for every CJ-7 year spelling tested and cannot prove these maintenance claims true or false.' }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'CJ-7');
  if (modelRows.length !== 6) throw new Error(`expected 6 Jeep CJ-7 rows, found ${modelRows.length}`);
  const expectedIds = Object.values(IDS).sort();
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(expectedIds)) throw new Error('CJ-7 ID constants do not match the frozen snapshot');
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id]) throw new Error(`missing CJ-7 decision: ${current.id}`);
    const before = fullRecord(current);
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No partial product fitment, community procedure or inaccessible registry result may change an indexed identity.', commerceDecision: current.fixParts.length ? 'unchanged-search-links-pending-exact-fitment' : 'unchanged-no-fixpart-commerce', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Jeep', model: 'CJ-7',
    completionStatement: 'This packet reconciles all six frozen Jeep CJ-7 rows. Product pages provide only partial fitment anchors, no exact primary source clears a complete rewrite, and all six indexed records remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All six CJ-7 rows remain published and byte-for-byte unchanged.',
      'Partial product fitment cannot be expanded across the full indexed model-year range.',
      'Safety-sensitive structural welding, steering, axle, drivetrain and emissions-delete guidance requires exact primary or qualified manual review before any rewrite.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 6 },
    observations: [
      { code: 'cj7-axle-commerce-partial-year-fitment', severity: 'high', recordIds: [IDS.axle], detail: 'KR-YCJL is anchored to 1982-1986, not the full 1976-1986 record range.' },
      { code: 'cj7-steering-source-year-and-tubing-mismatch', severity: 'high', recordIds: [IDS.steering], detail: 'The cited kit is 1982-1986 wide-track and 1-inch by .219-wall, not the frozen page specification.' },
      { code: 'cj7-emissions-delete-guidance-needs-manual-review', severity: 'critical', recordIds: [IDS.carb], detail: 'The frozen carburetor solution recommends emissions and computer deletion without a reviewed legal/primary service source.' },
      { code: 'all-cj7-pages-preserved', severity: 'seo-safety', recordIds: expectedIds, detail: 'Every frozen CJ-7 record remains published and byte-for-byte unchanged.' },
    ],
    webSources: WEB_SOURCES, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 6, total: 6 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, RECALL_QUERIES, WEB_SOURCES, evidenceFor };
