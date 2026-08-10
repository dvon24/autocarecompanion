/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  battery12v: 'nissan-leaf-12v-battery-drain-2011',
  telematics: 'nissan-leaf-3g-telematics-control-unit-shutdown-loss-nissanconnect',
  degradation: 'nissan-leaf-battery-degradation-2011',
  chademo: 'nissan-leaf-chademo-quick-charge-port-failure-won-t-fast-charge',
  onboardCharger: 'nissan-leaf-charger-failure-2011',
  cosmetic: 'nissan-leaf-dashboard-flame-retardant-coating-rub-off-thin-exterior-pain',
  fireRecall: 'nissan-leaf-high-voltage-battery-fire-risk-during-dc-fast-charging',
  brakeUnit: 'nissan-leaf-intelligent-brake-unit-failure',
  inverter: 'nissan-leaf-motor-inverter-2011',
  ocs: 'nissan-leaf-passenger-airbag-occupant-classification-sensor-failure',
  tireWear: 'nissan-leaf-premature-front-tire-wear',
  ptc: 'nissan-leaf-ptc-cabin-heater-failure',
  rapidgate: 'nissan-leaf-rapidgate-dc-fast-charge-throttling-from-battery-overheating',
  rearBrake: 'nissan-leaf-rear-brake-caliper-seizing-rotor-corrosion-from-regen-e-peda',
  reductionGear: 'nissan-leaf-reduction-gear-oil-seal-leak-gearbox-whine',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.fireRecall, ids.ocs].sort());
const reportCountCleanupIds = Object.freeze([ids.degradation, ids.inverter, ids.onboardCharger].sort());
const relevantDocumentIds = Object.freeze([
  '10050159', '10052321', '10052513', '10056181', '10075221', '10109107',
  '10109181', '10109218', '10109255', '10117403', '10119187', '10119231',
  '10119242', '10120556', '10120572', '10120597', '10125187', '10128638',
  '10130490', '10130503', '10134856', '10143139', '10143271', '10143280',
  '10143482', '10143491', '10144507', '10144512', '10144516', '10144520',
  '10145516', '10145549', '10145551', '10150732', '10152513', '10152985',
  '10153001', '10158440', '10162975', '10163708', '10165784', '10172232',
  '10172241', '10177210', '10185318', '10185428', '10186833', '10190123',
  '10190169', '10191952', '10192020', '10192085', '10192190', '10192217',
  '10192230', '10192365', '10192432', '10192466', '10192513', '10192532',
  '10192534', '10192542', '10192574', '10192698', '10192722', '10192811',
  '10194176', '10206392', '10211990', '10227255', '10227267', '10229653',
  '10231081', '10239060', '10249898', '11024394', '11031699', '11034255',
]);
const campaigns = Object.freeze([
  '13V069000', '14V138000', '14V192000', '14V263000', '16V119000',
  '16V244000', '16V436000', '17V253000', '19V654000', '20V412000',
  '20V570000', '23V048000', '23V296000', '23V362000', '23V494000',
  '24V071000', '24V700000', '25V655000', '26V188000', '26V425000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, battery or drivetrain configuration and VIN fitment remain unresolved; no universal retail part',
  });
}
function retained({ description, solution, symptoms, systems, evidence, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, summary, citations,
    commerceDecision: 'exact federal evidence governs VIN-specific diagnosis or remedy; no universal retail part should be purchased from this page',
  });
}

