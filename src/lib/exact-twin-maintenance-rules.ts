import type { VehicleSchedule } from './owners-manual-schedule';

export type ExactMaintenanceVehicle = { year: number; make: string; model: string; trim?: string | null };
export type ExactMaintenanceRule = {
  intervalMiles: number | null; intervalMonths: number | null;
  firstIntervalMiles?: number; firstIntervalMonths?: number;
  timing: 'routine' | 'monitor' | 'minder' | 'equipment' | 'condition' | 'inspection';
  action: 'replace' | 'inspect' | 'service'; guidance: string;
  severeGuidance?: string; equipmentGuidance?: string;
};
type Requirement = { id: string; label: string; guidance: string; action: 'inspect' | 'replace' | 'service'; maintenanceType?: string; equipmentGuidance?: string; logHold?: string };
const sources = {
  xt6: { primary:'2020 Cadillac XT6 US/Canada Owner Manual, GMNA 12984300 (2019-08-01)', url:'https://cdn.dealereprocess.org/cdn/servicemanuals/cadillac/2020-xt6.pdf', section:'Printed pp. 329–335, normal/severe tables and footnotes' },
  nautilus: { primary:'2019 Lincoln Nautilus US/Canada Owner Manual, 201806 third printing', url:'https://cdn.dealereprocess.org/cdn/servicemanuals/lincoln/2019-nautilus.pdf', section:'Printed pp. 529–536' },
  aviator: { primary:'2026 Lincoln Aviator US/Canada Owner Manual, 202507 edition', url:'https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/26MY_Aviator_OM_ENG_V1.pdf', section:'Printed pp. 497–501' },
  mdx: { primary:'2019 Acura MDX US Maintenance Minder', url:'https://owners.acura.com/utility/download?path=/static/pdfs/2019/MDX/2019_MDX_Maintenance_Minder.pdf', section:'Exact 2019 two-page extract, p. 2 codes and footnotes; non-hybrid equipment branch' },
  murano: { primary:'2023 Nissan Murano US Owner Manual, OM23EA 0Z52U1 (2022-10)', url:'https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/murano/2023/2023-nissan-murano-owner-manual.pdf', section:'Printed maintenance chapter pp. 9-6–9-32; p. 9-29 plugs/coolant footnotes' },
  kicks: { primary:'2025 Nissan Kicks US Owner Manual, OM25EM 0P16U2 (2024-12-04)', url:'https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/kicks/2025/2025-nissan-kicks-owner-manual.pdf', section:'Printed pp. 612–624; p. 623 plugs/coolant exception; pp. 586–587 original-key cell' },
} as const;
const identities: Record<string, readonly [number, string, string, string]> = {
  xt6:[2020,'cadillac','xt6','sport'], nautilus:[2019,'lincoln','nautilus','standard'],
  aviator:[2026,'lincoln','aviator','premiere'], mdx:[2019,'acura','mdx','technology'],
  murano:[2023,'nissan','murano','sv'], kicks:[2025,'nissan','kicks','sv'],
};
const canon = (value?: string | null) => value?.trim().toLowerCase() ?? '';
export function exactTwinMaintenanceIdentity(vehicle: ExactMaintenanceVehicle): string | null {
  return Object.entries(identities).find(([, [year,make,model,trim]]) => vehicle.year === year
    && canon(vehicle.make) === make && canon(vehicle.model) === model && canon(vehicle.trim) === trim)?.[0] ?? null;
}
const routine = (miles: number | null, months: number | null, guidance: string, extra: Partial<ExactMaintenanceRule> = {}): ExactMaintenanceRule =>
  ({ intervalMiles:miles, intervalMonths:months, timing:'routine', action:'replace', guidance, ...extra });
const monitor = (guidance: string, miles: number | null = null, months: number | null = null, extra: Partial<ExactMaintenanceRule> = {}) =>
  routine(miles, months, guidance, { timing:'monitor', ...extra });
