/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-grandeur-adjudication-2026-08-06.json');

const IDS = {
  stall: 'hyundai-grandeur-2-5-gdi-engine-stalls-while-stopped-drive-ecu-neutral-contro',
  mdps: 'hyundai-grandeur-c-mdps-steering-column-clunk-rattle',
  oilLeak: 'hyundai-grandeur-engine-front-case-oil-leak',
  brakeRollback: 'hyundai-grandeur-hybrid-electronic-brake-software-lets-car-roll-back-hills-of',
  electricalBundle: 'hyundai-grandeur-launch-year-electrical-faults-door-handle-touch-sensors-led',
  theta: 'hyundai-grandeur-theta-ii-2-4-gdi-connecting-rod-bearing-wear-engine-seizure',
};

const SOURCES = {
  thetaSettlement: 'https://www.hyundai.com/content/dam/hyundai/kr/ko/data/ir-schedule/2019/10/11/the-settlement-of-class-action-in-us.pdf',
  grandeur2019: 'https://www.hyundai.com/kr/ko/brand/brandstory/heritage/2019-grandeur',
};

const OFFICIAL_REGISTRY = {
  stall: {
    indexUrl: 'https://www.car.go.kr/ri/grts/list.do', recordType: 'free-repair', recordId: '2781',
    retrieval: 'POST /ri/grts/detail.do with gratischeckId=2781 and ctype=O', stablePublicDeepLink: false, verifiedOn: '2026-08-06',
    facts: { vehicle: 'Grandeur (GN7) 2.5 GDI', productionPeriod: '2022-11-16 through 2023-01-02', affectedCount: 4818, campaignStart: '2023-01-09', defect: 'Insufficiently robust electrical-load data in the neutral-control interval may cause a starting/running problem while stopped in Drive.', remedy: 'Upgrade the ECU, including OTA delivery when Bluelink is active.' },
  },
  brakeRollback: {
    indexUrl: 'https://www.car.go.kr/ri/stat/list.do', recordType: 'recall', recordId: '4726',
    retrieval: 'POST /ri/stat/detail.do with recallId=4726 and ctype=O', stablePublicDeepLink: false, verifiedOn: '2026-08-06',
    facts: { vehicle: 'Grandeur Hybrid (GN7 HEV)', productionPeriod: '2022-10-21 through 2023-03-28', affectedCount: 14316, campaignStart: '2023-05-02', defect: 'Incorrect IEB controller software can provide insufficient auxiliary braking after SCC stops on an uphill grade under 5%, allowing rollback and a rear collision.', remedy: 'Update the integrated electric-brake controller software.' },
  },
  electricalBundle: [
    { recordType: 'free-repair', recordId: '2818', retrieval: 'POST /ri/grts/detail.do with gratischeckId=2818 and ctype=O', vehicle: 'Grandeur GN7 and GN7 HEV', affectedCount: 8475, component: 'door-handle touch sensor', defect: 'internal-logic malfunction', remedy: 'DHS software upgrade' },
    { recordType: 'free-repair', recordId: '2816', retrieval: 'POST /ri/grts/detail.do with gratischeckId=2816 and ctype=O', vehicle: 'Grandeur GN7', affectedCount: 1961, component: 'LED driver module', defect: 'cold-temperature intermittent position-lamp non-illumination', remedy: 'replace both LDMs and aim the lamps' },
    { recordType: 'free-repair', recordId: '2838', retrieval: 'POST /ri/grts/detail.do with gratischeckId=2838 and ctype=O', vehicle: 'Grandeur GN7 HEV', affectedCount: 6006, component: 'battery-management system', defect: 'software-variable initialization error may intermittently discharge the battery', remedy: 'BMS upgrade, including OTA when Bluelink is active' },
    { recordType: 'free-repair', recordId: '2839', retrieval: 'POST /ri/grts/detail.do with gratischeckId=2839 and ctype=O', vehicle: 'Grandeur GN7', affectedCount: 1524, component: 'power trunk/tailgate', defect: 'internal-logic malfunction', remedy: 'PTG software upgrade' },
    { recordType: 'recall', recordId: '4697', retrieval: 'POST /ri/stat/detail.do with recallId=4697 and ctype=O', vehicle: 'Grandeur GN7, GN7 HEV and Kona SX2', affectedCount: 11200, component: 'body-domain controller and ultrasonic sensors', defect: 'communication failure may disable parking-distance warning while reversing', remedy: 'BDC software update' },
  ].map((entry) => ({ ...entry, indexUrl: entry.recordType === 'recall' ? 'https://www.car.go.kr/ri/stat/list.do' : 'https://www.car.go.kr/ri/grts/list.do', stablePublicDeepLink: false, verifiedOn: '2026-08-06' })),
  thetaKsds: [
    { indexUrl: 'https://www.car.go.kr/ri/grts/list.do', recordType: 'free-repair', recordId: '1693', retrieval: 'POST /ri/grts/detail.do with gratischeckId=1693 and ctype=O', stablePublicDeepLink: false, verifiedOn: '2026-08-06', facts: { vehicle: 'Grandeur HG/IG among three Hyundai nameplates', grandeurProductionPeriod: 'IG: 2016-06-21 through 2018-05-09', affectedCountAllModels: 289002, defect: 'Existing logic is less capable than KSDS at detecting engine noise and vibration and warning the driver.', remedy: 'Install new KSDS software; the entry also states a Theta II GDI short-block lifetime-warranty policy for connecting-rod-bearing damage.' } },
    { indexUrl: 'https://www.car.go.kr/ri/grts/list.do', recordType: 'free-repair', recordId: '1692', retrieval: 'POST /ri/grts/detail.do with gratischeckId=1692 and ctype=O', stablePublicDeepLink: false, verifiedOn: '2026-08-06', facts: { vehicle: 'Grandeur IG among four Hyundai nameplates', grandeurProductionPeriod: 'IG: 2018-04-26 through 2019-12-10', affectedCountAllModels: 87134, defect: 'Existing logic is less capable than KSDS at detecting engine noise and vibration and warning the driver.', remedy: 'Install the KSDS update; the entry also states a Theta II GDI short-block lifetime-warranty policy for connecting-rod-bearing damage.' } },
  ],
};

