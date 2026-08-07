/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-s-type-adjudication-2026-08-06.json');
const IDS = {
  electrical: 'jaguar-s-type-electrical-gremlins-2000',
  timing: 'jaguar-s-type-timing-chain-tensioner-v8-2000',
  transmission: 'jaguar-s-type-transmission-valve-body-2000',
};
const SOURCES = {
  techLines: 'https://jl-discourse-uploads.s3.dualstack.us-east-1.amazonaws.com/original/3X/a/b/ab2c9c44e2bf762ebef53d928dba0c905c677615.pdf',
  transmission: 'https://jl-discourse-uploads.s3.dualstack.us-east-1.amazonaws.com/original/3X/0/a/0a98a9309fe9a8032d210f87ee6d6eb38dac29c0.pdf',
  powertrain: 'http://jagrepair.com/images/Electrical/STypeElectrical/STypeTechGuide/2000%20MY%20S-TYPE%20Powertrain%20Introduction.pdf',
  jf506e: 'http://jagrepair.com/images/TSB/TSB2/X-Type/307Gearbox/XT307-S941%20JATCO%20JF506E%20Transmission%20Replacement.pdf',
};
const PDF_SOURCES = SOURCES;
const PDF_SHA256 = {
  techLines: 'e9adaa121fdfafd0c4adc459ae06db3bfcb2a0cc2e22d3091ccea94b4c2831b9',
  transmission: '801bec1c07499f1af9379f0a07d4396d86fdeca4c4a437a0e6e26558c76aa572',
  powertrain: 'fe42cee3ecd230e0232eae5b4f200ee56ec14ee34b5881967a1b5e7fb0d71019',
  jf506e: '34f83ca8f523ab694e388a87842318cdb1ebf048ce5ca29687e59a0916eeaa6a',
};
const VISUALLY_INSPECTED_PAGES = { techLines: [3], transmission: [1, 2], powertrain: [66], jf506e: [1] };
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 9 }, (_, index) => 2000 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=S-TYPE&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2000: { status: 200, campaigns: ['00V228004', '00V359002', '06E043000', '06E056000'] },
  2001: { status: 200, campaigns: ['00V228004', '00V359002', '06E043000', '06E056000'] },
  2002: { status: 200, campaigns: ['04V484000', '06E056000'] },
  2003: { status: 200, campaigns: ['04V024000', '04V484000', '04V488000', '06E056000'] },
  2004: { status: 200, campaigns: ['04V024000', '04V484000', '04V488000', '06E056000'] },
  2005: { status: 200, campaigns: ['04V484000', '06E056000', '06V418000'] },
  2006: { status: 200, campaigns: ['05V503000', '06E056000'] },
  2007: { status: 200, campaigns: ['06V467000'] },
  2008: { status: 400, campaigns: [] },
};
const KEEP_REASONS = {
  [IDS.electrical]: 'No exact Jaguar primary source was located that establishes moisture ingress into control modules and poor CAN connections as one 2000-2008 S-TYPE issue with the frozen module locations, U0140/U0155/U0100 codes, dealer-equipment claim and blanket battery remedy. The official recall inventory contains distinct campaign identities and is not negative proof, so the indexed row remains byte-for-byte unchanged pending an exact source.',
  [IDS.timing]: 'Jaguar TechLines lists bulletin 303-68 for 1997-2002 XK and 1998-2002 V8 XJ; it does not include S-TYPE. The frozen row extends the claim through 2008 and includes the later 4.2L and supercharged 4.2L engines without an exact primary source supporting that full identity, the P0016/P0017 scope, replacement bundle, 18-24 labor hours or cost range. The page therefore remains byte-for-byte unchanged.',
  [IDS.transmission]: 'Jaguar powertrain training identifies the early S-TYPE automatic as the 5R55N on both V6 and V8 engines, while Jaguar service action XT307-S941 identifies the JATCO JF506E as a specific 2002 X-TYPE transmission, not S-TYPE. Bulletin S307-17 attributes certain 2003-2004 S-TYPE harsh shifts to adaptive shift strategy drift and prescribes clearing adaptations plus TCM/ECM reconfiguration with no parts; it does not establish valve-body wear across 2000-2008. Because the frozen row combines different transmissions, years, causes and remedies, it remains unchanged.',
};

