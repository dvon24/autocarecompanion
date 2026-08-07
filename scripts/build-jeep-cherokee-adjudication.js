/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./jeep-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-cherokee-adjudication-2026-08-06.json');

const IDS = {
  deathWobble: 'jeep-cherokee-death-wobble',
  exhaust: 'jeep-cherokee-cracked-exhaust-manifold-4-0l-i6',
  crankSensor: 'jeep-cherokee-crankshaft-position-sensor-failure-causes-intermittent-no-st',
  transmission: 'jeep-cherokee-kl-9speed-trans-2014',
  brakes: 'jeep-cherokee-kl-brake-wear-2014',
  canBus: 'jeep-cherokee-kl-can-bus-2014',
  stalling: 'jeep-cherokee-kl-engine-stalling-2014',
  headlamp: 'jeep-cherokee-kl-headlight-condensation-2014',
  liftgate: 'jeep-cherokee-kl-liftgate-fire-2014',
  oilConsumption: 'jeep-cherokee-kl-oil-consumption-2014',
  oilHousing: 'jeep-cherokee-kl-oil-filter-housing-2014',
  ptu: 'jeep-cherokee-kl-ptu-failure-2014',
  shifter: 'jeep-cherokee-kl-shifter-rollaway-2014',
  sunroof: 'jeep-cherokee-kl-sunroof-drain-2014',
  tipm: 'jeep-cherokee-kl-tipm-fuel-pump-2014',
  oilAdapter: 'jeep-cherokee-oil-filter-adapter-o-ring-leak',
  rearMain: 'jeep-cherokee-rear-main-seal-oil-leak',
  rust: 'jeep-cherokee-rear-unibody-frame-rail-floor-pan-rocker-rust',
};

function campaignUrl(campaign) {
  return `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
}

const PDF_SOURCES = {
  canBus: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10162581-9999.pdf',
    sha256: '3f841cae0d81726723a7711828ec43b8e02e2a740fa1f881cf20a2ca7569b771',
    visuallyInspectedPages: [1],
    expectedMarkers: ['FERRARI NORTH AMERICA', 'SABELT Racing Seats', '458', 'F12', 'California'],
  },
  headlamp: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10221500-9999.pdf',
    sha256: 'a0bcf43e4d49e8b6c8bf5c8d493b2fc84c8d1909cda02ae65ba8d64e02a421ab',
    visuallyInspectedPages: [1, 2],
    expectedMarkers: ['23-024-22', '2019 - 2022', 'Jeep Cherokee', '20 minutes', 'does not need to be replaced'],
  },
};

const RECALL_URLS = {
  liftgate: campaignUrl('23V338000'),
  ptu: campaignUrl('20V343000'),
  shifterMismatch: campaignUrl('16V240000'),
};

const EXPECTED_CAMPAIGNS = {
  liftgate: {
    campaign: '23V338000', models: ['CHEROKEE'], years: ['2014', '2015', '2016'], resultCount: 3,
    markers: ['power liftgate module', 'vehicle fire with the ignition on or off', 'park outside and away from structures', 'relocate the power liftgate module', 'add a water shield', 'replace the module and electrical connectors', 'free of charge', 'supersedes recalls 15V-393 and 15V-826'],
  },
  ptu: {
    campaign: '20V343000', models: ['CHEROKEE'], years: ['2014', '2015', '2016', '2017'], resultCount: 4,
    markers: ['two-speed Power Transfer Unit', 'input spline teeth to wear off', 'loss of drive', 'loss of the Park function', 'engaging rear wheel drive', 'electronic parking brake'],
  },
  shifterMismatch: {
    campaign: '16V240000', resultCount: 8,
    modelYears: ['300|2012', '300|2013', '300|2014', 'CHARGER|2012', 'CHARGER|2013', 'CHARGER|2014', 'GRAND CHEROKEE|2014', 'GRAND CHEROKEE|2015'],
    markers: ['monostable gear selector', 'not in PARK', 'software to mitigate the risk of vehicle rollaway'],
  },
};

const EXPECTED_RECALLS = {
  1990: ['06E026000', '09E012000', '09E025000', '90V177000', '91V003000', '91V063000', '96V260000', '97I002000', '98V005000'],
  1991: ['06E026000', '09E012000', '09E025000', '90V206000', '91V023000', '91V063000', '96V260000', '97I002000', '98V005000'],
  1992: ['06E026000', '09E012000', '09E025000', '97I002000', '99V340000'],
  1993: ['06E026000', '09E012000', '09E025000', '93V037000', '97I002000', '97V069000', '99V340000'],
  1994: ['06E026000', '08V056000', '09E012000', '09E025000', '11V279000', '93V161000', '97I002000', '97V069000', '99V340000'],
  1995: ['06E022000', '06E026000', '08V056000', '09E012000', '09E025000', '11V279000', '95V057000', '95V172000', '97I002000', '97V069000', '99V340000'],
  1996: ['00V136000', '06E022000', '06E026000', '08V056000', '09E012000', '09E025000', '11V279000', '95V193000', '97V040000', '97V069000'],
  1997: ['00V105000', '00V136000', '06E011000', '06E022000', '06E026000', '06E065000', '08V056000', '09E012000', '09E025000', '97V194000'],
  1998: ['00V105000', '00V136000', '06E011000', '06E022000', '06E026000', '06E065000', '08V056000', '09E012000', '09E025000', '98V023000', '98V048000'],
  1999: ['00V105000', '00V136000', '06E011000', '06E022000', '06E026000', '06E065000', '09E012000', '09E025000'],
  2014: ['14V293000', '14V392000', '15V041000', '15V393000', '15V461000', '15V509000', '16V529000', '16V590000', '17V824000', '18V332000', '19V447000', '20V343000', '23V338000'],
  2015: ['15V041000', '15V393000', '15V461000', '15V676000', '15V826000', '16V529000', '16V590000', '17V824000', '18V332000', '20V343000', '23V338000'],
  2016: ['15V826000', '16V284000', '16V287000', '16V590000', '17V824000', '18V332000', '20V343000', '23V302000', '23V338000'],
  2017: ['16V799000', '17V543000', '18V332000', '20V343000', '23V302000', '25V011000'],
  2018: ['17V543000', '17V670000', '18V282000', '18V332000', '18V494000', '18V524000', '25V011000'],
  2019: ['18V344000', '18V492000', '18V523000', '18V524000', '18V739000', '18V917000', '19V248000', '19V449000', '19V637000', '25V011000', '26V290000'],
  2020: ['19V637000', '20V191000', '26V290000'],
  2021: ['20V657000', '21V310000', '24V516000', '26V290000'],
  2022: ['24V239000', '24V516000', '26V290000'],
  2023: ['26V290000'],
};

const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JEEP&model=CHEROKEE&modelYear=${year}`]));

