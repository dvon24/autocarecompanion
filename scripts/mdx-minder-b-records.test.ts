import { ownerEquipmentReady } from '../src/lib/twin-owner-equipment';
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveDemoVehicleTwin, VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';
import { getExactTwinMaintenanceCoverage, getExactTwinMaintenanceRule } from '../src/lib/exact-twin-maintenance-rules';
import { MAINTENANCE_SCHEDULES, getScheduleForVehicle, getMaintenanceStatus, getApplicableSchedules, getUpcomingMaintenance, estimateAnnualMaintenanceCost } from '../src/lib/maintenance';
import { getVehicleMaintenanceIntervals, applyOwnerMaintenanceIntervals } from '../src/lib/vehicle-maintenance-intervals';
import { buildModelOwnerTrees } from '../src/components/twin/demo-trees';
import { buildTwinMaintenanceSchedule } from '../src/components/twin/maintenance-schedule';
import { loadLatestTwinServiceRecords, serializeTwinServiceRecord, TWIN_SERVICE_RECORD_TYPES } from '../src/lib/twin-hub-data';
import { ServiceReviewSchema } from '../src/lib/maintenance-service-review';
import { persistServiceReview, persistMaintenanceEntry } from '../src/lib/maintenance-service-mutation';
import { TwinDataCtx } from '../src/components/twin/twin-context';
import { TTServiceRow, TTSchedule } from '../src/components/twin/stage/TechTree';

const expected = {
  brakeInspection:'brake_axles_inspection', steeringInspection:'steering_inspection', suspensionInspection:'suspension_inspection',
  driveshaftBootsInspection:'driveshaft_boots_inspection', brakeLinesInspection:'brake_lines_inspection',
  fluidLevelsInspection:'fluid_levels_inspection', exhaustInspection:'exhaust_inspection', fuelLinesInspection:'fuel_lines_inspection',
};
const twin=resolveDemoVehicleTwin('mdx')!;
const vehicle={...twin.identity,id:'synthetic-mdx',userId:'synthetic-owner',currentMileage:60000,transmission:null};
const now=new Date('2026-09-13T12:00:00Z');
function rebuild(records:any[]=[],miles=60000){
  const trees=buildModelOwnerTrees(twin,records,miles as never,null,now.toISOString() as never);
  applyOwnerMaintenanceIntervals(trees,records,vehicle,miles,now.toISOString());
  return trees;
}
function confirmed(type:string,mileage=59000,date='2026-09-01'){
  return ServiceReviewSchema.parse({requestId:'faaf932b-3d8a-43ea-b25a-8bfac8878e57',vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date,mileage,jobs:[{type,description:'Completed inspection of this job only'}]});
}
function fixture(){
  const rows:any[]=[];
  const tx={
    $queryRaw:async()=>[], $executeRaw:async()=>1,
    vehicle:{findFirst:async({where}:any)=>where.id===vehicle.id&&where.userId===vehicle.userId?vehicle:null},
    maintenanceRecord:{findMany:async()=>[],create:async({data}:any)=>{const row={...data,nextDueMileage:data.nextDueMileage??null};rows.push(row);return row;}},
  };
  return {rows,tx};
}
async function readback(rows:any[],miles=60000){
  const selected=await loadLatestTwinServiceRecords(vehicle.id,miles,now,async query=>{
    assert.equal(query.where.vehicleId,vehicle.id);
    assert.deepEqual(query.orderBy,[{date:'desc'},{mileage:'desc'},{id:'desc'}]);
    return rows.filter(row=>row.vehicleId===query.where.vehicleId&&row.type===query.where.type&&row.mileage>=query.where.mileage.gte&&row.mileage<=query.where.mileage.lte&&row.date<=query.where.date.lte)
      .sort((a,b)=>b.date.getTime()-a.date.getTime()||b.mileage-a.mileage||b.id.localeCompare(a.id))[0]??null;
  });
  return JSON.parse(JSON.stringify(selected.map(serializeTwinServiceRecord)));
}

