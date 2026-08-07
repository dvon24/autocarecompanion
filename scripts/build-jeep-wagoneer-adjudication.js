/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./jeep-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-wagoneer-adjudication-2026-08-06.json');

const IDS = {
  air: 'jeep-wagoneer-air-suspension-failure',
  battery: 'jeep-wagoneer-electrical-battery-drain',
  eTorque: 'jeep-wagoneer-etorque-stalling',
  camera: 'jeep-wagoneer-rearview-camera-recall',
};

const CAMPAIGN_URL = 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V577000';
const PDF_SOURCES = {
  eTorque: {
    url: 'https://static.nhtsa.gov/odi/inv/2024/INOA-PE24018-15183.pdf',
    sha256: '0149eb728677498a190c4cc520a71f2c54fe33424c8432dd3cd6f9eed4172b13',
    visuallyInspectedPages: [1, 2],
    markers: ['PE24018', '2022 Wagoneer 5.7L eTorque', '80 consumer complaints', 'root cause(s)', 'electrical concern'],
  },
  camera: {
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V577-3817.pdf',
    sha256: '291d3f9e74198c4248d26120763f243a4ea8e6abb432c8f4cb23df255387244f',
    visuallyInspectedPages: [1, 3],
    markers: ['NHTSA 23V-577', '2023 - 2024 Model Year (WS) Wagoneer and Grand Wagoneer', '2022 Model Year (WS) Wagoneer and Grand Wagoneer', 'Central Vision Park Assist Module', 'Update'],
  },
};

