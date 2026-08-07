/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-carnival-adjudication-2026-08-06.json');

const REWRITE_IDS = {
  battery: 'kia-carnival-12v-parasitic-battery-drain-while-parked',
  fuelPipe: 'kia-carnival-high-pressure-fuel-crossover-pipe-fuel-rail-leak-fire-risk',
  roofMolding: 'kia-carnival-roof-molding-loosens-detaches',
  towHitch: 'kia-carnival-tow-hitch-fire-risk-2022',
};
const SPECIAL_IDS = {
  acCompressor: 'kia-carnival-c-compressor-premature-failure-weak-cooling',
  idleStop: 'kia-carnival-idle-stop-go-phantom-activation-engine-shuts-off',
  infotainment: 'kia-carnival-infotainment-connectivity-2022',
  cluster: 'kia-carnival-instrument-cluster-goes-blank-while-driving',
  seatBelt: 'kia-carnival-second-third-row-seat-belt-buckle-anchor-bolts-non-compliant',
  slidingAutoReverse: 'kia-carnival-sliding-door-auto-reverse-2022',
  slidingLatch: 'kia-carnival-sliding-door-latch-failure',
};

const CAMPAIGNS = {
  fuelPipe: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=26V232000',
  roofMolding: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V025000',
  towHitch: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V179000',
  slidingAutoReverse: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V236000',
  cluster: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=26V046000',
};
const EXPECTED_CAMPAIGN_MODEL_YEARS = {
  fuelPipe: ['CARNIVAL|2022', 'CARNIVAL|2023', 'CARNIVAL|2024', 'CARNIVAL|2025', 'CARNIVAL|2026'],
  roofMolding: ['CARNIVAL|2022', 'CARNIVAL|2023', 'CARNIVAL|2024'],
  towHitch: ['CARNIVAL|2022', 'CARNIVAL|2023'],
  slidingAutoReverse: ['CARNIVAL|2022', 'CARNIVAL|2023'],
  cluster: ['CARNIVAL|2026'],
};
const PDF_SOURCES = {
  battery: { url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11010701-0001.pdf', sha256: '8e2215ebb9c0ccf837e6c799126718e96e783ab774994e0cd89f133ccb3d1182', visuallyInspectedPages: [1, 2, 5], markers: ['SERVICE ACTION: CCU LOGIC IMPROVEMENT (SA593)', '2025MY Carnival (KA4)', 'dark current', 'low battery voltage and no-start condition', 'April 15, 2024 to August 26, 2024'] },
  acCompressor: { url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11025765-0001.pdf', sha256: 'aef79504fbb7435ab8bc3a704dd60ee7c422d0f26543d7db92af95b7c2088ef1', visuallyInspectedPages: [1, 2, 4, 5], markers: ['SERVICE ACTION: A/C COMPRESSOR', '2025-2026MY', 'excessive clearance between the compressor piston and cylinder', 'December 1, 2024 to June 12, 2025', '97701 R0100QQK'] },
  idleStop: { url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10220345-0001.pdf', sha256: '782a37b7cc847d869da96dd9f27fb9e0f8db9cc2618e8c540bd80812e20ca26f', visuallyInspectedPages: [1, 2, 8], markers: ['SERVICE ACTION: 3.5L GDI ECM', '2023MY Carnival', 'temporary, lower than expected engine speed', 'while decelerating or idling', 'March 24, 2022 to July 14, 2022'] },
  infotainment: { url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253811-0001.pdf', sha256: '1c037e2ac327cf2e7f14e85faaab749a337a1ff1ca63f1331542672aff626eb9', visuallyInspectedPages: [1, 9, 10], markers: ['DISPLAY AUDIO 2.0/AVN5W', '2022-2023MY', 'Apple CarPlay', 'Android Auto', 'Carnival (KA4)'] },
  fuelPipe: { url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V232-8722.pdf', sha256: 'e642ec0a0239d16d1565f122835d94d6336f35ac9e6f6610e2e01ec2766c08d2', visuallyInspectedPages: [1, 2, 3], markers: ['26V232', '2022-2026 KIA CARNIVAL', 'high pressure cross over fuel pipe nuts', '35307-3NGA0', 'inspect the high-pressure cross over pipe for a fuel leak'] },
  roofMolding: { url: 'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V025-9671.pdf', sha256: '12277b5e10749f2df8fbb3f78f7627e93a417dd0c42871d45b65dae978646c3f', visuallyInspectedPages: [1, 2, 3], markers: ['ROOF MOLDING INSPECTION, RETENTION', '2022-2024MY Carnival', 'without Roof Rails', 'may become loose or detach', 'secure or replace'] },
  towHitch: { url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V179-1887.PDF', sha256: '6a6cbc00f334d2a673147cbedc7797c666fbe9e19cb550314b5df2d501bfc7bf', visuallyInspectedPages: [1, 2, 3], markers: ['23V-179', '2022-2023 Kia Carnival', 'tow hitch harness module', '15A fuse and new wire extension kit', 'park their vehicle outside'] },
  slidingAutoReverse: { url: 'https://static.nhtsa.gov/odi/inv/2022/INCLA-PE22004-8338.PDF', sha256: '559abccdc99821f3535d3119fe051ccd123feaca4cf7733dba05bc52ea32903b', visuallyInspectedPages: [1, 2], markers: ['PE 22-004', 'MY 2022 Kia Carnival', 'Power Sliding Door Auto Reverse Failure', 'NHTSA Recall No. 23V-236', '51,568 MY 2022 and 2023'] },
  cluster: { url: 'https://static.nhtsa.gov/odi/rcl/2026/RCAK-26V046-1085.pdf', sha256: '9aa62df043e8576bd9bdb5a41111a536dc672ffc128bb52035e22c357325bc2d', visuallyInspectedPages: [1, 2], markers: ['26V046', 'KIA/CARNIVAL/2026', 'INSTRUMENT CLUSTER/PANEL', 'instrument panel display may fail', 'SC361'] },
};

const EXPECTED_RECALLS = {
  2022: ['21V277000', '21V908000', '23V179000', '23V236000', '24V025000', '26V232000'],
  2023: ['23V179000', '23V236000', '24V025000', '26V232000'],
  2024: ['24V025000', '26V232000'],
  2025: ['26V232000'],
  2026: ['26V046000', '26V232000'],
};
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=KIA&model=CARNIVAL&modelYear=${year}`]));
const CAMPAIGN_COMPONENTS = {
  '21V277000': 'FUEL SYSTEM, GASOLINE:FUEL INJECTION SYSTEM:FUEL RAIL',
  '21V908000': 'LATCHES/LOCKS/LINKAGES:ELECTRONIC LOCK/LATCH ACTUATOR',
  '23V179000': 'TRAILER HITCHES',
  '23V236000': 'STRUCTURE:BODY:DOOR',
  '24V025000': 'STRUCTURE:BODY:ROOF AND PILLARS',
  '26V046000': 'ELECTRICAL SYSTEM: INSTRUMENT CLUSTER/PANEL',
  '26V232000': 'FUEL SYSTEM, GASOLINE:DELIVERY:HOSES, LINES/PIPING, AND FITTINGS',
};

const REWRITE_CARDS = {
  [REWRITE_IDS.battery]: {
    description: 'Kia Service Action SA593 applies to certain 2025 Carnival and Carnival Hybrid vehicles. Central Communication Unit software may fail to enter its normal sleep state, creating a dark-current draw from the 12V battery while parked and potentially causing low battery voltage or a no-start condition.',
    solution: 'Have a Kia retailer check the VIN for SA593. The repair updates both required CCU software events with the Kia Diagnostic System; eligible vehicles with an active Kia Connect subscription may also receive an over-the-air update. SA593 is a service action rather than a safety recall, so coverage outside the warranty period requires Kia approval.',
    severity: 'high', confidence: 'high',
    symptoms: ['Low 12V battery after the vehicle is parked', 'No-start condition', 'Repeated need for a jump-start'],
    affectedSystems: ['Central Communication Unit software', '12V battery'],
    citations: [{ type: 'tsb', title: 'Kia TSB ELE 360 - CCU Logic Improvement (SA593)', url: PDF_SOURCES.battery.url }],
    summary: 'Rewrote the same SA593 battery-drain identity from the visually inspected Kia bulletin and removed secondary-source claims, unsupported post-update assertions, costs and commerce.',
  },
  [REWRITE_IDS.fuelPipe]: {
    description: 'NHTSA campaign 26V232000 (Kia SC368) covers 2022-2026 Carnival vehicles. High-pressure cross-over fuel-pipe nuts may loosen over time, allowing fuel to leak at the connection between the pipe and fuel rail. Fuel odor or a check-engine light may precede the leak; fuel near an ignition source increases fire risk.',
    solution: 'Check the VIN for campaign 26V232000. Kia dealers inspect the high-pressure cross-over pipe for a leak. If a leak is found, they replace the pipe; otherwise, they securely tighten the pipe nuts. The recall repair is free. The official campaign also includes certain 2026 vehicles beyond this page’s retained 2022-2025 indexed scope.',
    severity: 'high', confidence: 'high',
    symptoms: ['Fuel odor', 'Check-engine light', 'Visible fuel near the cross-over pipe or fuel rail'],
    affectedSystems: ['high-pressure cross-over fuel pipe', 'fuel rail connection'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 26V232000 - Carnival Fuel Pipe Leak', url: CAMPAIGNS.fuelPipe }, { type: 'recall', title: 'Part 573 Safety Recall Report 26V232', url: PDF_SOURCES.fuelPipe.url }],
    summary: 'Bounded the same fuel-pipe leak identity to official campaign 26V232 and its inspect, tighten-or-replace remedy; removed secondary sources, unverified details and commerce.',
  },
  [REWRITE_IDS.roofMolding]: {
    description: 'NHTSA campaign 24V025000 (Kia SC292) covers certain 2022-2024 Carnival vehicles that do not have roof rails. Interference between a retaining clip and excess roof-panel sealer, or improper assembly installation, may allow a roof molding to loosen or detach. A detached molding can become a road hazard and increase crash risk for other vehicles.',
    solution: 'Check the VIN for campaign 24V025000. A Kia dealer inspects both roof moldings and secures an existing molding or replaces an affected molding as necessary, free of charge. Eligibility is VIN-specific and the Carnival population excludes vehicles equipped with roof rails.',
    severity: 'high', confidence: 'high',
    symptoms: ['Roof molding loose or raised near the windshield', 'Roof molding partially detached', 'Roof molding missing'],
    affectedSystems: ['roof molding', 'roof-molding retaining clips'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 24V025000 - Roof Molding May Detach', url: CAMPAIGNS.roofMolding }, { type: 'recall', title: 'Kia SC292 Dealer Instructions', url: PDF_SOURCES.roofMolding.url }],
    summary: 'Rewrote the same roof-molding recall identity from campaign 24V025 and visually inspected SC292 instructions; removed secondary sources and unsupported claims.',
  },
  [REWRITE_IDS.towHitch]: {
    description: 'NHTSA campaign 23V179000 (Kia SC265) covers certain 2022-2023 Carnival vehicles equipped with a Genuine Kia trailer-tow-hitch harness. Water may enter the harness connector and short the module printed circuit board, creating a fire risk while driving or while parked with the ignition off.',
    solution: 'Check the VIN for campaign 23V179000. Until repaired, owners of affected vehicles with the Genuine Kia harness should park outside and away from structures and other vehicles. Kia dealers verify whether the harness is installed and, if it is, install a 15-amp fuse and a new wire-extension kit free of charge.',
    severity: 'high', confidence: 'high',
    symptoms: ['Electrical short in the tow-hitch harness module', 'Overheating, smoke or fire near the tow-hitch harness'],
    affectedSystems: ['Genuine Kia trailer-tow-hitch harness', 'tow-hitch harness module printed circuit board'],
    citations: [{ type: 'recall', title: 'NHTSA Campaign 23V179000 - Tow Hitch Harness Fire Risk', url: CAMPAIGNS.towHitch }, { type: 'recall', title: 'Part 573 Safety Recall Report 23V179', url: PDF_SOURCES.towHitch.url }],
    summary: 'Corrected the same tow-hitch fire identity to the official park-outside advisory and 15A-fuse/wire-extension remedy; removed the unrelated article and unsafe retail wiring commerce.',
  },
};

const SPECIAL_HOLD_REASONS = {
  [SPECIAL_IDS.acCompressor]: 'Visually inspected SA632 covers only certain 2025-2026 3.5L Carnivals produced from December 1, 2024 through June 12, 2025 and specifically describes intermittent or weak cooling at low blower speed from excessive compressor piston-to-cylinder clearance. It cannot establish the frozen 2022-2025 aggregation or its broader parts and repair claims, so the row remains byte-for-byte unchanged.',
  [SPECIAL_IDS.idleStop]: 'Visually inspected SA508 covers some 2023 Carnivals produced from March 24 through July 14, 2022 with temporarily lower-than-expected engine speed while decelerating or idling during torque-converter dampening. It does not establish phantom Idle Stop & Go activation across 2022-2023 or the frozen module commerce, so the row remains byte-for-byte unchanged.',
  [SPECIAL_IDS.infotainment]: 'Visually inspected SA569 applies to certain 2022-2023 Carnivals with Apple CarPlay/Android Auto phone-projection connectivity concerns. The frozen page also includes 2024 and broader freezing/black-screen claims, so the partial bulletin cannot authorize a rewrite under the retained year scope; the row remains byte-for-byte unchanged.',
  [SPECIAL_IDS.cluster]: 'Visually inspected campaign 26V046 and SC361 cover 2026 Carnival and Carnival Hybrid only. The frozen page includes 2025 and attributes an overheat-protection mechanism not stated by the official campaign, so the row remains byte-for-byte unchanged.',
  [SPECIAL_IDS.seatBelt]: 'The frozen page claims Carnival campaign SC372 across 2022-2026, but the complete Carnival recall inventory contains no such campaign. Current SC372 concerns a different 2027 Telluride seat-belt identity, while the frozen citations are generic search pages and its parts are not recall remedy proof. This critical conflation remains byte-for-byte frozen for independent review rather than being silently retired or retitled.',
  [SPECIAL_IDS.slidingAutoReverse]: 'Visually inspected PE22-004 and campaign 23V236 establish all 2022 and certain 2023 Carnival vehicles, not 2024. The frozen page also cites the wrong campaign number, 23V179, and carries unrelated body-repair commerce. Because its indexed year set cannot change in this pass, the row remains byte-for-byte unchanged.',
  [SPECIAL_IDS.slidingLatch]: 'Campaign 21V908 establishes only a passenger-side release-actuator latch defect in certain 2022 Carnivals. It does not support a 2022-2025 bilateral motor/latch aggregation, opening-while-driving claims across the full range, or generic Dorman commerce, so the row remains byte-for-byte unchanged.',
};

function hostFor(url) { try { return new URL(url).hostname; } catch { return 'missing/invalid citation'; } }
function holdReasonFor(row) {
  if (SPECIAL_HOLD_REASONS[row.id]) return SPECIAL_HOLD_REASONS[row.id];
  const hosts = [...new Set((row.citations || []).map((item) => item.url ? hostFor(item.url) : 'missing URL'))];
  const partClaims = (row.fixParts || []).length + (row.communityRecommendations || []).filter((item) => item.type === 'part').length;
  const searchLinks = JSON.stringify([row.fixParts, row.communityRecommendations]).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/g)?.length || 0;
  const sourceText = hosts.length ? `${row.citations.length} citation(s) from ${hosts.join(', ')}` : 'no usable citation URLs';
  return `The frozen ${row.years[0]}-${row.years[row.years.length - 1]} "${row.title}" page has ${sourceText}, but no exact OEM or government primary package establishing its full year/vehicle scope, mechanism, diagnostic thresholds and repair outcome. It also carries ${partClaims} part recommendation(s) and ${searchLinks} search-style commerce link(s) without exact source-to-fitment proof. The indexed row remains byte-for-byte unchanged.`;
}

function rewriteProposal(current, card) {
  return fullRecord({ ...current, ...card, make: current.make, model: current.model, years: current.years, category: current.category, title: current.title, trims: [], engines: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: current.relatedIssueIds });
}

function evidenceFor(row) {
  if (row.id === REWRITE_IDS.battery) return [{ kind: 'official-tsb-exact-same-identity', url: PDF_SOURCES.battery.url, sha256: PDF_SOURCES.battery.sha256, visuallyInspectedPages: PDF_SOURCES.battery.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Rendered SA593 pages establish 2025 Carnival/Carnival HEV CCU non-sleep dark-current draw, no-start risk, software remedy and production windows.' }];
  if (row.id === REWRITE_IDS.fuelPipe) return [{ kind: 'official-recall-exact-same-identity', url: CAMPAIGNS.fuelPipe, verifiedOn: '2026-08-06', observation: 'Campaign 26V232 exactly matches the high-pressure cross-over fuel-pipe leak identity.' }, { kind: 'official-recall-pdf-visually-inspected', url: PDF_SOURCES.fuelPipe.url, sha256: PDF_SOURCES.fuelPipe.sha256, visuallyInspectedPages: PDF_SOURCES.fuelPipe.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Rendered Part 573 pages establish the affected years, component 35307-3NGA0, warnings and inspect/tighten-or-replace remedy.' }];
  if (row.id === REWRITE_IDS.roofMolding) return [{ kind: 'official-recall-exact-same-identity', url: CAMPAIGNS.roofMolding, verifiedOn: '2026-08-06', observation: 'Campaign 24V025 exactly matches the 2022-2024 Carnival roof-molding detachment identity.' }, { kind: 'official-recall-instructions-visually-inspected', url: PDF_SOURCES.roofMolding.url, sha256: PDF_SOURCES.roofMolding.sha256, visuallyInspectedPages: PDF_SOURCES.roofMolding.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Rendered SC292 pages confirm the no-roof-rails scope, causes, inspection and secure-or-replace remedy.' }];
  if (row.id === REWRITE_IDS.towHitch) return [{ kind: 'official-recall-exact-same-identity', url: CAMPAIGNS.towHitch, verifiedOn: '2026-08-06', observation: 'Campaign 23V179 exactly matches the 2022-2023 Genuine Kia tow-hitch harness water-intrusion fire identity.' }, { kind: 'official-recall-pdf-visually-inspected', url: PDF_SOURCES.towHitch.url, sha256: PDF_SOURCES.towHitch.sha256, visuallyInspectedPages: PDF_SOURCES.towHitch.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'Rendered Part 573 pages confirm the PCB short risk, park-outside advisory and 15A-fuse/wire-extension remedy.' }];
  if (row.id === SPECIAL_IDS.acCompressor) return [{ kind: 'official-tsb-narrower-year-and-production-scope', url: PDF_SOURCES.acCompressor.url, sha256: PDF_SOURCES.acCompressor.sha256, visuallyInspectedPages: PDF_SOURCES.acCompressor.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'SA632 is limited to certain 2025-2026 vehicles in a defined production range, not the frozen 2022-2025 aggregate.' }];
  if (row.id === SPECIAL_IDS.idleStop) return [{ kind: 'official-tsb-different-and-narrower-condition', url: PDF_SOURCES.idleStop.url, sha256: PDF_SOURCES.idleStop.sha256, visuallyInspectedPages: PDF_SOURCES.idleStop.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'SA508 addresses temporarily low engine speed during deceleration/idling on some 2023 vehicles, not a 2022-2023 phantom-ISG identity.' }];
  if (row.id === SPECIAL_IDS.infotainment) return [{ kind: 'official-tsb-partial-year-and-symptom-scope', url: PDF_SOURCES.infotainment.url, sha256: PDF_SOURCES.infotainment.sha256, visuallyInspectedPages: PDF_SOURCES.infotainment.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'SA569 supports 2022-2023 phone-projection connectivity only, not the page’s 2024 and broad screen-failure claims.' }];
  if (row.id === SPECIAL_IDS.cluster) return [{ kind: 'official-recall-year-scope-conflict', urls: [CAMPAIGNS.cluster, PDF_SOURCES.cluster.url], sha256: PDF_SOURCES.cluster.sha256, visuallyInspectedPages: PDF_SOURCES.cluster.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: '26V046/SC361 covers 2026 Carnival only, not 2025, and does not state the frozen overheat-protection mechanism.' }];
  if (row.id === SPECIAL_IDS.seatBelt) return [{ kind: 'critical-campaign-model-conflation', url: RECALL_QUERIES[2026], verifiedOn: '2026-08-06', observation: 'The complete 2022-2026 Carnival recall inventories contain no SC372 seat-belt-anchor campaign; the frozen page conflates a different Kia campaign/older minivan subject.' }];
  if (row.id === SPECIAL_IDS.slidingAutoReverse) return [{ kind: 'official-investigation-year-and-campaign-conflict', urls: [CAMPAIGNS.slidingAutoReverse, PDF_SOURCES.slidingAutoReverse.url], sha256: PDF_SOURCES.slidingAutoReverse.sha256, visuallyInspectedPages: PDF_SOURCES.slidingAutoReverse.visuallyInspectedPages, verifiedOn: '2026-08-06', observation: 'PE22-004 and 23V236 cover 2022 and certain 2023 vehicles; the frozen page includes 2024 and names 23V179.' }];
  if (row.id === SPECIAL_IDS.slidingLatch) return [{ kind: 'official-recall-narrower-component-and-year-scope', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V908000', verifiedOn: '2026-08-06', observation: '21V908 is a passenger-side release-actuator latch condition on certain 2022 vehicles, not the frozen 2022-2025 broad motor/latch aggregate.' }];
  return [{ kind: 'model-recall-inventory-boundary-not-broad-claim-proof', url: RECALL_QUERIES[row.years.find((year) => RECALL_QUERIES[year]) || 2022], verifiedOn: '2026-08-06', observation: 'The frozen Carnival recall inventories do not independently prove this broader owner-report, diagnostic, repair or commerce page.' }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Carnival');
  if (modelRows.length !== 26) throw new Error(`expected 26 Carnival rows, found ${modelRows.length}`);
  for (const id of Object.values({ ...REWRITE_IDS, ...SPECIAL_IDS })) if (!modelRows.some((row) => row.id === id)) throw new Error(`missing frozen Carnival ID ${id}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current); const card = REWRITE_CARDS[current.id]; const proposal = card ? rewriteProposal(current, card) : before;
    return { id: current.id, model: current.model, action: card ? 'rewrite_same_identity' : 'keep_published_pending_source', reason: card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years, status or related links.' : holdReasonFor(current), identityRule: 'No source may change an indexed page identity. A different model, component, year boundary or failure outcome requires a byte-for-byte hold.', commerceDecision: card ? 'removed-unverified-commerce-from-proposal' : 'unchanged-commerce-pending-exact-source-and-fitment', changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Kia', model: 'Carnival',
    completionStatement: 'All 26 frozen Kia Carnival records are reconciled. Four exact official-source identities receive no-commerce rewrites; 22 unsupported, partial or mismatched pages remain byte-for-byte holds.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All 26 Carnival IDs, titles, categories, indexed years and publication states remain unchanged.', 'Only exact same-identity official sources may authorize a rewrite; all other records remain byte-for-byte frozen.', 'Every rewrite removes search commerce, costs, unverified DTCs, trims and engines.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 26 },
    observations: [
      { code: 'carnival-fabricated-sc372-conflation-held', severity: 'critical', recordIds: [SPECIAL_IDS.seatBelt], detail: 'The Carnival recall inventory contains no SC372 seat-belt-anchor campaign; the indexed page is preserved but explicitly blocked from rewrite pending independent review.' },
      { code: 'carnival-sliding-door-page-names-wrong-campaign', severity: 'critical', recordIds: [SPECIAL_IDS.slidingAutoReverse], detail: 'The auto-reverse page names 23V179, but the correct campaign is 23V236 and only covers 2022/certain 2023 rather than the frozen 2022-2024 scope.' },
      { code: 'carnival-sc361-year-scope-conflict', severity: 'critical', recordIds: [SPECIAL_IDS.cluster], detail: 'SC361 covers 2026 Carnival only; the frozen page also lists 2025 and adds an unsupported mechanism.' },
      { code: 'carnival-service-action-scope-conflicts-preserved', severity: 'high', recordIds: [SPECIAL_IDS.acCompressor, SPECIAL_IDS.idleStop, SPECIAL_IDS.infotainment], detail: 'SA632, SA508 and SA569 each establish narrower year/production/symptom scopes than their frozen pages, so all three remain byte-for-byte holds.' },
      { code: 'carnival-four-exact-identities-rewritten', severity: 'content-correction', recordIds: Object.values(REWRITE_IDS).sort(), detail: 'SA593, 26V232, 24V025 and 23V179 exactly match their indexed identities and receive official-source, commerce-free proposals.' },
      { code: 'all-carnival-pages-preserved', severity: 'seo-safety', recordIds: modelRows.map((row) => row.id).sort(), detail: 'Every frozen Carnival ID, title, category, indexed year set and publication state remains preserved; no redirect, archive or deletion is proposed.' },
    ],
    pdfSources: PDF_SOURCES,
    campaigns: { urls: CAMPAIGNS, expectedModelYears: EXPECTED_CAMPAIGN_MODEL_YEARS, expectedComponents: CAMPAIGN_COMPONENTS },
    recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 4, keep_published_pending_source: 22, total: 26 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGNS, CAMPAIGN_COMPONENTS, EXPECTED_CAMPAIGN_MODEL_YEARS, EXPECTED_RECALLS, PDF_SOURCES, RECALL_QUERIES, REWRITE_CARDS, REWRITE_IDS, SPECIAL_HOLD_REASONS, SPECIAL_IDS, evidenceFor, holdReasonFor, rewriteProposal };
