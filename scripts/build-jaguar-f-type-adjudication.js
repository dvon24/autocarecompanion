/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-f-type-adjudication-2026-08-06.json');
const IDS = {
  convertibleTop: 'jaguar-f-type-convertible-hydraulic-leak-2014',
  differential: 'jaguar-f-type-differential-whine-2014',
  supercharger: 'jaguar-f-type-supercharger-bearing-v8-2014',
  transmission: 'jaguar-f-type-zf-8hp-valve-body-2014',
};
const SOURCES = {
  convertibleTop: 'https://static.nhtsa.gov/odi/tsbs/2014/CSC-10056412-8827.pdf',
  differentialRegistry: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=F-TYPE&modelYear=2014',
  supercharger: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10226328-9999.pdf',
  transmission: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10226148-9999.pdf',
};
const PDF_SOURCES = Object.fromEntries(Object.entries(SOURCES).filter(([key]) => key !== 'differentialRegistry'));
const PDF_SHA256 = {
  convertibleTop: 'a63db5317d9c0ae1af3c9ae026b7a4b812a269ce43b0d10ce4063b3f843d3c27',
  supercharger: '6edb7aa3628a36f02555715c3e3cc87baf563a2a4ff515c15f691037726ade0b',
  transmission: '7106eb83f55e94904a8c98e1b4d6ea867faffc4795e78af61f6e4d5320024570',
};
const VISUALLY_INSPECTED_PAGES = { convertibleTop: [1], supercharger: [1, 2], transmission: [1, 2] };
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 13 }, (_, index) => 2014 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=F-TYPE&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2014: { status: 200, campaigns: ['14V714000', '19V326000'] }, 2015: { status: 200, campaigns: ['14V673000', '14V714000', '19V326000'] },
  2016: { status: 200, campaigns: ['15V569000'] }, 2017: { status: 200, campaigns: ['16V789000', '16V940000'] },
  2018: { status: 200, campaigns: ['17V341000', '18V090000', '21V500000'] }, 2019: { status: 200, campaigns: ['19V039000', '19V682000'] },
  2020: { status: 200, campaigns: ['19V682000', '21V167000'] }, 2021: { status: 200, campaigns: ['21V667000'] },
  2022: { status: 200, campaigns: ['21V667000', '22V524000'] }, 2023: { status: 400, campaigns: [] },
  2024: { status: 400, campaigns: [] }, 2025: { status: 400, campaigns: [] }, 2026: { status: 400, campaigns: [] },
};
const KEEP_REASONS = {
  [IDS.convertibleTop]: 'Service Action K192 applies to certain 2014 F-TYPEs and addresses premature folding-top wear and white marks on the interior trim by inspecting or adjusting the top and harness. It is not a hydraulic-fluid leak, line, actuator-seal or pump bulletin and does not establish the frozen 2014-2023 hydraulic-system identity or remedy, so the row remains byte-for-byte unchanged.',
  [IDS.differential]: 'No exact Jaguar F-TYPE bulletin or campaign was located that establishes the frozen 2014-2023 rear-differential bearing and ring-and-pinion wear identity, high-torque causation, highway-deceleration whine or 75W-90 remedy. The official recall registry contains unrelated campaign identities and is not negative proof, so the indexed row remains unchanged pending an exact primary source.',
  [IDS.supercharger]: 'JTB00349NAS1 covers 2014-onward F-TYPE 5.0L V8 supercharger clatter, knock or rattle caused primarily by torsional-isolator or support-shaft wear. Although it directs assembly replacement for a rough bearing or excessive whine, it does not establish an Eaton TVS2300 front nose-cone bearing mechanism, heat-accelerated wear, progressive rotor contact or a nose-cone bearing rebuild; it is not a nose-cone bearing bulletin, so the frozen row remains unchanged.',
  [IDS.transmission]: 'JTB00382NAS1 is limited to 2014-2015 F-TYPE VIN K00222-K17210 with the 3.0L V6 and identifies a TCM software cause for poor shift quality, with no parts required. It does not establish the frozen 2014-2023 V6/V8/I4 scope, P0730, aggressive-driving solenoid or bore wear, or a valve-body failure; it is not a valve body bulletin, so the row remains unchanged.',
};

