/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  wetBelt: 'opel-mokka-1-2-puretech-wet-timing-belt-degradation-failure',
  timingChain: 'opel-mokka-1-4-turbo-timing-chain-stretch-cold-start-rattle',
  egr: 'opel-mokka-1-6-cdti-egr-valve-cooler-carbon-clogging',
  waterPump: 'opel-mokka-a-1.7-cdti-water-pump',
  ac: 'opel-mokka-air-conditioning-condenser-leak-compressor-failure',
  dpf: 'opel-mokka-diesel-particulate-filter-clogging-failed-regeneration',
  dmf: 'opel-mokka-dual-mass-flywheel-rattle-clutch-judder',
  ev12v: 'opel-mokka-e-12v-battery-drain',
  charger: 'opel-mokka-mokka-e-onboard-ac-charger-failure',
  ice12v: 'opel-mokka-start-stop-system-malfunction-12v-battery-parasitic-drain',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);
function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'], commerceDecision }) {
  return Object.freeze({ description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations, commerceDecision: commerceDecision || 'failure path, equipment, component and VIN fitment remain unresolved; no universal retail part' });
}

const content = Object.freeze({
  [ids.wetBelt]: held({
    description: 'Stellantis officially recognizes excessive oil consumption and premature timing-belt degradation on previous generations of PureTech 1.0 and 1.2 engines, with conditional coverage up to 10 years or 112,000 miles. That announcement does not identify every 2021-2025 Mokka B, prove the frozen EB2/EB2ADTS equipment scope, or support the complete fuel-dilution, oil-starvation and engine-destruction sequence for this model population.',
    solution: 'Identify the exact engine generation and timing-drive design from the VIN and current Opel/Vauxhall service information. Follow the specified oil and maintenance plan, document oil consumption, any warning or visible belt concern, and ask an authorized repairer to assess Stellantis support eligibility before work. Stop driving if an oil-pressure warning appears. Do not buy a belt kit, tensioner, strainer or engine from this page; generation, diagnosis and VIN fitment must be established first.',
    symptoms: ['engine generation and timing drive verified', 'oil-pressure warning treated as a stop condition', 'maintenance history retained for support eligibility'], systems: ['PureTech timing drive', 'engine lubrication and oil pickup', 'VIN-gated support eligibility'],
    evidence: ['Stellantis recognizes previous-generation PureTech timing-belt degradation.', 'The official policy is conditional and extends to 10 years or 112,000 miles.', 'The announcement does not map affected generations to every frozen Mokka year.'],
    conflict: 'The indexed identity maps family-level evidence and a complete failure sequence to every 2021-2025 Mokka B without exact generation proof.', summary: 'Held the overbroad Mokka B wet-belt identity while preserving the official Stellantis support boundary.', citations: ['stellantisPuretech'],
  }),
  [ids.timingChain]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication in the reviewed corpus establishes a 2013-2019 A14NET/B14NET Mokka timing-chain-stretch population, an 80,000-100,000-km onset or short-trip acceleration of wear. The frozen page relies on owner and repair-site reports and bundles timing-chain work with turbo and water-pump replacement without showing a common failure path.',
    solution: 'Record cold-start noise duration, oil level/specification, service history, DTCs and measured cam/crank correlation, then localize accessory, valvetrain and timing-drive noise under exact engine service information. Inspect turbo and water pump only on their own evidence. Do not buy a chain kit, sprockets, turbo or water pump from this page; the failure path and exact VIN fitment must be established first.',
    symptoms: ['cold-start noise timed and localized', 'oil and service history recorded', 'turbo and water-pump conditions kept separate'], systems: ['1.4 turbo timing drive', 'cam/crank timing control', 'separate turbo and cooling systems'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'No exact source supports the frozen mileage or use-pattern claims.', 'Timing-chain service does not justify automatic turbo or water-pump work.'], conflict: 'The indexed identity turns secondary reports into a seven-year timing-chain population and bundles unrelated components.', summary: 'Held the timing-chain identity and removed mileage and unrelated turbo/water-pump replacement advice.',
  }),
  [ids.egr]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2015-2019 B16DTH/B16DTU Mokka population with EGR valve, cooler and intake carbon clogging. The frozen page also adds a snapped bypass-flap spindle and MAF/MAP faults to P0401 without proving one mechanism or common repair.',
    solution: 'Record DTCs and operating conditions; compare commanded and measured EGR, air mass, boost, coolant loss, vacuum supply and DPF state under exact engine-code service information. Diagnose valve flow, cooler restriction/leakage, bypass actuator, sensors and intake deposits separately. Retain emissions equipment. Do not buy an EGR valve, cooler, actuator or sensor from this page; the failed path and exact fitment must be established first.',
    symptoms: ['P0401 diagnosed with measured EGR flow', 'cooler and bypass actuator evaluated separately', 'MAF/MAP and DPF paths kept distinct'], systems: ['EGR valve and cooler', 'bypass actuator and vacuum control', 'MAF/MAP, intake and DPF'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'Forum reports do not establish one EGR population.', 'P0401 cannot identify valve, cooler, actuator and sensors as one fault.'], conflict: 'The indexed identity combines several emissions and sensor paths into one model-wide defect.', summary: 'Held the conflated EGR identity and replaced cleaning/replacement advice with measured path-specific diagnosis.',
  }),
  [ids.waterPump]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or service source in the reviewed corpus establishes a 2012-2019 A17DTS water-pump seizure population, the frozen 80,000-130,000-km range, pump-driven belt ejection or failure before the official interval. The page gives a universal early kit replacement and guaranteed head-damage cost without exact VIN service evidence.',
    solution: 'Verify the exact engine code, timing-drive layout and current belt/water-pump service procedure by VIN. Investigate coolant loss, pump play or timing-area noise promptly. If timing is suspected lost, stop cranking and assess valve-train and piston contact. Do not buy a belt kit, water pump, cylinder head or engine from this page; interval, failure path and fitment must be established first.',
    symptoms: ['engine code and drive layout verified', 'coolant loss and pump condition inspected', 'engine not cranked after suspected timing loss'], systems: ['1.7 CDTI water pump', 'timing belt and tensioners', 'valvetrain and cooling circuit'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'No exact source supports the frozen mileage range or pre-interval frequency.', 'Cost and guaranteed damage claims are unsupported.'], conflict: 'The indexed identity applies an uncited pump/belt failure sequence and shortened replacement policy across eight years.', summary: 'Held the water-pump/timing-belt identity and removed mileage, cost and automatic kit claims.',
  }),
  [ids.ac]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2014-2019 Mokka air-conditioning population, low-mileage frequency or special 2018-build exposure. The frozen page combines condenser impact/corrosion, expansion valve and compressor failure, then infers an active leak from repeated regassing without identifying refrigerant, equipment or the leak.',
    solution: 'Have a qualified refrigerant technician identify the refrigerant and leak-test the system with an approved method, then inspect condenser, hoses, seals, valve and compressor separately. Repair the verified leak, evacuate and recharge to the exact specification. Do not vent refrigerant. Do not buy a condenser, expansion valve, compressor or receiver/drier from this page; failed component and VIN fitment must be established first.',
    symptoms: ['refrigerant and charge state identified', 'leak localized before replacement', 'condenser, valve and compressor paths separated'], systems: ['air-conditioning condenser and lines', 'expansion valve and evaporator circuit', 'compressor and refrigerant charge'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'Secondary sites do not establish a model-wide or 2018-specific population.', 'Repeated loss of cooling does not identify which component failed.'], conflict: 'The indexed identity merges several HVAC components and a build-year claim without exact evidence.', summary: 'Held the conflated HVAC identity and removed automatic receiver/drier and parts replacement advice.',
  }),
  [ids.dpf]: held({
    description: 'Short-trip use can inhibit diesel regeneration, but the frozen page turns that operating condition into a 2013-2019 two-engine Mokka defect with a 30,000-50,000-km onset. It combines DPF soot loading with EGR, injector and sensor faults and recommends motorway driving, forced static regeneration, cleaning or replacement without measured loading or safety boundaries.',
    solution: 'Follow the exact owner-manual warning and regeneration guidance. Record DTCs, soot load, differential pressure and exhaust temperature, and diagnose EGR, injector and sensor causes separately. Do not perform a forced regeneration where overheating or fire risk is present. Do not buy a DPF, EGR valve, injector or sensor from this page; loading, failed path and exact engine/VIN fitment must be established first.',
    symptoms: ['soot load and differential pressure measured', 'EGR, injector and sensor faults separated', 'regeneration limited by documented safety conditions'], systems: ['DPF and pressure sensing', 'regeneration and exhaust-temperature controls', 'EGR and fueling contributors'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'No exact source supports the frozen mileage onset.', 'A universal driving or forced-regeneration remedy is not established.'], conflict: 'The indexed identity turns a use pattern into a two-engine defect and merges several causes and remedies.', summary: 'Held the generic DPF identity and replaced driving/forced-regeneration advice with measured, manual-bound diagnosis.',
  }),
  [ids.dmf]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2013-2019 manual-diesel dual-mass-flywheel population or common damper-spring failure. The frozen page combines bellhousing noise, clutch judder, pedal sticking and noisy starting, then prescribes flywheel, clutch and slave-cylinder replacement without proving which component failed.',
    solution: 'Reproduce noise by engine temperature, clutch-pedal position, gear and load; inspect mounts, release system, clutch, gearbox and flywheel free play under exact engine/transmission service information. Do not operate a vehicle with severe vibration or loss of clutch control. Do not buy a flywheel, clutch kit or slave cylinder from this page; diagnosis and exact VIN fitment must be established first.',
    symptoms: ['noise correlated with clutch position and load', 'release system and gearbox causes separated', 'flywheel play measured before replacement'], systems: ['dual-mass flywheel', 'clutch and release system', 'gearbox input and engine mounts'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'Forum and repair articles do not establish a model-wide population.', 'Bellhousing symptoms do not prove all three replacement parts.'], conflict: 'The indexed identity combines several driveline symptoms and a three-part replacement bundle without exact evidence.', summary: 'Held the DMF/clutch identity and removed automatic clutch/slave-cylinder replacement advice.',
  }),
  [ids.ev12v]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2020-2024 Mokka-e 12-volt drain population, a three-to-five-day depletion rate or MyOpel polling as a cause. The frozen page transfers behavior from Corsa-e, e-208 and DS 3, claims multiple Stellantis updates and cites a 13,507-vehicle German recall without an exact campaign record.',
    solution: 'Record parking duration, state of charge, 12-volt voltage and current draw; check battery health, charging strategy, software level and modules that remain awake using EV-qualified service information. Use only manufacturer-approved storage and support procedures. Do not disable connected services or attach a maintainer from this page. Do not buy or code a battery here; cause, specification and VIN campaign status must be established first.',
    symptoms: ['parking duration and voltage recorded', 'battery health and parasitic draw measured', 'cross-platform and app-polling claims not assumed'], systems: ['12-volt auxiliary battery', 'DC/DC charging and sleep strategy', 'connected services and vehicle modules'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'No exact source supports the drain rate, app cause or recall population.', 'Platform siblings do not prove Mokka-e behavior.'], conflict: 'The indexed identity imports cross-platform anecdotes and an unverified recall into a five-year Mokka-e drain defect.', summary: 'Held the unsupported EV 12-volt-drain identity and removed app, maintainer, price and coding prescriptions.', citations: ['datasets', 'vauxhallRecallCheck'],
  }),
  [ids.charger]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2021-2024 Mokka-e Mahle 11-kW on-board-charger failure population, that every vehicle has the named unit, or a 2021-2022 concentration. Forum reports of AC charging failure and continuing DC charging do not prove one module fault, warranty coverage or a EUR 2,000 replacement cost.',
    solution: 'Record charge point, cable, phase, current, warning and DTCs; test more than one known-good compatible AC source where safe, then have an EV-qualified repairer isolate inlet, cable, EVSE communication, on-board charger, cooling and vehicle software. Do not reduce current or rely on repeated DC charging as a workaround from this page. Do not buy an 11-kW charger from this page; installed equipment, failed path and VIN fitment must be established first.',
    symptoms: ['AC source and cable ruled out', 'AC and DC behavior recorded without assuming OBC failure', 'charger equipment verified by VIN'], systems: ['charge inlet and EVSE communication', 'on-board AC charger and cooling', 'high-voltage battery charging controls'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'Forum reports do not prove a Mahle 11-kW population.', 'Warranty, year concentration, cost and workaround claims are unsupported.'], conflict: 'The indexed identity assigns one supplier module and workaround to every 2021-2024 Mokka-e without exact equipment evidence.', summary: 'Held the unsupported on-board-charger identity and removed current-reduction, DC-workaround, warranty and cost claims.',
  }),
  [ids.ice12v]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2013-2020 combustion Mokka population with parasitic drain and start-stop failure, a one-to-two-week depletion period or an 11.6-volt disable threshold. The frozen page groups ordinary battery wear, alternator output, battery management, module wakefulness and lost learned values into one defect across petrol and diesel vehicles.',
    solution: 'Measure battery state of health, resting voltage, charging output and key-off current after the documented sleep period; identify the circuit or module before replacement. Verify the exact battery type and whether registration/coding is required by VIN. Do not buy an AGM/EFB battery, alternator or module from this page; the failed path, specification and programming requirement must be established first.',
    symptoms: ['battery health and charging output measured', 'parasitic draw tested after documented sleep', 'battery type and coding requirement verified'], systems: ['12-volt battery and battery management', 'alternator and charging control', 'module sleep and parasitic draw'],
    evidence: ['The reviewed primary corpus contains zero Opel/Vauxhall Mokka rows.', 'No exact source supports the frozen voltage or parking-duration thresholds.', 'Battery wear, charging and parasitic drain are distinct paths.'], conflict: 'The indexed identity combines several normal and abnormal electrical paths across two engines and eight years.', summary: 'Held the generic ICE start-stop/battery identity and removed voltage threshold, battery coding and parts-first assumptions.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  vauxhallRecallCheck: { title: 'Vauxhall Official Vehicle Recall Check', type: 'manufacturer', url: 'https://www.vauxhall.co.uk/owners/maintenance-and-repair/vehicle-recall-check.html', contains: 'Check safety recall campaigns for MY vehicle' },
  stellantisPuretech: { title: 'Stellantis PureTech 1.0 and 1.2 Extended Support Policy', type: 'manufacturer', url: 'https://www.media.stellantis.com/uk-en/vauxhall/press/stellantis-extends-compensation-policy-for-european-consumers-claims-on-previous-generations-of-puretech-1-0-and-1-2-engines', contains: 'premature degradation of the timing belt' },
});
module.exports = Object.freeze({
  make: 'Opel', model: 'Mokka', slug: 'mokka', reviewDate: '2026-08-10', snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-opel-mokka-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds, sourceMakes: ['OPEL', 'VAUXHALL'], modelAliases: ['MOKKA', 'MOKKA X', 'MOKKA-E', 'MOKKA E'],
  searchTerms: ['PureTech', 'timing belt', 'timing chain', 'EGR', 'water pump', 'air conditioning', 'DPF', 'flywheel', '12V', 'battery', 'charger', 'charging', 'start-stop'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communication corpus contains zero OPEL or VAUXHALL MOKKA/MOKKA X/MOKKA-E rows; this is a disclosed U.S.-corpus limitation.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL MOKKA variants; secondary European recall claims remain held until exact campaign records are available.' },
  content,
  requiredProse: [
    { id: ids.wetBelt, field: 'description', patterns: ['does not identify every 2021-2025 Mokka B', 'complete fuel-dilution, oil-starvation'] },
    { id: ids.timingChain, field: 'description', patterns: ['bundles timing-chain work with turbo and water-pump', 'short-trip acceleration'] },
    { id: ids.egr, field: 'description', patterns: ['snapped bypass-flap spindle', 'MAF/MAP faults'] },
    { id: ids.waterPump, field: 'solution', patterns: ['stop cranking', 'Do not buy a belt kit'] },
    { id: ids.ac, field: 'solution', patterns: ['Do not vent refrigerant', 'qualified refrigerant technician'] },
    { id: ids.dpf, field: 'solution', patterns: ['Do not perform a forced regeneration', 'exact owner-manual'] },
    { id: ids.dmf, field: 'description', patterns: ['clutch judder, pedal sticking and noisy starting', 'prescribes flywheel, clutch and slave-cylinder'] },
    { id: ids.ev12v, field: 'description', patterns: ['three-to-five-day depletion rate', '13,507-vehicle German recall'] },
    { id: ids.charger, field: 'solution', patterns: ['Do not reduce current', 'repeated DC charging'] },
    { id: ids.ice12v, field: 'description', patterns: ['11.6-volt disable threshold', 'ordinary battery wear, alternator output'] },
  ],
  observations: [
    { code: 'all-ten-held', severity: 'identity-safety', recordIds: allIds, detail: 'All ten Mokka pages remain published, but every identity exceeds exact evidence or merges distinct paths.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero OPEL/VAUXHALL MOKKA variant rows; the geographic limit is disclosed.' },
    { code: 'puretech-family-not-mokka-population', severity: 'technical-accuracy', recordIds: [ids.wetBelt], detail: 'Stellantis family evidence does not map every 2021-2025 Mokka B or the complete frozen failure sequence.' },
    { code: 'timing-chain-parts-bundle', severity: 'technical-accuracy', recordIds: [ids.timingChain], detail: 'Timing-chain work does not justify bundled turbo/water-pump replacement.' },
    { code: 'egr-multiple-paths', severity: 'technical-accuracy', recordIds: [ids.egr], detail: 'Valve, cooler, bypass actuator, sensors, intake and DPF are separate diagnostic paths.' },
    { code: 'water-pump-interval-unverified', severity: 'technical-accuracy', recordIds: [ids.waterPump], detail: 'No exact source proves the frozen mileage, early kit policy or guaranteed engine damage.' },
    { code: 'hvac-components-conflated', severity: 'technical-accuracy', recordIds: [ids.ac], detail: 'Condenser, valve and compressor paths and a 2018 build claim are merged without exact evidence.' },
    { code: 'dpf-regeneration-safety', severity: 'safety-accuracy', recordIds: [ids.dpf], detail: 'Motorway and forced-regeneration recipes are removed without measured soot loading and safety limits.' },
    { code: 'dmf-repair-bundle', severity: 'commerce-safety', recordIds: [ids.dmf], detail: 'Bellhousing symptoms do not prove a flywheel/clutch/slave-cylinder replacement bundle.' },
    { code: 'ev12v-cross-platform-transfer', severity: 'technical-accuracy', recordIds: [ids.ev12v], detail: 'Corsa/e-208/DS3 behavior, MyOpel polling and a recall count are transferred without exact Mokka evidence.' },
    { code: 'charger-supplier-unverified', severity: 'commerce-safety', recordIds: [ids.charger], detail: 'Mahle 11-kW fitment, year concentration, warranty and price are not proven for every Mokka-e.' },
    { code: 'charger-workaround-removed', severity: 'safety-accuracy', recordIds: [ids.charger], detail: 'Current reduction and repeated DC charging are not prescribed as unverified workarounds.' },
    { code: 'ice12v-paths-conflated', severity: 'technical-accuracy', recordIds: [ids.ice12v], detail: 'Battery wear, alternator, management and parasitic draw are separate paths; 11.6V is not treated as universal.' },
    { code: 'no-commerce-or-social-proof', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; all indexed identity and routing fields stay preserved.' },
  ],
});