const condition = (guidance: string) => routine(null,null,guidance,{ timing:'condition', action:'service' });
const minder = (guidance: string, extra: Partial<ExactMaintenanceRule> = {}) => monitor(guidance,null,null,{ timing:'minder', ...extra });
const oilVisit = monitor('Rotate tires if permitted and complete the required checks at each oil service. The oil-life monitor sets the visit; this is not a separate fixed-mileage rotation rule.',null,null,{ action:'service' });
const axleCondition = condition('No fixed normal-use fluid replacement interval. Inspect leaks, contamination and submersion; confirm the installed drivetrain before service.');
// These footnotes depend on oil-service count and recent belt history, not a fixed repeat clock.
const lincolnBeltInspection = routine(null,null,'Inspect the accessory drive belt at 100,000 miles, then every other oil change until replaced. Record the inspection separately from belt replacement; oil-life visits are not a fixed mileage interval.',{timing:'inspection',action:'inspect'});
const lincolnBeltReplacement = routine(null,null,'At each 150,000-mile schedule stop, replace the accessory drive belt if it has not been replaced within the previous 100,000 miles. Confirm the belt history before deciding it is due. An inspection is not a replacement.',{timing:'condition',action:'replace'});
const lincolnVisitGuidance = 'At every oil-change interval indicated by the vehicle display, or by the one-year/10,000-mile maximum, whichever is earlier. This maximum is not a recommended wait. The displayed cap starts from this inspection record only; earlier oil-service visits still require this check. No live monitor reading is inferred and another job does not reset this inspection. Confirm only the full completed scope; optional actual measurements may be added in notes. A saved inspection does not certify current mechanical condition or a repaired known issue.';
const lincolnCommonInspections: Requirement[] = [
  {id:'brakeParkingInspection',label:'Brake pads, rotors, hoses and parking-brake inspection',maintenanceType:'brake_parking_inspection',action:'inspect',guidance:'Inspect brake pads, rotors, hoses and parking brake. A narrower brake check, fluid change or repair does not complete this scope.'},
  {id:'coolingStrengthHosesInspection',label:'Cooling-system strength and hoses inspection',maintenanceType:'cooling_strength_hoses_inspection',action:'inspect',guidance:'Inspect engine cooling-system strength and hoses. A coolant-level check, top-up or flush is separate work.'},
  {id:'exhaustHeatShieldsInspection',label:'Exhaust system and heat-shield inspection',maintenanceType:'exhaust_heat_shields_inspection',action:'inspect',guidance:'Inspect the exhaust system and heat shields. A generic exhaust check or repair does not prove the heat-shield scope.'},
  {id:'halfshaftBootsInspection',label:'Halfshaft boots inspection',maintenanceType:'halfshaft_boots_inspection',action:'inspect',guidance:'Inspect the halfshaft boots. Do not infer this check from an ambiguous driveshaft-boots record or from shaft or boot replacement.'},
  {id:'tireTreadInspection',label:'Tire wear and measured tread-depth inspection',maintenanceType:'tire_tread_inspection',action:'inspect',guidance:'Inspect the tires and tire wear, and measure tread depth. Confirming this job attests that measurement was performed; actual readings may optionally be recorded in notes. Rotation or replacement does not complete this inspection.'},
  {id:'wheelComponentsInspection',label:'Wheels and related components inspection',maintenanceType:'wheel_components_inspection',action:'inspect',guidance:'Inspect wheels and related components for abnormal noise, wear, looseness or drag. Tire tread inspection and rotation are separate work.'},
];
const lincolnSteeringInspections: Record<'nautilus'|'aviator',Requirement> = {
  nautilus:{id:'steeringSuspensionDriveshaftInspection',label:'Steering, suspension, driveshaft and U-joints inspection',maintenanceType:'steering_suspension_driveshaft_inspection',action:'inspect',guidance:'Inspect steering linkage, ball joints, suspension, tie-rod ends, driveshaft and U-joints. Complete every named scope; a steering-only or suspension-only record is insufficient. The separate AWD rear-axle/U-joint obligation remains equipment-held.'},
  aviator:{id:'steeringSuspensionInspection',label:'Steering linkage and suspension inspection',maintenanceType:'steering_suspension_inspection',action:'inspect',guidance:'Inspect steering linkage, ball joints, suspension and tie-rod ends. Complete every named scope; a narrower steering-only or suspension-only record is insufficient. Axle and U-joint checks remain separate obligations.'},
};
const lincolnVisitInspections = (id:'nautilus'|'aviator'): Requirement[] => [...lincolnCommonInspections,lincolnSteeringInspections[id]];
const lincolnVisitRules = (id:'nautilus'|'aviator') => Object.fromEntries(lincolnVisitInspections(id).map(item=>[item.maintenanceType!,monitor(item.guidance+' '+lincolnVisitGuidance,10000,12,{action:'inspect'})]));
const mdxBInspections: Requirement[] = [
  {id:'brakeInspection',label:'Front and rear brake inspection',maintenanceType:'brake_axles_inspection',action:'inspect',guidance:'Maintenance Minder B: inspect both front and rear brakes. Record this inspection only after both axles were inspected; brake repair, fluid service and oil service do not complete this check.'},
  {id:'steeringInspection',label:'Steering inspection',maintenanceType:'steering_inspection',action:'inspect',guidance:'Maintenance Minder B: inspect tie rod ends, steering gearbox and boots. Record only this completed inspection; repair and the other B checks are separate work.'},
  {id:'suspensionInspection',label:'Suspension component inspection',maintenanceType:'suspension_inspection',action:'inspect',guidance:'Maintenance Minder B: inspect suspension components. Record the inspection separately from suspension repair or replacement and the other B checks.'},
  {id:'driveshaftBootsInspection',label:'Driveshaft boots inspection',maintenanceType:'driveshaft_boots_inspection',action:'inspect',guidance:'Maintenance Minder B: inspect driveshaft boots. This record documents inspection, not boot or driveshaft replacement and not the other B checks.'},
  {id:'brakeLinesInspection',label:'Brake hoses and lines inspection',maintenanceType:'brake_lines_inspection',action:'inspect',guidance:'Maintenance Minder B: inspect brake hoses and lines, including ABS/VSA. This is separate from front/rear brake inspection, brake-fluid change and line or hose replacement.'},
  {id:'fluidLevelsInspection',label:'All fluid levels and condition inspection',maintenanceType:'fluid_levels_inspection',action:'inspect',guidance:'Maintenance Minder B: inspect all fluid levels and condition of fluids. Record the inspection only; no fluid top-up, change or repair is implied.'},
  {id:'exhaustInspection',label:'Exhaust system inspection',maintenanceType:'exhaust_inspection',action:'inspect',guidance:'Maintenance Minder B: inspect the exhaust system. Record the actual inspection, not exhaust repair or replacement. See the manual maintenance and emissions-warranty information.'},
  {id:'fuelLinesInspection',label:'Fuel lines and connections inspection',maintenanceType:'fuel_lines_inspection',action:'inspect',guidance:'Maintenance Minder B: inspect fuel lines and connections. Record the inspection separately from fuel-system repair or replacement. See the manual maintenance and emissions-warranty information.'},
];