const KEEP_REASONS = {
  [IDS.deathWobble]: 'No exact Jeep or government primary source was pinned for the frozen 1990-1999 cumulative front-end cause hierarchy, speed threshold, track-bar part number, brace/stabilizer outcome or cost range. The indexed page and commerce remain byte-for-byte unchanged pending exact source and fitment review.',
  [IDS.exhaust]: 'No exact primary source was pinned for the full 1990-1999 scope, collector/weld mechanism, flex-section remedy, welding-recurrence claim or part 4883385 fitment. The row remains byte-for-byte unchanged.',
  [IDS.crankSensor]: 'No exact primary source was pinned for the thermal-failure mechanism, P0320/P0335 mapping, 125,000-175,000-mile range, Mopar/NTK recommendation or part 56027866AB fitment across both frozen engines. The row remains byte-for-byte unchanged.',
  [IDS.transmission]: 'The frozen page combines broad 2014-2019 shifting, neutral, calibration, service-interval and cost claims without one reviewed primary package proving the complete identity and scope. It remains byte-for-byte unchanged rather than substituting a narrower bulletin.',
  [IDS.brakes]: 'A video citation cannot establish the frozen 2014-2023 soft-rotor mechanism, 20,000-30,000-mile range or part 68459898AB fitment. The row and commerce remain byte-for-byte unchanged.',
  [IDS.canBus]: 'The cited official NHTSA PDF MC-10162581-9999 is Ferrari North America bulletin 2583 about SABELT racing seats for Ferrari 458, F12 and California models, not a Jeep Cherokee CAN-bus bulletin. This critical citation and model mismatch cannot authorize any content change, so the indexed row remains byte-for-byte unchanged.',
  [IDS.stalling]: 'The title-only oil-consumption lead describes at most one engine/oil pathway and cannot support the frozen ten-year multiple-cause stalling aggregation, DTC set, sensor/fuel/transmission causes or remedies. The row remains byte-for-byte unchanged.',
  [IDS.headlamp]: 'Official bulletin 23-024-22 covers 2019-2022 KL Jeep Cherokee headlamp condensation evaluation, while the frozen row covers 2014-2023 and cites a different title-only identifier. The partial 2019-2022 procedure cannot overwrite a 2014-2023 indexed identity, so the row remains byte-for-byte unchanged.',
  [IDS.oilConsumption]: 'No exact primary source was pinned for the frozen piston-ring cause, one-quart-per-1,000-mile threshold, stall-below-3.5-quarts claim, XB1 eligibility, DTCs and engine-replacement outcome. The row remains byte-for-byte unchanged.',
  [IDS.oilHousing]: 'The row has no primary citation, includes unverified 3.6L Cherokee applicability and contains unverified Dorman/OEM part fitment. It remains byte-for-byte unchanged pending exact VIN/engine and part-source review.',
  [IDS.shifter]: 'NHTSA campaign 16V240000/S27 covers 2014-2015 Jeep Grand Cherokee, not Jeep Cherokee. The exact model mismatch cannot be repaired by changing this indexed page identity, so the row remains byte-for-byte unchanged.',
  [IDS.sunroof]: 'A title-only bulletin and complaint-search page do not support the frozen 2014-2023 scope, DIY line-clearing methods, annual interval or complete remedy. The row remains byte-for-byte unchanged.',
  [IDS.tipm]: 'The only frozen source is a video and no reviewed primary source establishes an integrated fuel-pump relay defect, bypass/rebuild remedy or costs across 2014-2023 Cherokee. The row remains byte-for-byte unchanged.',
  [IDS.oilAdapter]: 'No exact primary source was pinned for the ten-year scope, three-seal configuration, fastener-style split, relocation/delete claims or part 4720363 fitment. The row and commerce remain byte-for-byte unchanged.',
  [IDS.rearMain]: 'No exact primary service source was pinned, and the frozen instruction that the transmission and flexplate must be removed conflicts with the stated two-piece-seal identity, which ordinarily requires a different service path. The safety-sensitive procedure and part fitment remain byte-for-byte unchanged for independent manual review.',
  [IDS.rust]: 'No exact primary source was pinned for the full 1990-1999 structural-location set, corrosion mechanism, death-wobble linkage or weld-in repair claims. The row remains byte-for-byte unchanged.',
};

