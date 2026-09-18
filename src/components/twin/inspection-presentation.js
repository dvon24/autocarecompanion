import { inspectionArt } from './inspection-art';
/* Presentation only: the source requirement, completion scope and clocks stay intact. */
export const EMBEDDED_INSPECTION_TYPES = new Set(['wheel_components_inspection','steering_suspension_driveshaft_inspection']);

// Keep the full dictionary (historic links and notes still resolve), but remove
// only presentation edges. Evidence traversals always use the original trees.
export function componentGraphNodes(nodes) {
  return Object.fromEntries(Object.entries(nodes).map(([id,node])=>{
    const kids=(node.kids || []).filter(child=>!nodes[child]?.visualHidden);
    // Unchanged nodes retain identity: existing demo mark/undo actions mutate
    // the canonical service node shared across branches, not a throwaway view.
    return [id,kids.length===(node.kids || []).length?node:{...node,kids}];
  }));
}
const ROUTES = {
  brakeParkingInspection:['wheel','brakes'], brakeInspection:['wheel','brakes'],
  brakeSystemInspection:['wheel','brakes'], brakeLinesInspection:['wheel','brakes'],
  coolingStrengthHosesInspection:['engine','rad'], waterPumpInspection:['engine','rad'],
  tireTreadInspection:['wheel','tire'], tireRepairKitExpiration:['wheel','tire'],
  wheelComponentsInspection:['wheel','wheelRoot'], steeringInspection:['wheel','wheelRoot'],
  steeringSystemInspection:['wheel','wheelRoot'], suspensionInspection:['wheel','wheelRoot'],
  chassisInspection:['wheel','wheelRoot'], powerSteeringInspection:['wheel','wheelRoot'],
  steeringSuspensionInspection:['wheel','wheelRoot'], steeringSuspensionDriveshaftInspection:['wheel','wheelRoot'],
  halfshaftBootsInspection:['trans','driveline'], driveshaftBootsInspection:['trans','driveline'],
  drivelineInspection:['trans','driveline'], exhaustInspection:['engine','exhaustChecks'],
  exhaustHeatShieldsInspection:['engine','exhaustChecks'], fuelLinesInspection:['engine','fuelChecks'],
  evapInspection:['engine','fuelChecks'], fluidLevelsInspection:['engine','fluidChecks'],
  driveBelt:['engine','hoodRoot'], driveBeltReplace:['engine','hoodRoot'],
  beltInspection:['engine','hoodRoot'], timingBelt:['engine','hoodRoot'], valveInspection:['engine','hoodRoot'],
  liftStruts:['wipers','wiperRoot'], acDesiccant:['wipers','wiperRoot'],
  keyBatteryInspect:['wipers','wiperRoot'], keyBatteryReplace:['wipers','wiperRoot'],
};
const GROUPS = {
  exhaustChecks:'Exhaust & heat shields', fuelChecks:'Fuel & evaporative system',
  fluidChecks:'Fluid levels · complete multi-system inspection',
};
const GROUP_LOCATIONS = {
  exhaustChecks:'Exhaust system and surrounding heat shields',
  fuelChecks:'Fuel lines and evaporative-emissions system',
  fluidChecks:'Fluid reservoirs and circuits named in the inspection',
};
// These titles identify portions of the existing held instructions, not new jobs.
// Every view retains the entire source instruction and the original logging hold.
const HELD = {
  nautilus:[['trans','transFluid','Transmission fluid-level inspection'],['trans','driveline','AWD rear axle & U-joints · confirm equipment']],
  aviator:[['trans','driveline','Front/rear axle & U-joint inspections'],['wipers','cabinFilter','Cabin-filter inspection · if equipped'],['engine','airFilter','Engine-air-filter inspection']],
  murano:[['trans','driveline','Complete manual inspection visits · full scope']],
  kicks:[['trans','driveline','Complete manual inspection visits · full scope']],
  xt6:[['engine','oil','Oil level & oil-life checks'],['engine','airFilter','Air-filter life or inspection'],
    ['engine','rad','Coolant level & fluid-leak checks'],['wipers','washerFluid','Washer-fluid level'],
    ['wheel','tire','Tire pressure & wear checks'],['wipers','wiperRoot','Restraint-system checks'],
    ['engine','fuelChecks','Fuel-system damage & leaks'],['engine','exhaustChecks','Exhaust & heat-shield checks'],
    ['wipers','wiperRoot','Body lubrication & gas-strut checks'],['wipers','wiperRoot','Starter switch & accelerator-pedal checks'],
    ['wheel','brakes','Parking brake & transmission park checks'],['wipers','wiperRoot','Sunroof track & seal · if equipped']],
};