const THETA_CARD = {
  years: [2017, 2018, 2019], category: 'engine', severity: 'high', confidence: 'high',
  title: 'Theta II 2.4 GDI Connecting-Rod Bearing Coverage and KSDS (Grandeur IG)',
  description: 'Hyundai identifies the Grandeur among Korea-market Theta II GDI vehicles receiving expanded Knock Sensor Detection System (KSDS) coverage and a lifetime engine warranty limited to connecting-rod-bearing seizure. Hyundai\'s official 2019 Grandeur specification identifies its engine as the improved Theta II 2.4 GDi. Hyundai\'s disclosure also provides compensation terms for eligible customers who experienced engine stoppage or fire because of the covered engine defect.',
  solution: 'Ask a Hyundai service center to check the VIN for applicable KSDS and engine-warranty coverage. KSDS is monitoring software rather than a mechanical repair; any inspection, warranty decision or engine repair depends on the vehicle\'s eligibility and Hyundai\'s diagnosis.',
  symptoms: ['Engine stoppage in a covered connecting-rod-bearing-seizure case', 'Engine fire in a covered engine-defect case'],
  affectedSystems: ['Theta II 2.4 GDI engine', 'Connecting-rod bearings', 'Knock Sensor Detection System'],
  dtcCodes: [],
  citations: [
    { type: 'manufacturer', title: 'Hyundai Motor Company - Theta II Engine Lifetime Warranty and Settlement Disclosure', url: SOURCES.thetaSettlement },
    { type: 'manufacturer', title: 'Hyundai - 2019 Grandeur Theta II 2.4 GDi Specification', url: SOURCES.grandeur2019 },
  ],
  summary: 'Replaced secondary and forum claims with Hyundai primary sources, retained the 2017-2019 Grandeur IG Theta II 2.4 GDI identity, and removed P1326, oil-consumption, repair-cost, replacement-entitlement and population-total claims that the stable public sources do not establish.',
};

const KEEP_REASONS = {
  [IDS.stall]: 'Official Korean free-repair record 2781 confirms the exact 4,818-car GN7 2.5 GDI ECU campaign, production period and OTA-capable ECU update. The frozen row adds a detailed hydraulic-neutral-control explanation, unstable-idle and warning-light symptoms, a twenty-minute dealer claim and launch-campaign totals not stated by the record. Because the official detail is POST-only and has no stable record-specific public URL, the row remains byte-for-byte unchanged.',
  [IDS.mdps]: 'The official registry result involving an MDPS column/housing concerns earlier HG vehicles after column replacement and prescribes steering-angle-sensor initialization; it does not support this 2017-2022 IG clunk, coupling/bearing wear, steering-play, goodwill or assembly-replacement narrative. The row remains byte-for-byte unchanged.',
  [IDS.oilLeak]: 'Owner-community pages do not establish a model-wide 2017-2020 Grandeur IG front-case seal defect, a 50,000-km onset, both 2.4 GDI and 3.0 V6 scope, warranty practice or repair cost. No exact Hyundai or Korean-government primary document was found, so the row remains byte-for-byte unchanged.',
  [IDS.brakeRollback]: 'Official recall record 4726 confirms the exact 14,316-car GN7 HEV hill-rollback identity, production period and IEB software remedy. The frozen row adds launch-quality comparisons and reimbursement guidance beyond the record, and the detail is POST-only with no stable public deep link. The row remains byte-for-byte unchanged pending an independently approved citation path.',
  [IDS.electricalBundle]: 'Official registry records confirm five separate campaigns, but the frozen page combines five different components, populations, production periods and remedies into one issue identity. Replacing the bundle with any one campaign would change the indexed page; citing POST-only list pages would not provide record-specific public evidence. The row remains byte-for-byte unchanged pending an approved split or other page-preserving plan.',
};