test('exact MDX B maps eight distinct inspections, null clocks and held kit; existing Minder jobs remain',()=>{
  const coverage=getExactTwinMaintenanceCoverage(vehicle);
  assert.deepEqual(coverage.map(item=>item.id),[...Object.keys(expected),'tireRepairKitExpiration','driveBelt','timingBelt','waterPumpInspection','valveInspection']);
  const trees=rebuild(),schedule=buildTwinMaintenanceSchedule(trees,60000);
  for(const [id,type] of Object.entries(expected)){
    const requirement=coverage.find(item=>item.id===id)!;
    assert.equal(requirement.maintenanceType,type);
    assert((TWIN_SERVICE_RECORD_TYPES as readonly string[]).includes(type));
    const rule=getExactTwinMaintenanceRule(type,vehicle)!;
    assert.equal(rule.timing,'minder');assert.equal(rule.action,'inspect');
    assert.equal(rule.intervalMiles,null);assert.equal(rule.intervalMonths,null);
    assert.match(rule.guidance,/Maintenance Minder B/);assert.match(rule.guidance,/does not certify current mechanical condition/);
    assert.match(rule.source.url,/2019\/MDX\/2019_MDX_Maintenance_Minder.pdf/);assert.match(rule.source.section,/p\. 2/);
    const node=trees.car.nodes['requirement_'+id];
    assert.equal(node.unlogged,true);assert.equal(node.dueMileage,null);assert.equal(node.dueDate,null);
    assert.equal(node.imageUnavailable,false);assert.match(node.img,/^\/twin-stage\/parts\//);assert.match(node.imageCaption,/Representative component illustration/);assert.equal(node.buyUrl,undefined);assert.equal(node.products,undefined);
    assert.equal(schedule.requirements.find(item=>item.id==='requirement_'+id)?.status,'never-logged');
    assert(!schedule.columns.some(column=>column.groups.some((group:any)=>group.items.some((item:any)=>item.id==='requirement_'+id))));
    {
      assert.equal(MAINTENANCE_SCHEDULES[type].defaultIntervalMiles,0);assert.equal(MAINTENANCE_SCHEDULES[type].defaultIntervalMonths,0);
      assert.equal(getScheduleForVehicle(type,vehicle),null,'No invented generic inspection price or recurring schedule');
      assert.equal(getMaintenanceStatus({...vehicle,annualMileage:12000,lastMileageUpdate:now} as never,[],type).status,'unknown');
      assert(!getApplicableSchedules(vehicle).some(item=>item.id===type));
      for(const context of [undefined,vehicle])assert(!getUpcomingMaintenance({...vehicle,annualMileage:12000,lastMileageUpdate:now} as never,[],context).some(item=>item.type.id===type));
      const generic=getVehicleMaintenanceIntervals(type,{year:2024,make:'Other',model:'Other'});
      assert.equal(generic.intervalMiles,null);assert.equal(generic.intervalMonths,null);
    }
  }
  assert.match(trees.car.nodes.requirement_brakeInspection.serviceLabel,/Front and rear/);
  assert.match(trees.car.nodes.requirement_brakeLinesInspection.serviceGuidance,/ABS\/VSA/);
  assert.match(trees.car.nodes.requirement_steeringInspection.serviceGuidance,/tie rod ends, steering gearbox and boots/);
  assert.match(trees.car.nodes.requirement_fluidLevelsInspection.serviceGuidance,/all fluid levels and condition/);
  const kit=trees.car.nodes.requirement_tireRepairKitExpiration;
  assert.equal(kit.maintenanceType,undefined);assert.equal(kit.serviceTiming,'equipment');
  assert.match(kit.serviceLogHold,/Equipment unconfirmed/);assert.match(kit.serviceGuidance,/not available on all models/);
  assert.equal(kit.dueMileage,undefined);assert.equal(kit.dueDate,undefined);
  assert.equal(schedule.requirements.find(item=>item.id==='requirement_tireRepairKitExpiration')?.status,'coverage-hold');
  assert.equal(ownerEquipmentReady(twin.identity),false);
  assert.deepEqual(VEHICLE_TWIN_CATALOG.filter(item=>!ownerEquipmentReady(item.identity)).map(item=>item.id).sort(),['aviator','kicks','mdx','murano','nautilus','xt6']);
});

for(const [id,type] of Object.entries(expected))test(type+': actual confirmed write/readback only completes that inspection',async()=>{
  const {rows,tx}=fixture();
  const result=await persistServiceReview(tx as never,vehicle.userId,confirmed(type),now);
  assert.equal(result.records.length,1);assert.equal(rows.length,1);assert.equal(rows[0].type,type);
  assert.equal(rows[0].nextDueMileage,null);assert.equal(rows[0].nextDueDate,null);
  const valid=rows[0];
  rows.push({...valid,id:'invalid-negative',mileage:-1},{...valid,id:'invalid-ahead',mileage:60001},
    {...valid,id:'invalid-future',date:new Date('2027-01-01')},{...valid,id:'wrong-car',vehicleId:'another-car'},
    {...valid,id:'older',date:new Date('2026-01-01')});
  const serialized=await readback(rows),trees=rebuild(serialized),schedule=buildTwinMaintenanceSchedule(trees,60000);
  assert.equal(serialized.length,1);assert.equal(serialized[0].id,valid.id);
  for(const sibling of Object.keys(expected)){
    const node=trees.car.nodes['requirement_'+sibling];
    assert.equal(node.unlogged,sibling!==id);
    assert.equal(schedule.requirements.find(item=>item.id==='requirement_'+sibling)?.status,sibling===id?'recorded':'never-logged');
  }
  const node=trees.car.nodes['requirement_'+id];
  assert.equal(node.servicedAt,59000);assert.equal(node.servicedDate,'2026-09-01T00:00:00.000Z');assert.equal(node.serviceRecordId,valid.id);
  assert.equal(node.dueMileage,null);assert.equal(node.dueDate,null);assert.equal(trees.car.nodes.oil.unlogged,true);
  const html=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner',vehicle,miles:60000,trees,ownerActions:{vehicleId:vehicle.id,refresh:()=>{}}} as never},React.createElement(TTServiceRow,{node,miles:60000,dense:false})));
  assert.match(html,/Last logged at/);assert.match(html,/59,000/);assert.match(html,/Log again/);assert.doesNotMatch(html,/Mark as done|next projected/);
});

test('oil, filter, brake and fluid repair history cannot fan out into B inspections',()=>{
  const rows=['oil_change','air_filter','brake_service','front_brake_pads','brake_fluid','other_service'].map(type=>({id:type,type,mileage:59000,date:'2026-09-01',nextDueMileage:null,nextDueDate:null}));
  const trees=rebuild(rows);
  for(const id of Object.keys(expected))assert.equal(trees.car.nodes['requirement_'+id].unlogged,true);
  assert.equal(trees.car.nodes.oil.unlogged,false);
  assert.equal(trees.car.nodes.requirement_tireRepairKitExpiration.servicedAt,undefined);
});
test('zero-mile inspection remains evidence; future, unconfirmed and wrong-owner writes are rejected',async()=>{
  const {tx,rows}=fixture();
  await persistServiceReview(tx as never,vehicle.userId,confirmed('steering_inspection',0),now);
  const trees=rebuild(await readback(rows,0),0);
  assert.equal(trees.car.nodes.requirement_steeringInspection.servicedAt,0);assert.equal(trees.car.nodes.requirement_steeringInspection.unlogged,false);
  assert.equal(trees.car.nodes.requirement_steeringInspection.dueMileage,null);
  assert.equal(ServiceReviewSchema.safeParse({...confirmed('steering_inspection'),confirmed:false}).success,false);
  assert.equal(ServiceReviewSchema.safeParse({...confirmed('steering_inspection'),mileage:-1}).success,false);
  await assert.rejects(persistServiceReview(tx as never,vehicle.userId,confirmed('steering_inspection',100,'2027-01-01'),now),/future/);
  await assert.rejects(persistServiceReview(tx as never,'wrong-owner',confirmed('steering_inspection'),now),/Vehicle not found/);
  assert.equal(rows.length,1);
});
test('held kit has no logging affordance; B inspection has the existing confirmed-service entry',()=>{
  const trees=rebuild();
  const render=(node:any)=>renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner',vehicle,miles:60000,trees,ownerActions:{vehicleId:vehicle.id,refresh:()=>{}}} as never},React.createElement(TTServiceRow,{node,miles:60000,dense:false})));
  assert.match(render(trees.car.nodes.requirement_steeringInspection),/Log service/);
  assert.match(render(trees.car.nodes.requirement_steeringInspection),/Maintenance Minder code/);
  assert.doesNotMatch(render(trees.car.nodes.requirement_tireRepairKitExpiration),/Log service|Log again|Mark as done/);
  const schedule=buildTwinMaintenanceSchedule(trees,60000);
  const markup=renderToStaticMarkup(React.createElement(TTSchedule,{schedule,miles:60000,onOpenNode:()=>{}}));
  for(const id of Object.keys(expected))assert.match(markup,new RegExp('data-schedule-node="requirement_'+id+'"'));
  assert.match(markup,/Tire repair kit bottle expiration check/);
});
test('MDX-specific coverage does not leak to another year, trim or model',()=>{
  for(const identity of [{...vehicle,year:2020},{...vehicle,trim:'Sport Hybrid Technology'},{...vehicle,model:'RDX'}]){
    assert.deepEqual(getExactTwinMaintenanceCoverage(identity),[]);
    for(const type of Object.values(expected))assert.equal(getExactTwinMaintenanceRule(type,identity),undefined);
  }
});
test('public legacy cost estimates assign no dollars to the eight record-only inspection types',()=>{
  // Bound the exported catalogue to these synthetic test subjects so existing
  // unrelated zero-clock cost behavior cannot mask a new contribution.
  const originals={...MAINTENANCE_SCHEDULES};
  const oilBefore=getScheduleForVehicle('oil_change',vehicle);
  try {
    for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];
    for(const type of Object.values(expected))MAINTENANCE_SCHEDULES[type]=originals[type];
    assert.deepEqual(estimateAnnualMaintenanceCost(12000),{routine:0,periodic:0,major:0,total:0});
    assert.deepEqual(estimateAnnualMaintenanceCost(12000,vehicle),{routine:0,periodic:0,major:0,total:0});
    assert.deepEqual(getApplicableSchedules(vehicle),[]);
    assert.deepEqual(getUpcomingMaintenance({...vehicle,annualMileage:12000,lastMileageUpdate:now} as never,[]),[]);
  } finally {
    for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];
    Object.assign(MAINTENANCE_SCHEDULES,originals);
  }
  assert.deepEqual(getScheduleForVehicle('oil_change',vehicle),oilBefore);
});

