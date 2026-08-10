/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  timingChain: 'renault-captur-0-9-1-2-tce-timing-chain-premature-stretch-tensioner-guide-f',
  oilConsumption: 'renault-captur-1-2-tce-excessive-oil-consumption-motorgate-piston-ring-defe',
  dieselEmissions: 'renault-captur-1-5-dci-dpf-egr-clogging-adblue-scr-faults-short-trip-cars',
  waterIngress: 'renault-captur-cabin-water-ingress-through-door-seals-blocked-sill-drains',
  hybridGearboxSeal: 'renault-captur-e-tech-hybrid-gearbox-input-shaft-o-ring-oil-leak',
  edcShudder: 'renault-captur-edc-transmission-shudder',
  parkingBrake: 'renault-captur-electronic-parking-brake-fails-to-auto-engage-actuator-senso',
  infotainment: 'renault-captur-infotainment',
  turbo: 'renault-captur-tce-turbo-issues',
});

const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.edcShudder, ids.infotainment, ids.turbo].sort());

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
    commerceDecision: commerceDecision || 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.timingChain]: held({
    description: 'The frozen page combines the H4Bt 0.9 TCe and H5Ft 1.2 TCe across 2013-2019, then asserts a shared premature-chain defect, an 80,000-100,000 km onset, clogged oil-jet cause and goodwill practice. The complete reviewed U.S. regulator corpus contains no Renault Captur record, and the cited forums, repair sites and news coverage do not establish one exact manufacturer-defined population or common mechanism.',
    solution: 'Record cold-start duration, oil level and specification, service history, DTCs and cam/crank correlation, then localize the noise and verify timing under engine-code-specific Renault procedures before disturbing the drive. Stop if timing has jumped, oil pressure is low or internal contact is suspected. Do not buy a chain kit, tensioner, guide or sprocket from this page; the engine code, failed path and VIN-specific fitment must be established first.',
    symptoms: ['cold-start rattle duration recorded', 'oil level and service history verified', 'cam/crank timing tested before disassembly'],
    systems: ['timing chain, guides and tensioner', 'engine lubrication and oil supply', 'camshaft and crankshaft synchronization'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'Forum cases do not prove the same mechanism in H4Bt and H5Ft engines.', 'No exact Renault source verifies the frozen mileage threshold, oil-jet cause or goodwill percentage.'],
    conflict: 'The indexed identity merges two engine families, seven model years and several unsupported mechanism and policy claims.',
    summary: 'Held the combined timing-chain identity and replaced mileage, root-cause and goodwill certainty with engine-specific diagnosis.',
  }),
  [ids.oilConsumption]: held({
    description: 'Secondary reporting describes litigation and investigation concerning H5Ft-family oil consumption, but the frozen page turns that reporting into a Captur-specific 2013-2016 piston/ring/cylinder-wall defect, exact consumption and failure-mileage ranges, a 400,000-vehicle population, a May 2016 correction and a universal Renault repair threshold. No exact manufacturer campaign or regulator file reviewed here proves that entire Captur identity.',
    solution: 'Check oil on level ground, document consumption against distance and inspect external leakage, crankcase ventilation, compression, leak-down, plugs, catalyst condition and turbocharger oil paths under the exact engine code. Escalate low-oil-pressure warnings or rapid loss immediately and use the Renault VIN recall checker and retailer history for vehicle-specific campaigns or support. Do not buy piston rings, a catalyst, turbocharger or replacement engine from this page; the cause, damage and VIN-specific remedy must be established first.',
    symptoms: ['measured oil consumption log', 'external and internal oil paths separated', 'compression and catalyst condition assessed'],
    systems: ['H5Ft engine lubrication', 'pistons, rings and cylinder sealing', 'crankcase ventilation, turbocharger and catalyst'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'Secondary litigation reporting is not an exact Captur campaign file.', 'The frozen thresholds, production correction and repair sequence are not supported by a verified Renault primary source.'],
    conflict: 'The indexed identity converts multi-brand secondary reporting into a precise Captur population, mechanism and remedy.',
    summary: 'Held the Motorgate identity and replaced exact population, threshold and universal-repair claims with measured oil-consumption diagnosis.',
  }),
  [ids.dieselEmissions]: held({
    description: 'The frozen page combines first- and second-generation 1.5 dCi/Blue dCi vehicles, DPF loading, EGR restriction, AdBlue injector crystallization, NOx-sensor faults and urea-level errors under one 2013-2021 identity. These are separate diagnostic paths, and AdBlue/SCR equipment is not present across the whole indexed window. The cited advice and forum pages do not establish a single Captur defect population or the stated regeneration intervals.',
    solution: 'Capture the exact warning, DTCs, soot and ash estimates, differential pressure, exhaust temperatures, regeneration history, EGR command/response and—only where fitted—SCR pressure, dosing, NOx and AdBlue data. Do not force regeneration when oil dilution, excessive soot load, sensor error or an unsafe exhaust condition is unresolved. Do not buy a DPF, EGR valve, injector, NOx sensor or AdBlue component from this page; emissions generation, failed path and VIN fitment must be established first.',
    symptoms: ['exact emissions DTCs and freeze-frame captured', 'DPF, EGR and SCR paths separated', 'regeneration safety conditions verified'],
    systems: ['diesel particulate filter', 'exhaust-gas recirculation', 'SCR, AdBlue dosing and NOx sensing where equipped'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'The frozen years span materially different emissions generations.', 'Advice and forum sources do not prove a universal 300-400 km prevention interval or combined mechanism.'],
    conflict: 'The indexed identity merges unrelated emissions paths and equipment not fitted across all nine years.',
    summary: 'Held the combined DPF/EGR/AdBlue identity and separated code-led emissions diagnosis by generation.',
  }),
  [ids.waterIngress]: held({
    description: 'Owner threads describe wet Captur footwells, but the frozen 2013-2019 page treats detached rear-door seals, a bulkhead-to-sill joint and blocked sill drains as one common manufacturer defect. Those are different leak paths, and the reviewed primary corpus contains no exact Renault communication establishing the full population, causal combination or downstream module-damage claim.',
    solution: 'Disconnect or protect affected electrical equipment as required, remove standing water and trace entry with controlled sectional testing before resealing anything. Inspect door membranes and weatherstrips, body seams, drain paths, HVAC drainage, glazing and prior body repair separately, then dry the carpet and underlay fully and test any wetted connectors. Do not buy seals, bungs, trim or electronic modules from this page; the entry path, body configuration and VIN fitment must be established first.',
    symptoms: ['wet area mapped before trim removal', 'door, body, HVAC and glazing paths tested separately', 'under-carpet wiring inspected after drying'],
    systems: ['door weatherstrips and membranes', 'body seams, sill and drain paths', 'carpet, underlay and low-mounted wiring'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'Forum cases establish individual symptoms, not one common leak mechanism.', 'No exact primary source supports all 2013-2019 cars or the three asserted root causes.'],
    conflict: 'The indexed identity combines several possible water-entry paths into a seven-year defect.',
    summary: 'Held the combined water-ingress identity and replaced cause assumptions with sectional leak tracing and electrical safeguards.',
  }),
  [ids.hybridGearboxSeal]: held({
    description: 'Secondary European reporting describes a Renault E-Tech campaign concerning a primary-shaft seal, but the frozen Captur page asserts an exact 155,825-vehicle population, 2019-2022 build window, DB1 internal failure sequence, €3,000-8,000 outcomes and a post-September-2022 production correction. The official Renault source available here is VIN-specific and does not publish those Captur population details, so the indexed title and scope exceed verified primary evidence.',
    solution: 'Treat loss-of-drive or electrical-danger warnings as urgent and arrange Renault-capable diagnosis rather than continuing to drive. Check the VIN with Renault, preserve fault codes, and have the gearbox/electric-machine area inspected for leakage and contamination under the campaign procedure applicable to that vehicle. Do not buy an O-ring, X-ring, sensor, electric motor or gearbox from this page; campaign eligibility, damage and VIN-specific remedy must be confirmed by Renault first.',
    symptoms: ['VIN campaign status checked', 'gearbox and hybrid fault codes preserved', 'leakage and electric-machine contamination assessed'],
    systems: ['E-Tech multimode gearbox', 'primary-shaft sealing', 'electric machine, temperature sensing and hybrid control'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'Renault provides a VIN-specific recall checker but not the frozen population detail on the cited page.', 'Press and community material cannot independently prove the exact indexed build window, count or repair outcome.'],
    conflict: 'The indexed identity embeds a precise vehicle count, production range and internal remedy without an exact primary campaign file.',
    summary: 'Held the E-Tech seal campaign identity and directed owners to VIN-specific Renault confirmation without repeating unverified counts or costs.',
  }),
  [ids.edcShudder]: held({
    description: 'The frozen page applies one 2013-2026 identity to multiple Captur generations and describes the Getrag 6DCT250/DC4 as a wet dual-clutch unit; the 6DCT250/DC4 application is a dry-clutch architecture, while later vehicles can use different transmissions. No exact Renault communication reviewed here supports the 50,000-80,000 km onset, 85-owner total, universal oil-degradation mechanism, software history or repair price.',
    solution: 'Identify the transmission by VIN and gearbox code, record fault codes and adaptation values, reproduce the complaint under controlled conditions, and inspect engine mounts, clutch condition, actuator/mechatronic operation and software level using the correct Renault procedure. Do not perform a generic fluid service or adaptation reset on an unidentified unit. Do not buy a clutch pack, actuator, control unit or fluid from this page; gearbox identity, diagnosis and VIN fitment must be established first.',
    symptoms: ['gearbox code identified', 'faults and adaptation values recorded', 'clutch, actuator, mount and software paths separated'],
    systems: ['EDC clutch assembly', 'actuators and transmission control', 'mounts and driveline engagement'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'The frozen wet-clutch description is mechanically incorrect for 6DCT250/DC4.', 'A forum home page does not support the all-generation scope, mileage, 85-owner count or repair price.'],
    conflict: 'The indexed identity contains a transmission-architecture error and spans incompatible generations under fabricated social proof.',
    summary: 'Held the all-generation EDC identity, corrected the wet-clutch error and reduced the unsupported 85-owner total to unknown.',
  }),
  [ids.parkingBrake]: held({
    description: 'Secondary recall reporting attributes a 2024-2025 Captur parking-brake actuator sensor condition to Safety Gate reference SR/03262/25, but an exact official alert record was not retrievable in the reviewed evidence. The frozen page additionally asserts every trigger condition, backup-function availability and a prescribed correction. Renault campaign eligibility is VIN-specific; those details cannot be promoted from secondary summaries alone.',
    solution: 'If the parking-brake warning is present or the vehicle does not remain secured, keep people clear of its path, use the transmission and wheel restraints appropriate to the owner manual, and contact Renault before further use. Check the VIN in Renault’s official campaign system and have the actuator and control status diagnosed under the applicable campaign instructions. Do not buy an actuator, sensor or software service from this page; campaign eligibility and the VIN-specific correction must be confirmed first.',
    symptoms: ['VIN campaign status checked', 'parking-brake application confirmed before leaving vehicle', 'warning and actuator status diagnosed by Renault'],
    systems: ['electronic parking-brake actuator', 'position sensing and control logic', 'vehicle hold and park interlocks'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'The exact Safety Gate record was not available in the verified primary corpus.', 'Secondary summaries do not prove every frozen trigger, fallback and remedy detail.'],
    conflict: 'The indexed identity treats a secondary recall summary as an exact primary campaign file and universal remedy.',
    summary: 'Held the parking-brake recall identity while preserving rollaway safety guidance and VIN-specific Renault verification.',
  }),
  [ids.infotainment]: held({
    description: 'The frozen page combines Media Nav and Easy Link freezes, Bluetooth drops, lag, navigation crashes and update-related complaints across 2019-2026, including multiple Captur generations and hardware/software versions. A Renault forum home page does not establish a common defect, an Iconic-only population or the frozen total of 55 owner reports.',
    solution: 'Record the exact head-unit version, software build, connected phone and failure conditions; preserve navigation and pairing settings, test without accessories, and follow Renault’s VIN- and unit-specific reset or update instructions. Replace hardware only after power, network, software and peripheral causes are separated. Do not buy a head unit, display or update service from this page; unit identity, diagnosis, coding and VIN fitment must be established first.',
    symptoms: ['head-unit and software version recorded', 'phone and peripheral effects isolated', 'power, network and software paths tested before replacement'],
    systems: ['Media Nav and Easy Link hardware', 'Bluetooth, navigation and connected devices', 'vehicle network, power and software'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'Media Nav and Easy Link are not one system identity.', 'The forum home page does not support the eight-year scope, Iconic trim or 55-owner total.'],
    conflict: 'The indexed identity merges different infotainment systems and generations under unsupported social proof.',
    summary: 'Held the broad infotainment identity and reduced the unsupported 55-owner total to unknown while requiring unit-specific diagnosis.',
  }),
  [ids.turbo]: held({
    description: 'The frozen page combines 0.9 TCe and 1.3 TCe engines across 2013-2026 and attributes rattle, flutter, oil consumption and blue smoke to wastegate-arm play and turbo oil-seal leakage. Those symptoms have several possible causes, the engines and turbocharger applications differ, and a Renault forum home page does not establish a common 14-year defect or the frozen 50-owner total.',
    solution: 'Identify the engine and turbocharger by VIN, record boost and wastegate control data, inspect intake and charge-air leaks, crankcase ventilation, oil supply/return, shaft condition and exhaust smoke pattern before condemning the turbocharger. Stop if oil ingestion, runaway risk or severe power loss is suspected. Do not buy a wastegate actuator, rebuild kit or turbocharger from this page; the failed path, engine code and VIN fitment must be established first.',
    symptoms: ['engine and turbocharger identity verified', 'boost control and charge-air leaks tested', 'oil, crankcase and shaft paths separated'],
    systems: ['turbocharger and wastegate control', 'charge-air intake and boost sensing', 'engine oil supply, return and crankcase ventilation'],
    evidence: ['The complete NHTSA corpus contains zero Renault Captur rows.', 'The frozen engines do not share one universal turbocharger identity.', 'The forum home page does not support the 14-year scope, mechanisms or 50-owner total.'],
    conflict: 'The indexed identity merges different engine generations and symptoms under unsupported mechanism and social-proof claims.',
    summary: 'Held the all-generation turbo identity and reduced the unsupported 50-owner total to unknown while separating boost and oil diagnosis.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault',
  model: 'Captur',
  slug: 'captur',
  reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-captur-adjudication-2026-08-11.json',
  ids,
  allIds,
  retainedIds,
  reportCountCleanupIds,
  sourceMakes: ['RENAULT'],
  modelAliases: ['CAPTUR'],
  searchTerms: ['timing chain', 'oil consumption', 'DPF', 'EGR', 'AdBlue', 'water ingress', 'gearbox', 'EDC', 'parking brake', 'infotainment', 'turbo'],
  relevantDocumentIds: [],
  campaigns: [],
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0,
    relevantRowCount: 0,
    uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT CAPTUR rows; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 0 },
    totalRows: 0,
    campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT CAPTUR rows; owners must use Renault’s official VIN recall checker for market-specific campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.edcShudder, field: 'description', patterns: ['dry-clutch architecture', '85-owner total'] },
    { id: ids.hybridGearboxSeal, field: 'description', patterns: ['155,825-vehicle population', 'VIN-specific'] },
    { id: ids.dieselEmissions, field: 'description', patterns: ['AdBlue/SCR equipment is not present', 'separate diagnostic paths'] },
    { id: ids.infotainment, field: 'description', patterns: ['Media Nav and Easy Link', '55 owner reports'] },
    { id: ids.turbo, field: 'description', patterns: ['0.9 TCe and 1.3 TCe', '50-owner total'] },
  ],
  observations: [
    { code: 'all-nine-held', severity: 'identity-safety', recordIds: allIds, detail: 'All nine Captur pages remain published but exceed exact primary evidence.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT CAPTUR rows; the geographic limitation is explicit.' },
    { code: 'transmission-architecture-corrected', severity: 'technical-accuracy', recordIds: [ids.edcShudder], detail: 'The frozen 6DCT250/DC4 wet-clutch statement is corrected; the all-generation identity remains held.' },
    { code: 'emissions-generations-separated', severity: 'technical-accuracy', recordIds: [ids.dieselEmissions], detail: 'DPF, EGR and later SCR/AdBlue paths are not treated as one defect.' },
    { code: 'recall-claims-vin-bounded', severity: 'source-integrity', recordIds: [ids.hybridGearboxSeal, ids.parkingBrake], detail: 'Secondary recall summaries do not replace Renault VIN-specific campaign confirmation.' },
    { code: 'unsupported-owner-counts-removed', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'The unsupported 85, 55 and 50 owner totals are reduced to unknown.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