const xt6ChassisInspections: Requirement[] = [
  {id:'brakeSystemInspection',label:'Complete brake-system inspection',maintenanceType:'brake_system_inspection',action:'inspect',guidance:'Every 7,500-mile required visit: visually inspect brake lines and hoses for proper attachment, binding, leaks, cracks and chafing; inspect disc pads for wear, rotor surfaces and all other brake parts. Use qualified service and the manual brake-system procedure (printed p. 322). A narrower axle check or repair does not complete this inspection.'},
  {id:'steeringSystemInspection',label:'Steering-system component inspection',maintenanceType:'steering_system_inspection',action:'inspect',guidance:'Every 7,500 miles and at least once a year: visually inspect steering components for damage or wear, including cracks or tears in rubber boots and loose or missing parts. Use qualified service and the cited manual procedure. Record steering separately from suspension, chassis and power steering.'},
  {id:'suspensionInspection',label:'Suspension component inspection',maintenanceType:'suspension_inspection',action:'inspect',guidance:'Every 7,500 miles and at least once a year: visually inspect suspension components for damage or wear, including cracks or tears in rubber boots and loose or missing parts. Use qualified service and the cited manual procedure. Record this inspection separately from suspension repair, steering and chassis checks.'},
  {id:'chassisInspection',label:'Chassis component inspection',maintenanceType:'chassis_inspection',action:'inspect',guidance:'Every 7,500 miles and at least once a year: visually inspect chassis components for damage or wear, including cracks or tears in rubber boots and loose or missing parts. Use qualified service and the cited manual procedure. Record this inspection separately from repair, steering and suspension checks.'},
  {id:'powerSteeringInspection',label:'Power-steering inspection',maintenanceType:'power_steering_inspection',action:'inspect',guidance:'Every 7,500-mile required visit: inspect power steering for proper electrical connections, binding, cracks and chafing. Have qualified service use the cited manual procedure. This inspection is separate from steering component inspection, fluid service and repair.'},
  {id:'drivelineInspection',label:'Complete halfshaft and driveshaft inspection',maintenanceType:'driveline_inspection',action:'inspect',guidance:'Every 7,500-mile required visit: visually inspect halfshafts and driveshafts for excessive wear, lubricant leaks and damage, including tube dents or cracks, CV or universal joint looseness, cracked or missing boots, loose or missing boot clamps and fasteners, excessive center-bearing looseness and axle-seal leaks. Use qualified service and the cited manual procedure. A boots-only check, fluid change or repair does not complete this inspection.'},
];

/** Single exact timing authority. Numbers here are normal-use repeat intervals;
 * first intervals and severe conditions stay distinct and are never inferred from location.
 * This timing review does not certify the owner\'s engine/drivetrain or product fitment.
 */
