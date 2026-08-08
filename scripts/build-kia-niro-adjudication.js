/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-niro-adjudication-2026-08-08.json');

const IDS = {
  battery: 'kia-niro-12v-battery-premature-failure',
  braking: 'kia-niro-braking-power-loss',
  hvac: 'kia-niro-c-compressor-condenser-failure',
  dct: 'kia-niro-dct-judder-hybrid',
  obc: 'kia-niro-ev-onboard-charger-failure',
  chargeDoor: 'kia-niro-ev-phev-charge-port-door-lock-actuator-sticking-door-won-t-o',
  ehrs: 'kia-niro-exhaust-heat-recovery-system-bypass-valve-stuck-closed-causi',
  hca: 'kia-niro-hydraulic-clutch-actuator-fluid-leak-causing-engine-compartm',
  infotainment: 'kia-niro-infotainment-screen-freezing-random-reboots-black-screen',
  pra: 'kia-niro-power-relay-assembly-overheating-rear-seat-fire-risk',
};

const REWRITE_IDS = [IDS.ehrs, IDS.hca, IDS.pra];
const CLEANUP_IDS = [IDS.battery, IDS.braking, IDS.dct, IDS.obc];
const HOLD_IDS = [IDS.hvac, IDS.chargeDoor, IDS.infotainment];

const CAMPAIGN_SOURCES = {
  originalPra: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V666000',
  supersedingPra: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V836000',
  hca: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V534000',
};

const PDF_SOURCES = {
  ehrs: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201616-0001.pdf',
    sha256: '7ce5c31ce17e86cfcc2ea7cb59d38a9ea69affa2d6e822df7c6a1125c9616c8c',
    pageCount: 1,
    visuallyInspectedPages: [1],
    markers: ['2017-2022MY Niro HEV', '2018-2022MY Niro PHEV', 'coolant boiling in the reservoir', 'bypass valve', 'stuck in the closed position'],
  },
  hca: {
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V534-5538.PDF',
    sha256: '4dd80123c97bd08db1a6039eb4ca358af7267de9dd630eeed5c2564d99bb4204',
    pageCount: 4,
    visuallyInspectedPages: [1, 2, 3, 4],
    markers: ['121,411', 'printed circuit board', 'Hydraulic Clutch Actuator', 'different capacity fuse'],
  },
};

const MFR_COMMUNICATIONS_SOURCE = {
  files: {
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedNiroRows: 68 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedNiroRows: 101 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedNiroRows: 44 },
  },
  totalExpectedNiroRows: 213,
  requiredDocumentIds: ['10152899', '10152900', '10155382', '10165587', '10185035', '10187822', '10201616', '10247556', '11019904'],
};

const FLAT_RECALL_SOURCE = {
  name: 'FLAT_RCL_POST_2010.txt',
  extractedSha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70',
};

const EXPECTED_FLAT_RECALL_INVENTORY = {
  NIRO: {
    2017: ['18V257000', '18V666000', '22V836000', '23V534000'],
    2018: ['18V666000', '22V836000', '23V534000'],
    2019: ['23V534000'], 2020: ['23V534000'], 2021: ['23V534000'], 2022: ['23V534000'],
    2023: ['23V298000', '25V024000'], 2024: ['25V024000'], 2025: ['25V024000'],
  },
  'NIRO EV': {
    2020: ['22V899000', '25V426000'], 2021: ['25V426000'], 2022: ['24V358000', '25V426000'],
    2023: ['24V057000', '24V271000', '25V024000'], 2024: ['24V057000', '25V024000'], 2025: ['25V024000'],
  },
  'NIRO HYBRID': { 2017: ['17V159000'] },
  'NIRO PHEV': {
    2018: ['23V534000'], 2019: ['23V534000'], 2020: ['23V534000'], 2021: ['23V534000'], 2022: ['23V534000'],
    2023: ['23V298000', '25V024000'], 2024: ['25V024000'], 2025: ['25V024000'],
  },
};

const DEFERRED_CAMPAIGNS = ['17V159', '18V257', '22V899', '23V298', '24V057', '24V271', '24V358', '25V024', '25V426'];

