/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jeep-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-comanche-adjudication-2026-08-06.json');

const IDS = {
  exhaust: 'jeep-comanche-40l-exhaust-manifold-crack-1990',
  rust: 'jeep-comanche-floor-pan-rust-1990',
  renix: 'jeep-comanche-renix-fuel-injection-1990',
};
const EPA_OBD_SOURCE = {
  url: 'https://www.epa.gov/archive/epapages/newsroom_archive/newsreleases/5f03deb7242be80385256d3c006e1ad3.html',
  expectedStatus: 200,
  markers: ['All 1996 and newer passenger vehicles are required to have On-Board Diagnostic (OBD) systems', 'pollution control devices'],
};
const EXPECTED_RECALLS = {
  1990: { status: 200, campaigns: ['90V177000', '98V005000'] },
  1991: { status: 200, campaigns: ['98V005000'] },
  1992: { status: 400, campaigns: [] },
};
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JEEP&model=COMANCHE&modelYear=${year}`]));
const KEEP_REASONS = {
  [IDS.exhaust]: 'The frozen 1990-1992 page assigns standardized OBD-II catalyst codes P0420 and P0430 to a pre-1996 vehicle, while EPA identifies 1996 as the full-compliance point for passenger-vehicle OBD systems; P0430 also implies a second catalyst bank that the inline-six identity does not establish. No exact Jeep primary source clears the cast-iron design, crack locations, bolt-failure frequency, costs or part 4883385 fitment, so the row remains byte-for-byte unchanged.',
  [IDS.rust]: 'The cited forum, video and repair-parts catalog do not establish the complete three-year structural-location set, water-entry cause, probe/hammer inspection method, weld gauge, chemical treatment, cost range or when a Comanche structural repair is safe. The safety-sensitive structural weld guidance and commerce remain byte-for-byte unchanged pending qualified review.',
  [IDS.renix]: 'The page spans 1990-1992 but its own description limits the Renix system to 1990 and says 1991+ uses Chrysler MPFI, creating an internal year-scope contradiction. Its only video URL is a placeholder, and no exact primary source clears replacing CTS/TPS/MAP as a set, an HO conversion, O2 replacement or part 33002383 across the frozen range, so the row remains byte-for-byte unchanged.',
};
function evidenceFor(id) {
  if (id === IDS.exhaust) return [{ kind: 'epa-obd-year-boundary-and-code-scope-conflict', url: EPA_OBD_SOURCE.url, verifiedOn: '2026-08-06', observation: 'EPA states all 1996-and-newer passenger vehicles require OBD; the frozen 1990-1992 row lists standardized catalyst codes P0420 and P0430.' }];
  if (id === IDS.renix) return [{ kind: 'internal-model-year-contradiction-and-placeholder-source', url: RECALL_QUERIES[1990], verifiedOn: '2026-08-06', observation: 'The frozen row covers 1990-1992 while its own narrative says Renix is 1990 and 1991+ is Chrysler MPFI; its sole video path is a placeholder.' }];
  return [{ kind: 'official-recall-inventory-boundary-not-structural-repair-proof', url: RECALL_QUERIES[1990], supportingUrls: Object.values(RECALL_QUERIES), verifiedOn: '2026-08-06', observation: 'The complete model-year recall boundary contains no source for the frozen structural diagnosis and welding procedure.' }];
}
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Comanche');
  if (modelRows.length !== 3) throw new Error(`expected 3 Jeep Comanche rows, found ${modelRows.length}`);
  const expectedIds = Object.values(IDS).sort();
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(expectedIds)) throw new Error('Comanche ID constants do not match the frozen snapshot');
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id]) throw new Error(`missing Comanche decision: ${current.id}`);
    const before = fullRecord(current);
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'An internal year contradiction, anachronistic diagnostic code or unsourced structural procedure requires a byte-for-byte hold.', commerceDecision: current.fixParts.length || current.communityRecommendations.some((item) => item.affiliateUrl) ? 'unchanged-search-commerce-pending-exact-fitment' : 'unchanged-no-fixpart-commerce', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Jeep', model: 'Comanche',
    completionStatement: 'This packet reconciles all three frozen Jeep Comanche rows. Each contains an unresolved year, diagnostic-code, primary-source, fitment or structural-procedure problem; all three remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All three Comanche rows remain published and byte-for-byte unchanged.', 'Anachronistic OBD-II codes and internally contradictory year scope cannot be silently repaired.', 'Structural welding and unverified part advice require independent approval.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 3 },
    observations: [
      { code: 'comanche-exhaust-obd2-code-anachronism', severity: 'critical', recordIds: [IDS.exhaust], detail: 'P0420/P0430 are not cleared for the frozen 1990-1992 identity; EPA places full OBD implementation at 1996.' },
      { code: 'comanche-renix-internal-year-contradiction', severity: 'critical', recordIds: [IDS.renix], detail: 'The row spans 1990-1992 while describing Renix as 1990-only and 1991+ as a different system.' },
      { code: 'comanche-rust-structural-procedure-gap', severity: 'high', recordIds: [IDS.rust], detail: 'The structural welding, gauge and repair-threshold instructions lack a reviewed primary or qualified source.' },
      { code: 'all-comanche-pages-preserved', severity: 'seo-safety', recordIds: expectedIds, detail: 'Every frozen Comanche record remains published and byte-for-byte unchanged.' },
    ],
    epaObdSource: EPA_OBD_SOURCE, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 3, total: 3 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { EPA_OBD_SOURCE, EXPECTED_RECALLS, IDS, KEEP_REASONS, RECALL_QUERIES, evidenceFor };