export function attachInspectionPresentation(trees, twinId, requirements, makeNode) {
  function attach(branch, parent, id, node) {
    const nodes = trees[branch].nodes;
    if (!nodes[parent] && GROUPS[parent]) {
      nodes[parent] = makeNode({label:GROUPS[parent],sub:'Component inspection group',group:true,kids:[],
        where:GROUP_LOCATIONS[parent],spec:'Open a check below for its complete service scope. This group is not a completed service record.',
        ...inspectionArt(parent,twinId)});
      nodes.hoodRoot.kids.push(parent);
    }
    if (!nodes[parent]) throw new Error(`Missing inspection presentation parent: ${parent}`);
    nodes[id] = node;
    if (node.visualHidden) nodes[parent].embeddedServiceIds = [...(nodes[parent].embeddedServiceIds || []),id];
    nodes[parent].presentationHasRequirements = true;
    nodes[parent].kids = [...(nodes[parent].kids || []),id];
  }
  for (const item of requirements) {
    const canonicalId = `requirement_${item.id}`;
    const routes = item.id === 'requiredChecks' ? HELD[twinId] : [ROUTES[item.id]];
    if (!routes?.length || routes.some(route=>!route)) throw new Error(`Unmapped inspection requirement: ${twinId}/${item.id}`);
    const base = {
      label:item.label, sub:item.maintenanceType?'Record only this complete job':item.equipmentGuidance?'Confirm equipment before recording':'Owner-manual requirement · dedicated logging not yet mapped',
      ...inspectionArt(item.id,twinId),visualHidden:EMBEDDED_INSPECTION_TYPES.has(item.maintenanceType),
      where:'Confirm the applicable component and equipment in the cited manual',
      spec:item.guidance,life:item.guidance,manualRequirement:true,
      sourceRequirementId:item.id,canonicalRequirementId:canonicalId,
      unlogged:Boolean(item.maintenanceType),maintenanceType:item.maintenanceType,serviceLabel:item.label,
      serviceTiming:item.equipmentGuidance?'equipment':'inspection',serviceAction:item.action,
      serviceGuidance:item.guidance,serviceEquipmentGuidance:item.equipmentGuidance,
      serviceLogHold:item.logHold || (item.maintenanceType?undefined:'Dedicated service recording is not yet mapped for this requirement.'),
      serviceSourceLabel:`${item.source.primary} · ${item.source.section}`,serviceSourceUrl:item.source.url,
      sourceLabel:item.source.primary,sourceUrl:item.source.url,
    };
    routes.forEach(([branch,parent,label],index)=>attach(branch,parent,index?`${canonicalId}_view_${index}`:canonicalId,
      makeNode({...base,...inspectionArt(item.id,twinId,index),...(label?{label,serviceLabel:label}:{}),presentationSystem:branch})));
    // The same complete job is reachable from the driveline, not a boots-only log.
    if (item.id === 'steeringSuspensionDriveshaftInspection') {
      attach('trans','driveline',`${canonicalId}_driveline`,makeNode({...base,presentationSystem:'trans'}));
    }
    if (item.id === 'fluidLevelsInspection') {
      for (const [branch,parent] of [['trans','transFluid'],['wheel','brakes'],['wipers','washerFluid']]) {
        attach(branch,parent,`${canonicalId}_${branch}`,makeNode({...base,presentationSystem:branch}));
      }
    }
  }
}