const content = Object.freeze({
  [ids.battery12v]: held({
    description: `Nissan NTB18-045b supports a specific 2011-2015 LEAF path only when a 3G telematics control unit is installed and the 12-volt battery continuously loses charge or remote telematics fails. Its remedy is TCU reprogramming after the bulletin's applicability check. It does not establish frequent auxiliary-battery failure, fixed two-to-three-year life, a fourteen-year defect population or a universal storage and replacement schedule.`,
    solution: `Test the 12-volt battery with the approved procedure and record state of charge, capacity, parasitic draw and DC-DC charging behavior before replacing it. On an eligible 2011-2015 vehicle with a 3G TCU, follow NTB18-045b and check for P3131/P31C2 before reprogramming. Do not buy a Group 51R battery, maintainer, jump pack, TCU or DC-DC component from this page; battery specification, draw source, bulletin applicability and VIN fitment must be established first.`,
    symptoms: ['battery state, capacity and parasitic draw measured', 'DC-DC charging operation verified', '3G TCU applicability and P3131/P31C2 checked'],
    systems: ['12-volt auxiliary battery', 'DC-DC charging and vehicle power management', '3G telematics control unit where equipped'],
    evidence: ['NTB18-045b is limited to 2011-2015 LEAF vehicles equipped with a 3G TCU.', 'Its exact action is conditional TCU reprogramming.', 'No primary source supports the frozen lifespan, prevalence or fourteen-year scope.'],
    conflict: 'The indexed page expands one TCU-specific five-year bulletin into a universal auxiliary-battery failure identity through 2024.',
    summary: 'Held the overbroad 12-volt battery identity and preserved the exact NTB18-045b TCU boundary.',
    citations: ['batteryDrainBulletin', 'datasets'],
  }),
  [ids.telematics]: held({
    description: `Nissan NTB22-100 confirms that AT&T discontinued U.S. 3G service on February 22, 2022 and that NissanConnect services are unavailable on applied vehicles. For LEAF, the bulletin lists only 2011-2017 ZE0 vehicles with the applicable factory TCU; it does not support the frozen 2018-2019 extension, a March 2026 shutdown date, charge-clock drift or universal TCU replacement. Earlier 2G-to-3G initiatives are distinct and are no longer active.`,
    solution: `Identify the installed TCU generation and exact model-year applicability before diagnosing remote-service loss. A network-retired 3G unit cannot regain NissanConnect service through a retail replacement; separate network loss from TCU power, internal-battery, pairing and 12-volt draw faults using the applicable bulletin. Do not buy a TCU, antenna, modem, 12-volt battery or subscription from this page; network support, hardware generation, fault path and VIN fitment must be established first.`,
    symptoms: ['TCU generation and network compatibility identified', 'network retirement separated from hardware and power faults', 'remote-service, clock and charge-timer behavior documented separately'],
    systems: ['telematics communication unit', 'NissanConnect cellular service', '12-volt supply and telematics pairing'],
    evidence: ['NTB22-100 lists 2011-2017 LEAF, not the frozen 2011-2019 range.', 'The exact condition is loss of 3G network-backed NissanConnect services.', 'The bulletin does not prescribe replacing the TCU or support the frozen clock-drift narrative.'],
    conflict: 'The indexed page merges 2G upgrades, 3G retirement, parasitic draw and later app changes into one nine-year hardware-defect identity.',
    summary: 'Held the overbroad telematics identity and bounded 3G shutdown to NTB22-100 and 2011-2017.',
    citations: ['telematicsDeactivation', 'datasets'],
  }),
  [ids.degradation]: held({
    description: `Nissan campaign PC630 covers 2016-2017 LEAF vehicles with a 30 kWh battery whose capacity and range gauges can read lower than actual because of an improper capacity calculation; the remedy is LBC software. That campaign is not proof of physical battery degradation across 2011-2023. The exact primary corpus does not support universal 30-40 percent loss, a fixed five-to-seven-year timeline, the frozen warranty threshold for every battery generation or the 4,500-owner total.`,
    solution: `Establish battery size, chemistry generation, temperature history, state of health, cell-voltage balance and whether the concern is true capacity loss or a gauge-calculation error. Check VIN eligibility and warranty terms for the exact vehicle; on applicable 2016-2017 30 kWh vehicles, verify PC630 completion before condemning hardware. Do not buy an OBD adapter, battery module, replacement pack or upgrade from this page; measured capacity, campaign status, warranty terms and VIN fitment must be established first.`,
    symptoms: ['battery generation and usable capacity measured', 'cell balance and temperature history documented', 'physical loss separated from gauge-calculation error'],
    systems: ['lithium-ion traction battery', 'lithium-ion battery controller', 'capacity and range displays'],
    evidence: ['PC630 is a 2016-2017 30 kWh gauge-calculation campaign.', 'Its remedy is controller reprogramming and does not prove physical degradation.', 'No primary source substantiates the frozen 4,500-owner total.'],
    conflict: 'The indexed page turns one capacity-gauge campaign and general aging advice into a thirteen-year physical-degradation identity with fabricated social proof.',
    summary: 'Held the overbroad battery-degradation identity and removed the fabricated 4,500-owner total.',
    citations: ['capacityCampaign', 'datasets'],
  }),
  [ids.chademo]: held({
    description: `Nissan NTB19-056a supports a bounded condition on certain 2018-2019 LEAF vehicles built before January 24, 2019 with a 40 kWh battery: after many back-to-back quick charges, charging may not start or may take too long, and U1009-96 may be stored. The remedy is LBC reprogramming. It does not establish failure of the CHAdeMO port, PDM connector corrosion, lock-actuator failure or a twelve-year population.`,
    solution: `Record the charger, state of charge, pack temperature, DTCs and whether AC charging works, then inspect the connector only through the high-voltage service procedure. Apply NTB19-056a only to its exact VIN, date and 40 kWh configuration; use the owner-manual emergency-release procedure only when the connector is physically retained. Do not buy a CHAdeMO inlet, lock actuator, PDM, 12-volt battery or connector from this page; charging mode, fault code, thermal state and VIN fitment must be established first.`,
    symptoms: ['AC and DC charging behavior compared', 'pack temperature, state of charge and U1009-96 recorded', 'communication, lock, inlet, battery and charger paths separated'],
    systems: ['CHAdeMO quick-charge interface', 'lithium-ion battery controllers', 'charge connector lock and power distribution module'],
    evidence: ['NTB19-056a applies only to bounded 2018-2019 40 kWh vehicles.', 'Its remedy is LBC reprogramming, not charge-port replacement.', 'No exact primary source supports the frozen corrosion and lock-actuator population.'],
    conflict: 'The indexed page merges thermal throttling, communication, corrosion and mechanical locking into a twelve-year port-failure identity.',
    summary: 'Held the overbroad CHAdeMO-port identity and bounded NTB19-056a to its exact quick-charge condition.',
    citations: ['quickChargeBulletin', 'datasets'],
  }),
  [ids.onboardCharger]: held({
    description: `Nissan NTB14-102 provides a diagnostic procedure for DTC P3141 on 2011-2012 LEAF vehicles. The possible-cause list includes high-voltage harnesses, compressor, PTC heater, traction motor, onboard charger, battery and DC/DC junction box; it does not establish onboard-charger failure or automatic charger replacement. The evidence does not support a 2011-2017 population, failure after five-to-seven years, a warranty extension, the frozen part number, prices or the 720-owner total.`,
    solution: `Preserve all DTCs and confirm whether Level 1/2 and DC charging differ. A LEAF-certified high-voltage technician must follow the insulation-resistance and component checks in NTB14-102 and the service manual before identifying the failed component. Do not buy onboard charger 296A0-3NF2A, a PDM, compressor, PTC heater, harness or battery component from this page; DTC path, isolation test, configuration, supersession and VIN fitment must be established first.`,
    symptoms: ['Level 1/2 and DC charging behavior compared', 'P3141 and companion DTCs preserved', 'high-voltage insulation and component paths tested by qualified personnel'],
    systems: ['onboard charger and power distribution module', 'high-voltage harness and insulation monitoring', 'compressor, PTC heater, traction motor and battery'],
    evidence: ['NTB14-102 is a 2011-2012 P3141 diagnostic procedure.', 'P3141 has multiple possible causes and does not prove charger failure.', 'No primary source supports the frozen part, price, warranty or 720-owner claims.'],
    conflict: 'The indexed page converts a multi-component high-voltage diagnostic code into a seven-year universal onboard-charger failure identity.',
    summary: 'Held the unsupported onboard-charger identity and removed the fabricated 720-owner total.',
    citations: ['onboardChargerBulletin', 'datasets'],
  }),
  [ids.cosmetic]: held({
    description: `The complete exact LEAF manufacturer-communication and recall corpus does not establish a combined dashboard flame-retardant coating and exterior paint defect across 2011-2019. The frozen page joins two different surfaces, mechanisms and remedies and relies on forum reports. Primary evidence does not support soap-and-water causation, universal coating composition, thin clear coat, UV peeling or prevalence across the frozen years.`,
    solution: `Identify whether the concern is dashboard coating transfer, chemical damage, exterior clear-coat failure, stone impact or contamination before selecting cosmetic repair. Document products previously used and obtain a paint-thickness or finish assessment when necessary. Do not buy interior coating, protectant, ceramic coating, paint-protection film or repaint materials from this page; surface, material, damage mechanism and vehicle finish must be established first.`,
    symptoms: ['interior and exterior conditions documented separately', 'chemical, abrasion, UV, impact and coating-failure paths separated', 'paint thickness and prior product use recorded where relevant'],
    systems: ['dashboard surface finish', 'exterior base coat and clear coat', 'interior and exterior care products'],
    evidence: ['No exact primary communication supports the combined identity.', 'The frozen citations are forum reports rather than manufacturer defect evidence.', 'Two unrelated cosmetic mechanisms should not be treated as one repair path.'],
    conflict: 'The indexed page combines two unrelated cosmetic concerns into a nine-year material-defect identity without primary evidence.',
    summary: 'Held the unsupported combined dashboard-and-paint identity.',
    citations: ['datasets'],
  }),
  [ids.fireRecall]: retained({
    description: `NHTSA recall 25V655 and Nissan campaign R25C8 apply to 19,077 model-year 2021-2022 LEAF vehicles equipped with a Level 3 CHAdeMO quick-charge port. Excessive lithium deposits inside battery cells can increase electrical resistance and cause rapid heating during Level 3 charging; if charging continues, a battery fire may occur without preceding warning. The population is VIN-specific and separate from 2019-2020 recall 24V700.`,
    solution: `Check the VIN for 25V655/R25C8 and do not use Level 3 CHAdeMO charging until the recall remedy is complete; Level 1 or Level 2 AC charging is the interim path stated by Nissan. Dealers install the battery-software remedy at no charge and verify campaign completion. Do not buy a battery pack, module, charger, CHAdeMO inlet or monitoring device from this page; recall eligibility and the official remedy must be confirmed first.`,
    symptoms: ['VIN checked for 25V655/R25C8', 'Level 3 charging avoided until remedy completion', 'recall condition separated from 24V700 and unrelated charging faults'],
    systems: ['40 kWh and 62 kWh lithium-ion battery packs', 'Level 3 CHAdeMO charging', 'battery state-of-charge monitoring software'],
    evidence: ['The Part 573 report identifies 19,077 2021-2022 LEAF vehicles.', 'The exact mechanism is excessive lithium deposits and rapid heating during Level 3 charging.', 'The official interim instruction is to avoid Level 3 charging until software remedy completion.'],
    summary: 'Retained the exact 25V655/R25C8 fire-risk identity and current VIN-specific charging restriction.',
    citations: ['fireRecallReport', 'recall25V655', 'datasets'],
  }),
  [ids.brakeUnit]: held({
    description: `NHTSA recall 16V119 covers certain 2013-2015 LEAF vehicles produced November 19, 2012 through July 31, 2015. In extreme cold, a relay inside the electronic brake booster can freeze; a warning lamp illuminates and special assist mode requires more pedal effort. The remedy is Intelligent Brake Control Unit software reprogramming. This does not establish age-related actuator, capacitor, screw, stroke-sensor or controller failure across 2011-2019, nor the frozen complaint and price claims.`,
    solution: `Treat abnormal pedal travel or brake warnings as a safety issue and check the VIN for 16V119/P5327. Record DTCs, 12-volt condition, temperature and hydraulic behavior; perform recall software and service-manual diagnosis before condemning the booster or actuator. Do not buy an intelligent brake unit, actuator, stroke sensor, booster, master cylinder or 12-volt battery from this page; recall eligibility, exact fault and calibration requirements must be established first.`,
    symptoms: ['VIN checked for 16V119/P5327', 'temperature, warning lamps and pedal behavior documented', 'relay/software, 12-volt, hydraulic, sensor and actuator paths separated'],
    systems: ['electronic brake booster', 'Intelligent Brake Control Unit software', '12-volt supply and hydraulic brakes'],
    evidence: ['16V119 is limited to 2013-2015 production and an extreme-cold relay condition.', 'The official remedy is control-unit reprogramming, not actuator replacement.', 'No primary source supports the frozen nine-year component-degradation theory or prices.'],
    conflict: 'The indexed page converts one cold-temperature software recall into a nine-year mechanical intelligent-brake-unit failure identity.',
    summary: 'Held the overbroad intelligent-brake-unit identity and preserved the exact 16V119/P5327 boundary.',
    citations: ['brakeRecallReport', 'recall16V119', 'datasets'],
  }),
  [ids.inverter]: held({
    description: `NHTSA recall 14V263 covers approximately 196 model-year 2014 LEAF vehicles produced April 15 through April 24, 2014. An isolated supplier process installed an out-of-specification comparator on the inverter motor-control board; excessive voltage could stop the inverter and vehicle without warning. The remedy is inverter replacement. This does not establish a general 2011-2017 inverter-failure population, turtle-mode progression, universal powertrain warranty or the frozen 340-owner total.`,
    solution: `Treat loss of propulsion as a safety concern and preserve all inverter, motor and high-voltage DTCs. Check the VIN for 14V263 before applying its replacement remedy; otherwise use the LEAF high-voltage diagnostic procedure to separate inverter, battery, motor, resolver, harness and control faults. Do not buy a new, used or refurbished inverter, traction motor or power module from this page; recall eligibility, failed component, supersession and VIN fitment must be established first.`,
    symptoms: ['VIN checked for 14V263', 'loss-of-propulsion DTCs and operating state preserved', 'inverter, motor, battery, resolver, harness and control paths separated'],
    systems: ['traction inverter and motor-control circuit board', 'traction motor', 'high-voltage battery and wiring'],
    evidence: ['14V263 covers approximately 196 vehicles in a ten-day 2014 production window.', 'The exact defect is an incorrect comparator on the inverter circuit board.', 'No primary source supports a seven-year population or the 340-owner total.'],
    conflict: 'The indexed page expands a ten-day, 196-vehicle supplier recall into seven years of generic inverter failure.',
    summary: 'Held the overbroad inverter identity and removed the fabricated 340-owner total.',
    citations: ['inverterRecallReport', 'recall14V263', 'datasets'],
  }),
  [ids.ocs]: retained({
    description: `NHTSA defect petition DP19-002 concerns model-year 2011-2012 LEAF vehicles and the shared front-passenger occupant-classification sensor mat. ODI identified twelve distinct owner reports alleging an OCS warning and diagnosis of the sensor mat; no crash, injury or fatality was alleged in that opening record. The petition was granted for further evaluation, but the record is not a recall and does not justify claiming that 2011-2012 vehicles share the different defect covered by 16V244.`,
    solution: `If the OCS or passenger-airbag warning is present, keep the front passenger seat unoccupied and obtain Nissan-capable SRS diagnosis. Preserve OCS DTCs and inspect the mat, harness, connectors and seat condition; use only the exact service procedure and required calibration after repair. Do not buy a sensor mat, seat cushion, complete seat, emulator or airbag module from this page; DTC, damage path, approved repair and VIN fitment must be established first.`,
    symptoms: ['OCS and passenger-airbag warnings documented', 'SRS and OCS DTCs preserved', 'sensor mat, harness, connector and seat-damage paths separated'],
    systems: ['front passenger occupant-classification sensor mat', 'SRS control and passenger-airbag suppression', 'seat harness and connectors'],
    evidence: ['DP19-002 identifies the shared 2011-2012 sensor-mat design.', 'ODI reviewed twelve distinct reports and recorded no crash, injury or fatality allegations.', 'The document opens further evaluation and is not a recall determination.'],
    summary: 'Retained the exact 2011-2012 OCS-mat failure identity while removing recall and universal-repair implications.',
    citations: ['ocsInvestigation', 'datasets'],
  }),
  [ids.tireWear]: held({
    description: `Exact Nissan communications revise wheel-alignment specifications for 2016-2017 LEAF vehicles but do not establish premature front-tire wear across 2011-2022, a 20,000-26,000-mile failure range, low-pressure causation, outer-edge wear from Nissan's toe setting, battery-weight causation or a universal front-versus-rear pattern. The frozen evidence is forum and secondary reporting rather than a bounded manufacturer defect.`,
    solution: `Measure tread depth across each tire, pressure cold, wheel alignment, suspension play, wheel runout and rotation history before selecting correction. Use the door-label pressure and the exact service alignment specification rather than adding pressure from generic owner advice. Do not buy tires, alignment parts, wheels or suspension components from this page; wear pattern, measurements, tire specification and VIN fitment must be established first.`,
    symptoms: ['tread depth mapped across all tires', 'cold pressure, alignment and rotation history recorded', 'inflation, alignment, suspension, wheel and driving paths separated'],
    systems: ['front and rear tires', 'wheel alignment and suspension', 'tire-pressure specification and rotation history'],
    evidence: ['The exact alignment communications are limited to 2016-2017 LEAF.', 'They revise specifications and do not prove premature wear.', 'No primary source supports the frozen mileage, pressure or twelve-year prevalence claims.'],
    conflict: 'The indexed page converts limited specification revisions and anecdotes into a twelve-year tire-wear design identity with unsafe pressure advice.',
    summary: 'Held the unsupported premature-tire-wear identity and removed generic over-placard pressure advice.',
    citations: ['datasets'],
  }),
  [ids.ptc]: held({
    description: `Nissan NTB14-001c applies to certain 2013-2014 LEAF vehicles built before February 17, 2014 that fail exact heater-output specifications and have an applicable VCM software version; B2773 or B2774 may be present. Its remedy is VCM reprogramming and PTC-heater replacement. It does not establish PTC failure across 2011-2017, universal high-voltage fuse failure, dash-removal requirements, trim behavior or the frozen early-versus-late architecture narrative.`,
    solution: `A LEAF-certified high-voltage technician should measure heater output and check B2773/B2774, VCM version, high-voltage isolation and the exact heating architecture. Apply NTB14-001c only to its VIN/date boundary and do not replace the complete HVAC case when the bulletin specifies the heater. Do not buy PTC heater 27143-3NF1A, a high-voltage fuse, relay, sensor or HVAC case from this page; generation, measured output, software and VIN fitment must be established first.`,
    symptoms: ['heater output measured against the exact specification', 'B2773/B2774 and VCM version checked', 'PTC, heat-pump, coolant, fuse, relay and control paths separated'],
    systems: ['high-voltage PTC heater', 'vehicle control module software', 'HVAC and high-voltage supply'],
    evidence: ['NTB14-001c is limited to bounded 2013-2014 vehicles.', 'It requires heater-output and software applicability checks.', 'It does not prove the frozen seven-year architecture and fuse-failure identity.'],
    conflict: 'The indexed page expands one bounded 2013-2014 heater bulletin into seven years of several different heater architectures and repair paths.',
    summary: 'Held the overbroad PTC-heater identity and preserved the exact NTB14-001c boundary.',
    citations: ['ptcHeaterBulletin', 'datasets'],
  }),
  [ids.rapidgate]: held({
    description: `Nissan NTB19-056a supports a limited 2018-2019 40 kWh LEAF condition after many back-to-back quick charges or when quick charging takes too long; eligible vehicles receive LBC reprogramming. It does not establish the frozen 2018-2022 scope, 62 kWh behavior, fixed 50-to-20 kW rate progression, the named 'Rapidgate' prevalence or an inherent no-hardware-fix conclusion for every vehicle.`,
    solution: `Record battery size, state of charge, pack temperature, charger capability, session history, DTCs and actual charge-rate curve. Check NTB19-056a VIN/date eligibility before applying LBC software and distinguish normal thermal protection from a charger, connector, communication or battery fault. Do not buy a battery controller, battery pack, CHAdeMO adapter, cooling modification or charger accessory from this page; configuration, thermal evidence, software and VIN fitment must be established first.`,
    symptoms: ['battery size, temperature and charge-rate curve recorded', 'back-to-back session history and charger capability documented', 'thermal protection, communication, charger and battery faults separated'],
    systems: ['40 kWh lithium-ion battery where applicable', 'lithium-ion battery controllers', 'CHAdeMO quick charging and thermal protection'],
    evidence: ['NTB19-056a is limited to certain 2018-2019 40 kWh vehicles.', 'Its remedy is LBC reprogramming after applicability checks.', 'No primary source supports the full 2018-2022 and 62 kWh frozen identity.'],
    conflict: 'The indexed page expands a bounded software bulletin into a five-year, two-battery-generation thermal-design identity.',
    summary: 'Held the overbroad Rapidgate identity and bounded it to the exact NTB19-056a configuration.',
    citations: ['quickChargeBulletin', 'datasets'],
  }),
  [ids.rearBrake]: held({
    description: `The complete exact LEAF communication and recall corpus does not establish rear-caliper seizure and rotor corrosion caused by regenerative braking or e-Pedal across 2011-2025. Generic rotor-resurfacing guidance is not defect evidence. The frozen page combines slide-pin, piston, pad, rotor and maintenance conditions, asserts a universal EV mechanism and recommends periodic hard braking without primary support or an exact safety boundary.`,
    solution: `Inspect friction brakes at the service interval and whenever noise, drag, heat, warning lamps or reduced performance occurs. Measure pad thickness, rotor thickness and runout, caliper slide and piston movement, parking-brake operation and hydraulic condition using the exact service manual. Do not buy calipers, rotors, pads, hardware, grease or cleaner from this page; axle, measured condition, root cause and VIN fitment must be established first.`,
    symptoms: ['noise, drag, heat and braking-performance complaints separated', 'pad, rotor, slide, piston and hydraulic measurements recorded', 'parking-brake and warning-system operation checked'],
    systems: ['rear friction brakes', 'calipers, pads, rotors and hardware', 'hydraulic and parking-brake systems'],
    evidence: ['No exact primary communication supports the frozen fifteen-year identity.', 'Generic resurfacing guidance is not proof of regenerative-braking corrosion.', 'The frozen hard-braking and maintenance prescriptions are not manufacturer-supported.'],
    conflict: 'The indexed page turns general brake maintenance and EV anecdotes into a fifteen-year rear-brake defect identity.',
    summary: 'Held the unsupported rear-brake identity and removed generic hard-braking and replacement prescriptions.',
    citations: ['datasets'],
  }),
  [ids.reductionGear]: held({
    description: `The complete exact LEAF manufacturer-communication and recall corpus does not establish reduction-gear oil-seal leakage and gearbox whine across 2011-2024. The frozen page combines leakage, low-fluid wear, metal debris and noise into one causal chain and asserts fluid type, fill quantity and proactive 30,000-to-60,000-mile replacement without exact primary support. Noise can arise from tires, bearings, motor, mounts or reduction gears and must be localized.`,
    solution: `Locate any leak from its highest wet point, verify the exact lubricant specification and level from the service manual and correlate noise with vehicle speed, motor torque and coast/load state. Inspect wheel bearings, tires, mounts and electric-motor paths before opening or replacing the reduction gear. Do not buy Matic S fluid, seals, crush washers, bearings or a gearbox from this page; leak source, noise source, lubricant specification and VIN fitment must be established first.`,
    symptoms: ['leak source traced from the highest wet point', 'noise correlated with speed, torque and coast/load state', 'tire, bearing, motor, mount and reduction-gear paths separated'],
    systems: ['single-speed reduction gear', 'oil seals and lubricant', 'traction motor, mounts, wheel bearings and tires'],
    evidence: ['No exact primary communication supports the frozen fourteen-year identity.', 'No exact source establishes the frozen interval, quantity or universal Matic S prescription.', 'Whine alone does not identify internal reduction-gear failure.'],
    conflict: 'The indexed page converts forum maintenance discussion into a fourteen-year combined seal-leak and gearbox-wear identity.',
    summary: 'Held the unsupported reduction-gear identity and removed unsourced fluid and interval prescriptions.',
    citations: ['datasets'],
  }),
});

