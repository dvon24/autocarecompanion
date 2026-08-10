/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({ range: 'peugeot-2008-e2008-range-issues', pureTech: 'peugeot-2008-puretech-timing-chain' });
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.pureTech]);
const reportCountCleanupIds = allIds;
const content = Object.freeze({
  [ids.range]: Object.freeze({
    description: 'Peugeot states that WLTP range is a comparative test value and that real E-2008 range varies with starting charge, weather, heating or air-conditioning, speed, driving style, load, tires and road conditions. The frozen page converts that expected variability into a 2020-2026 defect, claims a consistent 30-40% cold-weather shortfall caused partly by BMS calibration, cites only a forum home page and assigns 45 owner reports. None of those population, percentage, cause or count claims has an exact source.',
    solution: 'Compare consumption and usable energy over repeat trips with the exact battery, software, temperature, speed, load, climate use and tire conditions recorded. Pre-condition while plugged in where supported and check official software/service information if the range estimate behaves abnormally. Do not deliberately deep-discharge the traction battery or perform repeated full-to-empty cycles as a calibration ritual. Do not buy a battery, BMS module or heating component from this page; measured battery health, fault data and VIN-specific diagnosis must come first.',
    symptoms: ['trip conditions and energy use recorded', 'displayed estimate separated from measured usable energy', 'battery and software faults checked without deep discharge'],
    affectedSystems: ['traction battery and state estimation', 'cabin heating and thermal management', 'tires, load, speed and driving conditions'],
    evidence: ['Peugeot says real range can differ substantially from WLTP with conditions and equipment use.', 'The complete NHTSA corpus contains zero Peugeot E-2008 rows.', 'A forum home page does not prove 30-40%, BMS causation or 45 owner reports.'],
    conflict: 'The indexed identity turns normal WLTP-versus-real-world variability into a seven-year BMS/range defect and fabricated social proof.',
    summary: 'Held the unsupported E-2008 range-defect identity, removed the 45-owner claim and prohibited repeated deep-discharge calibration.',
    citations: ['e2008Official', 'datasets', 'peugeotRecallCheck'],
    commerceDecision: 'range conditions, measured battery health, fault state and VIN-specific equipment remain unresolved; no universal retail part',
  }),
  [ids.pureTech]: Object.freeze({
    description: 'Peugeot confirms that previous-generation 1.0 and 1.2 PureTech engines can experience an oil-pressure issue resulting from premature timing-belt degradation. Official terms cover affected non-turbo engines produced June 2012-June 2022 and 1.2 turbo engines produced April 2014-June 2022. The 2008 uses a belt, not the timing chain incorrectly prescribed by the frozen solution; the shortened interval, revised-belt history and 130-owner count are not established by the cited manufacturer evidence.',
    solution: 'If an oil-pressure warning appears, stop the engine as soon as it is safe and do not continue driving until the lubrication system is checked. Identify engine and production date by VIN, inspect belt condition using the current Peugeot procedure, and when degradation is confirmed follow engine-specific instructions for the timing-belt system, oil pickup/lubrication circuit, oil and filter. Check Peugeot support eligibility and the service schedule. Do not buy a timing-belt kit from this page; production date, engine, diagnosis and VIN fitment must be established first.',
    symptoms: ['engine and production date verified', 'belt condition assessed under current procedure', 'oil pickup and lubrication consequences checked'],
    affectedSystems: ['PureTech timing belt', 'oil pickup and lubrication circuit', 'engine timing and oil-pressure monitoring'],
    evidence: ['Peugeot confirms premature timing-belt degradation and oil-pressure consequences.', 'Official production windows span the frozen 2013-2022 identity only for affected engines/builds.', 'The chain-kit remedy and 130-owner claim are unsupported.'],
    conflict: null,
    summary: 'Retained the manufacturer-supported PureTech wet-belt identity, corrected the chain remedy and reduced unsupported social proof to unknown.',
    citations: ['pureTechSupport', 'pureTechTerms'],
    commerceDecision: 'Peugeot confirms the condition, but engine generation, production date, service history and VIN fitment remain mandatory; no universal retail part',
  }),
});
const pdfSources = Object.freeze({
  pureTechTerms: { title: 'Peugeot PureTech Customer Satisfaction Portal Terms and Conditions', type: 'manufacturer', url: 'https://www.peugeot.co.uk/content/dam/peugeot/uk/b2c/owners/customer-care/2025-02-11_PureTech-Terms-and-Conditions_UK_Aug-2025.pdf', sha256: 'cfe7937ce80fa3003029926cba9c2e8924fca2dd525db069fd294a3475b758ed', pageCount: 2, visuallyReviewedPages: [1, 2] },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  peugeotRecallCheck: { title: 'Peugeot Official Safety Recall Campaign Check', type: 'manufacturer', url: 'https://www.peugeot.co.uk/tools/recall-campaigns.html', contains: 'Check recall campaigns for my vehicle' },
  pureTechSupport: { title: 'Peugeot PureTech Engines - Official Solutions and Special Coverage', type: 'manufacturer', url: 'https://www.peugeot.co.uk/owners/puretech-engines-solutions.html', contains: 'premature degradation of the timing belt' },
  e2008Official: { title: 'Peugeot E-2008 Official Range and WLTP Information', type: 'manufacturer', url: 'https://www.peugeot.co.uk/models/new-peugeot-2008/electric.html', contains: 'variations in weather' },
});
module.exports = Object.freeze({
  make: 'Peugeot', model: '2008', slug: '2008', reviewDate: '2026-08-10', snapshotFile: 'data/_peugeot-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-peugeot-2008-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PEUGEOT'], modelAliases: ['2008', 'E-2008', '2008 ELECTRIC', '2008 V2'], searchTerms: ['range', 'WLTP', 'battery', 'BMS', 'cold weather', 'PureTech', 'timing belt', 'oil pressure'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communications corpus contains zero PEUGEOT 2008/E-2008/2008 ELECTRIC/2008 V2 rows; this disclosed U.S.-corpus limitation is not treated as disproof.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero PEUGEOT 2008 variants; market-specific campaigns remain VIN-gated through Peugeot.' },
  content,
  requiredProse: [
    { id: ids.range, field: 'description', patterns: ['30-40% cold-weather', '45 owner reports'] },
    { id: ids.range, field: 'solution', patterns: ['Do not deliberately deep-discharge', 'Do not buy a battery'] },
    { id: ids.pureTech, field: 'description', patterns: ['belt, not the timing chain', '130-owner count'] },
    { id: ids.pureTech, field: 'solution', patterns: ['stop the engine', 'Do not buy a timing-belt kit'] },
  ],
  observations: [
    { code: 'one-retain-one-hold', severity: 'identity-safety', recordIds: allIds, detail: 'PureTech is retained on primary evidence; the range-defect identity remains held.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero PEUGEOT 2008 variants; the geographic limit is explicit.' },
    { code: 'wltp-comparative-boundary', severity: 'technical-accuracy', recordIds: [ids.range], detail: 'Peugeot describes WLTP as comparative and real range as condition-dependent.' },
    { code: 'range-percentage-unverified', severity: 'source-integrity', recordIds: [ids.range], detail: 'No exact source proves a consistent 30-40% shortfall.' },
    { code: 'bms-cause-unverified', severity: 'technical-accuracy', recordIds: [ids.range], detail: 'The frozen BMS-calibration cause is not established.' },
    { code: 'deep-discharge-ritual-removed', severity: 'safety-accuracy', recordIds: [ids.range], detail: 'Repeated full-to-empty cycling is removed as unsupported advice.' },
    { code: 'range-count-unsupported', severity: 'social-proof-safety', recordIds: [ids.range], detail: 'The 45-owner count is reduced to unknown.' },
    { code: 'puretech-primary-supported', severity: 'source-integrity', recordIds: [ids.pureTech], detail: 'Peugeot confirms premature timing-belt degradation on affected previous-generation engines.' },
    { code: 'puretech-chain-remedy-corrected', severity: 'technical-accuracy', recordIds: [ids.pureTech], detail: 'The live timing-chain-kit instruction is corrected to the belt and lubrication path.' },
    { code: 'puretech-count-unsupported', severity: 'social-proof-safety', recordIds: [ids.pureTech], detail: 'The 130-owner count is reduced to unknown.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No battery, BMS, heater, belt kit or search link is introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown counts are never rendered as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'All title, model, years, category, severity, status and routing fields remain frozen.' },
  ],
});
