/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  automatic: 'nissan-maxima-4-speed-automatic-transmission-wear-failure',
  catalyst: 'nissan-maxima-catalytic-converter-2004',
  positionSensors: 'nissan-maxima-crank-cam-position-sensor-failure',
  cvtBelt: 'nissan-maxima-cvt-belt-slip-2009',
  cvtJudder: 'nissan-maxima-cvt-failure-2016',
  dashboard: 'nissan-maxima-dashboard-cracking-2004',
  distributor: 'nissan-maxima-distributor-oil-leak-cap-rotor-contamination',
  egr: 'nissan-maxima-egr-passage-egr-temperature-sensor-tube-carbon-clogging',
  mounts: 'nissan-maxima-engine-motor-mount-deterioration',
  coils: 'nissan-maxima-ignition-coil-2004',
  oilConsumption: 'nissan-maxima-oil-consumption-2016',
  injectors: 'nissan-maxima-repeated-fuel-injector-leaks-electrical-failure',
  steeringColumn: 'nissan-maxima-steering-column-clunk-2009',
  steeringRack: 'nissan-maxima-steering-rack-leak-2004',
  suspension: 'nissan-maxima-suspension-clunk-2016',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.cvtJudder].sort());
const reportCountCleanupIds = Object.freeze([ids.cvtJudder, ids.oilConsumption, ids.suspension].sort());
const relevantDocumentIds = Object.freeze([
  '10004603', '10009952', '10015840', '10020932', '10030089', '10043773',
  '10043774', '10055044', '10091528', '10109202', '10109243', '10119190',
  '10119195', '10120556', '10123353', '10123354', '10133202', '10133203',
  '10162974', '10167364', '10167365', '10170013', '10173584', '10173604',
  '10173605', '10176207', '10176227', '10179618', '10180992', '10185451',
  '10188363', '10192142', '10192440', '10192471', '10192524', '10192793',
  '10192816', '10192855', '10194180', '10194181', '10206372', '10211993',
  '10218743', '10237565', '10248651', '11001202', '54261', '600358',
  '601881', '609965', '613978', '623760', '623993', '627437', '628197',
]);
const campaigns = Object.freeze([
  '02V010000', '02V043000', '02V146000', '02V171000', '03V455000',
  '04V326000', '05V338000', '05V512000', '06E026000', '06E049000',
  '06V046000', '06V402000', '08E050000', '09E012000', '09E025000',
  '09V358000', '15V287000', '15V486000', '15V733000', '16V193000',
  '16V244000', '16V636000', '16V911000', '18V601000', '19V654000',
  '19V807000', '20V008000', '20V570000', '22E066000', '86V096000',
  '94V007000', '94V194000', '95I006000', '95V244000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}
function retained({ description, solution, symptoms, systems, evidence, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, summary, citations,
    commerceDecision: 'exact manufacturer evidence governs diagnosis and repair; no universal retail part should be purchased from this page',
  });
}

const content = Object.freeze({
  [ids.automatic]: held({
    description: `The exact Maxima communication corpus contains brief 1995-era reports of slipping, harsh shifting and shifter concerns, but it does not identify RE4F04A internal wear, neglected fluid and filter service, metal-shard accumulation or a universal 1995-1999 failure pattern. A symptom report is not proof of the frozen mechanism, maintenance cause or eventual first-gear and complete-transmission failure sequence.`,
    solution: `Preserve the exact complaint and inspect fluid level and condition, external controls, DTCs, line pressure and engagement behavior using the service manual before opening the transmission. Separate shifter or control faults from hydraulic and internal mechanical faults. Do not buy ATF, a filter, valve body, rebuild kit or replacement transmission from this page; transmission code, diagnosis, service history, supersession and VIN fitment must be established first.`,
    symptoms: ['slip, flare, harsh shift and delayed engagement documented separately', 'fluid condition, DTCs and line pressure checked', 'external control and internal mechanical paths separated'],
    systems: ['four-speed automatic transmission', 'hydraulic controls and shift linkage', 'fluid, filter and internal friction elements'],
    evidence: ['Exact historical communications mention symptoms but do not identify the frozen failure mechanism.', 'No primary source establishes neglected service as the cause across 1995-1999.', 'No source supports the frozen replacement prescription or prevalence language.'],
    conflict: 'The indexed page turns brief symptom communications and owner anecdotes into a five-year RE4F04A wear-and-failure identity.',
    summary: 'Held the unsupported RE4F04A wear identity and replaced prescriptive replacement advice with diagnosis.',
    citations: ['datasets'],
  }),
  [ids.catalyst]: held({
    description: `The complete exact Maxima manufacturer-communication and recall corpus does not establish premature Bank 1 catalytic-converter failure across 2004-2018. It does not support an 80,000-120,000-mile window, heat as the distinguishing cause, VQ35DE oil consumption as a universal trigger or the claim that one close-coupled converter fails more often. Catalyst-efficiency codes can follow catalyst damage, mixture, misfire, oil use, exhaust leakage or sensor faults.`,
    solution: `Record the exact DTCs and freeze-frame data, inspect for misfire, oil or coolant consumption, fuel-trim faults and exhaust leaks, and compare upstream and downstream sensor behavior before condemning a converter. Confirm the applicable emissions warranty and legal replacement requirements for the VIN and jurisdiction. Do not buy a converter, exhaust manifold, oxygen sensor, air-fuel sensor or engine part from this page; failed bank, root cause, emissions certification and VIN fitment must be established first.`,
    symptoms: ['exact catalyst and mixture DTCs preserved', 'misfire, fluid consumption and exhaust leakage checked', 'sensor and catalyst performance evaluated by bank'],
    systems: ['close-coupled and underbody catalysts', 'air-fuel and oxygen sensors', 'engine combustion and exhaust sealing'],
    evidence: ['No exact primary communication supports the frozen fifteen-year Bank 1 identity.', 'No primary source supports the mileage, prevalence or oil-consumption causal claims.', 'A catalyst code alone does not identify the failed component or cause.'],
    conflict: 'The indexed page combines multiple catalyst, sensor and engine causes into a fifteen-year premature-converter identity.',
    summary: 'Held the unsupported broad catalytic-converter identity and removed prices and universal replacement advice.',
    citations: ['datasets'],
  }),
  [ids.positionSensors]: held({
    description: `NHTSA recall 03V455 documents heat-stressed solder joints in crankshaft and camshaft position-sensor circuit boards on certain later Nissan vehicles, including model-year 2002 Maxima records in the recall dataset. It does not cover the frozen 1995-1999 Maxima population or prove that those earlier sensors share the recalled solder defect. The exact corpus also does not support replacing every crank and cam sensor together.`,
    solution: `Preserve DTCs and no-start or stall conditions, then test sensor power, ground, signal and related harnesses against the service manual before replacing a sensor. Check the VIN for open campaigns rather than extending 03V455 to an earlier generation. Do not buy a crankshaft sensor, camshaft sensor, variable-timing sensor or sensor set from this page; DTC, failed circuit, connector and VIN fitment must be established first.`,
    symptoms: ['no-start and stall conditions reproduced safely', 'sensor power, ground, signal and harness integrity tested', 'VIN checked without cross-generation recall inference'],
    systems: ['crankshaft position sensing', 'camshaft and variable-timing position sensing', 'engine-control wiring and connectors'],
    evidence: ['03V455 documents an improper solder joint on a later recalled population.', 'The recall does not cover frozen 1995-1999 Maxima years.', 'No exact primary source supports replacing all sensors as a set.'],
    conflict: 'The indexed page imports a later recall mechanism into the unrecalled 1995-1999 generation.',
    summary: 'Held the cross-generation position-sensor identity and preserved the 03V455 boundary.',
    citations: ['recall03V455', 'datasets'],
  }),
  [ids.cvtBelt]: held({
    description: `Nissan NTB17-039R supports transmission judder only on 2016-2023 Maxima vehicles with a V6 CVT when P17F0 or P17F1 is stored. Nissan's 2025 warranty extension is limited to 2016-2018 Maxima and 84 months or 84,000 miles, subject to VIN and settlement eligibility. Neither document establishes progressive steel-belt slip across 2009-2023, a 100,000-130,000-mile onset, heavy-load causation, a 30,000-mile fluid interval or an aftermarket-cooler remedy.`,
    solution: `Record the exact symptom, operating state and every TCM DTC. Apply NTB17-039R only when the vehicle reports judder and stores P17F0 or P17F1; its flow separates control-valve and CVT-chain findings and may require TCM reprogramming. Verify warranty coverage by VIN. Do not buy CVT fluid, a cooler, valve body, belt-and-pulley kit or transmission from this page; DTC path, inspection result, service specification and VIN fitment must be established first.`,
    symptoms: ['judder, flare and delayed response documented separately', 'all TCM DTCs and operating conditions preserved', 'control-valve, chain, fluid and external causes separated'],
    systems: ['V6 continuously variable transmission', 'control valve and TCM', 'CVT chain, pulleys and cooler circuit'],
    evidence: ['NTB17-039R is limited to 2016-2023 V6 CVT vehicles with judder and P17F0/P17F1.', 'The warranty extension is limited to 2016-2018 and VIN eligibility.', 'No primary source supports the frozen 2009-2023 high-mileage belt-slip identity.'],
    conflict: 'The indexed page turns one bounded DTC procedure into a fifteen-year mileage, wear and maintenance identity.',
    summary: 'Held the overbroad CVT belt-slip identity and bounded the exact judder procedure and warranty.',
    citations: ['cvtBulletin', 'cvtWarranty', 'datasets'],
  }),
  [ids.cvtJudder]: retained({
    description: `Nissan NTB17-039R applies to 2016-2023 Maxima A36 vehicles equipped with the V6 CVT when the customer reports transmission judder and the TCM stores P17F0 or P17F1. The repair flow distinguishes P17F0 and P17F1, control-valve and CVT-chain inspection results, subassembly replacement, valve-body replacement and possible TCM reprogramming. Nissan separately extended CVT coverage on eligible 2016-2018 Maxima vehicles to 84 months or 84,000 miles; coverage remains VIN-specific.`,
    solution: `Preserve every TCM DTC and confirm that judder is present before using NTB17-039R; the bulletin says it does not apply without the reported symptom or P17F0/P17F1, or when other DTCs are stored. Follow the complete Nissan inspection and repair flow and verify warranty coverage for the VIN. Do not buy CVT fluid, a control valve, chain kit, subassembly or complete transmission from this page; DTC branch, inspection result, programming and VIN fitment must be established first.`,
    symptoms: ['transmission judder confirmed', 'P17F0 or P17F1 stored without unrelated DTCs', 'control-valve and CVT-chain inspection branch documented'],
    systems: ['A36 V6 continuously variable transmission', 'TCM and control valve', 'CVT chain, pulleys, subassembly and cooler circuit'],
    evidence: ['NTB17-039R exactly lists 2016-2023 Maxima A36 with V6 CVT.', 'The bulletin requires reported judder plus P17F0 or P17F1 and provides a component-specific flow.', 'The separate warranty extension covers eligible 2016-2018 vehicles only.'],
    summary: 'Retained the exact 2016-2023 CVT-judder identity with its DTC, diagnostic and warranty boundaries.',
    citations: ['cvtBulletin', 'cvtWarranty', 'datasets'],
  }),
  [ids.dashboard]: held({
    description: `The complete exact Maxima manufacturer-communication and recall corpus does not establish dashboard cracking, bubbling, warping or a sticky surface across 2004-2008. It also does not establish UV exposure and heat as the universal mechanism, a nationwide prevalence rate or the terms and eligibility of a class-action remedy. Cosmetic conditions and any legal settlement must be documented separately rather than treated as one manufacturer-confirmed defect.`,
    solution: `Document the exact surface, texture, crack pattern, prior cleaners, temperature exposure and any safety effect such as glare or loose material. Check the VIN and settlement or warranty records before selecting a cover, refinishing or dashboard replacement. Do not buy a dashboard cap, overlay, wrap, adhesive or instrument-panel assembly from this page; material condition, remedy eligibility, airbag compatibility and VIN fitment must be established first.`,
    symptoms: ['cracking, bubbling, stickiness and warping documented separately', 'prior products and heat exposure recorded', 'airbag and glare implications assessed before repair'],
    systems: ['instrument-panel surface and substrate', 'passenger-airbag deployment area', 'interior coatings and adhesives'],
    evidence: ['No exact primary communication supports the frozen five-year dashboard identity.', 'No primary source supports the asserted UV mechanism or nationwide prevalence.', 'No exact settlement terms are established by the frozen page.'],
    conflict: 'The indexed page converts anecdotal cosmetic reports and an unspecified lawsuit into a manufacturer-level defect identity.',
    summary: 'Held the unsupported dashboard identity and removed prices and universal repair prescriptions.',
    citations: ['datasets'],
  }),
  [ids.distributor]: held({
    description: `The complete exact Maxima manufacturer-communication and recall corpus does not establish a failed distributor O-ring or shaft seal, cap-and-rotor contamination, clogged-PCV causation or a recurring 1990-1994 VG30 population. Oil inside or around a distributor can originate from different seals and engine conditions, and misfire can originate from ignition, fuel, compression or wiring faults.`,
    solution: `Identify whether oil is external to the housing or inside the distributor, verify crankcase ventilation and preserve ignition symptoms before disassembly. Inspect the cap, rotor, shaft play, seals, connectors and ignition signal using the exact service manual. Do not buy an O-ring, shaft seal, cap, rotor, PCV valve or distributor assembly from this page; leak path, ignition fault, engine configuration and VIN fitment must be established first.`,
    symptoms: ['external and internal oil paths distinguished', 'ignition signal, cap, rotor and shaft condition inspected', 'PCV and crankcase pressure checked without assuming causation'],
    systems: ['VG30 distributor and ignition components', 'camshaft-area oil sealing', 'positive crankcase ventilation'],
    evidence: ['No exact primary communication supports the frozen five-year identity.', 'The frozen citations are forums and generic repair content.', 'No manufacturer source supports automatic PCV or complete-distributor replacement.'],
    conflict: 'The indexed page turns forum repair anecdotes into a five-year combined distributor-seal and ignition-failure identity.',
    summary: 'Held the unsupported distributor contamination identity and replaced parts advice with diagnosis.',
    citations: ['datasets'],
  }),
  [ids.egr]: held({
    description: `Exact Nissan communications document P1402 on 2004-2005 Maxima and direct technicians to inspect the EGR valve for metallic debris. They do not establish the frozen 1995-1999 P0400 identity, a clogged EGR-temperature-sensor tube as the near-universal root cause or a relationship to a P0325 knock-sensor code. P0400 identifies insufficient EGR flow and does not by itself identify the obstructed component.`,
    solution: `Preserve P0400 and companion DTCs, command or test EGR operation and inspect vacuum, valve, passages, temperature sensing and wiring according to the exact service manual. Clean or replace only the component proven faulty and verify flow afterward. Do not buy an EGR valve, temperature sensor, tube, gasket or cleaner from this page; DTC path, obstruction location, engine configuration and VIN fitment must be established first.`,
    symptoms: ['P0400 and companion DTCs preserved', 'EGR command, flow and temperature response tested', 'valve, passage, vacuum, sensor and wiring paths separated'],
    systems: ['exhaust-gas recirculation valve and passages', 'EGR temperature sensing', 'vacuum and engine-control circuits'],
    evidence: ['The exact P1402 communication applies to 2004-2005, not 1995-1999.', 'No exact source identifies the frozen tube or passage as the universal P0400 cause.', 'No primary source supports the claimed P0325 relationship or prevalence.'],
    conflict: 'The indexed page imports a later P1402 bulletin and forum diagnosis into a five-year P0400 clogging identity.',
    summary: 'Held the unsupported 1995-1999 EGR-clogging identity and separated the diagnostic paths.',
    citations: ['datasets'],
  }),
  [ids.mounts]: held({
    description: `Nissan NTB14-060c covers a two-piece front engine mount on 2012-2014 and 2016-2019 Maxima V6 vehicles. It says a single thunk during the first few accelerations and up to 5 mm of built-in free play can be normal, and instructs technicians not to replace the mount for those conditions. It does not establish four-mount deterioration, rubber separation or front-and-rear crossmember-mount failure across 1990-1999.`,
    solution: `Reproduce the vibration or clunk and inspect each mount under the service-manual load procedure while excluding exhaust contact, vacuum-line noise, transmission shift shock and engine performance faults. Treat a one-time later-model thunk within NTB14-060c separately. Do not buy a mount set, crossmember mount, vacuum component or transmission mount from this page; failed location, engine generation, measured movement and VIN fitment must be established first.`,
    symptoms: ['idle vibration and load-change clunk documented separately', 'mount movement and rubber condition measured by location', 'engine, exhaust, vacuum and transmission causes separated'],
    systems: ['engine and transmission mounts', 'crossmember and brackets', 'engine performance, exhaust and vacuum paths'],
    evidence: ['NTB14-060c applies to later 2012-2019 V6 vehicles, not the frozen 1990-1999 years.', 'It identifies several normal conditions where the mount must not be replaced.', 'No exact primary source supports the frozen four-mount failure pattern.'],
    conflict: 'The indexed page asserts a ten-year mount-deterioration pattern while the exact bulletin concerns later vehicles and warns against replacement for normal movement.',
    summary: 'Held the unsupported early-generation mount identity and preserved Nissan no-replacement guidance.',
    citations: ['engineMountBulletin', 'datasets'],
  }),
  [ids.coils]: held({
    description: `Exact Nissan communications document P0300 with blistered ignition coils on 2004-2006 Maxima and earlier P1320 or coil-related conditions on 1999-2002 vehicles. They do not establish coil failure across every 2004-2015 VQ35DE Maxima, greater rear-bank failure from firewall heat, a 60,000-80,000-mile onset or the claim that this is among the most reported issues.`,
    solution: `Preserve misfire DTCs and freeze-frame data, identify the affected cylinder and test the coil, plug, injector, compression and wiring before replacing parts. Follow the exact bulletin only when its DTC, coil condition and model-year boundary match. Do not buy one coil, a six-coil set, spark plugs or an injector from this page; failed cylinder, root cause, supersession and VIN fitment must be established first.`,
    symptoms: ['misfire DTC and cylinder identified', 'coil, plug, injector, compression and wiring tested', 'blistering and heat damage documented rather than assumed'],
    systems: ['coil-on-plug ignition', 'spark plugs and engine-control wiring', 'fuel injection and mechanical compression'],
    evidence: ['A communication supports P0300 and blistered coils on 2004-2006 vehicles.', 'It does not establish the frozen 2004-2015 population or mileage range.', 'No primary source supports replacing all six coils preventively.'],
    conflict: 'The indexed page expands a bounded DTC and visible-coil condition into a twelve-year universal coil-failure identity.',
    summary: 'Held the overbroad ignition-coil identity and removed blanket six-coil replacement advice.',
    citations: ['datasets'],
  }),
  [ids.oilConsumption]: held({
    description: `The complete exact Maxima communication and recall corpus does not establish excessive oil consumption across 2016-2023 VQ35DE vehicles, a rate of one quart per 1,500-3,000 miles, piston-ring wear or PCV failure as a population-wide cause, or catalytic-converter damage from that asserted pattern. The frozen 520-owner total and part number are unsupported.`,
    solution: `Document oil level with a repeatable manufacturer-approved consumption test, verify external leakage and service history, and inspect PCV operation, compression, leak-down, smoke, plugs and catalyst-related DTCs before identifying a cause. Use the exact oil specification for the VIN and ambient conditions. Do not buy PCV valve 11810-6N202, piston rings, oil additives or a catalytic converter from this page; measured rate, root cause, supersession and VIN fitment must be established first.`,
    symptoms: ['oil level and distance documented under a controlled test', 'external leaks and service history checked', 'PCV, ring, valve-seal and combustion paths separated'],
    systems: ['engine lubrication and crankcase ventilation', 'piston rings and valve sealing', 'catalysts and combustion monitoring'],
    evidence: ['No exact primary communication supports the frozen 2016-2023 identity.', 'No source supports the frozen consumption rates, causes or thresholds.', 'No primary source substantiates the 520-owner total or frozen part number.'],
    conflict: 'The indexed page presents unsourced rates, causes and a part number as an eight-year VQ35DE defect identity.',
    summary: 'Held the unsupported oil-consumption identity and removed the fabricated 520-owner total.',
    citations: ['datasets'],
  }),
  [ids.injectors]: held({
    description: `NHTSA safety-improvement campaign 95I006 addressed leaking injectors and related hoses on 1985-1988 Maxima vehicles; it was not a Part 573 safety recall. It does not cover the frozen 1990-1994 population or establish recurring electrical injector failure, lower-seal leakage into cylinders or the need to replace all six injectors. The exact corpus contains no primary evidence for that later VG30 identity.`,
    solution: `Treat fuel odor or visible leakage as a fire risk: shut the engine off, avoid ignition sources and have the vehicle inspected. Test fuel pressure, injector resistance and balance, rail and hose condition, and every seal before opening the system. Do not buy injectors, O-rings, hoses or a complete set from this page; leak location, electrical fault, engine configuration and VIN fitment must be established first.`,
    symptoms: ['fuel odor and visible leakage treated as a safety condition', 'fuel pressure, resistance and balance measured', 'injector body, hose, rail and seal paths separated'],
    systems: ['fuel injectors and electrical drivers', 'fuel rail, hoses and seals', 'VG30 fuel-pressure system'],
    evidence: ['95I006 covers 1985-1988 Maxima, not frozen 1990-1994.', 'The campaign addresses leaking injectors and related hoses, not recurring electrical failure.', 'No exact source supports blanket six-injector replacement.'],
    conflict: 'The indexed page extends an earlier safety-improvement campaign and anecdotes into a different five-year injector identity.',
    summary: 'Held the unsupported 1990-1994 injector identity and preserved the 95I006 boundary.',
    citations: ['recall95I006', 'datasets'],
  }),
  [ids.steeringColumn]: held({
    description: `Nissan campaign PC516 covers specific 2009-2010 Maxima vehicles whose electronic steering column lock can malfunction after the vehicle is parked and prevent starting. Nissan states that the condition occurs only when attempting to start and not while driving. It does not establish steering-column clunk, intermediate-shaft U-joint wear, cold-weather play or electric power-steering-column failure across 2009-2020.`,
    solution: `Separate no-start steering-lock symptoms from a clunk during turning or suspension movement. For noise or play, inspect column fasteners, intermediate shafts and joints, steering gear, suspension and body contact using the service manual; check VIN history for PC516 only when the parked no-start condition matches. Do not buy an intermediate shaft, steering column, ESCL, EPS component or lubricant from this page; symptom path, campaign status, failed joint and VIN fitment must be established first.`,
    symptoms: ['parked no-start and driving clunk separated', 'noise reproduced by steering, suspension and body-load condition', 'column, shaft, gear and suspension play measured'],
    systems: ['steering column and intermediate shaft', 'electronic steering column lock', 'steering gear, suspension and column fasteners'],
    evidence: ['PC516 is limited to specific 2009-2010 parked no-start conditions.', 'It expressly says the condition does not occur while driving.', 'No exact primary source supports the frozen twelve-year clunk and U-joint identity.'],
    conflict: 'The indexed page conflates an electronic parked no-start campaign with a broad mechanical clunk identity.',
    summary: 'Held the unsupported steering-column-clunk identity and separated it from PC516.',
    citations: ['steeringLockCampaign', 'datasets'],
  }),
  [ids.steeringRack]: held({
    description: `Nissan NTB12-078a applies to 2009-2014 Maxima and warns that a steering rack may appear to leak when it is not leaking; technicians must clean residue and follow the inspection before replacement. It does not apply to the frozen 2004-2008 years or establish rack-seal deterioration, high-pressure-hose failure, pump-seal failure, exhaust-contact fire risk or loss of assist as one population-wide chain.`,
    solution: `Locate fluid from its highest wet point, identify the fluid, clean the rack and lines, verify level and reproduce the leak under the exact service inspection before condemning a component. Treat assist loss as a safety concern and do not drive when steering effort is unsafe. Do not buy a rack, pump, hose, seal kit or fluid from this page; leak source, system damage, fluid specification and VIN fitment must be established first.`,
    symptoms: ['fluid identity and highest wet point documented', 'rack cleaned and reinspected before replacement', 'rack, hose, pump and unrelated-fluid paths separated'],
    systems: ['hydraulic steering gear', 'pressure and return hoses', 'power-steering pump and fluid reservoir'],
    evidence: ['NTB12-078a applies to 2009-2014 Maxima, not frozen 2004-2008.', 'It documents false-positive rack-leak appearance and requires inspection.', 'No exact primary source supports the frozen pump-failure and fire-hazard chain.'],
    conflict: 'The indexed page asserts a five-year rack, hose, pump and fire identity that the exact later bulletin cannot support.',
    summary: 'Held the unsupported 2004-2008 steering-leak identity and preserved Nissan anti-overrepair guidance.',
    citations: ['steeringRackBulletin', 'datasets'],
  }),
  [ids.suspension]: held({
    description: `Nissan NTB19-117 covers a VIN- and date-bounded 2020 Maxima creak while turning, caused by excessive seam sealer contacting the front coil spring; its remedy is to remove only enough sealer for clearance. NTB17-040 only revises 2016-2017 alignment specifications. Recall 09V358 concerns out-of-specification upper strut insulators on certain 2009-2010 vehicles. None establishes premature strut-mount and stabilizer-link wear across 2016-2023, a 30,000-60,000-mile onset or the frozen 380-owner total.`,
    solution: `Reproduce the noise while stationary turning, driving over bumps and braking, then inspect seam-sealer contact, strut and mount, spring, stabilizer links and bushings, control arms and fasteners. Apply NTB19-117 only to its exact 2020 VIN/date boundary and use the corrected alignment specifications where applicable. Do not buy strut mounts, links, springs, struts or a complete kit from this page; noise source, measurements, side and VIN fitment must be established first.`,
    symptoms: ['turning creak and bump clunk reproduced separately', 'seam-sealer contact and suspension play inspected', 'alignment and affected side measured before parts selection'],
    systems: ['front strut housings, mounts and springs', 'stabilizer links and bushings', 'wheel alignment and suspension fasteners'],
    evidence: ['NTB19-117 is limited to certain pre-October 9, 2019-built 2020 vehicles and a seam-sealer contact.', 'NTB17-040 revises specifications and does not prove component wear.', 'No source supports the frozen mileage, eight-year wear pattern or 380-owner total.'],
    conflict: 'The indexed page replaces a bounded seam-sealer condition with an eight-year strut-mount and stabilizer-link wear identity.',
    summary: 'Held the overbroad suspension identity and removed the fabricated 380-owner total and part numbers.',
    citations: ['frontSuspensionBulletin', 'alignmentBulletin', 'recall09V358', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  cvtBulletin: { title: 'Nissan NTB17-039R - 2016-2023 Maxima P17F0/P17F1 CVT Judder', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001202-0001.pdf', sha256: 'f372539f8c04019b8f9224d8d788257f50e6b5cc03a70c6b7375156c5528684a', pageCount: 118, visuallyReviewedPages: [1, 2, 92, 118] },
  cvtWarranty: { title: 'Nissan 2025 Maxima and Murano CVT Warranty Extension', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11024393-0001.pdf', sha256: '7d4fb4fdf16774d62e2a0a0feb90b56aca225f6f90e7be93058b62fdd91cf965', pageCount: 9, visuallyReviewedPages: [1, 9] },
  engineMountBulletin: { title: 'Nissan NTB14-060c - Normal Front Engine Mount Noise and Free Play', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10162974-9999.pdf', sha256: '8ebd2548a6f3a02df9b8a998336cbd4a068e92360fa836c29a7d5bef0dcd2be5', pageCount: 2, visuallyReviewedPages: [1, 2] },
  frontSuspensionBulletin: { title: 'Nissan NTB19-117 - 2020 Maxima Front Suspension Creak', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10170013-0001.pdf', sha256: 'c43884e8b2b4e1abb420d9ab322056a75f88a346ed43c77c0544d79eb49c5bc1', pageCount: 3, visuallyReviewedPages: [1, 3] },
  steeringRackBulletin: { title: 'Nissan NTB12-078a - Power Steering Rack Leak Inspection', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10192524-9999.pdf', sha256: 'db06a7a86805bce450792021dbc34edcda79e361c0a694b6f4f7af32245c34bb', pageCount: 6, visuallyReviewedPages: [1, 6] },
  alignmentBulletin: { title: 'Nissan NTB17-040 - Revised 2016-2017 Maxima Alignment Specifications', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10120556-9999.pdf', sha256: '6144d6c615a749c5b623c439281347778566be7655542fefb43401f8aca9920b', pageCount: 29, visuallyReviewedPages: [1, 8, 29] },
  steeringLockCampaign: { title: 'Nissan PC516 - 2009-2010 Maxima Electronic Steering Column Lock', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10119195-9999.pdf', sha256: '12d387297ed09d32f62c03ae20b08290f76c30e352a4fd0efda67c5ece3fb6f7', pageCount: 6, visuallyReviewedPages: [1, 6] },
});

function recallApi(campaign, title) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains: campaign });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  recall03V455: recallApi('03V455000', 'NHTSA Recall 03V455000 - Later Nissan Crank/Cam Position Sensors'),
  recall09V358: recallApi('09V358000', 'NHTSA Recall 09V358000 - 2009-2010 Maxima Strut Insulators'),
  recall95I006: recallApi('95I006000', 'NHTSA Safety Improvement 95I006000 - 1985-1988 Maxima Fuel Injectors'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Maxima', slug: 'maxima', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-maxima-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['MAXIMA'],
  searchTerms: ['RE4F04A', 'catalytic converter', 'crank position', 'cam position', 'CVT judder', 'P17F0', 'P17F1', 'dashboard crack', 'distributor', 'P0400', 'EGR', 'engine mount', 'ignition coil', 'oil consumption', 'fuel injector', 'steering column', 'intermediate shaft', 'steering rack', 'power steering', 'front suspension', 'strut mount', 'stabilizer'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 69, '2000-2004': 177, '2005-2009': 35, '2010-2014': 37, '2015-2019': 235, '2020-2024': 183, '2025-2026': 6 },
    totalRows: 742,
    relevantRowCount: 55,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 83, post: 90 },
    totalRows: 173,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Thirty-four exact Maxima campaigns cover bounded airbag, brake, suspension, fuel, visibility, electrical and other populations. The 03V455, 09V358 and 95I006 records prove materially different year and mechanism boundaries from three frozen pages; no recall supports expanding those conditions across generations.',
  },
  content,
  requiredProse: [
    { id: ids.automatic, field: 'description', patterns: ['does not identify RE4F04A internal wear', '1995-1999'] },
    { id: ids.catalyst, field: 'description', patterns: ['does not establish premature Bank 1', '2004-2018'] },
    { id: ids.positionSensors, field: 'description', patterns: ['03V455', 'does not cover the frozen 1995-1999'] },
    { id: ids.cvtBelt, field: 'description', patterns: ['NTB17-039R', 'establishes progressive steel-belt slip'] },
    { id: ids.cvtJudder, field: 'description', patterns: ['2016-2023', 'P17F0 or P17F1', '84 months or 84,000 miles'] },
    { id: ids.egr, field: 'description', patterns: ['P1402', 'do not establish the frozen 1995-1999 P0400'] },
    { id: ids.mounts, field: 'description', patterns: ['NTB14-060c', 'not to replace the mount'] },
    { id: ids.coils, field: 'description', patterns: ['2004-2006', 'do not establish coil failure across every 2004-2015'] },
    { id: ids.oilConsumption, field: 'description', patterns: ['does not establish excessive oil consumption', '520-owner total'] },
    { id: ids.injectors, field: 'description', patterns: ['95I006', 'does not cover the frozen 1990-1994'] },
    { id: ids.steeringColumn, field: 'description', patterns: ['PC516', 'not while driving'] },
    { id: ids.steeringRack, field: 'description', patterns: ['NTB12-078a', 'does not apply to the frozen 2004-2008'] },
    { id: ids.suspension, field: 'description', patterns: ['NTB19-117', 'seam sealer', '380-owner total'] },
  ],
  observations: [
    { code: 'one-supported-identity-fourteen-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only the exact 2016-2023 Maxima V6 CVT judder identity is retained. Fourteen cross-generation, combined or unsupported identities remain indexed but blocked pending identity policy.' },
    { code: 'current-cvt-path-bounded', severity: 'technical-accuracy', recordIds: [ids.cvtBelt, ids.cvtJudder], detail: 'NTB17-039R requires reported judder plus P17F0/P17F1 and branches between control-valve, chain/subassembly and programming outcomes. It does not prove a universal high-mileage belt-slip pattern.' },
    { code: 'do-not-replace-guidance-preserved', severity: 'overrepair-safety', recordIds: [ids.mounts, ids.steeringRack], detail: 'Nissan says specified front-mount movement can be normal and a rack may appear wet without leaking. Both no-replacement boundaries are explicit.' },
    { code: 'cross-generation-recalls-not-expanded', severity: 'identity-safety', recordIds: [ids.injectors, ids.positionSensors, ids.suspension], detail: '95I006, 03V455 and 09V358 apply to different year populations than the frozen pages and are not used as proof by analogy.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 1,880 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-maxima-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Maxima page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