const pdfSources = Object.freeze({
  batteryDrainBulletin: { title: 'Nissan NTB18-045b - 2011-2015 LEAF 12-Volt Battery/3G TCU', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10145516-9999.pdf', sha256: '3429beab2b34587f27279fafc7767e683f6ddb3dc15a52caffd0c6a913028948', pageCount: 22, visuallyReviewedPages: [1, 22] },
  telematicsDeactivation: { title: 'Nissan NTB22-100 - 3G Telematics Hardware Deactivation', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10227267-0001.pdf', sha256: '74b780e9b28fc53be931f2007c0e57c3c675c004e0dd5a77cc04370fffdab4c4', pageCount: 1, visuallyReviewedPages: [1] },
  capacityCampaign: { title: 'Nissan PC630 - 2016-2017 LEAF 30 kWh LBC Reprogram', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10143139-9999.pdf', sha256: '67225b3c3acaac5c39bcd04f45ebf9970dbf5bfb32fe6c84accfc2924e113dc5', pageCount: 5, visuallyReviewedPages: [1, 5] },
  quickChargeBulletin: { title: 'Nissan NTB19-056a - 2018-2019 LEAF Will Not Quick Charge', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10172241-0001.pdf', sha256: '8004a1c6fdca2bba2b14261981f37e4a901133df39e6134941a2b976d592669a', pageCount: 18, visuallyReviewedPages: [1, 18] },
  ptcHeaterBulletin: { title: 'Nissan NTB14-001c - 2013-2014 LEAF Insufficient PTC Heater Output', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10192534-9999.pdf', sha256: '18746925fdec1c955aba668e6dae095674829b5babd30f2fa32f279b266bad05', pageCount: 25, visuallyReviewedPages: [1, 25] },
  onboardChargerBulletin: { title: 'Nissan NTB14-102 - 2011-2012 LEAF DTC P3141 Diagnosis', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10192466-9999.pdf', sha256: 'eb18ba20516b0d9bdd24ca70865f230b64854dc69cc702096f408b9d21895936', pageCount: 7, visuallyReviewedPages: [1, 7] },
  fireRecallReport: { title: 'NHTSA Part 573 Report 25V655 - LEAF Level 3 Charging Fire Risk', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V655-2050.pdf', sha256: '712f2b60ec1fcc65c7fae1e580d06ecb480ad66398141038d33254645c094fe8', pageCount: 5, visuallyReviewedPages: [1, 2, 5] },
  inverterRecallReport: { title: 'Nissan Defect Report 14V263 - 2014 LEAF Inverter', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2014/RCDNN-14V263-3192P.pdf', sha256: '27bd519caa96add200856e49ddaf88ac9310c9202a1159a6e05efc74fd0bb208', pageCount: 3, visuallyReviewedPages: [1, 3] },
  brakeRecallReport: { title: 'Nissan Defect Report 16V119 - LEAF Electronic Brake Booster', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/rcl/2016/RCORRD-16V119-2623.pdf', sha256: '4eca570be30632c82ce84025bcdc64d1b339cee1fb119c8f8a5c20bf403e1ce6', pageCount: 4, visuallyReviewedPages: [1, 2, 4] },
  ocsInvestigation: { title: 'NHTSA ODI Resume DP19-002 - 2011-2012 LEAF OCS Sensor Mat', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/inv/2019/INCLA-DP19002-4085.PDF', sha256: '8d848db4a6e11e0fdbdb64fd7604957e68f3d26294ad323a48f76ceb9dcec141', pageCount: 2, visuallyReviewedPages: [1, 2] },
});

function recallApi(campaign, title) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains: campaign });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  recall14V263: recallApi('14V263000', 'NHTSA Recall 14V263000 - 2014 LEAF Inverter'),
  recall16V119: recallApi('16V119000', 'NHTSA Recall 16V119000 - LEAF Electronic Brake Booster'),
  recall25V655: recallApi('25V655000', 'NHTSA Recall 25V655000 - LEAF Level 3 Charging Fire Risk'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Leaf', slug: 'leaf', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-leaf-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['LEAF'],
  searchTerms: ['12V', 'telematics', 'TCU', 'battery capacity', 'capacity loss', 'CHAdeMO', 'quick charge', 'on-board charger', 'charger', 'dashboard', 'paint', 'fire', 'lithium deposits', 'brake unit', 'brake actuator', 'inverter', 'occupant classification', 'airbag', 'tire wear', 'alignment', 'PTC', 'heater', 'rapid charge', 'overheat', 'caliper', 'rotor', 'reduction gear', 'oil seal', 'gearbox', 'whine'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 25, '2015-2019': 156, '2020-2024': 124, '2025-2026': 12 },
    totalRows: 317,
    relevantRowCount: 78,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 530 },
    totalRows: 530,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Twenty exact LEAF campaigns cover bounded airbag, inverter, brake, rearview, glass, defroster, charging-fire, acceleration and other populations. Only 25V655 exactly matches a frozen recall identity; 14V263 and 16V119 prove much narrower conditions than the frozen inverter and brake-unit pages.',
  },
  content,
  requiredProse: [
    { id: ids.battery12v, field: 'description', patterns: ['NTB18-045b', '2011-2015', 'does not establish frequent auxiliary-battery failure'] },
    { id: ids.telematics, field: 'description', patterns: ['NTB22-100', '2011-2017', 'does not support the frozen 2018-2019'] },
    { id: ids.degradation, field: 'description', patterns: ['PC630', 'improper capacity calculation', '4,500-owner total'] },
    { id: ids.chademo, field: 'description', patterns: ['NTB19-056a', '2018-2019', 'does not establish failure of the CHAdeMO port'] },
    { id: ids.onboardCharger, field: 'description', patterns: ['NTB14-102', 'possible-cause list', '720-owner total'] },
    { id: ids.fireRecall, field: 'description', patterns: ['25V655', '19,077', 'excessive lithium deposits'] },
    { id: ids.brakeUnit, field: 'description', patterns: ['16V119', '2013-2015', 'software reprogramming'] },
    { id: ids.inverter, field: 'description', patterns: ['14V263', 'approximately 196', '340-owner total'] },
    { id: ids.ocs, field: 'description', patterns: ['DP19-002', 'twelve distinct', 'not a recall'] },
    { id: ids.tireWear, field: 'description', patterns: ['2016-2017', 'do not establish premature front-tire wear'] },
    { id: ids.ptc, field: 'description', patterns: ['NTB14-001c', '2013-2014', 'B2773 or B2774'] },
    { id: ids.rapidgate, field: 'description', patterns: ['NTB19-056a', '40 kWh', 'does not establish the frozen 2018-2022'] },
    { id: ids.rearBrake, field: 'description', patterns: ['does not establish rear-caliper seizure', '2011-2025'] },
    { id: ids.reductionGear, field: 'description', patterns: ['does not establish reduction-gear', '2011-2024'] },
  ],
  observations: [
    { code: 'two-supported-identities-thirteen-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only 25V655/R25C8 fire risk and the exact 2011-2012 OCS-mat failure identity are retained; thirteen overbroad combined or cross-generation identities remain indexed but blocked pending identity policy.' },
    { code: 'bounded-recalls-not-expanded', severity: 'identity-safety', recordIds: [ids.brakeUnit, ids.inverter], detail: '14V263 covers about 196 vehicles in a ten-day 2014 inverter production window; 16V119 covers a cold-temperature relay/software condition on 2013-2015 vehicles. Neither supports the frozen multi-year general-failure identity.' },
    { code: 'charging-identities-separated', severity: 'technical-accuracy', recordIds: [ids.chademo, ids.fireRecall, ids.rapidgate], detail: 'Port failure, back-to-back quick-charge throttling and the 25V655 battery-fire recall are distinct mechanisms and populations.' },
    { code: 'high-voltage-commerce-suppressed', severity: 'commerce-safety', recordIds: [ids.chademo, ids.fireRecall, ids.inverter, ids.onboardCharger, ids.ptc, ids.reductionGear], detail: 'No high-voltage, charging or drivetrain part is recommended without exact diagnosis, configuration and VIN fitment.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 5,560 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-leaf-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No LEAF page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
