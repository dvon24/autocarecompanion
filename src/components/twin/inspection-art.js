// Artwork is presentation only, never a SKU, installed geometry or fluid claim.
const PART='/twin-stage/parts/';
const MAP={
 brakeParkingInspection:'caliper',brakeInspection:'caliper',brakeSystemInspection:'caliper',brakeLinesInspection:'brake-lines',
 coolingStrengthHosesInspection:'radiator',waterPumpInspection:'water-pump',
 tireTreadInspection:'tire',tireRepairKitExpiration:'tire-repair-kit',wheelComponentsInspection:'wheel',
 steeringInspection:'steering-rack',steeringSystemInspection:'steering-rack',powerSteeringInspection:'steering-rack',
 suspensionInspection:'suspension-assembly',chassisInspection:'suspension-assembly',steeringSuspensionInspection:'suspension-assembly',steeringSuspensionDriveshaftInspection:'suspension-assembly',
 halfshaftBootsInspection:'cv-halfshaft',driveshaftBootsInspection:'cv-halfshaft',drivelineInspection:'cv-halfshaft',
 exhaustInspection:'exhaust-assembly',exhaustHeatShieldsInspection:'exhaust-assembly',exhaustChecks:'exhaust-assembly',
 fuelLinesInspection:'evap-lines',evapInspection:'evap-lines',fuelChecks:'evap-lines',
 fluidLevelsInspection:'fluid-levels',fluidChecks:'fluid-levels',
 driveBelt:'serpentine-belt',driveBeltReplace:'serpentine-belt',beltInspection:'serpentine-belt',timingBelt:'timing-belt',valveInspection:'valvetrain',
 liftStruts:'lift-strut',acDesiccant:'ac-desiccant',keyBatteryInspect:'key-coin-cell',keyBatteryReplace:'key-coin-cell',
};
const HELD={
 nautilus:['fluid-levels','differential'],aviator:['differential','cabin-filter','air-filter'],
 murano:['vehicle-inspection'],kicks:['vehicle-inspection'],
 xt6:['oil','air-filter','radiator','washer-fluid','tire','seat-belt','evap-lines','exhaust-assembly','lift-strut','pedal-start','caliper','roof-system-concept.svg'],
};
export function inspectionArt(id,twinId,index=0){
 const key=id==='requiredChecks'?HELD[twinId]?.[index]:MAP[id];
 if(!key)throw new Error(`Unmapped component illustration: ${twinId}/${id}/${index}`);
 return {img:PART+(key.endsWith('.svg')?key:`part-${key}.webp`),imageUnavailable:false,
 imageCaption:'Representative component illustration, not the exact installed part or a purchase recommendation. Follow the complete service scope and reviewed specifications below.'};
}
export function attachDrivelineArt(trees,twinId){
 const nodes=trees.trans.nodes;
 const caption='Representative component illustration; confirm the installed assembly and fluid specification from the exact vehicle details below.';
 for(const [id,key] of Object.entries({driveline:['nautilus','murano','kicks'].includes(twinId)?'fwd-transaxle':twinId==='mdx'?'power-transfer-unit':'differential',clutchFluid:'service-fluid',transferFluid:'service-fluid'})){
  if(nodes[id]&&!nodes[id].img)Object.assign(nodes[id],{img:`${PART}part-${key}.webp`,imageUnavailable:false,imageCaption:caption});
 }
}