for(const description of [undefined,'Front pads only; rear not inspected','Brakes checked','Front and rear inspected']) {
  test('generic brake history stays unassigned with '+(description??'absent description'),async()=>{
    const {tx,rows}=fixture();
    const legacy=await persistMaintenanceEntry(tx as never,vehicle as never,{type:'brake_inspection',mileage:59000,date:'2026-09-01',...(description?{description}:{} )},now,'legacy-brake');
    assert.equal(rows.length,1);assert.equal(legacy.type,'brake_inspection');assert.equal(legacy.description,description);
    assert.equal(legacy.nextDueMileage,74000,'Generic legacy brake policy remains unchanged');
    const original=structuredClone(rows[0]);
    const payload=await readback(rows);
    assert.deepEqual(payload,[],'Unscoped generic brake records are not assigned to exact twin jobs');
    for(const records of [payload,[serializeTwinServiceRecord(legacy as never)]]) {
      const trees=rebuild(records),schedule=buildTwinMaintenanceSchedule(trees,60000);
      for(const id of Object.keys(expected))assert.equal(trees.car.nodes['requirement_'+id].unlogged,true);
      assert.equal(schedule.requirements.find(item=>item.id==='requirement_brakeInspection')?.status,'never-logged');
      assert.equal(trees.car.nodes.oil.unlogged,true);
    }
    assert.deepEqual(rows[0],original,'History evidence was not changed or reclassified');
    assert.equal(getExactTwinMaintenanceRule('brake_inspection',vehicle),undefined);
    assert.equal(MAINTENANCE_SCHEDULES.brake_inspection.recordOnly,undefined);
    const explicit=await persistServiceReview(tx as never,vehicle.userId,confirmed('brake_axles_inspection'),now);
    assert.equal(explicit.records.length,1);assert.equal(explicit.records[0].type,'brake_axles_inspection');
    const after=rebuild(await readback(rows));
    assert.equal(after.car.nodes.requirement_brakeInspection.unlogged,false);
    assert.equal(after.car.nodes.requirement_brakeInspection.serviceRecordId,explicit.records[0].id);
    for(const id of Object.keys(expected).filter(id=>id!=='brakeInspection'))assert.equal(after.car.nodes['requirement_'+id].unlogged,true);
    assert.deepEqual(rows[0],original,'Explicit new work must not replace the generic legacy row');
  });
}
