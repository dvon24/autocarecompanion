/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-forte-adjudication-2026-08-08.json');

const REWRITE_IDS = {
  hecu: 'kia-forte-abs-hecu-brake-fluid-leak-causing-electrical-short-engine-ba',
  airbag: 'kia-forte-airbag-control-unit-electrical-fault-airbags-may-not-deploy',
  strut: 'kia-forte-front-strut-bearing-failure',
};
const HOLD_IDS = {
  paint: 'kia-forte-clear-coat-paint-peeling-flaking',
  rodBearing: 'kia-forte-connecting-rod-bearing-failure-causing-engine-seizure-sudden',
  ivt: 'kia-forte-cvt-judder',
  nuEngine: 'kia-forte-engine-knocking-nu-gdi',
  lamps: 'kia-forte-headlight-condensation',
  mdps: 'kia-forte-motor-driven-power-steering-flexible-coupler-knocking-clunki',
  lowBeam: 'kia-forte-premature-low-beam-headlight-burnout-from-melting-connector',
};

const CAMPAIGNS = {
  hecu: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V652000',
  wrongHecu: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V331000',
  airbagEarly: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V363000',
  airbagLate: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V031000',
};
const EXPECTED_CAMPAIGNS = {
  hecu: { modelYears: ['FORTE|2010', 'FORTE|2011', 'FORTE|2012', 'FORTE|2013'], component: 'SERVICE BRAKES, HYDRAULIC:ANTILOCK/TRACTION CONTROL/ELECTRONIC LIMITED SLIP:CONTROL UNIT/MODULE' },
  wrongHecu: { modelYears: [], component: null },
  airbagEarly: { modelYears: ['FORTE|2010', 'FORTE|2011', 'FORTE|2012', 'FORTE|2013'], component: 'AIR BAGS: AIR BAG/RESTRAINT CONTROL MODULE' },
  airbagLate: { modelYears: ['FORTE|2017', 'FORTE|2018'], component: 'AIR BAGS' },
};