const rules: Record<string, Record<string, ExactMaintenanceRule>> = {
  xt6: {
    ...Object.fromEntries(xt6ChassisInspections.map(item=>[item.maintenanceType!,routine(7500,['steering_system_inspection','suspension_inspection','chassis_inspection'].includes(item.maintenanceType!)?12:null,item.guidance+' A saved inspection records completed work at that date and mileage; it does not certify current condition or a repaired known issue.',{action:'inspect'})])),
    drive_belt_inspection:routine(150000,120,'Visually inspect the accessory drive belt every 150,000 miles or ten years, whichever comes first. Look for fraying, excessive cracking or damage; replace only if needed. Inspection is not replacement.',{action:'inspect'}),
    evap_system_inspection:routine(45000,null,'At each 45,000-mile visit, visually inspect all fuel and vapor lines and hoses for proper attachment, connection, routing and condition. Record the inspection, not an assumed part replacement.',{action:'inspect'}),
    ac_desiccant_replacement:routine(null,84,'Have the A/C desiccant replaced every seven years by a qualified refrigerant-system professional. A refrigerant top-up or generic A/C repair does not prove this job was completed.'),
    oil_change:monitor('Follow the oil-life monitor; change oil and filter at least every 12 months. Respond within 600 miles of the change-oil message. If accidentally reset, service within 3,000 miles of the last change. The 7,500-mile visit is a check/rotation, not automatic oil replacement.',null,12),
    tire_rotation:routine(7500,null,'Rotate every 7,500 miles if the installed tire arrangement permits it; inspect tires, brakes, leaks and steering/suspension.',{action:'service'}),
    cabin_filter:routine(22500,24,'Replace every 22,500 miles or two years, whichever comes first; sooner for contamination or reduced airflow.'),
    air_filter:monitor('Follow the engine air-filter life system. If not equipped, replace at 45,000 miles or four years; inspect sooner in dust.',null,null,{timing:'equipment',equipmentGuidance:'Confirm whether the vehicle has the filter-life monitor before enabling a fixed deadline.'}),
    transmission_fluid_auto:condition('No normal-use replacement mileage is listed. Severe-use transmission-fluid replacement is 45,000 miles only when the manual severe conditions apply.'),
    spark_plugs:routine(97500,null,'Replace spark plugs at 97,500 miles; inspect plug wires.'),
    rear_axle_fluid:routine(150000,null,'AWD rear gearcase: normal 150,000 miles. The clutch hydraulic circuit is a separate service.',{severeGuidance:'75,000 miles under the manual severe-use conditions; correct contamination sooner.',equipmentGuidance:'Confirm the rear circuit; this is not a PTU or clutch-fluid interval.'}),
    awd_clutch_fluid:condition('No separate fixed replacement clock is established for the active twin-clutch hydraulic circuit. Use the confirmed circuit procedure; do not apply the gearcase interval.'),
    differential_fluid:condition('Legacy generic driveline records are unassigned to the rear gearcase/clutch circuit. Identify the actual completed circuit before using a specific schedule.'),
    transfer_case_fluid:axleCondition,
    coolant_flush:routine(150000,60,'Replace engine coolant every 150,000 miles or five years, whichever comes first.'),
    brake_fluid:routine(null,60,'Replace brake fluid every five years; there is no mileage replacement requirement.'),
    wiper_blades:routine(15000,12,'Replace wiper blades every 15,000 miles or 12 months; sooner if visibility or condition requires.'),
  },
  nautilus: {
    ...lincolnVisitRules('nautilus'),
    drive_belt_inspection:lincolnBeltInspection, serpentine_belt:lincolnBeltReplacement,
    oil_change:monitor('Follow the oil-life monitor; never exceed 10,000 miles or 12 months between oil/filter services.',10000,12),
    tire_rotation:oilVisit, cabin_filter:routine(20000,null,'Replace cabin filter every 20,000 miles.'),
    air_filter:routine(30000,null,'Replace engine air filter every 30,000 miles; inspect/service sooner under the manual special conditions.'),
    spark_plugs:routine(100000,null,'Replace spark plugs every 100,000 miles under normal use.',{severeGuidance:'60,000 miles under the applicable manual severe-use conditions.'}),
    transmission_fluid_auto:routine(150000,null,'Replace automatic-transmission fluid at 150,000 miles under normal use.',{severeGuidance:'30,000 miles for towing, extensive idling or the specified off-road conditions; do not infer those uses from location.'}),
    coolant_flush:routine(50000,36,'Factory coolant first: 100,000 miles or six years; thereafter 50,000 miles or three years.',{firstIntervalMiles:100000,firstIntervalMonths:72}),
    differential_fluid:axleCondition, transfer_case_fluid:axleCondition,
    brake_fluid:condition('Inspect brake-fluid level/condition with required service checks. No fixed replacement clock is asserted from this reviewed manual section.'),
    wiper_blades:condition('Inspect wiper operation and blade condition; replace when visibility or condition requires.'),
  },
  aviator: {
    ...lincolnVisitRules('aviator'),
    drive_belt_inspection:lincolnBeltInspection, serpentine_belt:lincolnBeltReplacement,
    oil_change:monitor('Follow the oil-life monitor; never exceed 10,000 miles or 12 months between oil/filter services.',10000,12),
    tire_rotation:oilVisit, cabin_filter:routine(20000,null,'Replace cabin filter every 20,000 miles.'),
    air_filter:routine(30000,null,'Replace engine air filter every 30,000 miles.'),
    spark_plugs:routine(100000,null,'Replace spark plugs every 100,000 miles under normal use.',{severeGuidance:'60,000 miles under the applicable severe-use conditions.'}),
    transmission_fluid_auto:routine(150000,null,'Replace automatic-transmission fluid at 150,000 miles. No other Lincoln model\'s severe interval is substituted.'),
    coolant_flush:routine(100000,60,'Factory coolant first: 200,000 miles or ten years; thereafter 100,000 miles or five years.',{firstIntervalMiles:200000,firstIntervalMonths:120}),
    brake_fluid:routine(null,36,'Replace brake fluid every three years, independent of mileage.'),
    differential_fluid:axleCondition, transfer_case_fluid:axleCondition,
    wiper_blades:condition('Inspect wiper operation and blade condition; replace when visibility or condition requires.'),
  },
  mdx: {
    ...Object.fromEntries(mdxBInspections.map(item=>[item.maintenanceType!,minder(item.guidance+' A saved inspection records the work at its date and mileage; it does not certify current mechanical condition.',{action:'inspect'})])),
    oil_change:minder('Maintenance Minder A requests engine oil; B requests oil/filter and inspections. Oil must be changed at least annually. Record only the work actually completed.',{intervalMonths:12}),
    tire_rotation:minder('Maintenance Minder 1: rotate tires; confirm the installed tire arrangement permits rotation.',{action:'service'}),
    air_filter:minder('Maintenance Minder 2: replace engine air filter and inspect the drive belt.',{severeGuidance:'The manual dust override requires engine air-filter service every 15,000 miles.'}),
    cabin_filter:minder('Maintenance Minder 2: replace cabin filter.',{severeGuidance:'The manual soot/dust conditions require the specified filter service every 15,000 miles.'}),
    transmission_fluid_auto:minder('Maintenance Minder 3: replace non-hybrid transmission fluid; transfer fluid, if equipped, is a separate job.',{severeGuidance:'30,000 miles for mountainous low-speed use or towing.',equipmentGuidance:'Confirm non-hybrid transmission; this is not a Sport Hybrid specification.'}),
    transfer_case_fluid:minder('Maintenance Minder 3: service the transfer assembly if equipped; this does not complete transmission or rear-differential service.',{equipmentGuidance:'Confirm the actual transfer assembly and drivetrain.'}),
    rear_axle_fluid:minder('Maintenance Minder 6: service the rear differential if equipped.',{severeGuidance:'Mountainous low-speed use/towing: first 7,500 miles, then 15,000 miles.',equipmentGuidance:'Confirm SH-AWD/non-hybrid equipment; trim alone is not proof.'}),
    differential_fluid:condition('Legacy generic fluid history does not identify which of the separate transfer/rear circuits was serviced.'),
    spark_plugs:minder('Maintenance Minder 4: replace spark plugs; timing-belt replacement and water-pump/valve inspections are additional work, not proof that plugs alone completed code 4.'),
    timing_belt:minder('Maintenance Minder 4: replace the timing belt. Record only that completed replacement; water-pump and valve-clearance inspections are separate jobs.',{action:'replace',severeGuidance:'Regular driving over 110°F (43°C) or under −20°F (−29°C): replace every 60,000 miles. Do not infer this use from location.'}),
    drive_belt_inspection:minder('Maintenance Minder 2: inspect the accessory drive belt. Filter replacement does not complete this inspection, and inspection is not belt replacement.',{action:'inspect'}),
    water_pump_inspection:minder('Maintenance Minder 4: inspect the water pump during timing-belt service. Record the inspection separately; this does not state that the pump was replaced.',{action:'inspect'}),
    valve_clearance_inspection:minder('Maintenance Minder 4: inspect valve clearance. Record the actual inspection separately from spark-plug or timing-belt work; adjustment is not assumed.',{action:'inspect'}),
    coolant_flush:minder('Maintenance Minder 5: replace engine coolant. Do not invent a normal fixed-mileage interval.'),
    brake_fluid:routine(null,36,'Replace brake fluid every three years independently of the Maintenance Minder.'),
    wiper_blades:condition('Inspect blade condition and replace when visibility requires; no fixed interval is asserted here.'),
  },
  murano: {
    key_battery_inspection:routine(null,null,'At the initial 22,500-mile or 18-month standard visit, inspect the Intelligent Key battery. Record inspection separately from cell replacement and vehicle 12V battery work; no repeat inspection clock is inferred. Follow the exact manual, printed pp. 9-13 and 8-22–8-24, or consult a Nissan dealer when unsure.',{timing:'inspection',action:'inspect'}),
    key_battery_replacement:routine(22500,18,'First replace the Intelligent Key battery at 45,000 miles or 36 months; later replacements every 22,500 miles or 18 months. The original key uses CR2032 or equivalent; check a replacement key\'s own cell marking. Keep children away from the cell and removed parts. Avoid touching internal circuits or electrical terminals; hold the cell by its edges, close securely and check button operation. Follow the manual, printed pp. 8-22–8-24, 9-17 and 9-22, or consult a Nissan dealer when unsure. This does not complete key inspection or vehicle 12V battery work.',{firstIntervalMiles:45000,firstIntervalMonths:36}),
    oil_change:routine(7500,6,'Normal: replace oil and filter every 7,500 miles or six months.',{severeGuidance:'Severe use: 5,000 miles or six months.'}),
    tire_rotation:routine(7500,6,'Rotate every 7,500 miles or six months if the tire arrangement permits.',{action:'service'}),
    cabin_filter:routine(15000,12,'Replace cabin filter every 15,000 miles or 12 months.'),
    air_filter:routine(30000,24,'Replace engine air filter every 30,000 miles or 24 months.'),
    brake_fluid:routine(30000,24,'Normal: replace brake fluid every 30,000 miles or 24 months.',{severeGuidance:'Severe use: 10,000 miles or 12 months.'}),
    transmission_fluid_auto:condition('No fixed normal CVT replacement clock is asserted. Use the manual\'s applicable inspection/deterioration procedure.',),
    coolant_flush:routine(75000,60,'Factory coolant first: 105,000 miles or 84 months; thereafter 75,000 miles or 60 months.',{firstIntervalMiles:105000,firstIntervalMonths:84}),
    spark_plugs:routine(105000,null,'Replace spark plugs at 105,000 miles only; replace sooner if the gap exceeds 0.053 inches. The milestone month heading does not apply to these plugs.'),
    differential_fluid:axleCondition, transfer_case_fluid:axleCondition,
    wiper_blades:condition('Inspect wiper blades and replace when condition or visibility requires.'),
  },
  kicks: {
    key_battery_inspection:routine(null,null,'At the initial 15,000-mile or 18-month visit, inspect the Intelligent Key battery. Record inspection separately from replacement. This is not the vehicle 12V battery and no repeat inspection clock is inferred.',{timing:'inspection',action:'inspect'}),
    key_battery_replacement:routine(15000,18,'First replace the Intelligent Key battery at 30,000 miles or 36 months; later replacements every 15,000 miles or 18 months. The original key uses CR2032 or equivalent; check a replacement key\'s cell marking. Close securely and check button operation. This does not service the vehicle 12V battery.',{firstIntervalMiles:30000,firstIntervalMonths:36}),
    oil_change:monitor('Replace engine oil/filter at 10,000 miles or 12 months, or sooner when the oil indicator requests it.',10000,12),
    tire_rotation:routine(5000,6,'Rotate every 5,000 miles or six months if the installed tire arrangement permits.',{action:'service'}),
    cabin_filter:routine(15000,18,'Replace cabin filter every 15,000 miles or 18 months.'),
    air_filter:routine(40000,48,'Replace engine air filter every 40,000 miles or 48 months; sooner under dusty conditions.'),
    brake_fluid:routine(20000,24,'Normal: replace brake fluid every 20,000 miles or 24 months.',{severeGuidance:'Severe use: 10,000 miles or 12 months.'}),
    transmission_fluid_auto:routine(60000,72,'Replace CVT fluid every 60,000 miles or 72 months; confirm the exact fluid and level procedure.',{severeGuidance:'The rough/muddy-road or car-top-carrier paragraph specifies 60,000 miles; do not invent a shorter interval.'}),
    coolant_flush:routine(75000,60,'Factory coolant first: 105,000 miles or 84 months; thereafter 75,000 miles or 60 months.',{firstIntervalMiles:105000,firstIntervalMonths:84}),
    spark_plugs:routine(105000,126,'Replace spark plugs at 105,000 miles or 126 months, whichever comes first. The coolant footnote does not remove the plug time limit.'),
    differential_fluid:axleCondition, transfer_case_fluid:axleCondition,
    wiper_blades:condition('Inspect wiper blades and replace when condition or visibility requires.'),
  },
};
rules.murano.transmission_fluid_auto.severeGuidance = 'Towing, camper/car-top carrier or rough/muddy roads: 60,000 miles or CONSULT deterioration assessment. The separate general severe table lists 120,000 miles; keep its conditions distinct.';
const inspections = (guidance: string): Requirement => ({id:'requiredChecks',label:'Required inspections',action:'inspect',guidance});
const lincolnBeltRequirements: Requirement[] = [
  {id:'driveBelt',label:'Drive-belt inspection',maintenanceType:'drive_belt_inspection',action:'inspect',guidance:lincolnBeltInspection.guidance},
  {id:'driveBeltReplace',label:'Drive-belt replacement',maintenanceType:'serpentine_belt',action:'replace',guidance:lincolnBeltReplacement.guidance},
];
const coverage: Record<string, Requirement[]> = {
  xt6:[...xt6ChassisInspections,
    {id:'requiredChecks',label:'Remaining required checks',action:'inspect',guidance:'At every 7,500-mile visit, remaining checks include: engine oil level and oil-life percentage; air-filter life if equipped, otherwise filter inspection; coolant and washer-fluid levels; tire pressures and wear; fluid leaks; restraint components; fuel-system damage/leaks; exhaust and nearby heat shields; body-component lubrication; starter switch; parking brake and automatic-transmission park mechanism; accelerator-pedal damage, binding or high effort; gas-strut wear, cracks, damage and hold-open function; sunroof track and seal if equipped. Oil/filter changes or resets and strut/pedal replacements are separate conditional work. Qualified service must follow the cited manual procedures, especially for restraint, starter and park checks. Dedicated recording for these remaining obligations stays held; no completed work or equipment is assumed.'},
    {id:'beltInspection',label:'Accessory belt inspection',maintenanceType:'drive_belt_inspection',action:'inspect',guidance:'Inspect at 150,000 miles or ten years. This is not mandatory belt replacement.'},
    {id:'evapInspection',label:'Evaporative-system inspection',maintenanceType:'evap_system_inspection',action:'inspect',guidance:'Inspect fuel/vapor lines and hoses at each 45,000-mile visit; inspection is not replacement.'},
    {id:'liftStruts',label:'Hood/body lift struts',action:'replace',guidance:'Replace at 75,000 miles or ten years; table repeats at 150,000 miles. Check safe support function; confirm body equipment.'},
    {id:'acDesiccant',label:'A/C desiccant replacement',maintenanceType:'ac_desiccant_replacement',action:'replace',guidance:'Replace at seven years. Dealer/professional refrigerant-system service; no date can be calculated without actual in-service/service evidence.'}],
  nautilus:[...lincolnVisitInspections('nautilus'),{id:'requiredChecks',label:'Remaining required checks',action:'inspect',guidance:'At each display-indicated oil-service visit: inspect automatic-transmission fluid level; consult your dealer for requirements, with no assumed DIY dipstick or fluid change. Inspect rear axle and U-joints on AWD vehicles only; confirm the actual drivetrain before work. A multi-point inspection is recommended, not inferred from one completed check. These obligations remain separately held for dedicated recording; no equipment or completion is assumed. Oil/filter service, oil-life reset and eligible tire rotation remain separate work.'},...lincolnBeltRequirements],
  aviator:[...lincolnVisitInspections('aviator'),{id:'requiredChecks',label:'Remaining required checks',action:'inspect',guidance:'At each display-indicated oil-service visit: inspect the front axle; inspect rear axle and U-joints. Confirm actual axle/drivetrain equipment before service. Inspect the cabin air filter if equipped and the engine air filter; service as required, without assuming replacement. A multi-point inspection is recommended, not inferred from one completed check. These obligations remain separately held for dedicated recording; no equipment or completion is assumed. Oil/filter service, oil-life reset and eligible tire rotation remain separate work. Brake-fluid replacement remains a separate three-year job requiring dealer equipment.'},...lincolnBeltRequirements],
  mdx:[...mdxBInspections,
    {id:'tireRepairKitExpiration',label:'Tire repair kit bottle expiration check',action:'inspect',guidance:'Maintenance Minder B: check the tire repair kit bottle expiration date if equipped. This equipment is not available on all models; no kit installation or expiration date is assumed.',equipmentGuidance:'Confirm whether this vehicle has the tire repair kit and read its bottle expiration date.',logHold:'Equipment unconfirmed. Check whether a tire repair kit bottle is fitted and read its expiration date; dedicated recording remains held until that equipment is confirmed.'},
    {id:'driveBelt',label:'Drive-belt inspection',maintenanceType:'drive_belt_inspection',action:'inspect',guidance:'Maintenance Minder 2 includes drive-belt inspection, separate from filter replacement.'},
    {id:'timingBelt',label:'Timing-belt replacement',maintenanceType:'timing_belt',action:'replace',guidance:'Maintenance Minder 4: replace the timing belt; water-pump and valve inspections are separate completed jobs.'},
    {id:'waterPumpInspection',label:'Water-pump inspection',maintenanceType:'water_pump_inspection',action:'inspect',guidance:'Maintenance Minder 4: inspect the water pump during timing-belt service. Inspection is not replacement.'},
    {id:'valveInspection',label:'Valve-clearance inspection',maintenanceType:'valve_clearance_inspection',action:'inspect',guidance:'Maintenance Minder 4: inspect valve clearance; do not infer inspection or adjustment from a spark-plug log.'}],
  murano:[inspections('Complete the manual inspection visits; inspecting AWD differential/transfer fluid is not replacing it. Confirm drivetrain before selecting the AWD severe 20,000-mile/24-month replacement branch.'),
    {id:'keyBatteryInspect',label:'Intelligent Key battery inspection',maintenanceType:'key_battery_inspection',action:'inspect',guidance:'Initial 22,500-mile / 18-month standard visit: inspect the key battery. No recurring inspection interval is inferred. This is separate from key-cell replacement and vehicle 12V battery work.'},
    {id:'keyBatteryReplace',label:'Intelligent Key battery replacement',maintenanceType:'key_battery_replacement',action:'replace',guidance:'First replacement at 45,000 miles / 36 months; subsequent replacements at 22,500-mile / 18-month intervals. Confirm the actual key and cell marking; do not infer a replacement key from the original key specification.'}],
  kicks:[inspections('Complete the manual inspection visits. AWD transfer/differential/coupling severe replacements are separate 20,000-mile/24-month jobs only for confirmed AWD equipment.'),
    {id:'keyBatteryInspect',label:'Intelligent Key battery inspection',maintenanceType:'key_battery_inspection',action:'inspect',guidance:'Initial 15,000-mile / 18-month visit: inspect the key battery. This is not battery replacement and is separate from the vehicle 12V battery.'},
    {id:'keyBatteryReplace',label:'Intelligent Key battery replacement',maintenanceType:'key_battery_replacement',action:'replace',guidance:'Replacement starts at 30,000 miles / 36 months, then the table shows subsequent 15,000-mile / 18-month multiples. Confirm exact key-battery fitment before purchase.'}],
};
export function getExactTwinMaintenanceRule(type: string, vehicle: ExactMaintenanceVehicle) {
  const id = exactTwinMaintenanceIdentity(vehicle);
  const key = type === 'transmission_fluid' ? 'transmission_fluid_auto' : type;
  const rule = id ? rules[id]?.[key] : undefined;
  return rule && id ? {...rule, source:sources[id as keyof typeof sources]} : undefined;
}
export function getExactTwinMaintenanceCoverage(vehicle: ExactMaintenanceVehicle) {
  const id = exactTwinMaintenanceIdentity(vehicle);
  return id ? (coverage[id] || []).map(item => ({...item,source:sources[id as keyof typeof sources]})) : [];
}
/** Projection metadata only: this never creates a service event or an elapsed-age date. */
export function applyExactTwinRuleToNode(node: { maintenanceType?: string; serviceInspectionGuidance?: string }, vehicle: ExactMaintenanceVehicle) {
  if (!node.maintenanceType) return;
  const rule = getExactTwinMaintenanceRule(node.maintenanceType, vehicle);
  if (!rule) return;
  Object.assign(node, {
    interval:rule.intervalMiles,intervalMonths:rule.intervalMonths,
    serviceIntervalMiles:rule.intervalMiles,serviceIntervalMonths:rule.intervalMonths,riskAt:rule.intervalMiles,
    serviceFirstIntervalMiles:rule.firstIntervalMiles ?? null,serviceFirstIntervalMonths:rule.firstIntervalMonths ?? null,
    serviceTiming:rule.timing,serviceAction:rule.action,
    serviceGuidance:rule.guidance,serviceSevereGuidance:rule.severeGuidance,serviceEquipmentGuidance:rule.equipmentGuidance,
    serviceSourceLabel:`${rule.source.primary} · ${rule.source.section}`,serviceSourceUrl:rule.source.url,
    firstServiceDeadline:rule.intervalMiles != null && !['monitor','minder','equipment'].includes(rule.timing),
    life:[rule.guidance,node.serviceInspectionGuidance,rule.severeGuidance,rule.equipmentGuidance].filter(Boolean).join(' '),
  });
}
const manualKeys: Record<string,string> = {oil_change:'engine_oil',coolant_flush:'engine_coolant',rear_axle_fluid:'rear_differential',differential_fluid:'rear_differential',transfer_case_fluid:'transfer_case'};
export function getExactTwinOwnersManualSchedule(vehicle: ExactMaintenanceVehicle): VehicleSchedule | null {
  const id = exactTwinMaintenanceIdentity(vehicle);
  if (!id) return null;
  return { years:[vehicle.year],trims:[vehicle.trim!],engine:'Confirm exact non-hybrid engine/equipment before owner activation',transmission:'automatic',source:sources[id as keyof typeof sources],
    schedule:Object.fromEntries(Object.entries(rules[id]).filter(([type]) => type !== 'differential_fluid' || !rules[id].rear_axle_fluid).map(([type,rule]) => [manualKeys[type] || type,{
      interval_display:rule.guidance,interval_miles:rule.intervalMiles,interval_months:rule.intervalMonths,
      interval_first_miles:rule.firstIntervalMiles,interval_first_months:rule.firstIntervalMonths,
      interval_severe_display:rule.severeGuidance,verified:true,interval_source:sources[id as keyof typeof sources],
      note:rule.equipmentGuidance,timing:rule.timing,action:rule.action,
    }])),owner_alerts:['Timing evidence only: confirm exact engine, drivetrain, tire/wheel equipment and use conditions before owner activation.'] };
}
