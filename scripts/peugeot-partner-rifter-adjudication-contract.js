/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  dpf: 'peugeot-partner-dpf-issues',
  slidingDoor: 'peugeot-partner-sliding-door-mechanism',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = allIds;
const content = Object.freeze({
  [ids.dpf]: Object.freeze({
    description: 'The frozen page cites only a forum home page and assigns every 2008-2026 Peugeot Partner/Rifter with a listed 1.5 BlueHDi or 1.6 HDi engine an extreme commercial-use DPF susceptibility, with 80 owner reports and stop-start work as the cause. Engine, emissions standard and aftertreatment design change across those nineteen years; soot, ash, pressure/temperature sensing, additive equipment where fitted, fueling, EGR, turbo, oil faults, exhaust leaks and duty cycle remain separate paths.',
    solution: 'Identify the engine and aftertreatment design; capture DTCs, soot/ash estimates, differential pressure, temperature and regeneration history; then correct sensor, additive, engine or exhaust faults before any controlled regeneration. Do not schedule forced regeneration as a universal routine or attempt it when oil level, filter loading, exhaust temperature or fire safety makes it unsafe. Do not buy Eolys additive, a sensor or DPF from this page; system design, cause and VIN fitment must be established first.',
    symptoms: ['engine and aftertreatment design identified', 'soot, ash, pressure and temperature measured', 'regeneration safety and upstream faults checked'],
    affectedSystems: ['DPF', 'pressure, temperature and additive systems where equipped', 'fueling, EGR, turbo and exhaust'],
    evidence: ['The complete NHTSA corpus contains zero Peugeot Partner or Rifter variants.', 'A forum home page does not establish a nineteen-year commercial-use population.', 'The 80-owner and extreme-susceptibility claims have no traceable first-party dataset.'],
    conflict: 'The identity treats changing diesel systems and work patterns as one extreme DPF defect and turns forced regeneration and Eolys top-ups into universal maintenance.',
    summary: 'Held the overbroad commercial-use DPF identity, reduced 80 reports to unknown and bounded regeneration and additive advice.',
    citations: ['datasets', 'peugeotRecallCheck'],
    commerceDecision: 'engine, aftertreatment architecture, restriction cause and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.slidingDoor]: Object.freeze({
    description: 'The frozen page cites only a forum home page and assigns every 2008-2026 Partner/Rifter a sliding-door failure caused by roller and track wear, with 70 owner reports and colder weather as an aggravating factor. Stiffness, grinding, jamming or poor latching can also involve contamination, ice, seals, alignment, hinges, rollers, tracks, cables, handles, latches, central locking, body damage or load distortion, and the door hardware changes across generations and body lengths.',
    solution: 'Secure the vehicle and do not drive with a door that cannot latch and remain closed. Inspect the exact door, track cleanliness, ice and seals; support the door as required and check alignment, hinges, rollers, guides, cables, handles, latch, striker, central locking and body damage before adjustment or replacement. Use only lubricant and adjustment procedures approved for the exact mechanism. Do not buy rollers, a guide channel, latch or striker from this page; side, body length, generation, failed component and VIN fitment must be established first.',
    symptoms: ['door-latching safety checked', 'contamination, alignment and hardware paths separated', 'side, body length and generation identified'],
    affectedSystems: ['sliding-door rollers, tracks and guides', 'hinges, cables, handles, latch and striker', 'central locking, seals and body structure'],
    evidence: ['The complete NHTSA corpus contains zero Peugeot Partner or Rifter variants.', 'A forum home page does not prove one hardware defect across nineteen years.', 'The 70-owner and cold-weather claims have no traceable first-party dataset.'],
    conflict: 'The identity converts several door symptoms into one nineteen-year roller/track wear defect with fabricated social proof and parts-first advice.',
    summary: 'Held the broad sliding-door identity, reduced 70 reports to unknown and required door-level diagnosis and latch safety.',
    citations: ['datasets', 'peugeotRecallCheck'],
    commerceDecision: 'door side, body length, hardware generation, failed component and VIN fitment remain unresolved; no universal retail part',
  }),
});
const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  peugeotRecallCheck: { title: 'Peugeot Official Safety Recall Campaign Check', type: 'manufacturer', url: 'https://www.peugeot.co.uk/tools/recall-campaigns.html', contains: 'Check recall campaigns for my vehicle' },
});
module.exports = Object.freeze({
  make: 'Peugeot', model: 'Partner/Rifter', slug: 'partner-rifter', reviewDate: '2026-08-10', snapshotFile: 'data/_peugeot-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-peugeot-partner-rifter-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PEUGEOT'], modelAliases: ['PARTNER', 'RIFTER', 'PARTNER VAN', 'E-PARTNER', 'E-RIFTER'], searchTerms: ['DPF', 'regeneration', 'Eolys', 'additive', 'sliding door', 'roller', 'track', 'latch'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communications corpus contains zero PEUGEOT Partner/Rifter variants; this disclosed U.S.-corpus limitation is not treated as disproof.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero PEUGEOT Partner/Rifter variants; market-specific campaigns remain VIN-gated through Peugeot.' },
  content,
  requiredProse: [
    { id: ids.dpf, field: 'description', patterns: ['extreme commercial-use DPF susceptibility', '80 owner reports'] },
    { id: ids.dpf, field: 'solution', patterns: ['Do not schedule forced regeneration', 'Do not buy Eolys additive'] },
    { id: ids.slidingDoor, field: 'description', patterns: ['roller and track wear', '70 owner reports'] },
    { id: ids.slidingDoor, field: 'solution', patterns: ['do not drive with a door that cannot latch', 'Do not buy rollers'] },
  ],
  observations: [
    { code: 'both-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both Partner/Rifter pages remain published and held.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero PEUGEOT Partner/Rifter variants; absence is not disproof.' },
    { code: 'forum-homepages-only', severity: 'source-integrity', recordIds: allIds, detail: 'Both frozen pages cite only generic forum home pages.' },
    { code: 'nineteen-year-scopes', severity: 'technical-accuracy', recordIds: allIds, detail: 'Both identities cross changing vehicle and system generations.' },
    { code: 'commercial-use-cause-unverified', severity: 'source-integrity', recordIds: [ids.dpf], detail: 'Extreme susceptibility and stop-start causation are not established by an exact primary document.' },
    { code: 'forced-regeneration-not-routine', severity: 'safety-accuracy', recordIds: [ids.dpf], detail: 'Forced regeneration is diagnostic and safety gated, not universal fleet maintenance.' },
    { code: 'eolys-not-universal', severity: 'technical-accuracy', recordIds: [ids.dpf], detail: 'Eolys equipment and service interval are not assumed across every year.' },
    { code: 'door-latch-safety', severity: 'safety-accuracy', recordIds: [ids.slidingDoor], detail: 'A door that cannot latch and remain closed is a no-drive condition.' },
    { code: 'door-parts-not-diagnosis', severity: 'technical-accuracy', recordIds: [ids.slidingDoor], detail: 'Rollers, track, latch and striker are separated from alignment, locking and body paths.' },
    { code: 'counts-unsupported', severity: 'social-proof-safety', recordIds: allIds, detail: 'Counts 80 and 70 are reduced to unknown.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No parts, services, search links or recommendations are introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown counts never render as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, model, years, category, severity, status and routing remain frozen.' },
  ],
});
