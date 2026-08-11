/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const snapshot = require('../data/_ram-deeplink-snapshot-2026-08-10.json');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const rows = snapshot.records.filter((row) => row.make === 'RAM' && row.model === 'ProMaster').sort((left, right) => left.id.localeCompare(right.id));
const allIds = Object.freeze(rows.map((row) => row.id));
const reportCountCleanupIds = Object.freeze(rows.filter((row) => Number(row.reportCount) > 0).map((row) => row.id));
const ids = Object.freeze({
  brakes: 'ram-promaster-brake-issues-2014',
  oilHousing: 'ram-promaster-oil-filter-housing-leak-2014',
  roof: 'ram-promaster-roof-leak-2014',
  slidingDoor: 'ram-promaster-sliding-door-issues-2014',
});

const diagnosticByCategory = Object.freeze({
  body: 'water-test or load-test one location at a time and separate seam, lamp, antenna, conversion penetration, latch, cable, roller, track and alignment paths',
  brakes: 'measure pad thickness, rotor thickness and runout at every wheel and separate heat, loading, caliper, hose, hub, wheel-torque and driving-cycle causes',
  engine: 'clean and trace the fluid source, pressure-test cooling, compare oil and coolant condition and separate housing, cooler, adapter, seal and nearby leak paths',
});

function genericIssue(row) {
  const diagnostic = diagnosticByCategory[row.category] || 'record and reproduce the exact condition, preserve fault data and isolate the failed system before replacement';
  return {
    description: `The complete RAM ProMaster source pass (1,277 exact manufacturer-communication rows, 178 downloaded recall rows and 43 current live-API campaigns for frozen ProMaster years) did not establish the full indexed identity "${row.title}" across every 2014-2025 year. Available records describe bounded builds, option content and symptom-specific procedures rather than one universal mechanism, mileage band or owner-frequency claim. This page remains published as an identity hold; its title, routing and vehicle metadata are unchanged.`,
    solution: `Start with the exact build, body height, upfit, load and symptom instead of assuming the title mechanism: ${diagnostic}. Check the VIN for open campaigns and preserve measurements and photos before repair. Stop driving for braking loss, overheating, oil/coolant cross-contamination, severe door instability, smoke or fire risk. Do not buy a repair part from this page; the failed path, current part number, supersession and VIN fitment must be established first.`,
    symptoms: ['exact build, body, upfit, load and operating condition recorded', 'measurements, photos and pre-repair data preserved', 'campaign, conversion and factory paths separated', 'failed component and VIN applicability established before parts'],
    affectedSystems: [`${row.category} system`, 'upfit- and option-specific hardware where applicable', 'body-, powertrain- and VIN-specific components'],
    evidence: ['Every exact local RAM ProMaster communication alias and downloaded recall row was included.', 'The live NHTSA vehicle-year API was reconciled for every frozen 2014-2025 ProMaster year.', 'No communication or campaign is converted into an owner total, recurrence rate or all-year mechanism.'],
    conflict: 'The frozen title and year scope exceed one exact manufacturer or regulator source; identity, years and routing require separate policy review.',
    summary: 'Held the overbroad or unresolved RAM ProMaster identity, removed unsupported social proof and commerce, and restored diagnosis without changing indexed identity.',
    citations: ['datasets'],
    commerceDecision: 'failure path, current component and part number, supersession and VIN fitment remain unresolved; no universal retail part',
  };
}

const content = Object.fromEntries(rows.map((row) => [row.id, genericIssue(row)]));

content[ids.brakes] = {
  ...genericIssue(rows.find((row) => row.id === ids.brakes)),
  description: 'The complete official-source pass does not establish the frozen 2014-2025 identity of undersized front brakes, 15,000-25,000-mile rotor warping, 20,000-30,000-mile pad life or the 2,100-owner total. Pulsation and wear require measured rotor runout/thickness, pad wear pattern, caliper operation, wheel-hub condition, wheel torque and actual axle load. The page remains published as an identity hold.',
  solution: 'Record the load and braking cycle, then measure every pad, rotor thickness and lateral runout. Inspect caliper slides and pistons, hoses, hubs, tire/wheel condition and wheel-fastener torque; compare findings with the VIN service specification. Do not machine below discard thickness or infer a rotor defect from pedal pulsation alone. Do not buy rotors, pads or a brake kit from this page; axle, brake package, measured failure, current part number and VIN fitment must be established first.',
  evidence: ['No exact communication or campaign in the complete pass proves the frozen all-year wear mechanism or mileage bands.', 'The frozen owner total and percentage-of-braking claim lack primary support.', 'Rotor, hub, caliper, wheel-torque and duty-cycle causes require separate measurement.'],
  conflict: 'The frozen page turns unverified wear rates, owner prevalence and one aftermarket kit into a universal 2014-2025 identity.',
  summary: 'Held the premature-brake identity, removed invented prevalence and mileage bands, and restored measurement-led brake diagnosis.',
  citations: ['datasets'],
  commerceDecision: 'brake package, measured rotor and pad condition, hub and caliper findings, current part number and VIN fitment remain unresolved; no universal retail part',
};