function evidenceFor(id) {
  const evidence = {
    [IDS.convertibleTop]: [{ kind: 'jlr-service-action-component-outcome-mismatch', url: SOURCES.convertibleTop, verifiedOn: '2026-08-06', observation: 'K192 concerns top fabric/trim wear and harness adjustment, not hydraulic leakage.' }],
    [IDS.differential]: [{ kind: 'official-registry-boundary-not-negative-proof', url: SOURCES.differentialRegistry, verifiedOn: '2026-08-06', observation: 'The 2014 F-TYPE registry returns unrelated campaigns; it neither establishes nor disproves the frozen differential identity.' }],
    [IDS.supercharger]: [{ kind: 'jlr-bulletin-mechanism-remedy-mismatch', url: SOURCES.supercharger, verifiedOn: '2026-08-06', observation: 'JTB00349 primarily identifies torsional-isolator wear and distinguishes that repair from cases requiring complete supercharger replacement.' }],
    [IDS.transmission]: [{ kind: 'jlr-bulletin-year-engine-mechanism-mismatch', url: SOURCES.transmission, verifiedOn: '2026-08-06', observation: 'JTB00382 is a 2014-2015 V6 TCM-software condition with no parts required, not valve-body wear.' }],
  };
  return evidence[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'F-TYPE');
  if (modelRows.length !== 4) throw new Error(`expected 4 Jaguar F-TYPE rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing F-TYPE decision: ${current.id}`);
    const before = fullRecord(current);
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content, scope or publication-state changes; a partial or different official document cannot be expanded into the frozen indexed identity.', commerceDecision: 'unchanged-no-commerce-present', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Jaguar', model: 'F-TYPE',
    completionStatement: 'This packet reconciles all four frozen Jaguar F-TYPE rows. Three official JLR PDFs were downloaded and every page visually reviewed; the remaining registry check is explicitly a coverage boundary. All four rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All four F-TYPE rows remain published and byte-for-byte unchanged.',
      'A partial year, VIN, engine, component, mechanism or remedy match cannot authorize a broader rewrite.',
      'A recall-registry result is not negative proof that a non-recall issue does not exist.',
      'The four frozen citation objects contain titles but no URLs and therefore are not treated as verified source evidence.',
      'Distinct recall identities remain deferred until the post-audit new-known-issues phase.',
    ],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 4 },
    observations: [
      { code: 'f-type-top-component-outcome-mismatch', severity: 'high', recordIds: [IDS.convertibleTop], detail: 'K192 concerns folding-top wear and trim marks, not hydraulic leakage.' },
      { code: 'f-type-differential-primary-source-gap', severity: 'source-gap', recordIds: [IDS.differential], detail: 'No exact Jaguar primary source cleared the broad differential identity; unrelated registry entries are not substituted.' },
      { code: 'f-type-supercharger-mechanism-remedy-mismatch', severity: 'high', recordIds: [IDS.supercharger], detail: 'JTB00349 primarily identifies torsional-isolator wear and does not support a nose-cone-bearing rebuild narrative.' },
      { code: 'f-type-transmission-year-engine-mechanism-mismatch', severity: 'high', recordIds: [IDS.transmission], detail: 'JTB00382 is a 2014-2015 V6 TCM-software concern, not valve-body wear.' },
      { code: 'f-type-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation has a title but no URL, so none can independently clear a rewrite.' },
      { code: 'all-f-type-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed F-TYPE record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES, pdfSources: PDF_SOURCES, sourceArtifactSha256: PDF_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES,
    mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, evidenceFor };
