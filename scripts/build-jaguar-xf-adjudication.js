/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-xf-adjudication-2026-08-06.json');
const IDS = {
  pcv: 'jaguar-xf-crankcase-vent-valve-2009',
  dpf: 'jaguar-xf-diesel-dpf-regen-2009',
  timing: 'jaguar-xf-timing-chain-tensioner-ajv8-2009',
  turboHose: 'jaguar-xf-turbo-coolant-hose-ingenium-2016',
  window: 'jaguar-xf-window-regulator-2009',
  mechatronic: 'jaguar-xf-zf-8hp-mechatronic-2016',
};
const SOURCES = {
  dpf: 'https://www.jaguar.com/en-au/jdx/ownership/choose-your-engine/jaguar-diesel-particulate-filter.html',
  coolant: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10177147-0001.pdf',
  window: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10065160-6903.pdf',
  timingLandRover: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10056266-1292.pdf',
  mechatronic: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10142399-9999.pdf',
};
const PDF_SOURCES = { coolant: SOURCES.coolant, window: SOURCES.window, timingLandRover: SOURCES.timingLandRover, mechatronic: SOURCES.mechatronic };
const PDF_SHA256 = {
  coolant: '604bdc73f9458965ae7c29ef0767387b35db71ab578924f0e6e68e6394bc9f8e',
  window: 'ce7a17454a6dfb7ab7e3b28c4cf9a68f2bb4ece8abad2db3cbd174585301ed52',
  timingLandRover: 'bcda1e671fcf2d1f888edf1d2baceff11190f1abb7fe7f582f2d3362a5db280f',
  mechatronic: '09c530498ece98c13c2c6f0c8080ff25b78bc249d7439fa690237b91601feced',
};
const VISUALLY_INSPECTED_PAGES = { coolant: [1, 2], window: [1, 2], timingLandRover: [1, 2], mechatronic: [1, 2] };
const WEB_SOURCE_MARKERS = { dpf: ['frequently driving short distances', '60km/h and 112km/h for 20 minutes', 'red warning light indicates that the filter is full'] };
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 15 }, (_, index) => 2009 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=XF&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2009: { status: 200, campaigns: ['08V396000', '08V607000', '16V229000', '16V373000', '17V027000', '18V009000'] },
  2010: { status: 200, campaigns: ['09V316000', '09V424000', '10V332000', '11V168000', '12V521000', '16V187000', '16V373000', '18V009000', '18V010000', '20V081000'] },
  2011: { status: 200, campaigns: ['12V521000', '16V229000', '16V373000', '18V010000'] },
  2012: { status: 200, campaigns: ['11V604000', '12V521000', '16V229000', '17V027000', '18V010000'] },
  2013: { status: 200, campaigns: ['12V571000', '13V341000', '14V123000', '14V157000', '14V181000', '14V291000', '14V390000', '15V091000', '16V137000', '16V796000', '18V009000', '18V010000'] },
  2014: { status: 200, campaigns: ['14V157000', '14V181000', '14V291000', '14V390000', '16V137000', '16V796000', '18V010000'] },
  2015: { status: 200, campaigns: ['14V673000', '16V137000', '16V229000', '16V796000', '18V010000'] },
  2016: { status: 400, campaigns: [] },
  2017: { status: 200, campaigns: ['17V084000', '17V678000'] },
  2018: { status: 200, campaigns: ['17V678000', '18V090000', '18V112000'] },
  2019: { status: 400, campaigns: [] },
  2020: { status: 400, campaigns: [] },
  2021: { status: 200, campaigns: ['21V667000'] },
  2022: { status: 200, campaigns: ['22V524000'] },
  2023: { status: 400, campaigns: [] },
};
const KEEP_REASONS = {
  [IDS.pcv]: 'No exact Jaguar primary source was located that establishes one diaphragm-failure identity across 2009-2015 XF 4.2L and 5.0L naturally aspirated and supercharged engines with the frozen lean codes, oil-consumption threshold, intake-removal statement, gasket remedy, prevalence and cost range. The official recall inventory is a boundary rather than negative proof, and the frozen citation has no URL, so the row remains byte-for-byte unchanged.',
  [IDS.dpf]: 'Jaguar owner guidance confirms that short trips, slow traffic and cold weather can prevent regeneration, but its amber-warning instruction is to drive between 60 and 112 km/h for 20 minutes and its full-filter instruction is to contact a retailer. It does not establish the frozen P2463/P244A scope, permanent-damage claim, forced regeneration, chemical-cleaning/replacement ladder or 2,500 RPM weekly prescription across 2009-2018 XF diesels. The broader row remains unchanged.',
  [IDS.timing]: 'The frozen citation names LTB00473, but that reference could not be verified as the claimed Jaguar XF timing-chain bulletin. The verifiable official LTB00474NAS2 is a Land Rover bulletin limited to 2010-2012 LR4, Range Rover Sport and Range Rover 5.0L engines; it excludes Jaguar XF, 4.2L engines and the frozen 2009-2015 scope. It specifies tensioners and tensioner levers rather than all four tensioners, both chains and all guides, and lists 8.1-9.2 labor hours rather than 20+. The row remains byte-for-byte unchanged.',
  [IDS.turboHose]: 'No exact Jaguar primary source was located for cracking turbocharger coolant feed and return hoses across 2016-2023 XF Ingenium 2.0L vehicles. Jaguar H291 instead covers a limited 2019-21 2.0L petrol coolant-pump operation issue remedied by PCM software with no parts; it does not identify turbo hoses, heat-rating failure, updated silicone construction or a 60,000-mile preventive interval. The unrelated component and remedy cannot authorize a rewrite, so the row remains unchanged.',
  [IDS.window]: 'Jaguar bulletin JTB00345NAS3 covers a limited 2012-2014 XF VIN range with a squeak during window operation caused by inadequately lubricated regulator cable pulleys and prescribes lubrication. It does not establish cable fraying, motor failure, windows dropping into doors or broad 2009-2020 prevalence, and it does not validate the frozen switch-contact or annual-silicone recommendations. The broader identity remains unchanged.',
  [IDS.mechatronic]: 'Jaguar SSM73852 covers a specific flashing-D/gearbox-fault concern following an Eco Stop/Start event, typically below 2,500 miles, with only P0715-64 and P0700-02 stored. It identifies either TCM software or a mechatronic valve-block fault and first prescribes clearing codes, an adaptation drive and Technical Assistance review. It does not establish broad 2016-2023 internal electrical, solenoid and bore failure with P0730/P0657/P0700, loss of reverse, mandatory rebuild/replacement, simultaneous fluid service or the frozen costs. The row remains unchanged.',
};

