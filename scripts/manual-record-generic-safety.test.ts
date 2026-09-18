import { ownerEquipmentReady } from '../src/lib/twin-owner-equipment';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MAINTENANCE_SCHEDULES, getScheduleForVehicle, getApplicableSchedules, getMaintenanceStatus, getAllMaintenanceStatuses, getUpcomingMaintenance, estimateAnnualMaintenanceCost, type MaintenanceType} from '../src/lib/maintenance';
import {resolveDemoVehicleTwin, VEHICLE_TWIN_CATALOG} from '../src/lib/vehicle-twin-catalog';
import {getExactTwinMaintenanceRule} from '../src/lib/exact-twin-maintenance-rules';
import {applyOwnerMaintenanceIntervals} from '../src/lib/vehicle-maintenance-intervals';
import {buildModelOwnerTrees} from '../src/components/twin/demo-trees';
import {buildTwinMaintenanceSchedule} from '../src/components/twin/maintenance-schedule';
import {loadLatestTwinServiceRecords, serializeTwinServiceRecord, TWIN_SERVICE_RECORD_TYPES} from '../src/lib/twin-hub-data';
import {ServiceReviewSchema} from '../src/lib/maintenance-service-review';
import {persistServiceReview} from '../src/lib/maintenance-service-mutation';
import {ServiceReview} from '../src/components/maintenance/ServiceReview';
import {LogMaintenanceModal} from '../src/components/maintenance/LogMaintenanceModal';
import {MaintenanceOverview} from '../src/components/maintenance/MaintenanceStatusBar';