const REWRITE_CARDS = {
  [IDS.ehrs]: {
    description: 'Kia Pitstop PS709 covers overheating on some 2017-2022 Niro HEV and 2018-2022 Niro PHEV vehicles. It states that coolant may boil in the reservoir when the Exhaust Heat Recovery System (EHRS) bypass valve sticks closed, allowing exhaust gas to heat the engine coolant excessively in the heat exchanger.',
    solution: 'If the vehicle overheats or coolant boils in the reservoir, stop driving and have a qualified Kia technician test the EHRS wax actuator and valve lever using the applicable KGIS procedure. PS709 describes temporarily looping the coolant hose only as a diagnostic check to verify whether bypassing the EHRS resolves the overheating condition; it does not prescribe an owner-installed bypass or identify a retail replacement part.',
    severity: 'high', confidence: 'high', symptoms: ['Coolant boiling in the reservoir', 'Engine overheating'],
    affectedSystems: ['Exhaust Heat Recovery System bypass valve', 'engine cooling system'],
    citations: [{ type: 'tsb', title: 'Kia Pitstop PS709 - Engine Overheating in Niro HEV/PHEV', url: PDF_SOURCES.ehrs.url }],
    summary: 'Bounded the page to Kia PS709, removed unsupported coolant-loss, head-gasket, engine-replacement and owner-bypass claims, and retained dealer diagnosis with no retail-part link.',
    commerceDecision: 'dealer-diagnostic-no-retail-part-specified',
  },
  [IDS.hca]: {
    description: 'Kia recall SC276 (NHTSA 23V-534) covers 2017-2022 Niro hybrid and 2018-2022 Niro Plug-in Hybrid vehicles. Fluid can contaminate the printed circuit board inside the hydraulic clutch actuator (HCA), cause an electrical short and increase the risk of an engine-compartment fire while driving. The official report lists 121,411 potentially affected vehicles and identifies illumination of the HEV warning light as a possible warning.',
    solution: 'Check the VIN for open recall SC276/23V-534 and have the free dealer remedy completed. Kia dealers inspect the HCA, replace it if necessary and install a different-capacity HCA fuse. This is a VIN-specific safety recall, so no retail actuator or fuse is linked from this page.',
    severity: 'high', confidence: 'high', symptoms: ['HEV warning light illuminated'],
    affectedSystems: ['hydraulic clutch actuator printed circuit board', 'HCA fuse'],
    citations: [
      { type: 'recall', title: 'NHTSA Recall 23V-534 - Hydraulic Clutch Actuator Fire Risk', url: CAMPAIGN_SOURCES.hca },
      { type: 'recall', title: 'NHTSA Part 573 Safety Recall Report 23V-534', url: PDF_SOURCES.hca.url },
    ],
    summary: 'Replaced secondary citations with the official campaign API and visually inspected Part 573 report, removed the unsupported parked-fire warning, and bounded symptoms and remedy to SC276.',
    commerceDecision: 'dealer-only-no-retail-part-vin-specific-safety-recall',
  },
  [IDS.pra]: {
    description: 'NHTSA recall 18V-666 (Kia SC168) covered 2017-2018 Niro hybrid vehicles whose Power Relay Assembly (PRA) main-relay contacts could have inadequate connections. Increased electrical resistance could overheat the rear seat above the PRA and increase fire risk. NHTSA recall 22V-836 (Kia SC256) superseded that campaign for the same model years and requires the newer remedy even on vehicles repaired previously.',
    solution: 'Check the VIN for open recall 22V-836/SC256 and have the free dealer remedy completed. Dealers inspect the PRA and replace either the PRA or the main relay as necessary. Vehicles repaired under 18V-666/SC168 still require the superseding remedy. This is a VIN-specific recall, so no retail PRA or relay is linked.',
    severity: 'high', confidence: 'high', symptoms: ['Burning smell or heat near the rear seat', 'Recall notification'],
    affectedSystems: ['Power Relay Assembly', 'main relay'],
    citations: [
      { type: 'recall', title: 'NHTSA Recall 18V-666 - Original Niro PRA Campaign (SC168)', url: CAMPAIGN_SOURCES.originalPra },
      { type: 'recall', title: 'NHTSA Recall 22V-836 - Superseding Niro PRA Campaign (SC256)', url: CAMPAIGN_SOURCES.supersedingPra },
    ],
    summary: 'Corrected SC256 to NHTSA 22V-836, distinguished the original SC168/18V-666 campaign from its superseding remedy, and removed the unsupported parked/off fire statement.',
    commerceDecision: 'dealer-only-no-retail-part-vin-specific-safety-recall',
  },
};

