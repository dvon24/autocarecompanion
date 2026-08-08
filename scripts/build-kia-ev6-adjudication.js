/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-ev6-adjudication-2026-08-06.json');

const REWRITE_IDS = {
  brakeLights: 'kia-ev6-brake-lights-fail-to-illuminate-during-i-pedal-one-pedal-reg',
  iccu: 'kia-ev6-iccu-12v-battery-drain',
  level2: 'kia-ev6-level-2-ac-home-charging-interruptions-from-charge-handle-ov',
  rearShaft: 'kia-ev6-rear-inner-drive-shaft-fracture-from-improperly-heat-treated',
  rollaway: 'kia-ev6-shift-by-wire-rollaway-risk-park',
};
const SPECIAL_IDS = {
  chargeDoor: 'kia-ev6-charge-port-door-stuck',
  compressor: 'kia-ev6-electric-c-compressor-failure-long-national-parts-backorder',
  heatPump: 'kia-ev6-heat-pump-cold-weather',
  rearMotor: 'kia-ev6-rear-motor-bearing-noise',
  coldCharging: 'kia-ev6-reduced-dc-fast-charging-speed-cold-weather',
  windshield: 'kia-ev6-spontaneous-windshield-cracking-acoustic-laminated-glass',
};

const CAMPAIGNS = {
  rollaway: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V322000',
  rearShaft: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V057000',
  iccuPrior: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V200000',
  iccuCurrent: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V867000',
  newBattery: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=26V431000',
};
const EXPECTED_CAMPAIGN_MODEL_YEARS = {
  rollaway: ['EV6|2022'],
  rearShaft: ['EV6|2023', 'NIRO EV|2023', 'NIRO EV|2024'],
  iccuPrior: ['EV6|2022', 'EV6|2023', 'EV6|2024'],
  iccuCurrent: ['EV6|2022', 'EV6|2023', 'EV6|2024'],
  newBattery: ['EV6|2022', 'EV6|2023', 'EV6|2024', 'EV9|2024'],
};
const CAMPAIGN_COMPONENTS = {
  '22V322000': 'PARKING BRAKE:ELECTRICAL:CONTROL MODULE:SOFTWARE',
  '24V057000': 'POWER TRAIN:DRIVELINE:DRIVESHAFT',
  '24V200000': 'ELECTRICAL SYSTEM:12V/24V/48V BATTERY',
  '24V867000': 'ELECTRICAL SYSTEM:12V/24V/48V BATTERY',
  '26V431000': 'ELECTRICAL SYSTEM:PROPULSION SYSTEM:TRACTION BATTERY',
};

const PDF_SOURCES = {
  brakeLights: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10241180-0001.pdf',
    sha256: '7702e7c997b7f444b8202975933f6d1e64b7310ea694308c472ca6174c96ffc0',
    visuallyInspectedPages: [1],
    markers: ['SC273 (Rev 1, 08/17/2023)', '2022-2023MY EV6', 'Illumination of Brake lamp', 'regenerative braking', 'i-Pedal'],
  },
  level2Ele283: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10230617-0001.pdf',
    sha256: 'a7349b428493b329c9533669d6b2fbe3873f25cde6d47afb01f7bc8187a2255b',
    visuallyInspectedPages: [1],
    markers: ['ELE', '283', '2022 - 2023MY', 'excessive high temperatures', 'combo charger inlet module assembly'],
  },
  level2Ele295: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10236661-0001.pdf',
    sha256: '665e6255a7cf99758f5f0aea98417fea93fd791db21c3dcbf031ff1853f6b8d8',
    visuallyInspectedPages: [1],
    markers: ['ELE', '295', '2023MY', 'EV6 GT', 'P1BAD00'],
  },
  level2Sc311: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11000537-0001.pdf',
    sha256: '410689b1c479d5361366018a1eb83bff7f3093707b336a7fa92affe6ec8954d1',
    visuallyInspectedPages: [1],
    markers: ['SC311', '2022-2024 MY EV6', '240-V AC', 'interrupted charging session', 'VCMS ECU'],
  },
  iccu: {
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V867-8124.PDF',
    sha256: 'a6b0da45fede1f53f8cbf41fdfddc51bbf09e5807c07efcf55ef8e871135294e',
    visuallyInspectedPages: [1, 2],
    markers: ['24V-867', '2022-2024 Kia EV6', 'supersede recall 24V200', 'Integrated Charging Control Unit', 'replace the ICCU and ICCU fuse'],
  },
  rearShaft: {
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V057-9009.PDF',
    sha256: '94b4d26c4587a3d829b40f53e1da9fdf852d63398b09089006bd7cdce4368bdb',
    visuallyInspectedPages: [1, 2, 3],
    markers: ['24V-057', '2023-2023 Kia EV6', 'Rear Inner Drive Shaft Assembly', '49560-GI000', 'replace the affected drive shaft'],
  },
  rollaway: {
    url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V322-1584.PDF',
    sha256: '7e198ec6c679e788dd308c098e698f4d5cda50f3e0db0e8114f4b14f5323dfd9',
    visuallyInspectedPages: [1, 3],
    markers: ['22V-322', '2022-2022 Kia EV6', 'temporary disengagement of the parking mechanism', 'update the Shifter Control Unit', 'level ground'],
  },
  coldCharging: {
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10238481-0001.pdf',
    sha256: 'ea6458c31ccfa8600825b0a6a8ef9ed9552a59e27c8c5d45cf13220b7acea81a',
    visuallyInspectedPages: [1],
    markers: ['2022MY EV6', 'BMS UPGRADE FOR BATTERY CONDITIONING MODE', 'low outdoor temperatures', 'selects a DC charger site', 'below 68'],
  },
};