const scoped=['drive_belt_inspection','evap_system_inspection','ac_desiccant_replacement','water_pump_inspection','valve_clearance_inspection'];
const now=new Date('2026-09-13T12:00:00Z');
const xt6={...resolveDemoVehicleTwin('xt6')!.identity,id:'synthetic-xt6',userId:'synthetic-owner',currentMileage:60000,transmission:null,lastMileageUpdate:now};
const generic={year:2020,make:'Unreviewed',model:'Synthetic'};
const zero={routine:0,periodic:0,major:0,total:0};
function withCatalog(entries:Record<string,MaintenanceType>,run:()=>void){
  const originals={...MAINTENANCE_SCHEDULES};
  try{for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];Object.assign(MAINTENANCE_SCHEDULES,entries);run();}
  finally{for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];Object.assign(MAINTENANCE_SCHEDULES,originals);}
}
function entry(id:string,miles:number,category:MaintenanceType['category']='routine',recordOnly=false):MaintenanceType{
  return {id,name:id,description:'Synthetic frequency probe',defaultIntervalMiles:miles,defaultIntervalMonths:12,category,icon:'wrench',...(recordOnly?{recordOnly:true}:{})};
}
test('five manual-only records return neutral unknown status and no generic schedules/upcoming/default dollars',()=>{
  for(const type of scoped){
    assert.equal(MAINTENANCE_SCHEDULES[type].recordOnly,true);assert.equal(MAINTENANCE_SCHEDULES[type].id,type);assert((TWIN_SERVICE_RECORD_TYPES as readonly string[]).includes(type));
    for(const vehicle of [generic,xt6])assert.equal(getScheduleForVehicle(type,vehicle),null);
    for(const context of [undefined,xt6])for(const records of [[],[{id:'actual',vehicleId:xt6.id,type,mileage:59000,date:new Date('2026-09-01'),nextDueMileage:60001,nextDueDate:null}]]){
      const result=getMaintenanceStatus(xt6 as never,records as never,type,context);
      assert.equal(result.status,'unknown');assert.match(result.message,/completed service/);assert.match(result.message,/exact manual or Minder/);assert.doesNotMatch(result.message,/completed inspection|no exact/);
      assert.equal(result.dueAtMileage,undefined);assert.equal(result.dueAtDate,undefined);
      assert(!getUpcomingMaintenance(xt6 as never,records as never,context).some(item=>item.type.id===type));
    }
    assert.equal(getAllMaintenanceStatuses(xt6 as never,[])[type].status,'unknown');assert.equal(getAllMaintenanceStatuses(xt6 as never,[],xt6)[type],undefined);
  }
  assert(!getApplicableSchedules(xt6).some(item=>scoped.includes(item.id)));
  withCatalog(Object.fromEntries(scoped.map(type=>[type,MAINTENANCE_SCHEDULES[type]])),()=>{for(const context of [undefined,xt6])assert.deepEqual(estimateAnnualMaintenanceCost(12000,context),zero);});
  for(const type of ['front_brake_pads','rear_brake_pads','front_brake_rotors','rear_brake_rotors','radiator_replacement','other_service','rear_axle_fluid','awd_clutch_fluid'])assert.equal(MAINTENANCE_SCHEDULES[type].recordOnly,undefined,'Unrelated generic status policy must remain unchanged');
});
test('old context-filtered form and overview omit manual-only jobs; shared confirmed review still offers exact canonicals',()=>{
  const modal=renderToStaticMarkup(React.createElement(LogMaintenanceModal,{vehicleId:xt6.id,currentMileage:60000,vehicleContext:xt6,onClose:()=>{},onRecordAdded:()=>{}}));
  const overview=renderToStaticMarkup(React.createElement(MaintenanceOverview,{currentMileage:60000,annualMileage:12000,maintenanceRecords:[],showAll:true,vehicleContext:xt6}));
  const unfilteredModal=renderToStaticMarkup(React.createElement(LogMaintenanceModal,{vehicleId:xt6.id,currentMileage:60000,onClose:()=>{},onRecordAdded:()=>{}}));
  for(const type of scoped){
    assert(!modal.includes(`value="${type}"`));assert(!overview.includes(MAINTENANCE_SCHEDULES[type].name));assert(unfilteredModal.includes(`value="${type}"`));
    const shared=renderToStaticMarkup(React.createElement(ServiceReview,{vehicleId:xt6.id,currentMileage:60000,service:{typeId:type,label:MAINTENANCE_SCHEDULES[type].name}}));
    assert(shared.includes(`value="${type}"`));assert(shared.includes(MAINTENANCE_SCHEDULES[type].name));assert.match(shared,/Confirm and save service/);
  }
});
const exactCases=[
  ['xt6','requirement_beltInspection','drive_belt_inspection',150000,120],
  ['xt6','requirement_evapInspection','evap_system_inspection',45000,null],
  ['xt6','requirement_acDesiccant','ac_desiccant_replacement',null,84],
  ['mdx','requirement_driveBelt','drive_belt_inspection',null,null],
  ['mdx','requirement_waterPumpInspection','water_pump_inspection',null,null],
  ['mdx','requirement_valveInspection','valve_clearance_inspection',null,null],
  ['nautilus','requirement_driveBelt','drive_belt_inspection',null,null],
  ['aviator','requirement_driveBelt','drive_belt_inspection',null,null],
] as const;
for(const [model,nodeId,type,miles,months] of exactCases)test(model+'/'+type+': actual confirmed persistence and bounded tree evidence retain exact clocks',async()=>{
  const twin=resolveDemoVehicleTwin(model)!,vehicle={...twin.identity,id:'synthetic-'+model,userId:'synthetic-owner',currentMileage:60000,transmission:null},rows:any[]=[];
  const rule=getExactTwinMaintenanceRule(type,vehicle)!;assert.equal(rule.intervalMiles,miles);assert.equal(rule.intervalMonths,months);
  const tx={$queryRaw:async()=>[],$executeRaw:async()=>1,vehicle:{findFirst:async({where}:any)=>where.id===vehicle.id&&where.userId===vehicle.userId?vehicle:null},maintenanceRecord:{findMany:async()=>[],create:async({data}:any)=>{const row={...data,nextDueMileage:data.nextDueMileage??null};rows.push(row);return row;}}};
  const input=ServiceReviewSchema.parse({requestId:randomUUID(),vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date:'2026-09-01',mileage:59000,jobs:[{type,description:'Actual completed service'}]});
  const saved=await persistServiceReview(tx as never,vehicle.userId,input,now);assert.equal(saved.records.length,1);assert.equal(rows[0].type,type);assert.equal(rows[0].nextDueMileage,miles==null?null:59000+miles);
  const records=await loadLatestTwinServiceRecords(vehicle.id,60000,now,async query=>{
    assert.equal(query.where.vehicleId,vehicle.id);assert.deepEqual(query.orderBy,[{date:'desc'},{mileage:'desc'},{id:'desc'}]);
    return rows.find(row=>row.type===query.where.type&&row.vehicleId===query.where.vehicleId&&row.date<=query.where.date.lte&&row.mileage>=query.where.mileage.gte&&row.mileage<=query.where.mileage.lte)??null;
  });
  const payload=JSON.parse(JSON.stringify(records.map(serializeTwinServiceRecord))),trees=buildModelOwnerTrees(twin,payload,60000 as never,null,now.toISOString() as never);
  applyOwnerMaintenanceIntervals(trees,payload,vehicle,60000,now.toISOString());const node=trees.car.nodes[nodeId];
  assert.equal(node.serviceRecordId,rows[0].id);assert.equal(node.servicedAt,59000);assert.equal(node.unlogged,false);assert.equal(node.serviceIntervalMiles,miles);assert.equal(node.serviceIntervalMonths,months);assert.equal(node.dueMileage,miles==null?null:59000+miles);
  assert.equal(node.dueDate,months===120?'2036-09-01T00:00:00.000Z':months===84?'2033-09-01T00:00:00.000Z':null);
  assert.equal(buildTwinMaintenanceSchedule(trees,60000).requirements.find(item=>item.id===nodeId)?.status,'recorded');
  for(const [otherId,other] of Object.entries(trees.car.nodes) as Array<[string,any]>)if(otherId!==nodeId&&other.manualRequirement&&other.maintenanceType)assert.equal(other.unlogged,true);
  assert.equal(trees.car.nodes.oil.unlogged,true);assert.equal(ownerEquipmentReady(twin.identity),false);
});
test('normal positive default arithmetic and existing vehicle overrides retain prices and rounding',()=>{
  const entries={oil_change:entry('oil_change',10000),brake_fluid:entry('brake_fluid',10000,'periodic'),timing_belt:entry('timing_belt',10000,'major')};
  withCatalog(entries,()=>{
    assert.deepEqual(estimateAnnualMaintenanceCost(12000),{routine:90,periodic:96,major:960,total:1146});
    assert.deepEqual(estimateAnnualMaintenanceCost(12000,generic),{routine:90,periodic:96,major:960,total:1146});
    const vehicle=resolveDemoVehicleTwin('challenger')!.identity;
    const expected={routine:0,periodic:0,major:0,total:0};
    assert.equal(getScheduleForVehicle('timing_belt',vehicle),null,'Existing non-applicable override is preserved');
    for(const type of Object.keys(entries)){const schedule=getScheduleForVehicle(type,vehicle);if(schedule)expected[schedule.category]+=schedule.estimatedCost*(12000/schedule.intervalMiles);}
    expected.total=Math.round(expected.routine+expected.periodic+expected.major);expected.routine=Math.round(expected.routine);expected.periodic=Math.round(expected.periodic);expected.major=Math.round(expected.major);
    assert.notDeepEqual(expected,{routine:90,periodic:96,major:960,total:1146},'The chosen exact override must actually differ');
    assert.deepEqual(estimateAnnualMaintenanceCost(12000,vehicle),expected);
  });
});
test('zero, negative, nonfinite and calendar-only frequencies contribute nothing to either estimate path',()=>{
  const entries:Record<string,MaintenanceType>={regular:entry('regular',12000)};
  for(const [index,interval] of [0,-1,NaN,Infinity,-Infinity].entries())entries['invalid'+index]=entry('invalid'+index,interval,index%2?'periodic':'major');
  entries.manual=entry('manual',12000,'routine',true);entries.calendar=entry('calendar',0,'major');
  withCatalog(entries,()=>{for(const context of [undefined,generic])assert.deepEqual(estimateAnnualMaintenanceCost(12000,context),{routine:100,periodic:0,major:0,total:100});});
});
test('invalid or zero annual mileage always returns finite zero estimates with the full real catalog',()=>{
  for(const input of [0,-0,-1,NaN,Infinity,-Infinity])for(const context of [undefined,xt6])assert.deepEqual(estimateAnnualMaintenanceCost(input,context),zero);
});
test('complete real catalog gives finite serialized estimates with and without all model contexts',()=>{
  for(const annual of [12000,1,Number.MAX_VALUE,Number.MIN_VALUE])for(const context of [undefined,...VEHICLE_TWIN_CATALOG.map(twin=>twin.identity)]){
    const result=estimateAnnualMaintenanceCost(annual,context);assert(Object.values(result).every(Number.isFinite));assert.deepEqual(JSON.parse(JSON.stringify(result)),result);
  }
});
test('finite-input division and contribution overflow are skipped without fabricated clamping',()=>{
  withCatalog({tiny:entry('tiny',Number.MIN_VALUE),multiply:entry('multiply',1)},()=>{
    for(const context of [undefined,generic])assert.deepEqual(estimateAnnualMaintenanceCost(Number.MAX_VALUE,context),zero);
  });
});
test('finite contributions cannot overflow a category or the combined total',()=>{
  for(const secondCategory of ['routine','periodic','major'] as const)withCatalog({first:entry('first',100),second:entry('second',100,secondCategory)},()=>{
    const first=100*(Number.MAX_VALUE/100);assert(Number.isFinite(first));
    for(const context of [undefined,generic])assert.deepEqual(estimateAnnualMaintenanceCost(Number.MAX_VALUE,context),{routine:Math.round(first),periodic:0,major:0,total:Math.round(first)});
  });
});