function rewriteTheta(current) {
  return fullRecord({
    ...current, ...THETA_CARD, make: 'Hyundai', model: 'Grandeur', title: current.title, category: current.category, trims: [], engines: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0,
    source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06',
    contentUpdatedOn: '2026-08-06', contentUpdateSummary: THETA_CARD.summary, relatedIssueIds: [],
  });
}

function evidenceFor(id) {
  if (id === IDS.stall) return [{ kind: 'official-registry-exact-but-post-only', ...OFFICIAL_REGISTRY.stall, observation: 'The record confirms the central campaign but does not provide a stable record-specific GET URL or support every frozen detail.' }];
  if (id === IDS.brakeRollback) return [{ kind: 'official-registry-exact-but-post-only', ...OFFICIAL_REGISTRY.brakeRollback, observation: 'The record confirms the exact recall but does not provide a stable record-specific GET URL or support every frozen statement.' }];
  if (id === IDS.electricalBundle) return OFFICIAL_REGISTRY.electricalBundle.map((entry) => ({ kind: 'official-registry-distinct-campaign', ...entry, observation: 'This is one of five separate identities combined by the frozen page.' }));
  if (id === IDS.mdps) return [{ kind: 'generation-and-condition-mismatch', indexUrl: 'https://www.car.go.kr/ri/grts/list.do', recordId: '1173', retrieval: 'POST /ri/grts/detail.do with gratischeckId=1173 and ctype=O', verifiedOn: '2026-08-06', observation: 'The record applies to earlier HG vehicles after MDPS column/housing replacement, not an IG coupling/bearing clunk.' }];
  if (id === IDS.theta) return [
    ...THETA_CARD.citations.map((item) => ({ kind: 'official-manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism or coverage language.` })),
    ...OFFICIAL_REGISTRY.thetaKsds.map((entry) => ({ kind: 'official-registry-corroboration', ...entry, observation: 'The POST-only registry record independently confirms KSDS and Grandeur IG production coverage; it is review metadata rather than a public citation.' })),
  ];
  return [];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Grandeur');
  if (modelRows.length !== 6) throw new Error(`expected 6 Hyundai Grandeur rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const isTheta = current.id === IDS.theta;
    if (!isTheta && !KEEP_REASONS[current.id]) throw new Error(`missing Grandeur decision: ${current.id}`);
    const proposal = isTheta ? rewriteTheta(before) : before;
    return {
      id: current.id, model: current.model,
      action: isTheta ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: isTheta ? THETA_CARD.summary : KEEP_REASONS[current.id],
      identityRule: isTheta ? 'The same indexed Grandeur IG Theta II 2.4 GDI bearing/KSDS identity stays on the existing ID; unsupported claims are removed.' : 'No content or publication-state changes; a POST-only record, different generation or one component from a multi-campaign bundle cannot replace this indexed issue.',
      commerceDecision: isTheta ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal), evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const summary = { rewrite_same_identity: 1, keep_published_pending_source: 5, total: 6 };
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Hyundai', model: 'Grandeur',
    completionStatement: 'This packet reconciles all six frozen Hyundai Grandeur rows. One same-identity Hyundai-primary rewrite is proposed; five rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All six rows remain published. Five are byte-for-byte unchanged.',
      'POST-only official records are review evidence, not public deep links; broad registry list pages are not substituted as issue citations.',
      'Five different campaigns in one frozen page remain frozen rather than being collapsed into one component or silently split.',
      'The single rewrite contains zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no unsupported DTC.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, grandeurRecordCount: modelRows.length },
    observations: [
      { code: 'two-exact-post-only-campaigns-frozen', severity: 'independent-review-required', recordIds: [IDS.stall, IDS.brakeRollback], detail: 'Records 2781 and 4726 validate the central identities but do not expose stable record-specific GET links and do not establish every frozen claim.' },
      { code: 'five-campaign-bundle-not-collapsed', severity: 'independent-review-required', recordIds: [IDS.electricalBundle], detail: 'DHS, LDM, BMS, PTG and parking-distance-warning records remain distinct official campaigns; no single one replaces the bundled indexed page.' },
      { code: 'mdps-generation-mismatch-rejected', severity: 'independent-review-required', recordIds: [IDS.mdps], detail: 'Free-repair record 1173 concerns prior HG vehicles after MDPS replacement, not the frozen IG clunk identity.' },
      { code: 'theta-secondary-claims-removed', severity: 'independent-review-required', recordIds: [IDS.theta], detail: 'The proposed rewrite removes P1326, oil-consumption, repair-cost, automatic-replacement and broad population claims while retaining stable Hyundai primary citations.' },
      { code: 'owner-only-oil-leak-row-frozen', severity: 'independent-review-required', recordIds: [IDS.oilLeak], detail: 'No exact primary record supports the model-wide front-case seal narrative.' },
    ],
    officialRegistry: OFFICIAL_REGISTRY, publicSources: SOURCES, summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, OFFICIAL_REGISTRY, SOURCES, THETA_CARD, evidenceFor, fullRecord, hashValue, normalizedFileHash, rewriteTheta };
