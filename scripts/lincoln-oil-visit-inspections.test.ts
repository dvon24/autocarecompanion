import { ownerEquipmentReady } from '../src/lib/twin-owner-equipment';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {resolveDemoVehicleTwin, VEHICLE_TWIN_CATALOG} from '../src/lib/vehicle-twin-catalog';
import {getExactTwinMaintenanceCoverage, getExactTwinMaintenanceRule} from '../src/lib/exact-twin-maintenance-rules';
import {MAINTENANCE_SCHEDULES, getScheduleForVehicle, getMaintenanceStatus, getUpcomingMaintenance, estimateAnnualMaintenanceCost} from '../src/lib/maintenance';
import {getVehicleMaintenanceIntervals, applyOwnerMaintenanceIntervals} from '../src/lib/vehicle-maintenance-intervals';
import {buildModelOwnerTrees} from '../src/components/twin/demo-trees';
import {buildTwinMaintenanceSchedule} from '../src/components/twin/maintenance-schedule';
import {loadLatestTwinServiceRecords, serializeTwinServiceRecord, TWIN_SERVICE_RECORD_TYPES} from '../src/lib/twin-hub-data';
import {ServiceReviewSchema} from '../src/lib/maintenance-service-review';
import {persistServiceReview, persistMaintenanceEntry} from '../src/lib/maintenance-service-mutation';
import {TwinDataCtx} from '../src/components/twin/twin-context';
import {TTServiceRow, TTSchedule} from '../src/components/twin/stage/TechTree';