content[ids.oilHousing] = {
  ...genericIssue(rows.find((row) => row.id === ids.oilHousing)),
  description: 'The complete exact ProMaster communication and recall pass did not establish the frozen 2014-2025 all-year oil-filter-housing/cooler identity, 40,000-80,000-mile band, universal oil/coolant mixing mechanism, 2,900-owner total or frozen part-number claim. Oil above or around the engine can originate from several seals, adapters and nearby components. The page remains published as an identity hold.',
  solution: 'Clean the engine and trace fresh oil under controlled operation. Pressure-test the cooling system and compare engine oil and coolant condition before attributing cross-contamination. Identify the engine build and exact housing/cooler/adapter leak point, then follow the VIN service procedure. Do not buy a housing, cooler, gasket or coolant from this page; failure location, contamination extent, current part number, supersession and VIN fitment must be established first.',
  evidence: ['No exact ProMaster source in the complete pass proves the frozen all-year housing identity or mileage band.', 'The frozen part number and cross-contamination claim are not treated as universal fitment or mechanism.', 'External oil leakage and oil/coolant mixing require separate confirmation.'],
  conflict: 'The frozen page generalizes a platform-wide narrative, mileage band and part number to every 2014-2025 ProMaster without exact model-wide evidence.',
  summary: 'Held the overbroad oil-housing identity, removed unsupported prevalence and restored leak-location and contamination diagnosis.',
  citations: ['datasets'],
  commerceDecision: 'engine build, leak location, contamination extent, current part number, supersession and VIN fitment remain unresolved; no universal retail part',
};

content[ids.roof] = {
  ...genericIssue(rows.find((row) => row.id === ids.roof)),
  description: 'The manufacturer-communication inventory includes a bounded "Water Leak From Roof Area" record for later ProMaster years, but it does not establish the frozen combined identity of roof-seam, marker-light, antenna, high-top joint and conversion-penetration leaks across 2014-2025. Those are distinct factory and aftermarket paths. The 1,450-owner total is unsupported, so the page remains published as an identity hold.',
  solution: 'Document whether the roof and penetrations are factory or conversion-installed, remove loose cargo trim as needed and water-test one zone at a time from low to high. Trace seam, lamp, antenna, windshield, body joint, fan, vent and solar penetrations separately and preserve photos before sealing. Do not buy sealant, gaskets or roof hardware from this page; the exact entry path, substrate, approved repair material, current part number, VIN fitment and upfit applicability must be established first.',
  evidence: ['An exact later-year communication records a roof-area water-leak condition but does not prove the frozen combined mechanism.', 'Factory seams, lamps and antenna paths are distinct from conversion roof penetrations.', 'The complete source pass does not prove one 2014-2025 recurrence identity or owner total.'],
  conflict: 'The frozen page combines multiple factory and conversion leak identities into one all-year mechanism.',
  summary: 'Held the combined roof-leak identity, removed invented prevalence and restored zone-by-zone factory-versus-upfit diagnosis.',
  citations: ['datasets'],
  commerceDecision: 'water entry path, factory versus upfit substrate, approved repair material, current part number and VIN/upfit applicability remain unresolved; no universal retail part',
};