const CLEANUP_REASONS = {
  [IDS.battery]: 'The frozen page claims one AGM size, replacement interval and failure mechanism across HEV, PHEV and EV generations without URL-bearing primary evidence. The proposal removes unverifiable citations, search-result commerce and proactive product advice, marks the page unapproved, and explicitly requires VIN/variant-specific diagnosis while the broad identity remains blocked.',
  [IDS.braking]: 'P0401-P0404 are exhaust-gas-recirculation codes, not brake-system codes, and the pad/rotor search links do not remedy an integrated-brake complaint. The proposal removes those false codes and unrelated commerce and replaces the unsupported module/recall prescription with immediate safety-oriented diagnosis; the broad loss-of-braking identity remains blocked.',
  [IDS.dct]: 'The frozen row combines broad 2017-2022 judder claims with generic transmission codes, automatic-transmission-fluid search products and five inaccurate or dangling related pages. Official Kia communications located only narrower model-year symptoms and procedures. The proposal removes the unsafe/inexact fields and cautions against generic ATF while the substantive aggregation remains blocked.',
  [IDS.obc]: 'P0401-P0404 are EGR codes unrelated to an EV onboard charger, and six battery/relay/tool/EVSE search products do not remedy an OBC module. The proposal removes those false codes and unrelated commerce and requires component-level charging diagnosis; the broad 2019-2023 EV identity remains blocked because the official communication inventory did not establish it.',
};

const HOLD_REASONS = {
  [IDS.hvac]: 'The official communication inventory contains narrower refrigerant-overfill, electrical-compressor and pressure-transducer-harness conditions, not one 2017-2019 compressor/condenser/evaporator/high-line failure identity. The page remains byte-for-byte frozen pending an exact primary package.',
  [IDS.chargeDoor]: 'Official Kia communications describe a 2018-2019 PHEV/EV emergency-release-cable condition and a separate 2019 EV freezing/snow condition. They do not establish the frozen 2019-2021 lock-actuator aggregation, so the page remains byte-for-byte frozen.',
  [IDS.infotainment]: 'Kia communications support several narrower black-screen, wired-CarPlay freeze, radio-icon and phone-projection conditions on different subsets. They do not establish one 2017-2023 freeze/reboot/black-screen/backup-camera identity, so the page remains byte-for-byte frozen.',
};