const PDF_SOURCES = {
  hecu: { url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V652-3815.PDF', sha256: 'a9538466fbfe576dfa188c07207d2fea2213db30be7a05dd5e162c9bfa86f206', visuallyInspectedPages: [1, 2, 7], markers: ['23V-652', '2010-2013 Kia Forte/Forte Koup', 'install new fuse(s)', 'lower fuse amperage'] },
  airbagEarly: { url: 'https://static.nhtsa.gov/odi/rcl/2018/RCRIT-18V363-8649.pdf', sha256: 'bdf62189a791719e9aa642a83b7908b011b8d5be491f3819ad9574e45270df61', visuallyInspectedPages: [1, 2], markers: ['SC165', '2010-2013MY Kia Forte', 'Application-Specific Integrated Circuit', 'extension wire harness kit'] },
  airbagLate: { url: 'https://static.nhtsa.gov/odi/rcl/2022/RCRIT-22V031-2809.pdf', sha256: '7641424836f9f8e5fdcb3bebb3d177d605ee24e0769bb70af0ff630552d40192', visuallyInspectedPages: [1, 2, 12], markers: ['SC226', '2017-2018 MY Forte', 'B1620', 'ACU software logic'] },
  strut: { url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10248691-0001.pdf', sha256: 'f015c6a07a24be67ce4b5d3b4fa8faa9532f97255b6f07e2595bc2e5a19044d4', visuallyInspectedPages: [1, 2], markers: ['CHA 121', '2019-2024MY Forte', 'intermittent noise when turning', 'front strut bearing and upper spring pad'] },
  lamps: { url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201529-0001.pdf', sha256: '692a4d7795da66719f1f82d7be4c5bc8a76a3426de1d610d74f85db7e471b72c', visuallyInspectedPages: [1, 2], markers: ['BOD 055', 'All Models', 'normal condensation', 'Water Intrusion'] },
  mdps: { url: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10089591-5448.pdf', sha256: 'e619d353a63a59b2199890564917727f048322e96534db802e5afe6f9d802fa6', visuallyInspectedPages: [1, 2], markers: ['CHA 074', 'Forte (TD) / 2012~2013', 'Forte (YD) / 2014', 'MDPS FLEXIBLE COUPLING'] },
  wrongLowBeam: { url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10109873-9999.pdf', sha256: 'bc4c28fb40261ff31663349046b08474c7c24eb285a3f414cc4fa7bd4db572aa', visuallyInspectedPages: [1, 2], markers: ['SC149', '2011-2012MY Sorento', 'HALOGEN HEADLAMP LOW BEAM CONNECTOR'] },
  pi2102: { url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11010510-0001.pdf', sha256: 'eb2c7f8c79d204ff1567daee75c31149c60f60f395802d5916234818c503db92', visuallyInspectedPages: [1, 2], markers: ['PI2102Y/Z', '2010-2011MY Forte', '2.4L MPI', 'DTC P1326'] },
  ivt: { url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10238222-0001.pdf', sha256: '508191b216bcdac905da6dbd7b1ff9ca4fd3fb449af3305cdd1e44dd51f33b8b', visuallyInspectedPages: [1, 2], markers: ['SC199', '2019-2020', 'Forte (BDm)', 'P0867'] },
  engineRecall: { url: 'https://static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V750-5519.PDF', sha256: 'c5b64ece5dde15aef6480eefccf7c4eaabc1d895e3bc8326560fd1b14093e04d', visuallyInspectedPages: [1, 2, 3, 4, 5], markers: ['20V-750', '2014-2015 KIA Forte and Forte Koup', '2012-2013 KIA Forte and Forte Koup', 'cause resulting from a manufacturing or design defect has not been identified', '15 years/150,000 miles'] },
};

const FLAT_RECALL_SOURCE = {
  url: 'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip', retrievedOn: '2026-08-07',
  archiveSha256: '59f15be5de0bde8768606fb03b1135e7fca5bc2c56041c7cfdac9b0d137e6a0f', extractedFile: 'FLAT_RCL_POST_2010.txt', extractedSha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70',
};
const EXPECTED_FLAT_RECALL_INVENTORY = {
  2010: ['13V114000', '18V363000', '23V652000'], 2011: ['16V070000', '18V363000', '23V652000'], 2012: ['17V773000', '18V363000', '20V750000', '23V652000'], 2013: ['16V312000', '17V773000', '18V363000', '20V750000', '23V652000'],
  2014: ['15V015000', '17V773000', '20V750000'], 2015: ['20V750000'], 2016: ['21V622000'], 2017: ['21V260000', '21V622000', '22V031000'], 2018: ['21V260000', '21V622000', '22V031000'],
  2019: ['18V771000', '20V459000'], 2020: [], 2021: ['21V164000', '22V304000'], 2022: ['22V304000'], 2023: ['22V906000', '23V649000', '24V244000'], 2024: [],
};
const DEFERRED_CAMPAIGNS = ['13V114000', '15V015000', '16V070000', '16V312000', '17V773000', '18V771000', '20V459000', '21V164000', '21V260000', '21V622000', '22V304000', '22V906000', '23V649000', '24V244000'];

const REWRITE_CARDS = {
  [REWRITE_IDS.hecu]: {
    description: 'NHTSA recall 23V652000 (Kia SC284) covers certain 2010-2013 Forte and Forte Koup vehicles equipped with Electronic Stability Control. The Hydraulic Electronic Control Unit (HECU) may experience an electrical short that can cause an engine-compartment fire while the vehicle is parked or being driven. Kia and NHTSA advise affected owners to park outdoors and away from structures until the recall is completed.',
    solution: 'Check the VIN for recall 23V652000. A Kia dealer installs new lower-amperage fuse or fuses to prevent an overcurrent condition in the HECU circuit, free of charge. This proposal does not recommend a retail HECU or fuse because the campaign remedy is VIN-specific and dealer-installed. If the ABS or malfunction light illuminates, or there is a burning smell or smoke, stop safely, turn the engine off and arrange towing to a Kia dealer.',
    commerceDecision: 'dealer-only-no-retail-part-safety-recall', severity: 'high', confidence: 'high',
    symptoms: ['ABS or malfunction warning light', 'Burning or melting smell', 'Smoke from engine compartment'], affectedSystems: ['hydraulic electronic control unit', 'HECU electrical circuit and recall fuse'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 23V652000 - Forte HECU Fire Risk', url: CAMPAIGNS.hecu }, { type: 'recall', title: 'Part 573 Safety Recall Report 23V652', url: PDF_SOURCES.hecu.url }],
    summary: 'Corrected the same HECU fire identity to Forte recall 23V652, removed the false prior campaign citation and unsupported HECU-replacement and fuse-amperage details, and retained the indexed page identity.',
  },
  [REWRITE_IDS.airbag]: {
    description: 'Two Kia safety recalls match this page’s retained year groups. Under 18V363000 (SC165), the airbag control unit in certain 2010-2013 Forte vehicles can suffer electrical overstress during a frontal crash, preventing the frontal airbags and seatbelt pretensioners from deploying. Under 22V031000 (SC226), the ACU cover in certain 2017-2018 Forte vehicles can contact a memory chip, illuminate the airbag warning light with DTC B1620 and deactivate the airbags.',
    solution: 'Check the VIN for both recalls. For 18V363000, Kia installs an extension wire-harness kit between the ACU and vehicle harness. For 22V031000, Kia updates ACU software when B1620 is absent and replaces the ACU when B1620 is present. Both remedies are free and VIN-specific. No retail airbag-control part should be purchased from this page. If the airbag warning light stays on, follow Kia’s recall instructions and arrange dealer diagnosis.',
    commerceDecision: 'dealer-only-no-retail-part-safety-recalls', severity: 'high', confidence: 'high',
    symptoms: ['Airbag warning light remains illuminated', 'DTC B1620 on later recall population', 'Airbags or pretensioners may not deploy in a crash'], affectedSystems: ['airbag control unit', 'frontal airbags', 'seatbelt pretensioners'],
    citations: [{ type: 'recall', title: 'Kia SC165 - ACU Extension Wire Harness Installation', url: PDF_SOURCES.airbagEarly.url }, { type: 'recall', title: 'Kia SC226 - ACU Software Update or Replacement', url: PDF_SOURCES.airbagLate.url }, { type: 'recall', title: 'NHTSA Campaign 18V363000', url: CAMPAIGNS.airbagEarly }, { type: 'recall', title: 'NHTSA Campaign 22V031000', url: CAMPAIGNS.airbagLate }],
    summary: 'Separated the same airbag-nondeployment identity into the exact SC165 and SC226 year groups and dealer remedies, removed class-action and secondary-source claims, and preserved the indexed title and years.',
  },
  [REWRITE_IDS.strut]: {
    description: 'Kia bulletin CHA121 applies to certain 2019-2024 Forte vehicles and documents an intermittent front-suspension noise while turning the steering wheel, whether the vehicle is moving or stationary. Kia’s procedure replaces the front strut bearing and upper spring pad on both front strut assemblies. The bulletin describes a noise repair, not a safety recall or proof of complete strut failure.',
    solution: 'Ask a Kia dealer or qualified suspension shop to confirm bulletin CHA121 applies and to inspect both front strut assemblies. The bulletin replaces both front strut bearings and upper spring pads and requires new locking nuts during reassembly. This proposal does not recommend a retail part because the repair is production- and fitment-specific and requires strut disassembly, correct torque and verification after repair.',
    commerceDecision: 'dealer-only-no-retail-part-technical-bulletin', severity: 'medium', confidence: 'high',
    symptoms: ['Intermittent front suspension noise while turning', 'Noise while steering when moving or stationary'], affectedSystems: ['front strut bearings', 'upper spring pads'],
    citations: [{ type: 'tsb', title: 'Kia TSB CHA121 - Front Strut Bearing and Spring Pad Replacement', url: PDF_SOURCES.strut.url }],
    summary: 'Bounded the same 2019-2024 front-strut noise identity to Kia CHA121, removed unsupported cold-climate prevalence, cost and aftermarket commerce, and retained all indexed routing fields.',
  },
};

const HOLD_REASONS = {
  [HOLD_IDS.paint]: 'The page relies only on forum threads and asserts a thin clear coat, inadequate UV protection, water wicking, Kia acknowledgement and goodwill coverage without an exact Kia bulletin or primary package. Those claims cannot be safely rewritten under the primary-source contract, so the row stays byte-for-byte frozen and blocks application.',
  [HOLD_IDS.rodBearing]: 'The 2010-2018 aggregation crosses three different scopes: PI2102 covers 2010-2011 Forte with 2.4L MPI; recall 20V750 covers 2012-2013 2.4L MPI and 2014-2015 2.0L GDI; no inspected source establishes 2016-2018. The page also states manufacturing debris as the root cause while 20V750 says no manufacturing or design cause was identified. This safety-critical conflation remains frozen and blocks application.',
  [HOLD_IDS.ivt]: 'Kia SC199 covers a VIN-bound 2019-2020 Forte population with specified DTCs and lack or delay of acceleration from slippage, not a general 2019-2024 chain-and-pulley shudder identity. The frozen page also names unsupported DTCs, a 60% success rate, an Amazon search URL and fluid part 45280-2F100, while Kia’s fluid guide identifies SP-CVT1 as UM018 CH130. The row remains frozen and blocks application.',
  [HOLD_IDS.nuEngine]: 'Recall 20V750 supports only 2014-2015 Forte with 2.0L Nu GDI, not this page’s 2014-2018 oil-consumption and piston-ring identity. The inspected recall says the fire cause was undetermined, and the frozen page adds unsupported oil-consumption thresholds, unrelated DTCs and search commerce. The row remains frozen and blocks application.',
  [HOLD_IDS.lamps]: 'Kia BOD055 addresses headlamp condensation on all models and says most fogging is normal and needs no replacement; it does not establish this combined 2019-2023 headlight-and-taillight identity, recurrence rate, LED-board damage, updated seal design, RTV resealing advice or the unrelated P0401-P0404 DTCs. The row remains frozen and blocks application.',
  [HOLD_IDS.mdps]: 'The cited Kia CHA074 bulletin supports only 2012-2013 Forte (TD) and a limited 2014 Forte (YD) production range, not the frozen page’s 2014-2018 scope. Rewriting against that partial source would leave 2015-2018 unsupported, so the row remains frozen and blocks application.',
  [HOLD_IDS.lowBeam]: 'The page claims Kia campaign SC149 covers Forte, but the rendered SC149 bulletin is exclusively for certain 2011-2012 Sorento vehicles. No exact primary Forte package was found for the retained 2014-2018 connector-melting identity, so the false-citation row remains frozen and blocks application.',
};

function rewriteProposal(current, card) {
  return fullRecord({ ...current, ...card, make: current.make, model: current.model, years: current.years, category: current.category, title: current.title, trims: [], engines: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08', contentUpdateSummary: card.summary, relatedIssueIds: current.relatedIssueIds });
}
function evidenceFor(row) {
  if (row.id === REWRITE_IDS.hecu) return [{ kind: 'official-recall-correction-exact-same-identity', urls: [CAMPAIGNS.hecu, CAMPAIGNS.wrongHecu, PDF_SOURCES.hecu.url], sha256: PDF_SOURCES.hecu.sha256, visuallyInspectedPages: PDF_SOURCES.hecu.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: '23V652 and the complete recall inventory establish the 2010-2013 Forte HECU fire identity; 21V331 contains no Forte row.' }];
  if (row.id === REWRITE_IDS.airbag) return [{ kind: 'official-recalls-exact-same-outcome', urls: [CAMPAIGNS.airbagEarly, CAMPAIGNS.airbagLate, PDF_SOURCES.airbagEarly.url, PDF_SOURCES.airbagLate.url], sha256: [PDF_SOURCES.airbagEarly.sha256, PDF_SOURCES.airbagLate.sha256], visuallyInspectedPages: { SC165: PDF_SOURCES.airbagEarly.visuallyInspectedPages, SC226: PDF_SOURCES.airbagLate.visuallyInspectedPages }, verifiedOn: '2026-08-08', observation: 'Rendered SC165 and SC226 establish the retained 2010-2013 and 2017-2018 ACU failure groups, distinct causes and dealer remedies.' }];
  if (row.id === REWRITE_IDS.strut) return [{ kind: 'official-tsb-exact-same-identity', url: PDF_SOURCES.strut.url, sha256: PDF_SOURCES.strut.sha256, visuallyInspectedPages: PDF_SOURCES.strut.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'Rendered CHA121 establishes 2019-2024 Forte intermittent steering-turn noise and replacement of both front strut bearings and upper spring pads.' }];
  if (row.id === HOLD_IDS.rodBearing || row.id === HOLD_IDS.nuEngine) return [{ kind: 'official-engine-scope-conflict', urls: [PDF_SOURCES.pi2102.url, PDF_SOURCES.engineRecall.url], sha256: [PDF_SOURCES.pi2102.sha256, PDF_SOURCES.engineRecall.sha256], verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
  if (row.id === HOLD_IDS.ivt) return [{ kind: 'official-ivt-scope-and-part-conflict', url: PDF_SOURCES.ivt.url, sha256: PDF_SOURCES.ivt.sha256, visuallyInspectedPages: PDF_SOURCES.ivt.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
  if (row.id === HOLD_IDS.lamps) return [{ kind: 'official-headlamp-guidance-conflicts-with-aggregation', url: PDF_SOURCES.lamps.url, sha256: PDF_SOURCES.lamps.sha256, visuallyInspectedPages: PDF_SOURCES.lamps.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
  if (row.id === HOLD_IDS.mdps) return [{ kind: 'official-tsb-partial-year-conflict', url: PDF_SOURCES.mdps.url, sha256: PDF_SOURCES.mdps.sha256, visuallyInspectedPages: PDF_SOURCES.mdps.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
  if (row.id === HOLD_IDS.lowBeam) return [{ kind: 'critical-wrong-model-campaign-citation', url: PDF_SOURCES.wrongLowBeam.url, sha256: PDF_SOURCES.wrongLowBeam.sha256, visuallyInspectedPages: PDF_SOURCES.wrongLowBeam.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
  return [{ kind: 'secondary-only-identity', urls: (row.citations || []).map((item) => item.url).filter(Boolean), verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Forte');
  if (modelRows.length !== 10) throw new Error(`expected 10 Forte rows, found ${modelRows.length}`);
  for (const id of Object.values({ ...REWRITE_IDS, ...HOLD_IDS })) if (!modelRows.some((row) => row.id === id)) throw new Error(`missing frozen Forte ID ${id}`);
  const rows = modelRows.map((current) => { const before = fullRecord(current); const card = REWRITE_CARDS[current.id]; const proposal = card ? rewriteProposal(current, card) : before; return { id: current.id, model: current.model, action: card ? 'rewrite_same_identity' : 'keep_published_pending_source', reason: card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years, status or related links.' : HOLD_REASONS[current.id], identityRule: 'No source may change an indexed page identity. A different model, component, year boundary or failure outcome requires a byte-for-byte hold.', commerceDecision: card ? card.commerceDecision : 'unchanged-commerce-pending-exact-source-and-fitment', changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal }; });
  const blockerRecordIds = Object.values(HOLD_IDS).sort();
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-08', make: 'Kia', model: 'Forte',
    completionStatement: 'All ten frozen Kia Forte records are adjudicated. Three exact identities receive official-source, no-retail rewrites; seven unresolved or scope-conflicted rows remain byte-for-byte holds and block application.',
    applicationGate: { status: 'blocked', blockerRecordIds, reason: 'Seven live Forte rows still contain unsupported, partial-scope, false-citation or unsafe commerce claims. Independent manual correction is required before any Forte proposal is applied.' },
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All ten Forte IDs, titles, categories, indexed years and publication states remain unchanged.', 'Only exact same-identity official sources may authorize a rewrite; all other records remain byte-for-byte frozen and block application.', 'Every rewrite removes search commerce, costs, unverified DTCs, trims and engines.', 'A rewrite that names a retail-replaceable part requires a verified direct product link with exact part-number and fitment evidence; dealer remedies carry an explicit no-retail-part disposition.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 10 },
    observations: [
      { code: 'forte-hecu-wrong-campaign-corrected', severity: 'critical-correction', recordIds: [REWRITE_IDS.hecu], detail: 'The frozen page cites 21V331, which has no Forte row. The proposal uses exact Forte recall 23V652 and its lower-amperage recall-fuse remedy.' },
      { code: 'forte-airbag-recalls-bounded', severity: 'critical-correction', recordIds: [REWRITE_IDS.airbag], detail: 'SC165 and SC226 cover the retained disjoint year groups but have different failure mechanisms and remedies; the proposal states both explicitly.' },
      { code: 'forte-strut-tsb-bounded', severity: 'content-correction', recordIds: [REWRITE_IDS.strut], detail: 'CHA121 exactly covers 2019-2024 Forte steering-turn noise and the two-side bearing and spring-pad procedure without establishing a safety recall or complete strut failure.' },
      { code: 'forte-sc149-sorento-only-blocker', severity: 'critical', recordIds: [HOLD_IDS.lowBeam], detail: 'Rendered SC149 is exclusively for 2011-2012 Sorento; it cannot support the 2014-2018 Forte low-beam connector page.' },
      { code: 'forte-engine-and-ivt-scope-blockers', severity: 'critical', recordIds: [HOLD_IDS.rodBearing, HOLD_IDS.ivt, HOLD_IDS.nuEngine], detail: 'Rendered Kia packages cover narrower engine, transmission and year populations than the frozen aggregations and contradict several cause, DTC and part claims.' },
      { code: 'forte-lamp-guidance-blocker', severity: 'critical', recordIds: [HOLD_IDS.lamps], detail: 'Kia BOD055 says most headlamp fogging is normal and does not support the page’s combined headlamp/taillamp, RTV, updated-seal or unrelated-DTC claims.' },
      { code: 'forte-mdps-partial-year-blocker', severity: 'critical', recordIds: [HOLD_IDS.mdps], detail: 'CHA074 covers 2012-2013 Forte and limited 2014 production, not the indexed 2014-2018 page scope.' },
      { code: 'forte-fourteen-new-recall-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'The complete official Forte recall inventory exposes fourteen distinct campaign identities absent from these ten frozen pages. They are recorded for the later additions phase.' },
      { code: 'all-forte-pages-preserved', severity: 'seo-safety', recordIds: modelRows.map((row) => row.id).sort(), detail: 'Every frozen Forte ID, title, category, indexed year set and publication state remains preserved; no redirect, archive or deletion is proposed.' },
    ],
    pdfSources: PDF_SOURCES, campaigns: { urls: CAMPAIGNS, expected: EXPECTED_CAMPAIGNS }, flatRecallDataset: { source: FLAT_RECALL_SOURCE, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY }, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 3, keep_published_pending_source: 7, total: 10 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
if (require.main === module) main();
module.exports = { CAMPAIGNS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, HOLD_IDS, HOLD_REASONS, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, evidenceFor, rewriteProposal };