const EXPECTED_RECALLS = {
  2022: ['22V322000', '24V200000', '24V867000', '26V431000'],
  2023: ['24V057000', '24V200000', '24V867000', '26V431000'],
  2024: ['24V200000', '24V867000', '26V431000'],
};
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=KIA&model=EV6&modelYear=${year}`]));

const REWRITE_CARDS = {
  [REWRITE_IDS.brakeLights]: {
    description: 'Kia voluntary service campaign SC273 applies to certain 2022-2023 EV6 vehicles other than the GT. During rapid regenerative deceleration in i-Pedal mode, the original Vehicle Control Unit logic may not illuminate the brake lamps unless the accelerator is fully released, reducing warning to following drivers.',
    solution: 'Have a Kia retailer check the VIN for SC273 and confirm the latest VCU software. The campaign repair updates the VCU logic so the brake lamps illuminate during qualifying rapid regenerative deceleration. The software update is performed through Kia’s diagnostic system; eligibility is VIN-specific.',
    severity: 'high', confidence: 'high',
    symptoms: ['Brake lamps do not illuminate during rapid i-Pedal regenerative deceleration'],
    affectedSystems: ['Vehicle Control Unit software', 'brake-lamp control logic'],
    citations: [{ type: 'tsb', title: 'Kia SC273 Rev. 1 - VCU Software Logic Upgrade', url: PDF_SOURCES.brakeLights.url }],
    summary: 'Rewrote the same SC273 brake-lamp identity from the visually inspected Kia campaign and removed secondary claims, the unsupported deceleration threshold and software commerce.',
  },
  [REWRITE_IDS.iccu]: {
    description: 'NHTSA campaign 24V867000 (Kia SC327) covers all 2022-2023 and certain 2024 EV6 vehicles. Transient high voltage and thermal cycling can damage the Integrated Charging Control Unit, preventing it from charging the 12-volt battery. Continued driving after warnings may cause progressive power reduction and eventual loss of motive power.',
    solution: 'Check the VIN for campaign 24V867000. Kia dealers inspect the ICCU and replace the ICCU and its fuse if necessary, then install improved software that further optimizes thermal management and peak voltage. The recall repair is free. Campaign 24V867 expands and replaces 24V200, so vehicles repaired under the earlier recall need the newer remedy.',
    severity: 'high', confidence: 'high',
    symptoms: ['Check Electric Vehicle System warning', 'Charging-system or master warning light', 'Power-down (turtle) warning', 'Progressive reduction or loss of motive power'],
    affectedSystems: ['Integrated Charging Control Unit', 'ICCU fuse', '12-volt battery charging'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 24V867000 - ICCU May Fail and Discharge 12V Battery', url: CAMPAIGNS.iccuCurrent }, { type: 'recall', title: 'Part 573 Safety Recall Report 24V867', url: PDF_SOURCES.iccu.url }],
    summary: 'Bounded the same ICCU/12V identity to current campaign 24V867, documented its supersession of 24V200 and removed unsupported owner-report, cost and commerce claims.',
  },
  [REWRITE_IDS.level2]: {
    description: 'Kia bulletins ELE283 and ELE295 address interrupted or inoperable high-voltage-battery charging caused by excessive temperature at the EV6 combo-charger inlet. Kia later opened voluntary campaign SC311 for certain EV6 vehicles that can experience interrupted Level 2 charging or reduced charging speed when a damaged charging-cable connector degrades the electrical connection.',
    solution: 'Have a Kia retailer inspect the charge inlet and cable connector and check the VIN for SC311 and the applicable VCMS software update. Dealers install improved VCMS ECU software under SC311 free of charge. Do not use a connector that is visibly damaged, deformed, wet or contaminated; connector or inlet damage requires inspection rather than an aftermarket workaround.',
    severity: 'high', confidence: 'high',
    symptoms: ['Level 2 charging stops unexpectedly', 'Reduced Level 2 charging speed', 'Charging unavailable after the inlet becomes hot'],
    affectedSystems: ['combo-charger inlet module', 'Vehicle Charging Management System software'],
    citations: [{ type: 'tsb', title: 'Kia TSB ELE283 - VCMS Battery Charging Logic Improvement', url: PDF_SOURCES.level2Ele283.url }, { type: 'tsb', title: 'Kia TSB ELE295 - EV6 GT VCMS Battery Charging Logic Improvement', url: PDF_SOURCES.level2Ele295.url }, { type: 'tsb', title: 'Kia Voluntary Service Campaign SC311', url: PDF_SOURCES.level2Sc311.url }],
    summary: 'Rewrote the same Level 2 interruption/charge-inlet-temperature identity from ELE283, ELE295 and current SC311 while retaining the indexed 2022-2023 years and removing unverified commerce and costs.',
  },
  [REWRITE_IDS.rearShaft]: {
    description: 'NHTSA campaign 24V057000 (Kia SC295) covers certain 2023 EV6 vehicles built from January 26 through April 8, 2023. A supplier manufacturing error may have left the rear inner drive shaft improperly heat-treated. The shaft can break under load, causing loss of motive power and increasing crash risk.',
    solution: 'Check the VIN for campaign 24V057000. Kia dealers replace the affected rear inner drive shaft with a properly heat-treated shaft free of charge. The official EV6 recall component is the rear inner drive-shaft assembly, part number 49560-GI000; retail front or rear half-shaft listings are not proof of recall fitment.',
    severity: 'high', confidence: 'high',
    symptoms: ['Loss of motive power if the shaft fractures', 'No advance warning identified by the recall'],
    affectedSystems: ['rear inner drive-shaft assembly'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 24V057000 - Improperly Heat-Treated Drive Shaft', url: CAMPAIGNS.rearShaft }, { type: 'recall', title: 'Part 573 Safety Recall Report 24V057', url: PDF_SOURCES.rearShaft.url }],
    summary: 'Corrected the same 24V057 driveshaft identity to the official rear-inner-shaft component and 49560-GI000 part number, while removing three misleading retail parts and secondary claims.',
  },
  [REWRITE_IDS.rollaway]: {
    description: 'NHTSA campaign 22V322000 (Kia SC236) covers certain 2022 EV6 vehicles built from November 17, 2021 through April 7, 2022. A voltage fluctuation while the vehicle is off and parked can affect the Shifter Control Unit command to the parking-pawl actuator, temporarily disengaging the parking mechanism and allowing the vehicle to roll away.',
    solution: 'Check the VIN for campaign 22V322000. Kia dealers update the Shifter Control Unit software free of charge so the controller does not allow the parking pawl to move out of Park. Until repaired, Kia recommends parking on level ground and avoiding slopes or inclined surfaces whenever possible.',
    severity: 'high', confidence: 'high',
    symptoms: ['Vehicle rolls after being placed in Park', 'No advance warning identified by the recall'],
    affectedSystems: ['Shifter Control Unit software', 'parking-pawl actuator control'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 22V322000 - EV6 Rollaway Risk', url: CAMPAIGNS.rollaway }, { type: 'recall', title: 'Part 573 Safety Recall Report 22V322', url: PDF_SOURCES.rollaway.url }],
    summary: 'Rewrote the same 22V322 rollaway identity from the visually inspected Part 573 report and retained Kia’s level-ground advisory without adding parts or commerce.',
  },
};

const SPECIAL_HOLD_REASONS = {
  [SPECIAL_IDS.chargeDoor]: 'Both frozen citations omit URLs, so neither can be verified. The page also makes unsupported actuator-failure, cold-weather, emergency-release-location, price and lubricant claims and embeds charger commerce unrelated to the asserted repair. It remains byte-for-byte unchanged.',
  [SPECIAL_IDS.compressor]: 'The only OEM citation is for an evaporator core rather than proof of the asserted compressor failure/backorder identity. The page combines AWD, RWD, inverter, compressor and evaporator claims with four retail part-number recommendations but no exact Kia diagnostic or fitment package. It remains byte-for-byte unchanged.',
  [SPECIAL_IDS.heatPump]: 'The frozen heat-pump page has no usable citation URLs and carries unverified component, software and parts claims across 2022-2025. No exact OEM package establishes that full indexed scope, so the row remains byte-for-byte unchanged.',
  [SPECIAL_IDS.rearMotor]: 'Both frozen citations omit URLs, and the page recommends generic gear oil and gasket commerce for a high-voltage rear-motor bearing claim without an exact OEM diagnostic or fitment source. The row remains byte-for-byte unchanged.',
  [SPECIAL_IDS.coldCharging]: 'Visually inspected Kia bulletin ELE291 supports Battery Conditioning Mode only for some 2022 EV6 vehicles produced through October 21, 2022. It does not establish the frozen page’s full 2022-2023 indexed scope or its claimed 70 kW, 15 C, 21 C and 24% thresholds, so the row remains byte-for-byte unchanged.',
  [SPECIAL_IDS.windshield]: 'The cited class-action article predates the EV6 and does not establish this model-specific failure identity. OEM glass listings establish replacement products, not spontaneous-cracking causation or the frozen 2022-2025 scope. The row and its commerce remain byte-for-byte unchanged pending exact evidence.',
};

function hostFor(url) { try { return new URL(url).hostname; } catch { return 'missing/invalid citation'; } }
function holdReasonFor(row) {
  if (SPECIAL_HOLD_REASONS[row.id]) return SPECIAL_HOLD_REASONS[row.id];
  const hosts = [...new Set((row.citations || []).map((item) => item.url ? hostFor(item.url) : 'missing URL'))];
  const partClaims = (row.fixParts || []).length + (row.communityRecommendations || []).filter((item) => item.type === 'part').length;
  const searchLinks = JSON.stringify([row.fixParts, row.communityRecommendations]).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/g)?.length || 0;
  const sourceText = hosts.length ? `${row.citations.length} citation(s) from ${hosts.join(', ')}` : 'no usable citation URLs';
  return `The frozen ${row.years[0]}-${row.years[row.years.length - 1]} "${row.title}" page has ${sourceText}, but no exact OEM or government primary package establishing its complete year, vehicle, mechanism, diagnostic and repair scope. It also carries ${partClaims} part recommendation(s) and ${searchLinks} search-style commerce link(s) without exact source-to-fitment proof. The indexed row remains byte-for-byte unchanged.`;
}

function rewriteProposal(current, card) {
  return fullRecord({ ...current, ...card, make: current.make, model: current.model, years: current.years, category: current.category, title: current.title, trims: [], engines: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: current.relatedIssueIds });
}

function evidenceFor(row) {
  if (row.id === REWRITE_IDS.brakeLights) return [{ kind: 'official-service-campaign-exact-same-identity', url: PDF_SOURCES.brakeLights.url, sha256: PDF_SOURCES.brakeLights.sha256, visuallyInspectedPages: PDF_SOURCES.brakeLights.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Rendered SC273 page 1 establishes certain 2022-2023 non-GT EV6 brake-lamp logic during rapid i-Pedal regenerative deceleration.' }];
  if (row.id === REWRITE_IDS.iccu) return [{ kind: 'official-recall-exact-same-identity', urls: [CAMPAIGNS.iccuCurrent, PDF_SOURCES.iccu.url], sha256: PDF_SOURCES.iccu.sha256, visuallyInspectedPages: PDF_SOURCES.iccu.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Campaign 24V867 and rendered Part 573 pages establish the 2022-2024 EV6 ICCU/12V failure identity, remedy and explicit replacement of 24V200.' }];
  if (row.id === REWRITE_IDS.level2) return [{ kind: 'official-tsb-and-service-campaign-exact-same-identity', urls: [PDF_SOURCES.level2Ele283.url, PDF_SOURCES.level2Ele295.url, PDF_SOURCES.level2Sc311.url], sha256: [PDF_SOURCES.level2Ele283.sha256, PDF_SOURCES.level2Ele295.sha256, PDF_SOURCES.level2Sc311.sha256], visuallyInspectedPages: [1], verifiedOn: '2026-08-06', observation: 'Rendered ELE283, ELE295 and SC311 pages establish EV6 charge-inlet temperature/connection-related Level 2 interruptions and the VCMS software remedy.' }];
  if (row.id === REWRITE_IDS.rearShaft) return [{ kind: 'official-recall-exact-same-identity', urls: [CAMPAIGNS.rearShaft, PDF_SOURCES.rearShaft.url], sha256: PDF_SOURCES.rearShaft.sha256, visuallyInspectedPages: PDF_SOURCES.rearShaft.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Rendered 24V057 pages establish certain 2023 EV6 vehicles, improper heat treatment, rear inner drive-shaft assembly 49560-GI000 and free replacement.' }];
  if (row.id === REWRITE_IDS.rollaway) return [{ kind: 'official-recall-exact-same-identity', urls: [CAMPAIGNS.rollaway, PDF_SOURCES.rollaway.url], sha256: PDF_SOURCES.rollaway.sha256, visuallyInspectedPages: PDF_SOURCES.rollaway.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Rendered 22V322 pages establish the 2022 EV6 SCU software rollaway identity, repair and level-ground advisory.' }];
  if (row.id === SPECIAL_IDS.coldCharging) return [{ kind: 'official-tsb-narrower-year-and-production-scope', url: PDF_SOURCES.coldCharging.url, sha256: PDF_SOURCES.coldCharging.sha256, visuallyInspectedPages: PDF_SOURCES.coldCharging.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'ELE291 is limited to some 2022 vehicles and does not authorize rewriting a 2022-2023 aggregate.' }];
  if (row.id === SPECIAL_IDS.chargeDoor || row.id === SPECIAL_IDS.heatPump || row.id === SPECIAL_IDS.rearMotor) return [{ kind: 'missing-primary-citation-urls', url: RECALL_QUERIES[row.years[0]], verifiedOn: '2026-08-06', observation: 'The frozen page lacks usable primary citation URLs; model recall inventory is a boundary check and does not prove the broader claim.' }];
  return [{ kind: 'model-recall-inventory-boundary-not-broad-claim-proof', url: RECALL_QUERIES[row.years.find((year) => RECALL_QUERIES[year]) || 2022], verifiedOn: '2026-08-06', observation: 'The complete EV6 recall inventory does not independently prove this broader owner-report, diagnostic, repair or commerce page.' }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'EV6');
  if (modelRows.length !== 21) throw new Error(`expected 21 EV6 rows, found ${modelRows.length}`);
  for (const id of Object.values({ ...REWRITE_IDS, ...SPECIAL_IDS })) if (!modelRows.some((row) => row.id === id)) throw new Error(`missing frozen EV6 ID ${id}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const card = REWRITE_CARDS[current.id]; const proposal = card ? rewriteProposal(current, card) : before;
    return { id: current.id, model: current.model, action: card ? 'rewrite_same_identity' : 'keep_published_pending_source', reason: card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years, status or related links.' : holdReasonFor(current), identityRule: 'No source may change an indexed page identity. A different model, component, year boundary or failure outcome requires a byte-for-byte hold.', commerceDecision: card ? 'removed-unverified-commerce-from-proposal' : 'unchanged-commerce-pending-exact-source-and-fitment', changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Kia', model: 'EV6',
    completionStatement: 'All 21 frozen Kia EV6 records are reconciled. Five exact official-source identities receive no-commerce rewrites; 16 unsupported, partial or mismatched pages remain byte-for-byte holds.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All 21 EV6 IDs, titles, categories, indexed years and publication states remain unchanged.', 'Only exact same-identity official sources may authorize a rewrite; all other records remain byte-for-byte frozen.', 'Every rewrite removes search commerce, costs, unverified DTCs, trims and engines.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 21 },
    observations: [
      { code: 'ev6-current-iccu-recall-supersedes-prior', severity: 'critical', recordIds: [REWRITE_IDS.iccu], detail: 'Campaign 24V867 expands and replaces 24V200; vehicles repaired under the earlier campaign require the newer remedy.' },
      { code: 'ev6-driveshaft-commerce-used-wrong-parts', severity: 'critical', recordIds: [REWRITE_IDS.rearShaft], detail: 'The official recall names rear inner drive-shaft assembly 49560-GI000, while the frozen page recommends unrelated front/rear half-shaft listings. The proposal removes all commerce.' },
      { code: 'ev6-new-traction-battery-identity-deferred', severity: 'new-issue-deferred', recordIds: [], detail: 'Campaign 26V431 concerns a distinct misaligned-electrode traction-battery fire identity affecting seven EV6 and one EV9 vehicle. It is observed but not added or merged during the existing-catalog audit.' },
      { code: 'ev6-cold-charging-source-scope-conflict-held', severity: 'high', recordIds: [SPECIAL_IDS.coldCharging], detail: 'ELE291 applies only to some 2022 EV6 vehicles, so it cannot authorize a rewrite of the frozen 2022-2023 page.' },
      { code: 'ev6-nhtsa-empty-year-endpoint-gap', severity: 'source-gap', recordIds: [], detail: 'NHTSA’s recallsByVehicle endpoint returned repeated 504 responses for EV6 model years 2025 and 2026 on 2026-08-06. The packet makes no assertion that those inventories are empty; all indexed 2025 claims remain holds unless exact primary evidence exists.' },
      { code: 'ev6-missing-source-and-commerce-claims-held', severity: 'high', recordIds: [SPECIAL_IDS.chargeDoor, SPECIAL_IDS.compressor, SPECIAL_IDS.heatPump, SPECIAL_IDS.rearMotor, SPECIAL_IDS.windshield], detail: 'These pages lack exact primary evidence for their complete scopes and/or carry commerce that is not source-to-fitment proof; each remains byte-for-byte unchanged.' },
      { code: 'ev6-five-exact-identities-rewritten', severity: 'content-correction', recordIds: Object.values(REWRITE_IDS).sort(), detail: 'SC273, 24V867, ELE283/ELE295/SC311, 24V057 and 22V322 exactly match their indexed identities and receive official-source, commerce-free proposals.' },
      { code: 'all-ev6-pages-preserved', severity: 'seo-safety', recordIds: modelRows.map((row) => row.id).sort(), detail: 'Every frozen EV6 ID, title, category, indexed year set and publication state remains preserved; no redirect, archive or deletion is proposed.' },
    ],
    pdfSources: PDF_SOURCES,
    campaigns: { urls: CAMPAIGNS, expectedModelYears: EXPECTED_CAMPAIGN_MODEL_YEARS, expectedComponents: CAMPAIGN_COMPONENTS },
    recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 5, keep_published_pending_source: 16, total: 21 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGNS, CAMPAIGN_COMPONENTS, EXPECTED_CAMPAIGN_MODEL_YEARS, EXPECTED_RECALLS, PDF_SOURCES, RECALL_QUERIES, REWRITE_CARDS, REWRITE_IDS, SPECIAL_HOLD_REASONS, SPECIAL_IDS, evidenceFor, holdReasonFor, rewriteProposal };