function stamp(proposal, summary) {
  Object.assign(proposal, { humanApproved: false, reportCount: 0, source: 'manual', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08', contentUpdateSummary: summary });
  return proposal;
}

function rewriteProposal(row) {
  const proposal = fullRecord(row);
  const card = REWRITE_CARDS[row.id];
  Object.assign(proposal, {
    description: card.description, solution: card.solution, severity: card.severity, confidence: card.confidence,
    symptoms: clone(card.symptoms), affectedSystems: clone(card.affectedSystems), dtcCodes: [],
    citations: clone(card.citations), communityRecommendations: [], fixParts: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
  });
  return stamp(proposal, card.summary);
}

function cleanupProposal(row) {
  const proposal = fullRecord(row);
  if (row.id === IDS.battery) {
    proposal.solution = 'Do not replace the 12V battery on a fixed schedule or select a Group 47/H5 battery from this page. Niro HEV, PHEV and EV variants use different 12V-system designs across these model years. Have the exact VIN, battery specification, charging behavior and any applicable Kia campaign or software update checked before replacement.';
    proposal.citations = []; proposal.communityRecommendations = []; proposal.fixParts = [];
  } else if (row.id === IDS.braking) {
    proposal.solution = 'A change in brake-pedal feel, warning light or stopping performance requires immediate professional inspection; do not rely on generic pads, rotors or the EGR codes formerly listed here. The exact brake-system fault and VIN-specific Kia procedure must be identified before any module programming or replacement is recommended.';
    proposal.dtcCodes = []; proposal.communityRecommendations = []; proposal.fixParts = [];
  } else if (row.id === IDS.dct) {
    proposal.solution = 'Have a Kia technician reproduce the exact shift condition and identify the applicable VIN-specific diagnostic procedure before software, clutch or fluid work. Do not use generic automatic-transmission fluid or a transmission flush on the Niro 6-speed DCT based on this page. The former diagnostic codes and related-issue links were not validated for this identity.';
    proposal.dtcCodes = []; proposal.citations = []; proposal.communityRecommendations = []; proposal.fixParts = []; proposal.relatedIssueIds = [];
  } else if (row.id === IDS.obc) {
    proposal.solution = 'Have the charging cable, EVSE, inlet, 12V supply, software and onboard-charger system diagnosed separately before an OBC is replaced. The EGR codes and generic battery, relay, tool and charger products formerly listed here are unrelated to an OBC failure and have been removed. Confirm warranty coverage against the VIN with Kia.';
    proposal.dtcCodes = []; proposal.communityRecommendations = []; proposal.fixParts = [];
  }
  return stamp(proposal, `Targeted safety cleanup only: ${CLEANUP_REASONS[row.id]}`);
}

function evidenceFor(row) {
  if (REWRITE_IDS.includes(row.id)) {
    if (row.id === IDS.ehrs) return [{ kind: 'official-kia-pitstop-exact-identity', url: PDF_SOURCES.ehrs.url, sha256: PDF_SOURCES.ehrs.sha256, visuallyInspectedPages: PDF_SOURCES.ehrs.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'PS709 exactly establishes the affected HEV/PHEV ranges, stuck-closed EHRS bypass valve, coolant boiling and Kia diagnostic procedure.' }];
    if (row.id === IDS.hca) return [{ kind: 'official-nhtsa-recall-exact-identity', urls: [CAMPAIGN_SOURCES.hca, PDF_SOURCES.hca.url], sha256: PDF_SOURCES.hca.sha256, visuallyInspectedPages: PDF_SOURCES.hca.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: 'The campaign API and four-page Part 573 report establish the complete frozen year scope, affected variants, PCB contamination, warning, risk and dealer remedy.' }];
    return [{ kind: 'official-nhtsa-original-and-superseding-recalls', urls: [CAMPAIGN_SOURCES.originalPra, CAMPAIGN_SOURCES.supersedingPra], verifiedOn: '2026-08-08', observation: '18V-666/SC168 establishes the original PRA condition; 22V-836/SC256 supersedes it and requires the new remedy for previously repaired vehicles.' }];
  }
  if (CLEANUP_IDS.includes(row.id)) return [{ kind: 'critical-field-cleanup-with-substantive-identity-still-blocked', verifiedOn: '2026-08-08', observation: CLEANUP_REASONS[row.id] }];
  return [{ kind: 'official-communications-narrower-than-frozen-aggregation', verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
}

function actionFor(id) {
  if (REWRITE_IDS.includes(id)) return 'rewrite_same_identity';
  if (CLEANUP_IDS.includes(id)) return 'targeted_safety_cleanup_pending_source';
  return 'keep_published_pending_source';
}

function reasonFor(id) {
  if (REWRITE_IDS.includes(id)) return 'Exact official evidence supports a bounded correction of this same indexed identity; ID, title, category, years and publication state remain unchanged.';
  if (CLEANUP_IDS.includes(id)) return CLEANUP_REASONS[id];
  return HOLD_REASONS[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Niro');
  if (modelRows.length !== 10) throw new Error(`expected 10 Niro rows, found ${modelRows.length}`);
  const expectedIds = Object.values(IDS).sort();
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(expectedIds)) throw new Error('frozen Niro ID set mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const action = actionFor(current.id);
    const proposal = action === 'rewrite_same_identity' ? rewriteProposal(current) : action === 'targeted_safety_cleanup_pending_source' ? cleanupProposal(current) : before;
    const commerceDecision = REWRITE_IDS.includes(current.id) ? REWRITE_CARDS[current.id].commerceDecision : CLEANUP_IDS.includes(current.id) ? 'remove-unsafe-or-unrelated-commerce-pending-exact-source' : 'unchanged-pending-exact-primary-source';
    return {
      id: current.id, model: current.model, action, reason: reasonFor(current.id),
      identityRule: 'No evidence may change an indexed page identity. A broader year, variant, mechanism or symptom aggregation remains blocked; known false or unsafe fields receive only targeted cleanup.',
      commerceDecision, changedFields: diffFields(before, proposal), evidence: evidenceFor(current),
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const blockerRecordIds = [...CLEANUP_IDS, ...HOLD_IDS].sort();
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'Niro',
    completionStatement: 'All ten frozen Kia Niro records are adjudicated. Three exact official identities receive bounded rewrites; four records receive targeted removal of demonstrably false or unsafe fields while their substantive scope stays blocked; three broad aggregations remain byte-for-byte holds.',
    applicationGate: { status: 'blocked', blockerRecordIds, reason: 'Seven Niro pages remain source-, scope- or mechanism-conflicted. Independent review is required before any proposal is applied.' },
    safetyContract: [
      'No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, new issue or public-page change is authorized.',
      'All ten Niro IDs, titles, categories, indexed year sets and publication states remain unchanged.',
      'A hold may not conceal a known false DTC, unsafe commerce instruction or inaccurate related-issue link; those fields receive targeted cleanup while the substantive identity remains blocked.',
      'Search-result commerce never passes. Exact recall repairs and diagnostic bulletins are dealer-only where no verified retail part is specified.',
      'Every cited PDF was downloaded, hashed, rendered and visually inspected. Live verification must reproduce the frozen hash.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 10 },
    observations: [
      { code: 'niro-ehrs-ps709-bounded', severity: 'content-correction', recordIds: [IDS.ehrs], detail: 'The visually inspected one-page Kia Pitstop supports coolant boiling/overheating from a stuck-closed EHRS bypass valve and a diagnostic test, but not coolant burning through the exhaust, engine replacement or an owner-installed bypass.' },
      { code: 'niro-hca-sc276-bounded', severity: 'content-correction', recordIds: [IDS.hca], detail: 'The official API and visually inspected Part 573 report support the full frozen years and the dealer HCA inspection/replacement plus different-capacity fuse remedy; the parked-fire instruction was removed because it is not in the source.' },
      { code: 'niro-pra-campaign-number-corrected', severity: 'critical', recordIds: [IDS.pra], detail: 'The page incorrectly paired Kia SC256 with NHTSA 18V-666. SC168 is 18V-666; SC256 is superseding campaign 22V-836.' },
      { code: 'niro-false-egr-dtcs-removed', severity: 'critical', recordIds: [IDS.braking, IDS.obc], detail: 'P0401-P0404 are EGR-system codes and are not valid brake-system or EV onboard-charger evidence.' },
      { code: 'niro-search-commerce-and-unsafe-fluid-advice-removed', severity: 'critical', recordIds: [IDS.battery, IDS.braking, IDS.dct, IDS.obc], detail: 'All search-result parts and the generic ATF/flush advice are removed from the cleanup proposals; no exact part link is invented.' },
      { code: 'niro-inexact-related-links-removed', severity: 'critical', recordIds: [IDS.dct], detail: 'The five related IDs were either absent from the frozen catalog or represented different 7-speed/9-speed transmission identities; all are removed.' },
      { code: 'niro-three-broad-aggregations-held', severity: 'critical', recordIds: HOLD_IDS.slice().sort(), detail: 'HVAC, charge-door and infotainment communications cover narrower conditions and subsets than the frozen pages; no source stretching is allowed.' },
      { code: 'niro-nine-new-recall-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'The complete Niro-family recall inventory exposes nine campaigns not represented by an exact audited page identity. They are recorded for the later additions phase.' },
      { code: 'all-niro-pages-preserved', severity: 'seo-safety', recordIds: expectedIds, detail: 'Every Niro ID, title, category, indexed year set and publication state remains preserved; no redirect, archive, deletion or new public page is proposed.' },
    ],
    campaignSources: CAMPAIGN_SOURCES, pdfSources: PDF_SOURCES, manufacturerCommunications: MFR_COMMUNICATIONS_SOURCE,
    flatRecallSource: FLAT_RECALL_SOURCE, expectedFlatRecallInventory: EXPECTED_FLAT_RECALL_INVENTORY, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 3, targeted_safety_cleanup_pending_source: 4, keep_published_pending_source: 3, total: 10 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGN_SOURCES, CLEANUP_IDS, CLEANUP_REASONS, DEFERRED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, HOLD_IDS, HOLD_REASONS, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, SNAPSHOT, actionFor, cleanupProposal, evidenceFor, reasonFor, rewriteProposal };