function evidenceFor(id) {
  return {
    [IDS.pcv]: [{ kind: 'official-registry-boundary-not-negative-proof', url: RECALL_QUERIES[2009], verifiedOn: '2026-08-06', observation: 'The official inventory contains distinct campaign identities and cannot establish or disprove the broad PCV aggregation.' }],
    [IDS.dpf]: [{ kind: 'jaguar-owner-guidance-remedy-boundary', url: SOURCES.dpf, verifiedOn: '2026-08-06', observation: 'Jaguar describes short-trip regeneration limits and a 60-112 km/h, 20-minute amber-warning drive, not the frozen DTC and repair ladder.' }],
    [IDS.timing]: [{ kind: 'official-bulletin-brand-model-year-remedy-mismatch', url: SOURCES.timingLandRover, verifiedOn: '2026-08-06', observation: 'LTB00474NAS2 is Land Rover-only, limited to 2010-2012 5.0L applications and tensioner/lever replacement.' }],
    [IDS.turboHose]: [{ kind: 'jaguar-bulletin-component-cause-remedy-mismatch', url: SOURCES.coolant, verifiedOn: '2026-08-06', observation: 'H291 covers a limited 2019-21 2.0L petrol coolant-pump software action with no parts, not turbo hose failure.' }],
    [IDS.window]: [{ kind: 'jaguar-bulletin-symptom-cause-remedy-scope-mismatch', url: SOURCES.window, verifiedOn: '2026-08-06', observation: 'JTB00345NAS3 covers 2012-2014 XF pulley squeak and lubrication, not broad cable or motor failure.' }],
    [IDS.mechatronic]: [{ kind: 'jaguar-ssm-dtc-mileage-diagnostic-boundary', url: SOURCES.mechatronic, verifiedOn: '2026-08-06', observation: 'SSM73852 is limited to a low-mileage Eco Stop/Start event with exact DTCs and an adaptation-first diagnostic path.' }],
  }[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'XF');
  if (modelRows.length !== 6) throw new Error(`expected 6 Jaguar XF rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing XF decision: ${current.id}`);
    const before = fullRecord(current);
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content, scope or publication-state changes; partial or mismatched evidence cannot be expanded into the frozen indexed identity.', commerceDecision: 'unchanged-no-commerce-present', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Jaguar', model: 'XF',
    completionStatement: 'This packet reconciles all six frozen Jaguar XF rows. Four official technical PDFs and eight relevant pages were visually reviewed; current Jaguar DPF guidance and year-by-year NHTSA recall inventories were live-locked. All six rows remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All six XF rows remain published and byte-for-byte unchanged.', 'A brand, model, equipment, engine, VIN, year, cause, code, symptom or remedy mismatch cannot authorize a broader rewrite.', 'A recall-registry result is not negative proof that a non-recall issue does not exist.', 'The six frozen citation objects contain titles but no URLs and therefore are not treated as verified source evidence.', 'Distinct issue identities remain deferred until the post-audit new-known-issues phase.'],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 6 },
    observations: [
      { code: 'xf-pcv-primary-source-gap', severity: 'source-gap', recordIds: [IDS.pcv], detail: 'No exact primary source cleared the seven-year, four-engine PCV aggregation.' },
      { code: 'xf-dpf-remedy-claim-mismatch', severity: 'high', recordIds: [IDS.dpf], detail: 'Jaguar guidance supports regeneration constraints but not the frozen DTC scope or repair ladder.' },
      { code: 'xf-timing-citation-brand-model-scope-mismatch', severity: 'high', recordIds: [IDS.timing], detail: 'The named LTB00473 was not verified; LTB00474NAS2 is Land Rover-only and materially narrower.' },
      { code: 'xf-turbo-hose-primary-source-gap', severity: 'source-gap', recordIds: [IDS.turboHose], detail: 'The located same-engine cooling action concerns pump control software, not turbo hoses.' },
      { code: 'xf-window-symptom-cause-remedy-scope-mismatch', severity: 'high', recordIds: [IDS.window], detail: 'JTB00345NAS3 is a limited pulley-squeak lubrication bulletin, not broad cable and motor failure.' },
      { code: 'xf-mechatronic-dtc-mileage-diagnostic-mismatch', severity: 'high', recordIds: [IDS.mechatronic], detail: 'SSM73852 is a narrow low-mileage event with exact DTCs and adaptation-first diagnosis.' },
      { code: 'xf-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation has a title but no URL, so none can independently clear a rewrite.' },
      { code: 'all-xf-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed XF record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES, pdfSources: PDF_SOURCES, sourceArtifactSha256: PDF_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES, webSourceMarkers: WEB_SOURCE_MARKERS, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS }, summary: { rewrite_same_identity: 0, keep_published_pending_source: 6, total: 6 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, WEB_SOURCE_MARKERS, evidenceFor };