const EXPECTED_RECALLS = {
  2022: ['21V00A000', '21V873000', '21V919000', '23V545000', '23V577000', '23V716000', '24V436000', '25V593000', '25V642000'],
  2023: ['23V545000', '23V577000', '23V716000', '24V199000', '24V436000', '25V593000', '25V642000', '26V413000'],
  2024: ['23V577000', '23V716000', '24V199000', '24V944000', '25V593000', '25V642000'],
  2025: ['25V593000'],
};
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JEEP&model=WAGONEER&modelYear=${year}`]));
const CAMERA_WAGONEER_MODEL_YEARS = ['WAGONEER|2022', 'WAGONEER|2023', 'WAGONEER|2024'];

const KEEP_REASONS = {
  [IDS.air]: 'Two owner-forum threads do not establish a 2022-2025 Quadra-Lift failure population, over-pressure cause, universal repair path or cost range. Part 68409740AL, the Arnott air spring and the Strutmasters conversion are not supported by an exact official fitment source, so the row remains byte-for-byte unchanged.',
  [IDS.battery]: 'The only linked article is explicitly about the 2022 Jeep Grand Wagoneer, not this Wagoneer page, and the forum citation has no URL. Those sources do not establish the combined 12V/48V drain causes, under-50mA threshold, disabling connected services or part 68368758AA for 2022-2024 Wagoneer, so the row remains byte-for-byte unchanged.',
  [IDS.eTorque]: 'Visually inspected NHTSA investigation PE24018 concerns only 2022 Wagoneer and 2022 Ram 1500 vehicles with the 5.7L eTorque engine. The frozen page extends that evidence across 2022-2025, asserts a root cause while NHTSA is still assessing root cause(s), adds unsupported P0401-P0404 codes, software and parts remedies, and carries unverified part 04610491AG and generic commerce. It remains byte-for-byte unchanged.',
};

const CAMERA_CARD = {
  description: 'NHTSA campaign 23V577000 covers certain 2022-2024 Jeep Wagoneer and Grand Wagoneer vehicles. Central Vision Park Assist Module software may prevent the rearview image from displaying when the vehicle is placed in reverse, creating a failure to comply with Federal Motor Vehicle Safety Standard No. 111. This indexed page retains its existing 2022-2023 year scope; owners should use their VIN to confirm inclusion.',
  solution: 'Check the VIN for campaign 23V577000 (FCA recall 56A). Dealers update the Central Vision Park Assist Module software free of charge. Until repaired, physically check the area behind the vehicle before backing because the rearview image may not display.',
  severity: 'medium',
  confidence: 'high',
  symptoms: ['Rearview image may not display when the vehicle is placed in reverse'],
  affectedSystems: ['Central Vision Park Assist Module', 'rearview camera display'],
  citations: [{ type: 'recall', title: 'NHTSA Campaign 23V577000 - Rearview Image May Not Display', url: CAMPAIGN_URL }],
  summary: 'Bounded the same rearview-camera identity to NHTSA campaign 23V577000, preserved the indexed 2022-2023 scope, disclosed that the campaign also includes 2024 vehicles, and removed unsupported symptoms and recommendations.',
};

function rewriteCamera(current) {
  return fullRecord({
    ...current,
    ...CAMERA_CARD,
    make: current.make,
    model: current.model,
    years: current.years,
    category: current.category,
    title: current.title,
    trims: [],
    engines: [],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-06',
    contentUpdatedOn: '2026-08-06',
    contentUpdateSummary: CAMERA_CARD.summary,
    relatedIssueIds: current.relatedIssueIds,
  });
}

function evidenceFor(id) {
  if (id === IDS.eTorque) return [{ kind: 'official-investigation-partial-year-and-unresolved-root-cause', url: PDF_SOURCES.eTorque.url, sha256: PDF_SOURCES.eTorque.sha256, visuallyInspectedPages: [1, 2], verifiedOn: '2026-08-06', observation: 'PE24018 identifies 2022 Wagoneer 5.7L eTorque and 80 complaints but says root cause remains under evaluation.' }];
  if (id === IDS.camera) return [
    { kind: 'official-recall-exact-same-identity', url: CAMPAIGN_URL, verifiedOn: '2026-08-06', observation: 'Campaign 23V577000 exactly matches the rearview-image failure and free CVPAM software remedy for Wagoneer.' },
    { kind: 'official-recall-pdf-visually-inspected', url: PDF_SOURCES.camera.url, sha256: PDF_SOURCES.camera.sha256, visuallyInspectedPages: [1, 3], verifiedOn: '2026-08-06', observation: 'Rendered pages confirm 2022-2024 Wagoneer scope, equipment qualifiers and CVPAM reprogramming.' },
  ];
  return [{ kind: 'official-recall-inventory-boundary-not-broad-claim-proof', url: RECALL_QUERIES[2022], supportingUrls: Object.values(RECALL_QUERIES), verifiedOn: '2026-08-06', observation: `The complete 2022-2025 Wagoneer recall inventory does not establish the broad frozen claims for ${id}.` }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Wagoneer');
  if (modelRows.length !== 4) throw new Error(`expected 4 Wagoneer rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(Object.values(IDS).sort())) throw new Error('Wagoneer IDs do not match snapshot');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const rewrite = current.id === IDS.camera;
    const proposal = rewrite ? rewriteCamera(current) : before;
    return {
      id: current.id,
      model: current.model,
      action: rewrite ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: rewrite ? 'The exact campaign and visually inspected repair instructions match the indexed component, failure, vehicle and remedy. The proposal keeps the existing ID, title, category, years, status and related links while removing unsupported language.' : KEEP_REASONS[current.id],
      identityRule: 'An official source may narrow a matching identity, but it may not change the indexed ID, title, category, year set or publication status. Partial or unresolved evidence remains frozen.',
      commerceDecision: rewrite ? 'removed-unverified-commerce-from-proposal' : 'unchanged-commerce-pending-exact-source-and-fitment',
      changedFields: diffFields(before, proposal),
      evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Jeep',
    model: 'Wagoneer',
    completionStatement: 'All four frozen Wagoneer records are reconciled. One exact rear-camera recall receives a no-commerce same-identity rewrite; three broad or partial-source pages remain byte-for-byte holds.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All four Wagoneer IDs, titles, categories, indexed years and publication states remain unchanged.',
      'The 2022-only eTorque investigation cannot authorize a 2022-2025 root-cause or repair claim.',
      'Cross-model articles and search-query commerce cannot authorize fitment or repair claims.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 4 },
    observations: [
      { code: 'wagoneer-etorque-investigation-is-2022-only-and-root-cause-open', severity: 'critical', recordIds: [IDS.eTorque], detail: 'PE24018 covers only 2022 Wagoneer/2022 Ram 1500 5.7L eTorque and explicitly keeps root cause under evaluation.' },
      { code: 'wagoneer-camera-recall-also-includes-2024', severity: 'scope-note', recordIds: [IDS.camera], detail: 'Campaign 23V577 includes 2022-2024 Wagoneer; this same-identity proposal preserves the existing indexed 2022-2023 year set and discloses the additional official scope.' },
      { code: 'wagoneer-battery-citation-is-grand-wagoneer', severity: 'critical', recordIds: [IDS.battery], detail: 'The only linked battery article is for Grand Wagoneer and the forum citation has no URL.' },
      { code: 'wagoneer-air-commerce-unverified', severity: 'high', recordIds: [IDS.air], detail: 'The compressor part and air-spring/conversion-kit commerce lack exact official Wagoneer fitment support.' },
      { code: 'all-wagoneer-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS).sort(), detail: 'Every frozen Wagoneer identity and publication state remains preserved.' },
    ],
    pdfSources: PDF_SOURCES,
    recallCampaign: { url: CAMPAIGN_URL, expectedWagoneerModelYears: CAMERA_WAGONEER_MODEL_YEARS },
    recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 1, keep_published_pending_source: 3, total: 4 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMERA_CARD, CAMERA_WAGONEER_MODEL_YEARS, CAMPAIGN_URL, EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SOURCES, RECALL_QUERIES, evidenceFor, rewriteCamera };

