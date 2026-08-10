/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  timingChain: 'opel-astra-1.4-turbo-timing-chain',
  ignitionBarrel: 'opel-astra-astra-h-ignition-barrel-steering-column-lock-jamming',
  parkingBrake: 'opel-astra-astra-j-electronic-parking-brake-faults-hill-start-assist-ro',
  egrCooler: 'opel-astra-astra-k-1-6-cdti-whisper-diesel-egr-cooler-internal-leak-dpf',
  brakeRecall: 'opel-astra-astra-k-1-6-diesel-brake-fluid-contamination-recall-reduced',
  wetBelt: 'opel-astra-astra-l-1-2-turbo-wet-timing-belt-premature-degradation',
  rearAxle: 'opel-astra-h-rear-axle-corrosion',
  waterPump: 'opel-astra-h-water-pump-z16xep',
  egrValve: 'opel-astra-j-1.7-cdti-egr-clog',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'], commerceDecision }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: commerceDecision || 'failure path, component, engine applicability and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.timingChain]: held({
    description: 'The complete U.S. NHTSA manufacturer-communication and recall corpus contains no Opel or Vauxhall Astra records, so it cannot establish a 2009-2018 A14NET/A14NEL timing-chain-stretch population, a mileage threshold or the frozen bulletin reference. The indexed page also spans Astra J and K years without exact manufacturer evidence tying one mechanism and remedy to every listed vehicle.',
    solution: 'Document cold-start noise, oil level and specification, service history, DTCs and measured cam/crank correlation, then use current Opel/Vauxhall service information for the exact VIN and engine code. Separate timing-drive diagnosis from flywheel, accessory-drive and other noise sources before opening the engine. Do not buy a chain kit, tensioner or flywheel from this page; the failure path, engine variant and exact fitment must be established first.',
    symptoms: ['cold-start noise localized before timing diagnosis', 'oil condition and service history recorded', 'cam/crank correlation and DTCs measured'],
    systems: ['A14NET/A14NEL timing drive', 'engine lubrication and cam timing control', 'flywheel and accessory-drive noise sources'],
    evidence: ['The reviewed NHTSA corpus contains zero Opel/Vauxhall Astra communications or recalls.', 'No exact manufacturer source verifies the frozen bulletin number, mileage range or two-generation population.', 'The frozen page mixes timing-chain and dual-mass-flywheel diagnosis.'],
    conflict: 'The indexed identity asserts a ten-year, two-generation timing-chain defect without exact manufacturer or regulator evidence.',
    summary: 'Held the unsupported broad timing-chain identity and replaced parts advice with VIN- and engine-specific diagnosis.',
  }),
  [ids.ignitionBarrel]: held({
    description: 'No Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2004-2010 Astra H ignition-barrel or steering-column-lock defect population. The frozen page relies on forum and locksmith accounts, combines the key, barrel, mechanical lock and CIM into one failure, and does not establish which component is at fault for a given vehicle.',
    solution: 'Do not force the key or steering wheel. Try the documented spare key, note steering-load and temperature conditions, and have a qualified repairer inspect key wear, barrel operation, mechanical lock engagement, battery voltage and immobilizer/CIM faults using exact VIN service information. Do not spray an unspecified lubricant. Do not buy a barrel, lock or CIM from this page; the failed component and coding requirements must be established first.',
    symptoms: ['key rotation and steering load documented', 'spare key compared before dismantling', 'mechanical lock and immobilizer faults separated'],
    systems: ['ignition key and barrel', 'steering-column lock', 'CIM and immobilizer electronics'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Astra records.', 'Forum and locksmith reports do not establish one model-wide failure population.', 'The frozen page merges mechanically and electronically distinct causes.'],
    conflict: 'The indexed identity combines several possible key and column-lock faults without exact primary evidence or a bounded production population.',
    summary: 'Held the unsupported ignition-lock identity and removed unverified lubricant and component-replacement advice.',
  }),
  [ids.parkingBrake]: held({
    description: 'The reviewed primary corpus contains no exact Opel/Vauxhall Astra communication or recall supporting the frozen 15-R-058 label. The page combines hill-start-assist rollback with unrelated electronic parking-brake switch, actuator, caliper, cable and module faults, so neither one population nor one remedy is established by the cited secondary material.',
    solution: 'If the vehicle may roll, stop in a safe place, keep the service brake applied, select a secure gear or Park, and use wheel chocks when appropriate. Record warning messages and DTCs and have an Opel/Vauxhall repairer verify VIN recall status and diagnose the hill-start and parking-brake systems separately. Do not buy a switch, actuator, caliper, cable or module from this page; the exact campaign status and failed component must be established first.',
    symptoms: ['rollback condition separated from parking-brake malfunction', 'warning messages and DTCs recorded', 'VIN recall status checked before repair'],
    systems: ['hill-start assist', 'electronic parking brake control and switch', 'rear brake actuators, calipers and cables'],
    evidence: ['The reviewed NHTSA corpus contains zero Opel/Vauxhall Astra records.', 'No exact primary source in the packet verifies 15-R-058 or its population.', 'The frozen article merges a software recall claim with multiple hardware failure paths.'],
    conflict: 'The indexed identity conflates a claimed hill-start recall with several unrelated parking-brake faults and remedies.',
    summary: 'Held the conflated parking-brake and hill-start identity pending exact campaign evidence and identity policy.',
  }),
  [ids.egrCooler]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2015-2019 Astra K 1.6 CDTI population with an internally cracked EGR-cooler sleeve. The frozen page also combines coolant loss, P0401, DPF loading and injector correction into one defect and links those conditions to an emissions update without primary causal evidence.',
    solution: 'For coolant loss, white exhaust smoke, emissions faults or rough running, record DTCs and operating conditions, pressure-test the cooling circuit, and inspect the EGR circuit, intake, DPF loading and injector corrections as separate diagnostic paths under exact engine-code service information. Do not buy an EGR sleeve, cooler, valve, DPF or injector from this page; the failed path and VIN/engine fitment must be established first.',
    symptoms: ['coolant loss verified by pressure testing', 'EGR-flow and DPF conditions diagnosed separately', 'injector corrections treated as a separate path'],
    systems: ['1.6 CDTI cooling and EGR circuits', 'DPF and emissions controls', 'fuel injection and intake system'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Astra records.', 'No exact primary source supports the sleeve-only mechanism or frozen repair pricing.', 'No exact source establishes that an emissions update caused the combined failures.'],
    conflict: 'The indexed identity merges four distinct failure paths and a software-update causal claim without exact primary evidence.',
    summary: 'Held the conflated EGR-cooler, DPF and injector identity and removed sleeve-level shopping advice.',
  }),
  [ids.brakeRecall]: held({
    description: 'Vauxhall officially identifies recall 18-C-120 (E1811803130) for Astra K diesel models with manual transmission, describing isolated extended pedal travel and reduced braking when the pedal is applied slowly and constantly. The official page limits the condition to model years 2016-2018, while the frozen indexed years include 2015, and it does not state the frozen slave-cylinder-seal mechanism, exact build dates or vehicle count. General and emergency braking are described as operating as designed.',
    solution: 'Check the VIN or registration for recall 18-C-120 and contact an authorized Opel/Vauxhall repairer. Vauxhall specifies an immediate braking-system check and hydraulic-fluid replacement, followed by replacement of affected components when required; both steps are free. If pedal response feels abnormal, follow the manufacturer instruction to release and reapply the pedal firmly and arrange prompt inspection. Do not buy hydraulic or brake components from this page; VIN eligibility and the authorized recall procedure govern the remedy.',
    symptoms: ['extended pedal travel under slow constant application', 'reduced braking under the exact documented condition', 'VIN and manual-transmission eligibility confirmed'],
    systems: ['brake hydraulic system', 'shared hydraulic fluid service', 'recall-controlled affected components'],
    evidence: ['The official Vauxhall page exactly identifies recall 18-C-120 and Astra K diesel manual vehicles.', 'Vauxhall states model years 2016-2018 and a two-step free remedy.', 'The official page does not state the frozen seal mechanism, build dates or population count.'],
    conflict: 'The exact recall is real, but the frozen indexed years include 2015 and its body adds an unsupported component mechanism, dates and population.',
    summary: 'Held the exact recall title because the frozen year scope overreaches; bounded the body to the official Vauxhall condition and remedy.',
    citations: ['vauxhallBrakeRecall'],
    commerceDecision: 'recall status and VIN eligibility govern a no-charge dealer remedy; no universal retail part',
  }),
  [ids.wetBelt]: held({
    description: 'Stellantis officially recognizes excessive oil consumption and premature timing-belt degradation on previous generations of PureTech 1.0 and 1.2 engines and describes conditional warranty coverage up to 10 years or 112,000 miles. That announcement does not identify the Astra L, establish that every frozen 2022-2024 vehicle uses the affected generation, confirm the frozen oil-strainer and engine-destruction sequence for this model, or support the claimed belt-to-chain change dates.',
    solution: 'Identify the exact engine generation and timing-drive design from the VIN and current Opel/Vauxhall service information. Follow the specified oil and maintenance plan, document any oil-pressure warning or visible belt concern, and ask an authorized repairer to assess eligibility under the Stellantis support programme before authorizing work. Stop driving if an oil-pressure warning appears. Do not buy a belt kit, chain kit, oil strainer or engine part from this page; generation, diagnosis and VIN fitment must be established first.',
    symptoms: ['engine generation and timing-drive design verified', 'oil-pressure warning treated as a stop condition', 'maintenance records retained for support eligibility'],
    systems: ['PureTech timing drive', 'engine oil and lubrication circuit', 'VIN-gated warranty and compensation eligibility'],
    evidence: ['Stellantis recognizes timing-belt degradation on previous PureTech generations.', 'The official policy is conditional and extends to 10 years or 112,000 miles.', 'The announcement does not map the affected generation or timing-drive change to the frozen Astra L years.'],
    conflict: 'The indexed identity maps a real family-level PureTech concern to every 2022-2024 Astra L and asserts unsupported production-change detail.',
    summary: 'Held the overbroad Astra L wet-belt identity while preserving the exact Stellantis support boundary.',
    citations: ['stellantisPuretech'],
  }),
  [ids.rearAxle]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes one 2004-2010 Astra H defect combining rear-axle-bush wear with structural suspension-mount corrosion. These are distinct inspection findings with different causes and repair decisions. The frozen reference to the U.S. Northeast is also an unsupported market transfer for this Opel/Vauxhall population.',
    solution: 'Have the rear axle, bushes, attachment points and surrounding body structure inspected separately on a lift, with corrosion cleaned enough to establish remaining metal and structural extent before repair. Do not rely on age alone or the frozen price ranges. Do not buy bushes, an axle or repair panels from this page; the failed location, corrosion extent and exact body/VIN fitment must be established first.',
    symptoms: ['bush movement measured separately from corrosion', 'mounting structure inspected on a lift', 'structural extent established before repair'],
    systems: ['rear axle and pivot bushes', 'suspension attachment points', 'rear body structure and corrosion protection'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Astra records.', 'No exact source supports one combined bush-and-corrosion defect population.', 'The frozen market, age and price claims are unsupported.'],
    conflict: 'The indexed identity merges wear and structural corrosion into one model-wide failure and imports an unsupported U.S. market claim.',
    summary: 'Held the conflated rear-axle and corrosion identity and removed unsupported market, age and price claims.',
  }),
  [ids.waterPump]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a common 2004-2010 water-pump failure across both Z16XEP and Z18XER engines, the frozen mileage range, a shared plastic-impeller mechanism or routine thermostat-housing co-failure. The two listed engines require engine-code-specific service information and must not be assigned one drive layout or bundled repair without verification.',
    solution: 'Pressure-test the cooling system, locate the leak or circulation fault, confirm the exact engine code and verify the pump drive and current service interval in Opel/Vauxhall service information. Inspect belts, tensioners and thermostat housing on their own evidence rather than replacing them automatically. Do not buy a pump, belt kit or thermostat housing from this page; the failed component, drive layout and exact engine/VIN fitment must be established first.',
    symptoms: ['coolant leak or circulation fault localized', 'engine code and pump drive verified', 'belt and thermostat findings kept separate'],
    systems: ['Z16XEP and Z18XER cooling systems', 'water-pump drive and belt hardware', 'thermostat housing and coolant circuit'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Astra records.', 'No exact source supports the frozen mileage or shared impeller mechanism.', 'The two engines cannot be assigned one universal service bundle without exact service information.'],
    conflict: 'The indexed identity combines two engines and several assumed co-failures without exact primary evidence.',
    summary: 'Held the unsupported cross-engine water-pump identity and replaced automatic bundled replacement with measured diagnosis.',
  }),
  [ids.egrValve]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2009-2015 A17DTR/A17DTS EGR-valve-clogging population or the frozen mileage range. The page also combines valve deposits with an EGR-cooler crack and presents intake cleaning as a general remedy without first establishing the fault path.',
    solution: 'Record DTCs, commanded and measured EGR operation, boost and air-mass data, coolant loss and DPF state, then use current service information for the exact engine code. Diagnose valve flow, cooler leakage, intake deposits and DPF loading separately, and retain emissions equipment. Do not buy an EGR valve, cooler, intake-cleaning service or DPF part from this page; the failed path and exact VIN/engine fitment must be established first.',
    symptoms: ['EGR command and measured flow compared', 'coolant loss separated from deposit faults', 'DPF loading evaluated as a separate condition'],
    systems: ['A17DTR/A17DTS EGR valve and cooler', 'intake air and boost measurement', 'DPF and emissions controls'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Astra records.', 'No exact source supports the frozen mileage range or common population.', 'Valve deposits, cooler leakage and DPF loading are distinct diagnostic paths.'],
    conflict: 'The indexed identity presents multiple emissions-system conditions as one model-wide EGR failure without exact primary evidence.',
    summary: 'Held the unsupported EGR identity and separated valve, cooler, intake and DPF diagnosis.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
  vauxhallBrakeRecall: {
    title: 'Vauxhall Astra K Diesel Recall 18-C-120 (E1811803130)',
    type: 'manufacturer',
    url: 'https://www.vauxhall.co.uk/content/vauxhall/worldwide/uk/en/index/astra-k-recall.html',
    contains: 'Reference Number 18-C-120',
  },
  stellantisPuretech: {
    title: 'Stellantis PureTech 1.0 and 1.2 Extended Support Policy',
    type: 'manufacturer',
    url: 'https://www.media.stellantis.com/uk-en/vauxhall/press/stellantis-extends-compensation-policy-for-european-consumers-claims-on-previous-generations-of-puretech-1-0-and-1-2-engines',
    contains: 'premature degradation of the timing belt',
  },
});

