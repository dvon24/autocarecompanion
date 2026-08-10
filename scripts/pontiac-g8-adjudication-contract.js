/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  fuelBrake: 'pontiac-g8-fuel-pump-recall',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

const content = Object.freeze({
  [ids.fuelBrake]: Object.freeze({
    description: 'The frozen page combines a fuel-tank-module/fuel-pump issue with a brake-lamp-switch recall. Exact campaign 09V172000 does cover 2008-2009 Pontiac G8 vehicles, but it identifies incorrectly programmed brake-pedal-position and tire-pressure-monitor values; the stated remedy is reprogramming, not a $30-$50 switch replacement. The complete 1,180-row exact G8 communications corpus contains no 2008-2009 fuel-pump-failure or fuel-tank-module defect matching this identity. Record 10250028 is a 2014 special return for selected-date-code ACDelco M10256 kits, not proof that installed G8 modules commonly fail. Record 10037345 concerns a fuel-cap vapor leak, a different path.',
    solution: 'If brake lamps remain on or do not communicate braking correctly, avoid driving until the safety condition is assessed. Check the VIN for campaign 09V172000 and have brake-position-sensor and TPMS calibration verified; ask the dealer to confirm current remedy availability and any charge in 2026. Diagnose extended crank or fuel noise separately with fuel pressure, voltage/current, command, EVAP and engine-code testing. Do not buy a brake switch, fuel-pump module, tank assembly or access-cover parts from this page; recall applicability, calibration state, failed path, part number and VIN fitment must be established first.',
    symptoms: ['brake-lamp and cruise behavior documented', 'VIN and recall applicability checked', 'brake-position and TPMS calibration verified', 'fuel-pressure and electrical paths diagnosed separately'],
    affectedSystems: ['brake-pedal-position sensing and lamp control', 'tire-pressure-monitor calibration', 'fuel delivery, EVAP and engine-start paths'],
    evidence: ['Campaign 09V172000 covers 2008-2009 G8 brake-position/TPMS programming and specifies reprogramming.', 'Communication 10026626 supports PPS calibration for brake lamps on, cruise inoperative and C0161.', 'No exact 2008-2009 G8 row supports a common installed fuel-tank-module/fuel-pump defect.', 'Communication 10250028 is a 2014 service-part special return, not an in-vehicle failure bulletin.'],
    conflict: 'The indexed identity combines one exact programming recall with an unsupported fuel-pump defect and prescribes component replacement instead of the recall remedy.',
    summary: 'Held the mixed fuel-pump/brake-switch identity and restored exact recall calibration plus separate fuel diagnosis.',
    citations: ['recall09v172', 'g82008', 'datasets'],
    commerceDecision: 'VIN recall applicability, calibration state, fuel or electrical failure path, part number and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
  g82008: { title: 'NHTSA Vehicle Detail — 2008 Pontiac G8', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/2008/PONTIAC/G8' },
  recall09v172: { title: 'NHTSA Recall Campaign 09V172000 — Brake Position and TPMS Programming', type: 'nhtsa', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=09V172000' },
});

module.exports = Object.freeze({
  make: 'Pontiac', model: 'G8', slug: 'g8', reviewDate: '2026-08-10', snapshotFile: 'data/_pontiac-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-pontiac-g8-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PONTIAC'], modelAliases: ['G8'], searchTerms: ['fuel pump', 'fuel tank module', 'M10256', 'P0087', 'P0171', 'brake lights stay on', 'brake position sensor', 'brake pedal position', 'C0161'], relevantDocumentIds: ['10026626', '10037345', '10250028'], campaigns: ['09V172000', '11V534000', '14V540000', '15V399000'], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 1, '2005-2009': 9, '2010-2014': 72, '2015-2019': 839, '2020-2024': 242, '2025-2026': 17 }, totalRows: 1180, relevantRowCount: 3, uniqueRelevantCommunications: 3, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete corpus contains 1,180 exact Pontiac G8 rows. It supports brake-position-sensor calibration and a fuel-cap vapor-leak path, but no installed fuel-pump/module defect matching the frozen mixed identity.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 4, post: 6 }, totalRows: 10, campaignCount: 4, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'Ten flat rows represent four campaigns. Campaign 09V172000 covers 2008-2009 G8 brake-position and TPMS programming; it is not the GM-wide 14V355 switch family and does not prescribe switch replacement.' },
  content,
  requiredProse: [
    { id: ids.fuelBrake, field: 'description', patterns: ['09V172000', 'reprogramming', 'no 2008-2009 fuel-pump'] },
    { id: ids.fuelBrake, field: 'description', patterns: ['10250028', 'special return', 'not proof'] },
    { id: ids.fuelBrake, field: 'solution', patterns: ['current remedy availability', 'Do not buy a brake switch'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'The sole frozen G8 row is represented exactly once.' },
    { code: 'mixed-identity-held', severity: 'identity-safety', recordIds: allIds, detail: 'The page remains published and held because one title combines an exact calibration recall with an unsupported fuel-pump defect.' },
    { code: 'communications-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 1,180 exact G8 communications were searched.' },
    { code: 'recall-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 10 flat recall rows/four campaigns were reconciled.' },
    { code: 'correct-recall-identified', severity: 'source-integrity', recordIds: allIds, detail: 'The exact G8 campaign is 09V172000, not a projected GM-wide 14V355 switch family.' },
    { code: 'programming-not-switch-replacement', severity: 'technical-accuracy', recordIds: allIds, detail: 'Brake-position and TPMS reprogramming is preserved as the exact remedy.' },
    { code: 'service-part-return-bounded', severity: 'source-integrity', recordIds: allIds, detail: 'The 2014 ACDelco M10256 special return is not treated as an installed-vehicle defect.' },
    { code: 'fuel-cap-not-fuel-pump', severity: 'technical-accuracy', recordIds: allIds, detail: 'A fuel-cap vapor-leak communication is not relabeled as fuel-pump failure.' },
    { code: 'fuel-and-brake-paths-separated', severity: 'technical-accuracy', recordIds: allIds, detail: 'Brake programming and fuel-pressure/electrical diagnosis remain distinct.' },
    { code: 'old-recall-charge-not-promised', severity: 'consumer-accuracy', recordIds: allIds, detail: 'The proposal requires checking current remedy availability and charge rather than promising free 2026 work.' },
    { code: 'unsupported-dtc-cost-mileage-removed', severity: 'source-integrity', recordIds: allIds, detail: 'P0087/P0171, prices and mileage bands are not retained without exact support.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No switch, fuel module, buy link, fixParts record or recommendation is introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown owner count remains zero and never renders as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, model, years, trims, engines, category, severity, status and routing remain frozen.' },
  ],
});
