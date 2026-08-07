/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-amanti-adjudication-2026-08-06.json');
const IDS = {
  air: 'kia-amanti-ac-compressor-clutch-2004',
  alternator: 'kia-amanti-alternator-2004',
  steering: 'kia-amanti-power-steering-leak-2004',
  timing: 'kia-amanti-timing-belt-tensioner-2004',
  transmission: 'kia-amanti-transmission-failure-2004',
};
const PDF_SOURCES = {
  atf: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10059898-2280.pdf',
    sha256: '0b1d9abcfc1831ad0b2e6e00b3318ee1901d57e9b4943f9a480c78d5cbf03de9',
    visuallyInspectedPages: [1, 2],
    markers: ['AUTOMATIC TRANSMISSION FLUID APPLICATION GUIDE', 'Amanti, (GH) (2004~09MY)', 'SPIII ATF', 'UM010 CH002'],
  },
  techTimes: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10109707-9999.pdf',
    sha256: '638a4abc7f5fabc1d40a32169c957f30084ea1aaa1a5b933eafcb0b9bf853283',
    visuallyInspectedPages: [2],
    markers: ['2007-2009 Amanti (GH)', 'Engine noise heard on 3.3L and 3.8L engines', 'refer to Engine TSB028'],
  },
};
const EXPECTED_RECALLS = {
  2004: { status: 400, campaigns: [] },
  2005: { status: 400, campaigns: [] },
  2006: { status: 400, campaigns: [] },
  2007: { status: 200, campaigns: ['09V130000', '13V114000'] },
  2008: { status: 200, campaigns: ['13V114000'] },
  2009: { status: 200, campaigns: ['13V114000'] },
};
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=KIA&model=AMANTI&modelYear=${year}`]));
const KEEP_REASONS = {
  [IDS.air]: 'The sole frozen citation is a YouTube video rather than a Kia/NHTSA primary source, and no exact source establishes a 2004-2009 compressor-clutch/coil population, the stated hot-climate frequency, or replacement of the clutch in place. Generic scanner/manual search links do not prove repair fitment, so the row remains byte-for-byte unchanged.',
  [IDS.alternator]: 'The only citation is the Kia Forums home page, not an Amanti thread or primary document. It does not establish the under-80,000-mile rate, overcharge/undercharge mechanism, high-output replacement, or any listed battery/alternator fitment; the unrelated power-window regulator recommendation is also outside this issue identity. The row remains byte-for-byte unchanged.',
  [IDS.steering]: 'A single video citation cannot establish the combined hose, pump-seal and rack failure population for every 2004-2009 Amanti. The row has no frozen solution, is categorized as suspension despite a steering identity, and offers tie-rod/rack commerce without exact fitment. Category changes are prohibited in this audit, so the entire row remains byte-for-byte unchanged.',
  [IDS.timing]: 'The sole video URL contains a placeholder-style ID and is not primary evidence. The frozen row applies one timing-belt/tensioner claim to both 3.5L and 3.8L engines across 2004-2009, while the visually inspected Kia technician bulletin only directs 2007-2009 3.8L engine-noise cases to a separate TSB and does not establish this belt failure or 60,000-mile remedy. The row remains byte-for-byte unchanged.',
  [IDS.transmission]: 'Kia TSB TRANS 046, visually inspected on pages 1-2, specifies SP-III ATF and warns that incorrect fluid can damage the transmission. It does not establish the frozen 80,000-120,000-mile failure rate, torque-converter/forward-clutch/valve-body aggregation or DTC set, and the generic MaxLife/flush-kit search commerce is not the bulletin-specified fluid or an exact repair. The row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  if (id === IDS.transmission) return [{ kind: 'official-fluid-specification-does-not-prove-aggregated-failure', url: PDF_SOURCES.atf.url, sha256: PDF_SOURCES.atf.sha256, visuallyInspectedPages: [1, 2], verifiedOn: '2026-08-06', observation: 'Kia TRANS 046 specifies SP-III ATF for 2004-2009 Amanti and warns against incorrect fluid; it does not substantiate the frozen failure aggregation or generic commerce.' }];
  if (id === IDS.timing) return [{ kind: 'official-technician-bulletin-partial-engine-noise-reference', url: PDF_SOURCES.techTimes.url, sha256: PDF_SOURCES.techTimes.sha256, visuallyInspectedPages: [2], verifiedOn: '2026-08-06', observation: 'Kia Tech Times sends 2007-2009 Amanti 3.8L engine-noise cases to ENG028 but does not substantiate the frozen timing-belt identity, years or remedy.' }];
  return [{ kind: 'official-recall-inventory-boundary-not-broad-claim-proof', url: RECALL_QUERIES[2004], supportingUrls: Object.values(RECALL_QUERIES), verifiedOn: '2026-08-06', observation: `The complete 2004-2009 Amanti recall boundary does not substantiate the broad frozen claims for ${id}.` }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Amanti');
  const expectedIds = Object.values(IDS).sort();
  if (modelRows.length !== 5 || JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(expectedIds)) throw new Error('Amanti frozen-ID coverage mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule: 'Unsupported scope, category conflicts, partial official evidence and unverified commerce require a byte-for-byte hold; no indexed identity field may be silently changed.',
      commerceDecision: current.fixParts.length || current.communityRecommendations.some((item) => item.affiliateUrl || item.affiliateLink || item.amazonLink) ? 'unchanged-search-commerce-pending-exact-fitment' : 'unchanged-no-commerce',
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
    make: 'Kia',
    model: 'Amanti',
    completionStatement: 'All five frozen Kia Amanti rows are reconciled. None has exact primary evidence sufficient for a safe same-identity rewrite, so every row remains byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All five Amanti rows remain published and byte-for-byte unchanged.',
      'Partial official evidence cannot authorize a broader engine, year, outcome or repair claim.',
      'Search-result commerce and cross-component recommendations do not prove exact fitment.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 5 },
    observations: [
      { code: 'amanti-transmission-fluid-commerce-conflict', severity: 'critical', recordIds: [IDS.transmission], detail: 'Kia specifies SP-III ATF and warns that incorrect fluid can damage the transmission; the frozen generic flush/MaxLife commerce lacks exact approval.' },
      { code: 'amanti-timing-engine-scope-unproven', severity: 'critical', recordIds: [IDS.timing], detail: 'No primary source supports one timing-belt/tensioner failure and 60,000-mile remedy across both frozen engines and all six years.' },
      { code: 'amanti-alternator-cross-component-commerce', severity: 'high', recordIds: [IDS.alternator], detail: 'The alternator row includes an unrelated power-window regulator recommendation plus unverified battery and alternator searches.' },
      { code: 'amanti-steering-category-conflict-held', severity: 'seo-safety', recordIds: [IDS.steering], detail: 'The steering identity is categorized as suspension; this audit preserves the indexed category and holds the row for later independent resolution.' },
      { code: 'all-amanti-pages-preserved', severity: 'seo-safety', recordIds: expectedIds, detail: 'Every frozen Amanti ID, title, category, year set and publication state remains untouched.' },
    ],
    pdfSources: PDF_SOURCES,
    recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 5, total: 5 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SOURCES, RECALL_QUERIES, evidenceFor };