module.exports = Object.freeze({
  make: 'Opel', model: 'Astra', slug: 'astra', reviewDate: '2026-08-10',
  snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-opel-astra-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['OPEL', 'VAUXHALL'],
  modelAliases: ['ASTRA'],
  searchTerms: ['timing chain', 'ignition', 'steering lock', 'parking brake', 'hill start', 'EGR', 'cooler', 'DPF', 'brake', 'hydraulic', 'timing belt', 'PureTech', 'rear axle', 'corrosion', 'water pump'],
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
    scopeFinding: 'The complete NHTSA communication corpus contains zero OPEL or VAUXHALL ASTRA rows; this absence is a disclosed U.S.-corpus limitation, not proof that a non-U.S. condition does not exist.',
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 0 },
    totalRows: 0,
    campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL ASTRA rows. The exact Vauxhall 18-C-120 recall is therefore verified directly from Vauxhall rather than inferred from NHTSA absence.',
  },
  content,
  requiredProse: [
    { id: ids.timingChain, field: 'description', patterns: ['contains no Opel or Vauxhall Astra records', 'cannot establish a 2009-2018'] },
    { id: ids.ignitionBarrel, field: 'solution', patterns: ['Do not force the key', 'Do not spray an unspecified lubricant'] },
    { id: ids.parkingBrake, field: 'description', patterns: ['no exact.*15-R-058', 'combines hill-start-assist rollback'] },
    { id: ids.egrCooler, field: 'description', patterns: ['combines coolant loss, P0401, DPF loading and injector correction', 'without primary causal evidence'] },
    { id: ids.brakeRecall, field: 'description', patterns: ['model years 2016-2018', 'frozen indexed years include 2015', 'does not state the frozen slave-cylinder-seal mechanism'] },
    { id: ids.wetBelt, field: 'description', patterns: ['previous generations', 'does not identify the Astra L', 'claimed belt-to-chain change dates'] },
    { id: ids.rearAxle, field: 'description', patterns: ['distinct inspection findings', 'U.S. Northeast'] },
    { id: ids.waterPump, field: 'description', patterns: ['both Z16XEP and Z18XER', 'shared plastic-impeller mechanism'] },
    { id: ids.egrValve, field: 'description', patterns: ['combines valve deposits with an EGR-cooler crack', 'without first establishing the fault path'] },
  ],
  observations: [
    { code: 'all-nine-held', severity: 'identity-safety', recordIds: allIds, detail: 'Every Astra URL remains published, but no frozen indexed identity clears exact primary-source and vehicle-scope review.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero OPEL/VAUXHALL ASTRA rows; that U.S.-corpus limitation is disclosed rather than treated as proof of absence.' },
    { code: 'brake-recall-real-scope-conflict', severity: 'safety-accuracy', recordIds: [ids.brakeRecall], detail: '18-C-120 is exact, but Vauxhall says MY2016-2018 while the frozen indexed years include 2015.' },
    { code: 'brake-mechanism-not-on-official-page', severity: 'source-integrity', recordIds: [ids.brakeRecall], detail: 'The official recall page does not support the frozen slave-cylinder-seal mechanism, build dates or vehicle count.' },
    { code: 'puretech-family-not-astra-population', severity: 'technical-accuracy', recordIds: [ids.wetBelt], detail: 'Stellantis confirms prior-generation PureTech belt degradation but does not map the affected generation to every 2022-2024 Astra L.' },
    { code: 'hill-start-and-epb-conflated', severity: 'safety-accuracy', recordIds: [ids.parkingBrake], detail: 'The frozen page merges a claimed hill-start recall with switch, actuator, caliper, cable and module failure paths.' },
    { code: 'egr-cooler-dpf-injector-conflated', severity: 'technical-accuracy', recordIds: [ids.egrCooler], detail: 'Cooler leakage, EGR flow, DPF loading and injector correction cannot be one identity or universal remedy.' },
    { code: 'rear-axle-corrosion-conflated', severity: 'technical-accuracy', recordIds: [ids.rearAxle], detail: 'Bush wear and structural mount corrosion are distinct findings; the U.S. Northeast claim is an unsupported market transfer.' },
    { code: 'water-pump-engines-conflated', severity: 'technical-accuracy', recordIds: [ids.waterPump], detail: 'The page assigns common failure, drive and co-replacement assumptions across Z16XEP and Z18XER without exact service evidence.' },
    { code: 'egr-valve-cooler-dpf-separated', severity: 'technical-accuracy', recordIds: [ids.egrValve], detail: 'EGR valve flow, cooler leakage, intake deposits and DPF loading require separate diagnosis.' },
    { code: 'no-commerce-introduced', severity: 'commerce-safety', recordIds: allIds, detail: 'Every solution carries an explicit do-not-buy boundary; no retail link or universal part is introduced.' },
    { code: 'no-owner-social-proof', severity: 'social-proof-safety', recordIds: allIds, detail: 'All frozen report counts are already zero and the proposals preserve unknown rather than rendering 0+ owners.' },
    { code: 'all-astra-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Astra page is removed, archived, merged, redirected or allowed to lose its frozen title, URL identity or vehicle metadata.' },
  ],
});