function evidenceFor(id) {
  return {
    [IDS.electrical]: [{ kind: 'official-registry-boundary-not-negative-proof', url: RECALL_QUERIES[2000], verifiedOn: '2026-08-06', observation: 'The official year inventory contains separate campaign identities and cannot establish or disprove the broad moisture/CAN aggregation.' }],
    [IDS.timing]: [{ kind: 'jaguar-bulletin-model-scope-mismatch', url: SOURCES.techLines, verifiedOn: '2026-08-06', observation: 'The Jaguar April 2005 bulletin listing scopes 303-68 to XK and V8 XJ, not S-TYPE.' }],
    [IDS.transmission]: [
      { kind: 'jaguar-bulletin-cause-remedy-scope-mismatch', url: SOURCES.transmission, verifiedOn: '2026-08-06', observation: 'S307-17 covers certain 2003-2004 S-TYPE adaptive strategy drift and a software/adaptation remedy, not valve-body replacement.' },
      { kind: 'jaguar-powertrain-identity', url: SOURCES.powertrain, verifiedOn: '2026-08-06', observation: 'Jaguar training identifies the early S-TYPE automatic as 5R55N on V6 and V8.' },
      { kind: 'jaguar-jf506e-model-mismatch', url: SOURCES.jf506e, verifiedOn: '2026-08-06', observation: 'XT307-S941 scopes the JATCO JF506E service action to specific 2002 X-TYPE vehicles.' },
    ],
  }[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'S-TYPE');
  if (modelRows.length !== 3) throw new Error(`expected 3 Jaguar S-TYPE rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing S-TYPE decision: ${current.id}`);
    const before = fullRecord(current);
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content, scope or publication-state changes; partial or mismatched evidence cannot be expanded into the frozen indexed identity.', commerceDecision: 'unchanged-no-commerce-present', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Jaguar', model: 'S-TYPE',
    completionStatement: 'This packet reconciles all three frozen Jaguar S-TYPE rows. Four Jaguar technical PDFs and five relevant pages were visually reviewed; year-by-year NHTSA recall inventories were locked. All three rows remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All three S-TYPE rows remain published and byte-for-byte unchanged.', 'A model, engine, year, cause, code or remedy mismatch cannot authorize a broader rewrite.', 'A recall-registry result is not negative proof that a non-recall issue does not exist.', 'The three frozen citation objects contain titles but no URLs and therefore are not treated as verified source evidence.', 'Distinct issue identities remain deferred until the post-audit new-known-issues phase.'],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 3 },
    observations: [
      { code: 's-type-electrical-primary-source-gap', severity: 'source-gap', recordIds: [IDS.electrical], detail: 'No exact primary source cleared the frozen nine-year moisture/CAN/module aggregation.' },
      { code: 's-type-timing-model-engine-year-scope', severity: 'high', recordIds: [IDS.timing], detail: 'The located 303-68 scope excludes S-TYPE and cannot support the row through 2008 or its 4.2L applicability.' },
      { code: 's-type-transmission-identity-cause-remedy-mismatch', severity: 'high', recordIds: [IDS.transmission], detail: 'The row misassigns JF506E to S-TYPE and converts an adaptive-software bulletin into broad valve-body wear.' },
      { code: 's-type-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation has a title but no URL, so none can independently clear a rewrite.' },
      { code: 'all-s-type-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed S-TYPE record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES, pdfSources: PDF_SOURCES, sourceArtifactSha256: PDF_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS }, summary: { rewrite_same_identity: 0, keep_published_pending_source: 3, total: 3 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, evidenceFor };