content[ids.slidingDoor] = {
  ...genericIssue(rows.find((row) => row.id === ids.slidingDoor)),
  description: 'The complete exact-source pass did not locate TSB 23-024-20 for the frozen claimed cable-and-roller procedure and did not establish one 2014-2025 failure identity combining cable fray, roller wear, sag, track damage, latch/striker alignment and commercial duty. The 1,800-owner total and named left/right part numbers are not treated as proven universal fitment. The page remains published as an identity hold.',
  solution: 'Support the door safely and reproduce the fault without forcing it. Inspect cable routing and tension, upper/middle/lower rollers, track, stops, hinges, latch, striker, weather seals and body openings separately; record where binding or excess play begins. Do not buy a cable, roller, track, latch or striker from this page; door side, body configuration, failed component, current part number and VIN fitment must be established first.',
  evidence: ['No exact communication in the complete pass establishes TSB 23-024-20 as described.', 'Cable, roller, track and alignment faults are different repair identities.', 'The frozen owner total and universal part-number fitment lack primary support.'],
  conflict: 'The frozen page combines several sliding-door mechanisms and named parts across all years without one exact source.',
  summary: 'Held the combined sliding-door identity, removed unsupported prevalence and restored component-by-component door diagnosis.',
  citations: ['datasets'],
  commerceDecision: 'door side and body configuration, cable/roller/track/latch failure, current part number and VIN fitment remain unresolved; no universal retail part',
};

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL } });

module.exports = Object.freeze({
  make: 'RAM', frozenMakeValues: ['RAM'], model: 'ProMaster', slug: 'promaster', reviewDate: '2026-08-11',
  snapshotFile: 'data/_ram-deeplink-snapshot-2026-08-10.json', snapshotFileSha256: 'e47326640702306eb85ee0cfc33418e55908fd72b4094ecff71186a2e0610623', snapshotHash: 'bdb5e4ec822f7c28c21a5f6f1143e49a0d89b1005428bf1ea93ba5059a7b9057',
  liveRecallFile: 'data/_ram-promaster-live-recalls-2026-08-11.json', outputFile: 'data/known-issue-ram-promaster-adjudication-2026-08-11.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds, duplicateGroups: [], sourceMakes: ['RAM'], modelAliases: ['PROMASTER', 'PROMASTER 1500', 'PROMASTER 2500', 'PROMASTER 3500'],
  searchTerms: ['brake', 'rotor', 'pad', 'oil filter', 'oil cooler', 'roof', 'water leak', 'sliding door', 'cable', 'roller'], relevantDocumentIds: ['11030431'], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 1, '2015-2019': 661, '2020-2024': 504, '2025-2026': 111 }, totalRows: 1277, broadTermMatchedRows: 132, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 1,277 exact RAM ProMaster communication rows were searched. A later-year roof-area record is bounded; no frozen identity is proved at full title and year scope.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 178 }, totalRows: 178, downloadedCampaignCount: 45, liveModernCampaignCount: 43, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 178 downloaded exact-alias recall rows were reconciled with 43 current campaigns returned by the live ProMaster API for 2014-2025. No recall establishes a frozen identity at full scope.' },
  content,
  requiredProse: [
    ...allIds.map((id) => ({ id, field: 'solution', patterns: ['Do not buy', 'VIN fitment'] })),
    { id: ids.brakes, field: 'description', patterns: ['rotor runout', '2,100-owner'] },
    { id: ids.oilHousing, field: 'description', patterns: ['2014-2025', '2,900-owner'] },
    { id: ids.roof, field: 'description', patterns: ['Water Leak From Roof Area', 'factory and aftermarket'] },
    { id: ids.slidingDoor, field: 'description', patterns: ['23-024-20', 'cable-and-roller'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All four frozen RAM ProMaster rows are represented exactly once.' },
    { code: 'all-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All pages remain published holds; none is archived, redirected or relabeled.' },
    { code: 'roof-identity-bundled', severity: 'technical-accuracy', recordIds: [ids.roof], detail: 'A bounded roof-area record does not prove combined factory and conversion leak paths across all years.' },
    { code: 'sliding-door-source-unresolved', severity: 'technical-accuracy', recordIds: [ids.slidingDoor], detail: 'The complete exact-source pass did not locate TSB 23-024-20 as described.' },
    { code: 'invented-owner-counts-zeroed', severity: 'consumer-accuracy', recordIds: reportCountCleanupIds, detail: 'Four unsupported owner totals are proposed unknown and never rendered as 0+ owners.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record or community recommendation is introduced.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Titles, make, model, years, trims, engines, categories, severities, statuses and routing remain frozen.' },
  ],
});