const common = {
  brakeParkingInspection:'brake_parking_inspection',
  coolingStrengthHosesInspection:'cooling_strength_hoses_inspection',
  exhaustHeatShieldsInspection:'exhaust_heat_shields_inspection',
  halfshaftBootsInspection:'halfshaft_boots_inspection',
  tireTreadInspection:'tire_tread_inspection',
  wheelComponentsInspection:'wheel_components_inspection',
};
const expected = {
  nautilus:{...common,steeringSuspensionDriveshaftInspection:'steering_suspension_driveshaft_inspection'},
  aviator:{...common,steeringSuspensionInspection:'steering_suspension_inspection'},
};
type Lincoln = keyof typeof expected;
const models = ['nautilus','aviator'] as const;
const allTypes=[...new Set(Object.values(expected).flatMap(Object.values))];
const now=new Date('2026-09-13T12:00:00Z');
function setup(model:Lincoln){
  const twin=resolveDemoVehicleTwin(model)!;
  const vehicle={...twin.identity,id:'synthetic-'+model,userId:'synthetic-owner',currentMileage:60000,transmission:null};
  const rows:any[]=[];
  const tx={
    $queryRaw:async()=>[], $executeRaw:async()=>1,
    vehicle:{findFirst:async({where}:any)=>where.id===vehicle.id&&where.userId===vehicle.userId?vehicle:null},
    maintenanceRecord:{findMany:async()=>[],create:async({data}:any)=>{const row={...data,nextDueMileage:data.nextDueMileage??null};rows.push(row);return row;}},
  };
  const confirmed=(type:string,mileage=59000,date='2026-09-01')=>ServiceReviewSchema.parse({requestId:randomUUID(),vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date,mileage,jobs:[{type,description:'Completed the full named inspection scope'}]});
  const rebuild=(records:any[]=[],miles=60000)=>{
    const trees=buildModelOwnerTrees(twin,records,miles as never,null,now.toISOString() as never);
    applyOwnerMaintenanceIntervals(trees,records,vehicle,miles,now.toISOString());return trees;
  };
  const readback=async(miles=60000)=>{
    const records=await loadLatestTwinServiceRecords(vehicle.id,miles,now,async query=>{
      assert.equal(query.where.vehicleId,vehicle.id);
      assert.deepEqual(query.orderBy,[{date:'desc'},{mileage:'desc'},{id:'desc'}]);
      assert.equal(query.where.mileage.gte,0);assert.equal(query.where.mileage.lte,miles);
      return rows.filter(row=>row.vehicleId===query.where.vehicleId&&row.type===query.where.type&&row.mileage>=0&&row.mileage<=miles&&row.date<=query.where.date.lte)
        .sort((a,b)=>b.date.getTime()-a.date.getTime()||b.mileage-a.mileage||b.id.localeCompare(a.id))[0]??null;
    });
    return JSON.parse(JSON.stringify(records.map(serializeTwinServiceRecord)));
  };
  return {twin,vehicle,rows,tx,confirmed,rebuild,readback};
}
function assertNoRepeatingInspections(schedule:ReturnType<typeof buildTwinMaintenanceSchedule>){
  assert(!schedule.columns.some(column=>column.groups.some((group:any)=>group.items.some((item:any)=>allTypes.includes(item.maintenanceType)||Object.keys(common).some(id=>item.id==='requirement_'+id)||/requirement_steeringSuspension/.test(item.id)))));
}
for(const model of models)test(model+': exact seven scopes, monitor caps and honest empty history',()=>{
  const {twin,vehicle,rebuild}=setup(model),trees=rebuild(),schedule=buildTwinMaintenanceSchedule(trees,60000);
  assert.deepEqual(getExactTwinMaintenanceCoverage(vehicle).map(item=>item.id),[...Object.keys(expected[model]),'requiredChecks','driveBelt','driveBeltReplace']);
  for(const [id,type] of Object.entries(expected[model])){
    assert((TWIN_SERVICE_RECORD_TYPES as readonly string[]).includes(type));
    const rule=getExactTwinMaintenanceRule(type,vehicle)!;
    assert.equal(rule.intervalMiles,10000);assert.equal(rule.intervalMonths,12);assert.equal(rule.timing,'monitor');assert.equal(rule.action,'inspect');
    assert.match(rule.source.primary,new RegExp(String(vehicle.year)));assert.match(rule.guidance,/every oil-change interval indicated by the vehicle display/);
    assert.match(rule.guidance,/maximum.*whichever is earlier.*not a recommended wait/);
    assert.match(rule.guidance,/this inspection record only.*earlier oil-service visits still require this check/);
    assert.match(rule.guidance,/No live monitor reading is inferred/);assert.match(rule.guidance,/does not certify current mechanical condition or a repaired known issue/);
    const node=trees.car.nodes['requirement_'+id];
    assert.equal(node.maintenanceType,type);assert.equal(node.unlogged,true);assert.equal(node.dueMileage,null);assert.equal(node.dueDate,null);assert.equal(node.firstServiceDeadline,false);
    assert.equal(node.imageUnavailable,false);assert.match(node.img,/^\/twin-stage\/parts\//);assert.match(node.imageCaption,/Representative component illustration/);assert.equal(node.buyUrl,undefined);assert.equal(node.products,undefined);
    assert.equal(schedule.requirements.find(item=>item.id==='requirement_'+id)?.status,'never-logged');
  }
  assertNoRepeatingInspections(schedule);
  assert.match(trees.car.nodes.requirement_brakeParkingInspection.serviceGuidance,/pads, rotors, hoses and parking brake/);
  assert.match(trees.car.nodes.requirement_coolingStrengthHosesInspection.serviceGuidance,/strength and hoses/);
  assert.match(trees.car.nodes.requirement_exhaustHeatShieldsInspection.serviceGuidance,/exhaust system and heat shields/);
  assert.match(trees.car.nodes.requirement_tireTreadInspection.serviceGuidance,/measure tread depth.*measurement was performed.*optionally.*notes/);
  assert.match(trees.car.nodes.requirement_wheelComponentsInspection.serviceGuidance,/abnormal noise, wear, looseness or drag/);
  const steering=trees.car.nodes['requirement_'+(model==='nautilus'?'steeringSuspensionDriveshaftInspection':'steeringSuspensionInspection')];
  assert.match(steering.serviceGuidance,/steering linkage, ball joints, suspension(?:,| and) tie-rod ends/);
  if(model==='nautilus')assert.match(steering.serviceGuidance,/tie-rod ends, driveshaft and U-joints/);
  else assert.doesNotMatch(steering.serviceGuidance,/driveshaft/);
  assert.equal(ownerEquipmentReady(twin.identity),false);assert.deepEqual(VEHICLE_TWIN_CATALOG.filter(item=>!ownerEquipmentReady(item.identity)).map(item=>item.id).sort(),['aviator','kicks','mdx','murano','nautilus','xt6']);
});
for(const model of models)for(const [id,type] of Object.entries(expected[model]))test(model+'/'+type+': actual confirmed write, bounded load and serialized tree isolate one inspection',async()=>{
  const {vehicle,rows,tx,confirmed,rebuild,readback}=setup(model),before=rebuild();
  const result=await persistServiceReview(tx as never,vehicle.userId,confirmed(type),now);
  assert.equal(result.records.length,1);assert.equal(rows[0].type,type);assert.equal(rows[0].nextDueMileage,69000);assert.equal(rows[0].nextDueDate.toISOString(),'2027-09-01T00:00:00.000Z');
  const valid=rows[0];rows.push({...valid,id:'negative',mileage:-1},{...valid,id:'ahead',mileage:60001},{...valid,id:'future',date:new Date('2027-01-01')},{...valid,id:'other-car',vehicleId:'other-car'},{...valid,id:'older',date:new Date('2026-01-01')});
  const payload=await readback(),trees=rebuild(payload),schedule=buildTwinMaintenanceSchedule(trees,60000),node=trees.car.nodes['requirement_'+id];
  assert.equal(payload.length,1);assert.equal(payload[0].id,valid.id);
  assert.equal(node.unlogged,false);assert.equal(node.servicedAt,59000);assert.equal(node.servicedDate,'2026-09-01T00:00:00.000Z');assert.equal(node.serviceRecordId,valid.id);
  assert.equal(node.dueMileage,69000);assert.equal(node.dueDate,'2027-09-01T00:00:00.000Z');
  assert.equal(schedule.requirements.find(item=>item.id==='requirement_'+id)?.status,'recorded');assertNoRepeatingInspections(schedule);
  for(const [other,previous] of Object.entries(before.car.nodes))if(other!=='requirement_'+id){
    if((previous as any).canonicalRequirementId==='requirement_'+id){
      assert.equal(trees.car.nodes[other].serviceRecordId,valid.id);assert.equal(trees.car.nodes[other].maintenanceType,node.maintenanceType);
      assert.equal(trees.car.nodes[other].serviceGuidance,node.serviceGuidance);assert.equal(trees.car.nodes[other].dueMileage,node.dueMileage);
    }else assert.deepEqual(trees.car.nodes[other],previous,'Unrelated evidence/commerce/known issue changed: '+other);
  }
  const html=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner',vehicle,miles:60000,trees,ownerActions:{vehicleId:vehicle.id,refresh:()=>{}}} as never},React.createElement(TTServiceRow,{node,miles:60000,dense:false})));
  assert.match(html,/Last logged at/);assert.match(html,/59,000/);assert.match(html,/Log again/);assert.doesNotMatch(html,/Mark as done/);
  const scheduleHtml=renderToStaticMarkup(React.createElement(TTSchedule,{schedule,miles:60000,onOpenNode:()=>{}}));
  assert.match(scheduleHtml,/Open complete service/);assert.doesNotMatch(scheduleHtml,/recorded limit 69,000 mi/);
  assert.match(node.serviceGuidance,/maximum.*whichever is earlier/);assert.match(node.serviceGuidance,/not a recommended wait/);
});
for(const model of models)test(model+': narrower history and wrong-model steering never fan out',async()=>{
  const {vehicle,rows,tx,rebuild,readback}=setup(model);
  const wrongSteering=model==='nautilus'?'steering_suspension_inspection':'steering_suspension_driveshaft_inspection';
  for(const type of ['brake_inspection','brake_axles_inspection','brake_system_inspection','brake_lines_inspection','steering_inspection','steering_system_inspection','suspension_inspection','driveline_inspection','driveshaft_boots_inspection','exhaust_inspection','fluid_levels_inspection','oil_change','tire_rotation','tire_replacement','brake_service','coolant_flush','cooling_system_service','other_service',wrongSteering]){
    await persistMaintenanceEntry(tx as never,vehicle as never,{type,mileage:59000,date:'2026-09-01',description:'Limited work; other scopes not inspected'},now,type);
  }
  const preserved=structuredClone(rows);
  for(const records of [await readback(),rows.map(serializeTwinServiceRecord)])for(const id of Object.keys(expected[model]))assert.equal(rebuild(records).car.nodes['requirement_'+id].unlogged,true);
  assert.deepEqual(rows,preserved);
});
for(const model of models)test(model+': off-cycle check retains its own cap across a later oil visit',async()=>{
  const {vehicle,rows,tx,confirmed,rebuild,readback}=setup(model);
  await persistServiceReview(tx as never,vehicle.userId,confirmed('cooling_strength_hoses_inspection',55000,'2026-07-01'),now);
  const first=rows[0];await persistServiceReview(tx as never,vehicle.userId,confirmed('oil_change',59000,'2026-09-01'),now);
  const trees=rebuild(await readback()),node=trees.car.nodes.requirement_coolingStrengthHosesInspection;
  assert.equal(node.serviceRecordId,first.id);assert.equal(node.dueMileage,65000);assert.equal(node.dueDate,'2027-07-01T00:00:00.000Z');
  assert.equal(trees.car.nodes.oil.dueMileage,69000);assert.match(node.serviceGuidance,/earlier oil-service visits still require this check/);
  for(const id of Object.keys(expected[model]))if(id!=='coolingStrengthHosesInspection')assert.equal(trees.car.nodes['requirement_'+id].unlogged,true);
  assertNoRepeatingInspections(buildTwinMaintenanceSchedule(trees,60000));
});
for(const model of models)test(model+': saved mileage boundaries and calendar equality remain requirements-only',()=>{
  const {rebuild}=setup(model);
  for(const [id,type] of Object.entries(expected[model]))for(const limit of [59999,60000,60001]){
    const trees=rebuild([{id:'explicit',type,mileage:59000,date:'2026-09-01',nextDueMileage:limit,nextDueDate:'2027-09-01'}]);
    const schedule=buildTwinMaintenanceSchedule(trees,60000),item=schedule.requirements.find(item=>item.id==='requirement_'+id)!;
    assert.equal(item.dueMileage,limit);assert.equal(item.dueDate,'2027-09-01');assert.equal(item.status,limit<60000?'overdue':'recorded');assertNoRepeatingInspections(schedule);
  }
  const schedule=buildTwinMaintenanceSchedule(rebuild([{id:'calendar',type:'tire_tread_inspection',mileage:59000,date:'2025-09-13',nextDueMileage:70000,nextDueDate:now.toISOString()}]),60000);
  assert.equal(schedule.requirements.find(item=>item.id==='requirement_tireTreadInspection')?.status,'overdue');assertNoRepeatingInspections(schedule);
});
for(const model of models)test(model+': deterministic equal-date history, zero miles, optional readings and rejected writes',async()=>{
  const {vehicle,rows,tx,confirmed,rebuild,readback}=setup(model);
  await persistServiceReview(tx as never,vehicle.userId,{...confirmed('tire_tread_inspection',0),notes:'Actual tread readings: 7/32 in at all inspected positions'},now);
  assert.match(rows[0].notes,/7\/32/);assert.equal(rows[0].nextDueMileage,10000);
  const zero=rebuild(await readback(0),0).car.nodes.requirement_tireTreadInspection;assert.equal(zero.unlogged,false);assert.equal(zero.servicedAt,0);
  const base=rows[0];rows.push({...base,id:'tie-a',mileage:59000},{...base,id:'tie-z',mileage:59000},{...base,id:'lower-mile-z',mileage:58000});
  const payload=await readback(),node=rebuild(payload).car.nodes.requirement_tireTreadInspection;
  assert.equal(payload[0].id,'tie-z');assert.equal(node.serviceRecordId,'tie-z');
  assert.equal(ServiceReviewSchema.safeParse({...confirmed('tire_tread_inspection'),confirmed:false}).success,false);
  assert.equal(ServiceReviewSchema.safeParse({...confirmed('tire_tread_inspection'),mileage:-1}).success,false);
  await assert.rejects(persistServiceReview(tx as never,vehicle.userId,confirmed('tire_tread_inspection',100,'2027-01-01'),now),/future/);
  await assert.rejects(persistServiceReview(tx as never,'other-owner',confirmed('tire_tread_inspection'),now),/Vehicle not found/);
  assert.equal(rows.length,4);
});
for(const model of models)test(model+': remaining model-specific obligations stay held, other timing stays distinct',()=>{
  const {vehicle,rebuild}=setup(model),trees=rebuild(),hold=trees.car.nodes.requirement_requiredChecks;
  assert.equal(hold.sourceRequirementId,'requiredChecks');assert.equal(hold.maintenanceType,undefined);assert(hold.serviceLogHold);
  assert.match(hold.serviceGuidance,/multi-point inspection is recommended/);assert.match(hold.serviceGuidance,/no equipment or completion is assumed/);
  if(model==='nautilus'){
    assert.match(hold.serviceGuidance,/automatic-transmission fluid level.*consult your dealer/);assert.match(hold.serviceGuidance,/rear axle and U-joints on AWD vehicles only/);assert.doesNotMatch(hold.serviceGuidance,/front axle|cabin air filter/);
  }else{
    assert.match(hold.serviceGuidance,/front axle.*rear axle and U-joints/);assert.match(hold.serviceGuidance,/cabin air filter if equipped and the engine air filter; service as required/);assert.match(hold.serviceGuidance,/three-year job requiring dealer equipment/);
  }
  const html=renderToStaticMarkup(React.createElement(TTServiceRow,{node:hold,miles:60000,dense:false}));assert.match(html,/data-service-coverage-hold/);assert.doesNotMatch(html,/<button/);
  for(const [type,miles,months] of [['oil_change',10000,12],['tire_rotation',null,null],['cabin_filter',20000,null],['air_filter',30000,null],['drive_belt_inspection',null,null],['serpentine_belt',null,null]] as const){const rule=getExactTwinMaintenanceRule(type,vehicle)!;assert.equal(rule.intervalMiles,miles);assert.equal(rule.intervalMonths,months);}
});
test('eight record-only vocabularies have no generic inferred deadlines/prices or unrelated exact-model rules',()=>{
  for(const model of models){
    const {vehicle}=setup(model);
    for(const identity of [{...vehicle,year:vehicle.year+1},{...vehicle,trim:'Unreviewed'},resolveDemoVehicleTwin('mdx')!.identity,resolveDemoVehicleTwin('xt6')!.identity])for(const type of allTypes){assert.equal(getExactTwinMaintenanceRule(type,identity),undefined);assert.equal(getVehicleMaintenanceIntervals(type,identity).intervalMiles,null);}
    for(const type of allTypes){
      assert.equal(MAINTENANCE_SCHEDULES[type].recordOnly,true);assert.equal(getScheduleForVehicle(type,vehicle),null);assert.equal(getMaintenanceStatus({...vehicle,lastMileageUpdate:now} as never,[],type).status,'unknown');
      for(const context of [undefined,vehicle])assert(!getUpcomingMaintenance({...vehicle,lastMileageUpdate:now} as never,[],context).some(item=>item.type.id===type));
    }
  }
  const originals={...MAINTENANCE_SCHEDULES};
  try {
    for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];for(const type of allTypes)MAINTENANCE_SCHEDULES[type]=originals[type];
    for(const identity of [undefined,setup('nautilus').vehicle,setup('aviator').vehicle])assert.deepEqual(estimateAnnualMaintenanceCost(12000,identity),{routine:0,periodic:0,major:0,total:0});
  }finally{for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];Object.assign(MAINTENANCE_SCHEDULES,originals);}
});
