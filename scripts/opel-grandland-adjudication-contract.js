/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  thpChain: 'opel-grandland-1.6-thp-timing-chain',
  wetBelt: 'opel-grandland-1-2-puretech-wet-timing-belt-degradation-oil-starvation',
  scr: 'opel-grandland-diesel-scr-adblue-nox-sensor-emissions-fault-starting-imposs',
  transmission: 'opel-grandland-eat8-automatic-transmission-jerking-hesitation-whining-noise',
  suspensionRecall: 'opel-grandland-front-lower-suspension-arm-ball-joint-bolt-failure',
  infotainment: 'opel-grandland-intellilink-nac-infotainment-freezing-reversing-camera-dropo',
  batteryRecall: 'opel-grandland-plug-hybrid-high-voltage-battery-fire-risk',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'], commerceDecision }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: commerceDecision || 'failure path, production population, component and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.thpChain]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2017-2021 Grandland X 1.6 THP timing-chain-stretch population or an 80,000-km threshold. The frozen page transfers timing-chain history from Peugeot, Citroen and MINI applications and calls it the same root cause without proving the exact Grandland engine generation or service configuration.',
    solution: 'Record cold-start noise duration, oil level and specification, service history, DTCs and measured cam/crank correlation, then use current Opel/Vauxhall service information for the exact engine code. Localize accessory, valvetrain and timing-drive noise before opening the engine. Do not buy a chain kit or tensioner from this page; the engine generation, failure path and exact VIN fitment must be established first.',
    symptoms: ['cold-start noise timed and localized', 'oil and service history recorded', 'cam/crank correlation measured before timing work'],
    systems: ['1.6 turbo timing drive', 'chain tensioning and lubrication', 'cam/crank timing control'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Grandland records.', 'Other PSA/BMW applications do not establish Grandland population or root cause.', 'No exact source supports the frozen mileage threshold or repair price.'],
    conflict: 'The indexed identity imports a cross-platform engine-family issue and mileage threshold without exact Grandland evidence.',
    summary: 'Held the cross-platform THP timing-chain identity and removed mileage, cost and universal oil-interval claims.',
  }),
  [ids.wetBelt]: held({
    description: 'Stellantis officially recognizes excessive oil consumption and premature timing-belt degradation on previous generations of PureTech 1.0 and 1.2 engines, with conditional coverage up to 10 years or 112,000 miles. That announcement does not identify every 2019-2024 Grandland, prove the frozen EB2/EB2ADTS equipment scope, or support the complete debris, VVT, oil-starvation, warning and catastrophic-outcome sequence for this model population.',
    solution: 'Identify the exact engine generation and timing-drive design from the VIN and current Opel/Vauxhall service information. Follow the specified oil and maintenance plan, document any oil-pressure warning or visible belt concern, and ask an authorized repairer to assess Stellantis support eligibility before work. Stop driving if an oil-pressure warning appears. Do not buy a belt kit, strainer, solenoid or engine from this page; generation, diagnosis and exact VIN fitment must be established first.',
    symptoms: ['engine generation and timing drive verified', 'oil-pressure warning treated as a stop condition', 'maintenance history retained for support eligibility'],
    systems: ['PureTech timing drive', 'engine lubrication and oil pickup', 'VVT control and VIN-gated support'],
    evidence: ['Stellantis recognizes previous-generation PureTech timing-belt degradation.', 'The official policy is conditional and extends to 10 years or 112,000 miles.', 'The official announcement does not map affected generations to every frozen Grandland year.'],
    conflict: 'The indexed identity maps family-level PureTech evidence and a full failure sequence to every 2019-2024 Grandland without exact engine-generation proof.',
    summary: 'Held the overbroad Grandland wet-belt identity while preserving the official Stellantis support boundary.',
    citations: ['stellantisPuretech'],
  }),
  [ids.scr]: held({
    description: 'The frozen page turns a regulated SCR restart countdown plus NOx sensors, tank and dosing faults, crystallization, fluid quality and wiring into one 2017-2023 Grandland defect across two diesel engine families. No exact Opel/Vauxhall primary source in the packet establishes a common population, the 30,000-45,000-km phase or a universal parts-and-reset remedy.',
    solution: 'Follow the exact owner-manual warning and use fluid meeting the specified standard. Record the countdown, warning text and DTCs; before the restart limit is reached, obtain diagnosis of NOx sensing, dosing, tank, wiring and catalyst paths under exact engine/VIN service information. Do not clear or reset the countdown without correcting the verified fault. Do not buy a sensor, tank, injector, pump or catalyst from this page; the failed path and exact fitment must be established first.',
    symptoms: ['warning text and restart distance recorded', 'NOx, dosing, tank and wiring paths separated', 'fault corrected before any countdown reset'],
    systems: ['SCR and AdBlue dosing', 'NOx sensors and wiring', 'tank, pump and restart-inhibition logic'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Grandland records.', 'No exact source establishes a seven-year two-engine population.', 'The frozen mileage phase and universal reset/parts list are unsupported.'],
    conflict: 'The indexed identity combines a regulatory warning with several unrelated component faults across two engines and seven years.',
    summary: 'Held the conflated SCR/AdBlue identity and removed unsupported mileage, software and reset claims.',
  }),
  [ids.transmission]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2018-2024 Grandland EAT8 population with jerking, hesitation and a 45-65-km/h metallic whine from one cause. The frozen page combines temperature-dependent shift quality and noise, attributes both to adaptation values or gear/bearing tolerances, and transfers shared-platform behavior from Peugeot/Citroen without exact Grandland evidence.',
    solution: 'Reproduce each condition with gear, temperature, speed and load recorded; scan the transmission and verify software, adaptation state, fluid level/specification and mechanical noise under current VIN service information. Diagnose shift quality and whine separately before reset, service or replacement. Do not buy fluid, a valve body or transmission from this page; the exact fault, service procedure and VIN fitment must be established first.',
    symptoms: ['shift condition recorded by gear and temperature', 'whine localized separately from shift quality', 'software, adaptation and fluid checked under exact procedure'],
    systems: ['EAT8/AWF8 transmission and controls', 'adaptation and hydraulic control', 'gears, bearings and fluid'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Grandland records.', 'Forum reports do not establish one seven-year failure population.', 'No exact source supports adaptation reset or valve-body/gearbox replacement as universal remedies.'],
    conflict: 'The indexed identity merges two symptom families and inferred causes across several powertrains without exact primary evidence.',
    summary: 'Held the conflated EAT8 identity and separated shift-quality diagnosis from mechanical noise.',
  }),
  [ids.suspensionRecall]: held({
    description: 'The frozen page relies on a secondary recall summary for campaign KQG, claiming front lower-control-arm ball-joint fixing screws can break across indexed years 2023-2025. No exact manufacturer or regulator campaign record in the packet defines the Grandland VIN/build population, number of screws, stated wheel movement sequence, shared-platform scope or the inspection and replacement remedy.',
    solution: 'Use the official Vauxhall VIN recall checker or an authorized Opel/Vauxhall repairer to confirm whether campaign KQG or another suspension campaign applies. Treat new clunking, wheel-position change or steering-control symptoms as urgent and arrange inspection or recovery. Do not buy bolts, a ball joint or control arm from this page; the campaign, damage state, one-time fastener procedure and VIN fitment must be established first.',
    symptoms: ['campaign status verified by VIN', 'wheel position and fasteners inspected urgently', 'shared-platform inference excluded'],
    systems: ['front lower control arms', 'ball-joint mounts and fixing screws', 'steering geometry and wheel control'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Grandland records.', 'The packet contains only secondary recall aggregation for KQG.', 'Exact population, mechanism and remedy are not verified from a primary campaign document.'],
    conflict: 'The indexed identity may describe a real campaign but expands unverified secondary detail across 2023-2025.',
    summary: 'Held the KQG suspension identity pending exact campaign evidence while preserving urgent VIN-check guidance.',
    citations: ['datasets', 'vauxhallRecallCheck'],
    commerceDecision: 'recall status, inspection result and VIN eligibility govern suspension work; no universal retail part',
  }),
  [ids.infotainment]: held({
    description: 'No exact Opel/Vauxhall Grandland communication in the reviewed primary corpus establishes a 2017-2023 IntelliLink/NAC freezing and reversing-camera-dropout population, the frozen 12,000-25,000-km onset, or a common software/module cause. Forum posts cannot prove that locking the vehicle, battery disconnection, a software update, connector repair, camera replacement and head-unit replacement are interchangeable remedies.',
    solution: 'Record the display, camera, audio, phone connection, software version, battery voltage and DTCs, then follow exact owner-manual restart and VIN-specific update guidance. Preserve reversing-camera evidence before resetting. Do not disconnect the battery or use a cross-model reset without service guidance. Do not buy a camera, connector or head unit from this page; software, power, network, wiring and hardware paths must be separated first.',
    symptoms: ['camera, display, audio and phone functions tested separately', 'software version and battery state recorded', 'model-specific restart procedure verified'],
    systems: ['IntelliLink/NAC head unit and display', 'reversing camera and wiring', 'software, power and vehicle network'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Grandland records.', 'Forum timing and self-recovery do not prove a software-only cause.', 'No exact source supports the frozen mileage range or battery-disconnect workaround.'],
    conflict: 'The indexed identity combines several infotainment and camera paths over seven years and assigns forum workarounds as remedies.',
    summary: 'Held the unsupported infotainment identity and removed battery-disconnect, mileage and parts-first advice.',
  }),
  [ids.batteryRecall]: held({
    description: 'The frozen page combines multiple secondary reports under recall labels KT8/KC5 and maps water ingress, corrosion, a generically faulty high-voltage battery and fire risk across 2019-2023 Hybrid/Hybrid4 vehicles. No exact manufacturer or regulator campaign record in the packet defines each population, cause, remedy, charging restriction or whether drainage work and battery replacement belong to the same campaign.',
    solution: 'Use the official Vauxhall VIN recall checker and contact an authorized high-voltage Opel/Vauxhall repairer for every open campaign. If smoke, unusual heat, odor, battery warning or charging instruction appears, stop safely, move away, call emergency services when appropriate and follow manufacturer guidance. Do not drill drainage holes, open the battery or change charging behavior from this page. Do not buy a high-voltage battery or support component here; exact campaign and VIN eligibility govern the remedy.',
    symptoms: ['each recall campaign checked separately by VIN', 'heat, smoke or odor treated as an emergency', 'high-voltage work restricted to authorized repairers'],
    systems: ['high-voltage traction battery', 'battery support, sealing and drainage', 'charging and thermal safety controls'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Grandland records.', 'The packet contains secondary recall reporting rather than exact KT8/KC5 campaign documents.', 'Drainage, battery replacement and charging restrictions cannot be assigned across campaigns without primary evidence.'],
    conflict: 'The indexed identity merges multiple high-voltage campaign populations, mechanisms and remedies into one five-year fire-risk page.',
    summary: 'Held the conflated PHEV battery-recall identity and prohibited owner drainage or charging changes from secondary advice.',
    citations: ['datasets', 'vauxhallRecallCheck'],
    commerceDecision: 'high-voltage recall status and VIN eligibility govern all work; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  vauxhallRecallCheck: { title: 'Vauxhall Official Vehicle Recall Check', type: 'manufacturer', url: 'https://www.vauxhall.co.uk/owners/maintenance-and-repair/vehicle-recall-check.html', contains: 'Check safety recall campaigns for MY vehicle' },
  stellantisPuretech: { title: 'Stellantis PureTech 1.0 and 1.2 Extended Support Policy', type: 'manufacturer', url: 'https://www.media.stellantis.com/uk-en/vauxhall/press/stellantis-extends-compensation-policy-for-european-consumers-claims-on-previous-generations-of-puretech-1-0-and-1-2-engines', contains: 'premature degradation of the timing belt' },
});

module.exports = Object.freeze({
  make: 'Opel', model: 'Grandland', slug: 'grandland', reviewDate: '2026-08-10',
  snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-opel-grandland-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['OPEL', 'VAUXHALL'], modelAliases: ['GRANDLAND', 'GRANDLAND X'],
  searchTerms: ['timing chain', 'THP', 'PureTech', 'timing belt', 'AdBlue', 'SCR', 'NOx', 'EAT8', 'transmission', 'ball joint', 'control arm', 'KQG', 'infotainment', 'camera', 'battery', 'fire', 'KT8', 'KC5'],
  relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communication corpus contains zero OPEL or VAUXHALL GRANDLAND/GRANDLAND X rows; this is a disclosed U.S.-corpus limitation.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL GRANDLAND/GRANDLAND X rows; secondary European recall summaries remain held until exact campaign records are available.',
  },
  content,
  requiredProse: [
    { id: ids.thpChain, field: 'description', patterns: ['transfers timing-chain history from Peugeot, Citroen and MINI', 'without proving the exact Grandland'] },
    { id: ids.wetBelt, field: 'description', patterns: ['does not identify every 2019-2024 Grandland', 'complete debris, VVT, oil-starvation'] },
    { id: ids.scr, field: 'description', patterns: ['across two diesel engine families', '30,000-45,000-km phase'] },
    { id: ids.transmission, field: 'description', patterns: ['combines temperature-dependent shift quality and noise', 'Peugeot/Citroen'] },
    { id: ids.suspensionRecall, field: 'description', patterns: ['No exact manufacturer or regulator campaign record', 'shared-platform scope'] },
    { id: ids.infotainment, field: 'solution', patterns: ['Do not disconnect the battery', 'Preserve reversing-camera evidence'] },
    { id: ids.batteryRecall, field: 'solution', patterns: ['Do not drill drainage holes', 'high-voltage Opel/Vauxhall repairer'] },
  ],
  observations: [
    { code: 'all-seven-held', severity: 'identity-safety', recordIds: allIds, detail: 'All seven Grandland pages remain published, but every identity exceeds exact evidence or merges distinct conditions.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero OPEL/VAUXHALL GRANDLAND rows; the packet discloses that geographic limitation.' },
    { code: 'thp-cross-platform-transfer', severity: 'technical-accuracy', recordIds: [ids.thpChain], detail: 'Peugeot/Citroen/MINI timing-chain history does not prove a Grandland population or common root cause.' },
    { code: 'puretech-family-not-grandland-population', severity: 'technical-accuracy', recordIds: [ids.wetBelt], detail: 'Stellantis family evidence does not map every 2019-2024 Grandland or the full frozen failure sequence.' },
    { code: 'scr-two-engine-conflation', severity: 'technical-accuracy', recordIds: [ids.scr], detail: 'The SCR page groups multiple components across 1.5 and 1.6 diesels and invents a common mileage phase.' },
    { code: 'eat8-symptom-conflation', severity: 'technical-accuracy', recordIds: [ids.transmission], detail: 'Shift quality and mechanical whine are distinct, and forum adaptation advice is not a universal remedy.' },
    { code: 'kqg-primary-campaign-missing', severity: 'source-integrity', recordIds: [ids.suspensionRecall], detail: 'The KQG page has only secondary recall aggregation; exact population, mechanism and remedy remain unverified.' },
    { code: 'infotainment-battery-reset-removed', severity: 'safety-accuracy', recordIds: [ids.infotainment], detail: 'Generic battery-disconnect advice is removed and camera evidence is preserved before reset.' },
    { code: 'hv-campaigns-conflated', severity: 'safety-accuracy', recordIds: [ids.batteryRecall], detail: 'KT8/KC5, water ingress, corrosion, battery defect, drainage and replacement are merged without exact campaign documents.' },
    { code: 'hv-owner-work-prohibited', severity: 'safety-accuracy', recordIds: [ids.batteryRecall], detail: 'The proposal prohibits owner drilling, battery opening or charging changes from secondary advice.' },
    { code: 'no-commerce-introduced', severity: 'commerce-safety', recordIds: allIds, detail: 'All solutions contain do-not-buy boundaries and no retail links or parts are introduced.' },
    { code: 'no-owner-social-proof', severity: 'social-proof-safety', recordIds: allIds, detail: 'All report counts are unknown zero and no 0+ owner messaging is introduced.' },
    { code: 'all-grandland-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Grandland URL, title, vehicle scope, category, severity or published status changes.' },
  ],
});
