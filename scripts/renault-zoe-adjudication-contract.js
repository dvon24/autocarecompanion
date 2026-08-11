/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  battery: 'renault-zoe-battery-degradation',
  charging: 'renault-zoe-charging-system',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze(allIds);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, commerceDecision }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations: ['datasets', 'renaultRecallCheck'],
    commerceDecision: commerceDecision || 'failure path, component, battery/charger generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.battery]: held({
    description: 'The frozen page applies one capacity-degradation identity to 22, 41 and 52 kWh Zoe batteries from 2013-2024, claims early packs lose 20-30% within five years, attributes acceleration to rapid charging and heat, assigns 90 owner reports and states lease customers receive replacement below 75%. It cites only a SpeakEV home page; battery ownership, lease and warranty terms vary by market, contract and date.',
    solution: 'Record usable energy, state of health from Renault-capable diagnostics, temperature, charging history and range under comparable conditions; separate seasonal consumption, tire/HVAC load, estimation error and cell/battery faults. Review the original battery ownership/lease and warranty documents plus Renault’s VIN-specific records before making a coverage claim. Do not buy a traction battery, module or diagnostic adapter from this page; measured condition, ownership terms, safe repair path and VIN fitment must be established first.',
    symptoms: ['usable energy and diagnostic state of health recorded', 'range compared under controlled temperature and load', 'ownership, lease and warranty terms verified for the VIN'],
    systems: ['high-voltage traction battery', 'battery management and state estimation', 'charging history, thermal and vehicle energy use'],
    evidence: ['The complete NHTSA corpus contains zero Renault Zoe rows.', 'A forum home page does not prove twelve years or three battery generations.', 'The 20-30%, five-year, rapid-charge/heat, 90-owner and 75% lease claims lack exact contract-specific evidence.'],
    conflict: 'The indexed identity merges three battery generations and market-specific lease policy under unsupported social proof.',
    summary: 'Held the battery-degradation identity and reduced the unsupported 90-owner total to unknown while removing universal percentage and lease-policy claims.',
  }),
  [ids.charging]: held({
    description: 'The frozen page applies one Chameleon-charger failure identity to every 2013-2024 Zoe battery variant, asserts module overheating during high-power AC charging and connector-pin corrosion, and assigns 65 owner reports. A SpeakEV home page does not establish that population or mechanism; charge refusal can also involve site supply/earthing, EVSE, cable/connector, 12 V support, software, motor/inverter-integrated charging hardware, battery management or traction-battery conditions.',
    solution: 'Stop using any hot, damaged, wet or discolored plug/cable and isolate the supply safely. Record the charge point, power, warnings and DTCs; test another approved EVSE where safe, verify site supply/earthing through a qualified electrician, and have Renault diagnose 12 V support, connector interlocks, software and high-voltage charging hardware. Do not clean energized connector pins or open/probe high-voltage components. Do not buy a cable, inlet or charger module from this page; failed path, charger generation, market electrical specification and VIN fitment must be established first.',
    symptoms: ['charge point, power and warning data recorded', 'hot or damaged connector treated as stop-use', 'site, EVSE, 12 V, interlock, software and high-voltage paths separated'],
    systems: ['mains supply, EVSE and charge cable', 'vehicle inlet, interlocks and low-voltage support', 'Chameleon charging hardware, BMS and traction battery'],
    evidence: ['The complete NHTSA corpus contains zero Renault Zoe rows.', 'A forum home page does not prove twelve years or every battery/charger application.', 'The overheating, corrosion and 65-owner claims lack exact Renault evidence.'],
    conflict: 'The indexed identity merges external supply, low-voltage, connector, software and high-voltage paths into one charger defect.',
    summary: 'Held the charging-system identity and reduced the unsupported 65-owner total to unknown while adding mains/high-voltage stop-use gates.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Zoe', slug: 'zoe', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-zoe-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT'], modelAliases: ['ZOE'],
  searchTerms: ['battery degradation', 'state of health', 'charging', 'Chameleon charger'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT ZOE rows; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT ZOE rows; owners must use Renault’s VIN recall checker for market-specific campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.battery, field: 'description', patterns: ['22, 41 and 52 kWh', '90 owner reports', '75%'] },
    { id: ids.charging, field: 'solution', patterns: ['Do not clean energized connector pins', 'charger generation'] },
  ],
  observations: [
    { code: 'both-pages-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both Zoe pages remain published but exceed exact primary evidence.' },
    { code: 'battery-generations-and-contracts-separated', severity: 'technical-accuracy', recordIds: [ids.battery], detail: 'Three battery generations and market/contract-specific lease terms are not treated as one policy or degradation rate.' },
    { code: 'charging-paths-and-hv-safety', severity: 'safety-accuracy', recordIds: [ids.charging], detail: 'Site, EVSE, low-voltage, connector, software and high-voltage paths are separated with stop-use boundaries.' },
    { code: 'unsupported-owner-counts-removed', severity: 'social-proof-safety', recordIds: allIds, detail: 'The unsupported 90 and 65 owner totals are reduced to unknown.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT ZOE rows; the geographic limitation is explicit.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