const REWRITE_CARDS = {
  [IDS.liftgate]: {
    description: 'NHTSA campaign 23V338000 covers certain 2014-2016 Jeep Cherokee vehicles equipped with a power liftgate. An electrical short in the power liftgate module may cause a vehicle fire whether the ignition is on or off.',
    solution: 'Check VIN eligibility. Until the recall repair is complete, park outside and away from structures. Dealers relocate the power liftgate module, add a water shield, inspect for corrosion, and replace the module and electrical connectors when necessary, free of charge. Vehicles repaired under superseded campaigns 15V393 and 15V826 still require the new remedy.',
    severity: 'critical', confidence: 'high', symptoms: [], affectedSystems: ['power liftgate module', 'rear liftgate wiring'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 23V338000 - Power Liftgate Module Fire Risk', url: RECALL_URLS.liftgate }],
    summary: 'Updated the same power-liftgate fire identity to the completed NHTSA 23V338 remedy and removed unsupported commerce, costs and warning symptoms.',
  },
  [IDS.ptu]: {
    description: 'NHTSA campaign 20V343000 covers certain 2014-2017 Jeep Cherokee vehicles equipped with a two-speed Power Transfer Unit. Relative movement between the differential input splines and transmission output shaft may wear away input-spline teeth, causing loss of drive while moving and loss of Park while stationary.',
    solution: 'Check VIN eligibility. Dealers perform a software update that engages rear-wheel drive to maintain propulsion and activates the electronic parking brake to prevent rollaway if an input-spline failure occurs. The campaign does not state that dealers replace the PTU.',
    severity: 'critical', confidence: 'high', symptoms: [], affectedSystems: ['two-speed power transfer unit', 'input splines', 'driveline'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 20V343000 - PTU Input-Spline Failure', url: RECALL_URLS.ptu }],
    summary: 'Bounded the same PTU-failure identity to NHTSA campaign 20V343 and removed the unsupported retail part, fluid intervals, costs, mileage and replacement promise.',
  },
};

function rewriteProposal(current, card) {
  return fullRecord({
    ...current, ...card,
    make: current.make, model: current.model, years: current.years, category: current.category, title: current.title,
    trims: [], engines: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [],
    humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '',
    reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary,
    relatedIssueIds: current.relatedIssueIds,
  });
}

function evidenceFor(id) {
  if (id === IDS.canBus) return [{ kind: 'critical-official-pdf-model-and-subject-mismatch', url: PDF_SOURCES.canBus.url, sha256: PDF_SOURCES.canBus.sha256, visuallyInspectedPages: PDF_SOURCES.canBus.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'The rendered first page is Ferrari bulletin 2583 for SABELT racing seats, not a Jeep CAN-bus bulletin.' }];
  if (id === IDS.headlamp) return [{ kind: 'official-pdf-partial-year-scope', url: PDF_SOURCES.headlamp.url, sha256: PDF_SOURCES.headlamp.sha256, visuallyInspectedPages: PDF_SOURCES.headlamp.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Rendered pages 1-2 show bulletin 23-024-22 covers KL Cherokee only for 2019-2022 and gives a 20-minute lamp evaluation.' }];
  if (id === IDS.shifter) return [{ kind: 'official-recall-exact-model-mismatch', url: RECALL_URLS.shifterMismatch, verifiedOn: '2026-08-06', observation: 'Campaign 16V240000 includes Jeep GRAND CHEROKEE for 2014-2015 and no Jeep CHEROKEE result.' }];
  if (id === IDS.liftgate) return [{ kind: 'official-recall-exact-same-identity', url: RECALL_URLS.liftgate, verifiedOn: '2026-08-06', observation: 'Campaign 23V338000 exactly matches the frozen power-liftgate fire identity and supplies the current remedy.' }];
  if (id === IDS.ptu) return [{ kind: 'official-recall-exact-same-identity', url: RECALL_URLS.ptu, verifiedOn: '2026-08-06', observation: 'Campaign 20V343000 exactly matches the frozen two-speed PTU input-spline failure identity and software remedy.' }];
  return [{ kind: 'nhtsa-recall-inventory-boundary-not-claim-proof', url: RECALL_QUERIES[Object.keys(EXPECTED_RECALLS)[0]], verifiedOn: '2026-08-06', observation: 'The official recall inventory was locked for the frozen model-year ranges, but it does not prove these broader maintenance, part-fitment or aggregated failure claims.' }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Cherokee');
  if (modelRows.length !== 18) throw new Error(`expected 18 Jeep Cherokee rows, found ${modelRows.length}`);
  const expectedIds = Object.values(IDS).sort();
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(expectedIds)) throw new Error('Cherokee ID constants do not match the frozen snapshot');

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) throw new Error(`missing Cherokee decision: ${current.id}`);
    const proposal = card ? rewriteProposal(current, card) : before;
    return {
      id: current.id, model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? 'The frozen page and exact NHTSA campaign describe the same component, failure and vehicle identity. The proposal narrows the language and current remedy without changing ID, title, category, years, status or related links.' : KEEP_REASONS[current.id],
      identityRule: 'No source may change an indexed page identity. A different model, year scope, component, outcome or remedy requires a byte-for-byte hold.',
      commerceDecision: card ? 'removed-unverified-commerce-from-proposal' : 'unchanged-pending-exact-fitment-source',
      changedFields: diffFields(before, proposal), evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const summary = { rewrite_same_identity: rows.filter((row) => row.action === 'rewrite_same_identity').length, keep_published_pending_source: rows.filter((row) => row.action === 'keep_published_pending_source').length, total: rows.length };
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Jeep', model: 'Cherokee',
    completionStatement: 'This packet reconciles all 18 frozen Jeep Cherokee rows. Two exact same-identity NHTSA recall pages receive no-commerce rewrites; 16 uncertain, partial or mismatched identities remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, title change, category change, year change, new issue or public-page change is authorized by this packet.',
      'All 18 Cherokee records remain published, all IDs remain present, and all 16 holds remain byte-for-byte unchanged.',
      'The two rewrites preserve ID, make, model, title, category, years, status and relatedIssueIds while removing unsupported commerce and numeric claims.',
      'A partial source or a source for a different model cannot be used to overwrite an indexed identity.',
      'Recall identities found in the inventory but absent from this frozen model remain deferred until the post-audit new-known-issues phase.',
    ],
    source: { snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 18 },
    observations: [
      { code: 'cherokee-can-bus-citation-is-ferrari-bulletin', severity: 'critical', recordIds: [IDS.canBus], detail: 'The live, rendered cited PDF is a Ferrari SABELT racing-seat bulletin and provides no Jeep CAN-bus support.' },
      { code: 'cherokee-shifter-campaign-is-grand-cherokee', severity: 'critical', recordIds: [IDS.shifter], detail: 'Campaign 16V240000 applies to Grand Cherokee, not Cherokee.' },
      { code: 'cherokee-headlamp-source-partial-year-scope', severity: 'high', recordIds: [IDS.headlamp], detail: 'Bulletin 23-024-22 supports a 2019-2022 procedure, not the frozen 2014-2023 range.' },
      { code: 'cherokee-rear-main-service-path-conflict', severity: 'high', recordIds: [IDS.rearMain], detail: 'The frozen two-piece-seal identity conflicts with its transmission/flexplate-removal instruction and requires independent service-manual review.' },
      { code: 'all-cherokee-pages-preserved', severity: 'seo-safety', recordIds: expectedIds, detail: 'Every frozen Cherokee record remains published; no ID, title, category or year scope moves.' },
    ],
    pdfSources: PDF_SOURCES, recallSources: RECALL_URLS, expectedCampaigns: EXPECTED_CAMPAIGNS,
    recallInventory: { queries: RECALL_QUERIES, expectedStatus: 200, expectedCampaignsByYear: EXPECTED_RECALLS },
    summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { EXPECTED_CAMPAIGNS, EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SOURCES, RECALL_QUERIES, RECALL_URLS, REWRITE_CARDS, evidenceFor, rewriteProposal };
