/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  adBlue: 'peugeot-208-adblue-scr-system-failure-bluehdi-diesels-urea-fault-start-p',
  dpf: 'peugeot-208-dpf-issues-diesel',
  evBattery: 'peugeot-208-e-208-battery-recalls-fire-risk-sudden-loss-drive',
  obc: 'peugeot-208-e-208-onboard-charger-failure-ac-charging-stops-working',
  automatic: 'peugeot-208-eat6-eat8-automatic-gearbox-jerky-shifting-low-speed-hesitat',
  suspension: 'peugeot-208-front-suspension-knocking-drop-links-anti-roll-bar-bushes-da',
  infotainment: 'peugeot-208-infotainment-freeze',
  pureTech: 'peugeot-208-puretech-timing-chain',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.pureTech]);
const reportCountCleanupIds = Object.freeze([ids.dpf, ids.infotainment, ids.pureTech].sort());
function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations }) {
  return Object.freeze({ description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations: citations || ['datasets', 'peugeotRecallCheck'], commerceDecision: 'failure path, component, build population and VIN fitment remain unresolved; no universal retail part' });
}
function retained({ description, solution, symptoms, systems, evidence, summary, citations }) {
  return Object.freeze({ description, solution, symptoms, affectedSystems: systems, evidence, conflict: null, summary, citations, commerceDecision: 'Peugeot confirms the condition, but engine generation, production date, service history and VIN fitment remain mandatory; no universal retail part' });
}
const content = Object.freeze({
  [ids.adBlue]: held({
    description: 'Peugeot confirms technical issues affecting the SCR urea tank on certain Euro 6 diesel vehicles manufactured from January 2014 through August 2020 and provides conditional extended support. The frozen 2015-2023 page extends that evidence three model years beyond the manufacturer window and asserts one integrated-pump, level-sensor, crystallisation and filler-cap mechanism across all BlueHDi variants without an exact campaign population.',
    solution: 'Record the exact warnings, restart countdown, DTCs, reductant pressure, level data and dosing results; verify fluid quality, injector, wiring, NOx sensing and tank/pump operation separately. Do not defeat the SCR system or assume the whole tank has failed from P20E8/P20EE alone. Check the VIN and support eligibility with Peugeot before repair. Do not buy a urea tank, pump, injector or NOx sensor from this page; failed path, production date, coding requirements and fitment must be established first.',
    symptoms: ['restart countdown and DTCs recorded', 'pressure, dosing, level and sensor paths separated', 'VIN and support eligibility checked'], systems: ['SCR urea tank and pump', 'injector and reductant plumbing', 'NOx sensors, wiring and engine control'], evidence: ['Peugeot confirms urea-tank issues and conditional support for certain January 2014-August 2020 vehicles.', 'The manufacturer page does not extend that population through 2023.', 'The frozen secondary sources do not prove a universal tank-pump mechanism.'], conflict: 'The frozen identity extends a bounded manufacturer support population through 2023 and converts several SCR paths into one tank failure.', summary: 'Held the overbroad AdBlue identity, bounded the manufacturer window and separated SCR diagnosis before tank replacement.', citations: ['ureaSupport', 'peugeotRecallCheck', 'datasets'],
  }),
  [ids.dpf]: held({
    description: 'The frozen page cites only a forum home page and claims a 2012-2026 Peugeot 208 diesel DPF-blockage population with 110 owner reports. Short-trip operation can inhibit regeneration, but restriction can also involve pressure/temperature sensing, EGR, fueling, turbo or oil faults, additive systems where equipped, exhaust leaks and ash loading; the reviewed primary corpus contains no exact 208 record supporting the full fifteen-year defect identity.',
    solution: 'Capture DTCs, soot and ash estimates, differential pressure at specified conditions, temperature-sensor data and regeneration history, then correct engine, sensor, additive or exhaust faults before attempting a controlled regeneration. Do not force regeneration when oil level, exhaust temperature or fire safety makes it unsafe. Do not buy a DPF, pressure sensor or additive component from this page; restriction cause, engine, system design and VIN fitment must be established first.',
    symptoms: ['soot, ash and differential pressure measured', 'sensor and upstream engine faults checked', 'regeneration safety conditions confirmed'], systems: ['diesel particulate filter', 'pressure and temperature sensing', 'fueling, EGR, turbo and additive controls'], evidence: ['The complete NHTSA corpus contains zero Peugeot 208 rows.', 'A forum home page does not prove a 2012-2026 DPF population.', 'The 110-owner count has no traceable dataset.'], conflict: 'The indexed identity turns a usage-sensitive warning and multiple diagnostic paths into a fifteen-year defect with fabricated social proof.', summary: 'Held the unsupported DPF identity, removed the 110-owner claim and bounded forced-regeneration safety.',
  }),
  [ids.evBattery]: held({
    description: 'The frozen page combines several European campaign summaries under one 2020-2023 e-208 “battery recalls” identity: a reported 12-volt battery short-circuit, battery-control software and air-conditioning-compressor logic. Its citations mix secondary recall aggregators, forums and a DVSA 2008 Electric page described as being on the same platform; that cross-model page is not exact proof for an e-208 population, and the title can be read as a traction-battery fire defect.',
    solution: 'Treat smoke, burning smell, overheating, isolation warnings or propulsion loss as stop-use conditions and follow emergency guidance. Do not open either battery system. Check the exact VIN in Peugeot’s recall tool and have a retailer identify the campaign code and prescribed remedy; distinguish the 12-volt supply, high-voltage battery/control unit and compressor-related logic before work. Do not buy a battery, control unit or compressor from this page; campaign applicability and remedy are VIN-specific.',
    symptoms: ['12-volt and high-voltage systems distinguished', 'campaign code verified by VIN', 'fire or propulsion-loss stop condition applied'], systems: ['12-volt battery and supply', 'traction battery and control electronics', 'powertrain and compressor control logic'], evidence: ['The complete NHTSA corpus contains zero Peugeot e-208 rows.', 'A Peugeot 2008 Electric campaign page does not prove e-208 applicability.', 'The frozen citations do not establish one traction-battery fire-and-drive-loss defect.'], conflict: 'The indexed identity conflates separate campaign mechanisms and risks presenting a 12-volt short as a traction-battery fire defect.', summary: 'Held the conflated e-208 battery-recall identity and made campaign, battery-system and emergency boundaries explicit.',
  }),
  [ids.obc]: held({
    description: 'Forum and repair-business reports describe individual e-208 AC-charging failures, but the reviewed primary corpus does not establish that every 2020-2023 e-208 uses the named Mahle CAOBC1 11 kW unit, commonly fails at 10,000-12,000 miles, or receives a VMAX replacement under a four-year Stellantis warranty. AC charging can also fail through the EVSE, cable, charge port, supply, cooling, isolation monitoring, software or high-voltage interlocks.',
    solution: 'Test with a known-good cable and supply, record vehicle and EVSE errors, and identify whether failure affects single-phase, three-phase and DC charging. A qualified high-voltage technician should check charge-port, supply, cooling, isolation, communication and onboard-charger paths using VIN-specific information. Do not open a high-voltage charger. Do not buy an OBC or remanufactured unit from this page; installed hardware, diagnosis, coding and fitment must be established first.',
    symptoms: ['AC supply and cable ruled out', 'AC phases and DC charging compared', 'high-voltage isolation and cooling checked by qualified personnel'], systems: ['onboard AC charger', 'charge port, cable and EVSE communication', 'high-voltage cooling, isolation and interlocks'], evidence: ['The complete NHTSA corpus contains zero Peugeot e-208 rows.', 'The frozen citations are forums, repair businesses and a derivative article.', 'Mileage, supplier, warranty and replacement-brand claims lack exact primary support.'], conflict: 'The indexed identity turns charging symptoms into a supplier-specific four-year OBC defect and warranty program without primary proof.', summary: 'Held the supplier-specific OBC identity and separated external, software, cooling and high-voltage charging paths.',
  }),
  [ids.automatic]: held({
    description: 'Secondary forums and gearbox-repair businesses report low-speed shift complaints, but the reviewed primary corpus contains no exact Peugeot 208 communication establishing a 2018-2024 EAT6/EAT8 defect population, aggressive fuel-saving calibration as the common cause or that a software update and adaptation reset resolve most cases. Normal shift strategy, engine torque delivery, mounts, fluid condition, calibration, hydraulic control and internal wear can produce different symptoms.',
    solution: 'Identify the exact transmission and software level by VIN, record whether the symptom is a commanded shift, flare, slip, harsh engagement or engine hesitation, and check DTCs, fluid leaks/condition, mounts and adaptation data under current service information. Do not reset adaptations or service a “sealed” unit without the specified procedure and fluid. Do not buy a valve body, clutch pack or gearbox from this page; diagnosis and VIN fitment must be established first.',
    symptoms: ['shift event distinguished from engine hesitation', 'transmission and calibration identified', 'fluid, mounts, faults and adaptation data checked'], systems: ['EAT6/EAT8 transmission where equipped', 'engine torque and transmission calibration', 'mounts, hydraulic control and internal clutches'], evidence: ['The complete NHTSA corpus contains zero Peugeot 208 rows.', 'Forums and repair sellers do not prove a seven-year defect rate.', 'The “resolves most” software claim has no traceable manufacturer source.'], conflict: 'The indexed identity treats multiple transmissions and drivability paths as one calibration defect across 2018-2024.', summary: 'Held the broad EAT6/EAT8 identity and separated commanded behavior, engine hesitation, hydraulic faults and internal slip.',
  }),
  [ids.suspension]: held({
    description: 'The frozen page aggregates forum threads into a 2012-2019 first-generation 208 population involving drop links, anti-roll-bar bushes, top mounts and dampers, then calls damper knock a well-known shared-platform trait. A front knock can also involve ball joints, steering joints, springs, subframe, brakes, wheel fasteners or collision damage, and the reviewed primary corpus contains no exact communication proving the frozen population or usual-culprit hierarchy.',
    solution: 'Check wheel security and limit use if steering, braking or stability is affected. Reproduce the noise safely, inspect loaded and unloaded joints, links, bushes, ball joints, springs, struts, mounts, steering, brakes and subframe, then replace only the confirmed failed component and align the vehicle where required. Do not buy drop links, bushes, mounts or dampers from this page; side, failure path and VIN fitment must be established first.',
    symptoms: ['wheel security and handling risk checked', 'noise reproduced under controlled conditions', 'links, joints, strut and steering paths inspected separately'], systems: ['anti-roll-bar links and bushes', 'struts, springs and top mounts', 'ball joints, steering, brakes and subframe'], evidence: ['The complete NHTSA corpus contains zero Peugeot 208 rows.', 'Forum threads do not prove model-wide prevalence.', 'Replacing one commonly named part does not diagnose a remaining knock.'], conflict: 'The indexed identity groups several front-end noises and parts into an eight-year common-defect hierarchy without exact primary evidence.', summary: 'Held the broad suspension-knock identity and required component-level inspection before any parts purchase.',
  }),
  [ids.infotainment]: held({
    description: 'The frozen page has no citations and assigns 2019-2026 second-generation 208 vehicles an i-Cockpit freeze/reboot population with 70 owner reports. “i-Cockpit” describes the cabin interface rather than one head-unit generation, and the claim spans future/current model years without a frozen source establishing hardware, software, navigation or connectivity scope.',
    solution: 'Record the software version, exact frozen functions, connected phone/cable, temperature and repeat conditions; safely restart only as instructed for the installed system and preserve diagnostic logs. Check official updates by VIN before module replacement. Do not perform resets while they would distract from driving. Do not buy a NAC, SMEG, display or head unit from this page; installed architecture, software, diagnosis and coding must be established first.',
    symptoms: ['head-unit and software version identified', 'phone, cable and environmental triggers separated', 'diagnostic logs preserved before reset'], systems: ['infotainment head unit and display', 'Bluetooth, navigation and connected devices', 'vehicle network, power and software'], evidence: ['The complete NHTSA corpus contains zero Peugeot 208 rows.', 'The frozen page has no citations.', 'The 70-owner count and 2019-2026 hardware scope have no traceable dataset.'], conflict: 'The indexed identity turns an uncited interface symptom into an eight-year hardware/software defect with fabricated social proof.', summary: 'Held the uncited infotainment identity, removed the 70-owner claim and bounded reset and module-replacement advice.',
  }),
  [ids.pureTech]: retained({
    description: 'Peugeot confirms that previous-generation 1.0 and 1.2 PureTech engines can experience an oil-pressure issue resulting from premature timing-belt degradation and provides conditional support. Its published terms cover affected 1.0/1.2 non-turbo engines produced June 2012-June 2022 and 1.2 turbo engines produced April 2014-June 2022. The 208 uses a belt, not the timing chain incorrectly named in the frozen solution, and the frozen 150-owner count has no traceable dataset.',
    solution: 'If an oil-pressure warning appears, stop the engine as soon as it is safe and do not continue driving until the lubrication system is checked. Identify the exact PureTech engine and production date by VIN; inspect belt condition using the current Peugeot procedure and, when degradation is confirmed, follow engine-specific instructions for the timing-belt system, oil pickup/lubrication circuit, oil and filter. Check Peugeot support eligibility and the vehicle service schedule. Do not buy a timing-belt kit from this page; production date, engine, diagnosis and VIN fitment must be established first.',
    symptoms: ['engine and production date verified', 'belt and oil-pressure condition assessed', 'oil pickup and lubrication consequences checked'], systems: ['PureTech timing belt', 'oil pickup and lubrication circuit', 'engine timing and oil-pressure monitoring'], evidence: ['Peugeot confirms premature timing-belt degradation on previous-generation PureTech 1.0/1.2 engines.', 'Official terms span June 2012-June 2022 non-turbo and April 2014-June 2022 turbo production.', 'The frozen solution incorrectly prescribed timing-chain replacement and the 150-owner count is unsupported.'], summary: 'Retained the evidence-backed PureTech wet-belt identity, corrected the chain remedy and reduced unsupported social proof to unknown.', citations: ['pureTechSupport', 'pureTechTerms'],
  }),
});
const pdfSources = Object.freeze({
  pureTechTerms: {
    title: 'Peugeot PureTech Customer Satisfaction Portal Terms and Conditions',
    type: 'manufacturer',
    url: 'https://www.peugeot.co.uk/content/dam/peugeot/uk/b2c/owners/customer-care/2025-02-11_PureTech-Terms-and-Conditions_UK_Aug-2025.pdf',
    sha256: 'cfe7937ce80fa3003029926cba9c2e8924fca2dd525db069fd294a3475b758ed',
    pageCount: 2,
    visuallyReviewedPages: [1, 2],
  },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  peugeotRecallCheck: { title: 'Peugeot Official Safety Recall Campaign Check', type: 'manufacturer', url: 'https://www.peugeot.co.uk/tools/recall-campaigns.html', contains: 'Check recall campaigns for my vehicle' },
  pureTechSupport: { title: 'Peugeot PureTech Engines — Official Solutions and Special Coverage', type: 'manufacturer', url: 'https://www.peugeot.co.uk/owners/puretech-engines-solutions.html', contains: 'premature degradation of the timing belt' },
  ureaSupport: { title: 'Peugeot Urea Tank (AdBlue) Special Coverage', type: 'manufacturer', url: 'https://www.peugeot.co.uk/owners/urea-tank-special-coverage.html', contains: 'manufactured between January 2014 and August 2020' },
});
module.exports = Object.freeze({
  make: 'Peugeot', model: '208', slug: '208', reviewDate: '2026-08-10', snapshotFile: 'data/_peugeot-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-peugeot-208-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PEUGEOT'], modelAliases: ['208', 'E-208'], searchTerms: ['AdBlue', 'SCR', 'urea', 'DPF', 'battery', 'fire', 'loss of drive', 'onboard charger', 'charging', 'EAT6', 'EAT8', 'gearbox', 'suspension', 'knock', 'infotainment', 'timing belt', 'PureTech'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communications corpus contains zero PEUGEOT 208/E-208 rows; this disclosed U.S.-corpus limitation is not treated as disproof of European campaigns.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero PEUGEOT 208/E-208 variants; market-specific campaign applicability remains VIN-gated through Peugeot.' },
  content,
  requiredProse: [
    { id: ids.adBlue, field: 'description', patterns: ['January 2014 through August 2020', 'three model years beyond'] },
    { id: ids.dpf, field: 'description', patterns: ['110 owner reports', 'pressure/temperature sensing'] },
    { id: ids.evBattery, field: 'solution', patterns: ['12-volt supply, high-voltage', 'Do not buy a battery'] },
    { id: ids.obc, field: 'description', patterns: ['CAOBC1 11 kW', '10,000-12,000 miles'] },
    { id: ids.automatic, field: 'solution', patterns: ['commanded shift, flare, slip', 'Do not buy a valve body'] },
    { id: ids.suspension, field: 'solution', patterns: ['Check wheel security', 'Do not buy drop links'] },
    { id: ids.infotainment, field: 'description', patterns: ['no citations', '70 owner reports'] },
    { id: ids.pureTech, field: 'description', patterns: ['uses a belt, not the timing chain', '150-owner count'] },
    { id: ids.pureTech, field: 'solution', patterns: ['stop the engine', 'Do not buy a timing-belt kit'] },
  ],
  observations: [
    { code: 'one-retain-seven-hold', severity: 'identity-safety', recordIds: allIds, detail: 'PureTech wet-belt identity has exact manufacturer support; seven broader identities remain held.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero PEUGEOT 208/E-208 rows; European campaign limits are stated explicitly.' },
    { code: 'adblue-window-overbroad', severity: 'source-integrity', recordIds: [ids.adBlue], detail: 'Peugeot support ends at August 2020 while the frozen page extends through 2023.' },
    { code: 'dpf-count-unsupported', severity: 'social-proof-safety', recordIds: [ids.dpf], detail: 'The 110-owner DPF count is reduced to unknown.' },
    { code: 'ev-battery-campaigns-conflated', severity: 'technical-accuracy', recordIds: [ids.evBattery], detail: '12-volt battery, traction control and compressor-logic campaigns remain distinct.' },
    { code: 'cross-model-recall-not-proof', severity: 'source-integrity', recordIds: [ids.evBattery], detail: 'A 2008 Electric recall page is not exact evidence for e-208.' },
    { code: 'obc-supplier-warranty-unverified', severity: 'source-integrity', recordIds: [ids.obc], detail: 'CAOBC1, mileage, VMAX and four-year warranty claims lack primary proof.' },
    { code: 'high-voltage-boundary', severity: 'safety-accuracy', recordIds: [ids.obc, ids.evBattery], detail: 'No owner high-voltage opening or component-first advice remains.' },
    { code: 'gearbox-paths-separated', severity: 'technical-accuracy', recordIds: [ids.automatic], detail: 'Calibration, engine hesitation, mounts, hydraulics and internal slip remain separate.' },
    { code: 'suspension-parts-not-diagnosis', severity: 'commerce-safety', recordIds: [ids.suspension], detail: 'A front knock does not select drop links, bushes, mounts or dampers.' },
    { code: 'infotainment-uncited-count-removed', severity: 'social-proof-safety', recordIds: [ids.infotainment], detail: 'The uncited 70-owner claim is reduced to unknown.' },
    { code: 'puretech-primary-support', severity: 'source-integrity', recordIds: [ids.pureTech], detail: 'Peugeot confirms oil-pressure issues caused by premature timing-belt degradation.' },
    { code: 'puretech-chain-remedy-corrected', severity: 'technical-accuracy', recordIds: [ids.pureTech], detail: 'The live instruction to replace a timing chain is corrected to the timing-belt and lubrication path.' },
    { code: 'puretech-count-unsupported', severity: 'social-proof-safety', recordIds: [ids.pureTech], detail: 'The manufacturer support program does not prove 150 owner reports.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
