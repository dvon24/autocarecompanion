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
import {TTServiceRow} from '../src/components/twin/stage/TechTree';

const jobs={requirement_keyBatteryInspect:'key_battery_inspection',requirement_keyBatteryReplace:'key_battery_replacement'};
const now=new Date('2026-09-13T12:00:00Z');
function setup(model='murano'){
  const twin=resolveDemoVehicleTwin(model)!;
  const vehicle={...twin.identity,id:'synthetic-'+model,userId:'synthetic-owner',currentMileage:60000,transmission:null};
  const rows:any[]=[];
  const tx={
    $queryRaw:async()=>[], $executeRaw:async()=>1,
    vehicle:{findFirst:async({where}:any)=>where.id===vehicle.id&&where.userId===vehicle.userId?vehicle:null},
    maintenanceRecord:{findMany:async()=>[],create:async({data}:any)=>{const row={...data,nextDueMileage:data.nextDueMileage??null};rows.push(row);return row;}},
  };
  const confirmed=(type:string,mileage=59000,date='2026-09-01')=>ServiceReviewSchema.parse({requestId:randomUUID(),vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date,mileage,jobs:[{type,description:'Completed only the named key job'}]});
  const rebuild=(records:any[]=[],miles=60000)=>{
    const trees=buildModelOwnerTrees(twin,records,miles as never,null,now.toISOString() as never);
    applyOwnerMaintenanceIntervals(trees,records,vehicle,miles,now.toISOString());return trees;
  };
  const readback=async(miles=60000)=>{
    const records=await loadLatestTwinServiceRecords(vehicle.id,miles,now,async query=>{
      assert.equal(query.where.vehicleId,vehicle.id);assert.equal(query.where.mileage.gte,0);assert.equal(query.where.mileage.lte,miles);
      assert.deepEqual(query.orderBy,[{date:'desc'},{mileage:'desc'},{id:'desc'}]);
      return rows.filter(row=>row.vehicleId===query.where.vehicleId&&row.type===query.where.type&&row.mileage>=0&&row.mileage<=miles&&row.date<=query.where.date.lte)
        .sort((a,b)=>b.date.getTime()-a.date.getTime()||b.mileage-a.mileage||b.id.localeCompare(a.id))[0]??null;
    });return JSON.parse(JSON.stringify(records.map(serializeTwinServiceRecord)));
  };
  return {twin,vehicle,rows,tx,confirmed,rebuild,readback};
}
test('Murano key inspection and replacement retain exact first/repeat differences without invented age',()=>{
  const {vehicle,rebuild}=setup(),initial=rebuild([],20000),later=rebuild(),schedule=buildTwinMaintenanceSchedule(later,60000);
  assert.deepEqual(getExactTwinMaintenanceCoverage(vehicle).map(item=>item.id),['requiredChecks','keyBatteryInspect','keyBatteryReplace']);
  const inspect=initial.car.nodes.requirement_keyBatteryInspect,replace=initial.car.nodes.requirement_keyBatteryReplace;
  assert.equal(inspect.serviceIntervalMiles,null);assert.equal(inspect.serviceIntervalMonths,null);assert.equal(inspect.serviceTiming,'inspection');assert.equal(inspect.serviceAction,'inspect');
  assert.equal(inspect.dueMileage,null);assert.equal(inspect.dueDate,null);assert.match(inspect.serviceGuidance,/initial 22,500-mile or 18-month standard visit/);assert.match(inspect.serviceGuidance,/no repeat inspection clock/);
  assert.equal(replace.serviceIntervalMiles,22500);assert.equal(replace.serviceIntervalMonths,18);assert.equal(replace.serviceFirstIntervalMiles,45000);assert.equal(replace.serviceFirstIntervalMonths,36);assert.equal(replace.serviceTiming,'routine');assert.equal(replace.serviceAction,'replace');
  assert.equal(replace.dueMileage,45000);assert.equal(replace.dueDate,null);assert.equal(replace.unlogged,true);
  assert.equal(later.car.nodes.requirement_keyBatteryReplace.dueMileage,67500);assert.equal(later.car.nodes.requirement_keyBatteryReplace.dueDate,null);assert.equal(later.car.nodes.requirement_keyBatteryReplace.unlogged,true);
  for(const id of Object.keys(jobs)){
    const node=later.car.nodes[id];assert.equal(schedule.requirements.find(item=>item.id===id)?.status,'never-logged');
    assert.equal(node.imageUnavailable,false);assert.match(node.img,/^\/twin-stage\/parts\//);assert.equal(node.buyUrl,undefined);assert.equal(node.products,undefined);assert.equal(node.price,undefined);assert.equal(node.serviceLogHold,undefined);
  }
  const groups=schedule.columns.flatMap(column=>column.groups).filter((group:any)=>group.items.some((item:any)=>item.id==='requirement_keyBatteryReplace'));
  assert(groups.length>0);assert(groups.every(group=>group.id==='keys'&&group.label==='Keys & access'));
  assert(!schedule.columns.some(column=>column.groups.some((group:any)=>group.items.some((item:any)=>item.id==='requirement_keyBatteryInspect'||item.id==='requirement_requiredChecks'))));
  assert.equal(schedule.requirements.find(item=>item.id==='requirement_requiredChecks')?.status,'coverage-hold');
  assert.match(later.car.nodes.requirement_requiredChecks.serviceGuidance,/Confirm drivetrain.*AWD severe 20,000-mile\/24-month/);
});
test('Murano original-key marking and complete handling cautions stay source-qualified with no purchase claim',()=>{
  const {vehicle}=setup(),rule=getExactTwinMaintenanceRule('key_battery_replacement',vehicle)!;
  assert.match(rule.source.url,/2023-nissan-murano-owner-manual.pdf/);
  for(const phrase of ['original key uses CR2032 or equivalent',"replacement key's own cell marking",'children away from the cell and removed parts','Avoid touching internal circuits or electrical terminals','hold the cell by its edges','close securely and check button operation','8-22–8-24','9-17 and 9-22','consult a Nissan dealer when unsure','does not complete key inspection or vehicle 12V battery work'])assert(rule.guidance.includes(phrase),phrase);
});
for(const [id,type] of Object.entries(jobs))test('Murano '+type+': actual confirmed write and bounded readback complete only that job',async()=>{
  const {vehicle,rows,tx,confirmed,rebuild,readback}=setup(),before=rebuild();
  assert((TWIN_SERVICE_RECORD_TYPES as readonly string[]).includes(type));
  const saved=await persistServiceReview(tx as never,vehicle.userId,confirmed(type),now),replacement=type==='key_battery_replacement';
  assert.equal(saved.records.length,1);const valid=rows[0];assert.equal(valid.type,type);
  assert.equal(valid.nextDueMileage,replacement?81500:null);assert.equal(valid.nextDueDate?.toISOString()??null,replacement?'2028-03-01T00:00:00.000Z':null);
  rows.push({...valid,id:'older',date:new Date('2026-01-01')},{...valid,id:'future',date:new Date('2027-01-01')},{...valid,id:'negative',mileage:-1},{...valid,id:'ahead',mileage:60001},{...valid,id:'other-car',vehicleId:'another-car'});
  const payload=await readback(),trees=rebuild(payload),node=trees.car.nodes[id],schedule=buildTwinMaintenanceSchedule(trees,60000);
  assert.equal(payload.length,1);assert.equal(payload[0].id,valid.id);assert.equal(node.serviceRecordId,valid.id);assert.equal(node.servicedAt,59000);assert.equal(node.servicedDate,'2026-09-01T00:00:00.000Z');assert.equal(node.unlogged,false);
  assert.equal(node.dueMileage,replacement?81500:null);assert.equal(node.dueDate,replacement?'2028-03-01T00:00:00.000Z':null);assert.equal(schedule.requirements.find(item=>item.id===id)?.status,'recorded');
  for(const [other,previous] of Object.entries(before.car.nodes))if(other!==id)assert.deepEqual(trees.car.nodes[other],previous,'Key work changed an unrelated node: '+other);
  const html=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner',vehicle,miles:60000,trees,ownerActions:{vehicleId:vehicle.id,refresh:()=>{}}} as never},React.createElement(TTServiceRow,{node,miles:60000,dense:false})));
  assert.match(html,/Last logged at/);assert.match(html,/59,000/);assert.match(html,/Log again/);assert.doesNotMatch(html,/Mark as done/);
});
test('actual generic battery, oil and ambiguous other-service writes never become key evidence',async()=>{
  const {vehicle,rows,tx,rebuild,readback}=setup();
  for(const type of ['battery','oil_change','other_service'])await persistMaintenanceEntry(tx as never,vehicle as never,{type,date:'2026-09-01',mileage:59000,description:'Battery replacement, unspecified battery'},now,type);
  const preserved=structuredClone(rows);
  for(const payload of [await readback(),rows.map(serializeTwinServiceRecord)])for(const id of Object.keys(jobs))assert.equal(rebuild(payload).car.nodes[id].unlogged,true);
  assert.deepEqual(rows,preserved);assert.equal(rows.find(row=>row.type==='battery').type,'battery');
});
for(const type of Object.values(jobs))test(type+': existing and zero-mile key history remains visible; tied selection and bad writes stay guarded',async()=>{
  const {vehicle,rows,tx,confirmed,rebuild,readback}=setup(),id=Object.keys(jobs).find(id=>jobs[id as keyof typeof jobs]===type)!;
  await persistServiceReview(tx as never,vehicle.userId,confirmed(type,0),now);
  const zero=rebuild(await readback(0),0).car.nodes[id];assert.equal(zero.unlogged,false);assert.equal(zero.servicedAt,0);assert.equal(zero.dueMileage,type==='key_battery_replacement'?22500:null);
  const first=rows[0];rows.push({...first,id:'older-record',date:new Date('2025-01-01')},{...first,id:'tie-a',mileage:59000},{...first,id:'tie-z',mileage:59000},{...first,id:'lower-mile-z',mileage:58000});
  assert.equal((await readback())[0].id,'tie-z');assert.equal(rebuild(await readback()).car.nodes[id].serviceRecordId,'tie-z');
  const legacy=rebuild([{id:'old-key',type,mileage:100,date:'2025-01-01'}]).car.nodes[id];assert.equal(legacy.unlogged,false);assert.equal(legacy.serviceRecordId,'old-key');assert.equal(legacy.dueMileage,type==='key_battery_replacement'?22600:null);
  assert.equal(ServiceReviewSchema.safeParse({...confirmed(type),confirmed:false}).success,false);assert.equal(ServiceReviewSchema.safeParse({...confirmed(type),mileage:-1}).success,false);
  await assert.rejects(persistServiceReview(tx as never,vehicle.userId,confirmed(type,100,'2027-01-01'),now),/future/);
  await assert.rejects(persistServiceReview(tx as never,'other-owner',confirmed(type),now),/Vehicle not found/);assert.equal(rows.length,5);
});
test('saved replacement mileage and date boundaries agree in both Schedule representations',()=>{
  const {rebuild}=setup();
  for(const limit of [59999,60000,60001]){
    const trees=rebuild([{id:'explicit',type:'key_battery_replacement',mileage:59000,date:'2026-09-01',nextDueMileage:limit,nextDueDate:'2027-09-01'}]),schedule=buildTwinMaintenanceSchedule(trees,60000);
    assert.equal(trees.car.nodes.requirement_keyBatteryReplace.dueMileage,limit);assert.equal(trees.car.nodes.requirement_keyBatteryReplace.dueDate,'2027-09-01');
    assert.equal(schedule.requirements.find(item=>item.id==='requirement_keyBatteryReplace')?.status,limit<60000?'overdue':'recorded');
    const item=schedule.columns.find(column=>column.mileage===limit)?.groups.flatMap((group:any)=>group.items).find((item:any)=>item.id==='requirement_keyBatteryReplace');assert(item);assert.equal(item.status,limit<60000?'overdue':'scheduled');
  }
  for(const date of ['2026-09-13T11:59:59Z',now.toISOString(),'2026-09-13T12:00:01Z']){
    const schedule=buildTwinMaintenanceSchedule(rebuild([{id:'explicit-date',type:'key_battery_replacement',mileage:59000,date:'2025-03-13',nextDueMileage:70000,nextDueDate:date}]),60000);
    assert.equal(schedule.requirements.find(item=>item.id==='requirement_keyBatteryReplace')?.status,Date.parse(date)<=now.getTime()?'overdue':'recorded');
  }
  const inspection=rebuild([{id:'saved-inspection-limit',type:'key_battery_inspection',mileage:59000,date:'2026-09-01',nextDueMileage:60000,nextDueDate:'2027-09-01'}]).car.nodes.requirement_keyBatteryInspect;
  assert.equal(inspection.serviceIntervalMiles,null);assert.equal(inspection.serviceIntervalMonths,null);assert.equal(inspection.dueMileage,60000);assert.equal(inspection.dueDate,'2027-09-01');assert.match(inspection.dueNote,/Saved service-record deadline/);
});
test('Kicks retains first 30000/36 and repeat 15000/18 through actual confirmed writes',async()=>{
  const {vehicle,tx,confirmed,rebuild,readback}=setup('kicks');
  const first=rebuild([],20000).car.nodes.requirement_keyBatteryReplace;assert.equal(first.dueMileage,30000);assert.equal(first.serviceFirstIntervalMonths,36);
  assert.match(rebuild().car.nodes.requirement_keyBatteryInspect.serviceGuidance,/initial 15,000-mile or 18-month/);
  await persistServiceReview(tx as never,vehicle.userId,confirmed('key_battery_replacement'),now);
  const node=rebuild(await readback()).car.nodes.requirement_keyBatteryReplace;assert.equal(node.dueMileage,74000);assert.equal(node.dueDate,'2028-03-01T00:00:00.000Z');assert.equal(node.serviceIntervalMiles,15000);assert.equal(node.serviceIntervalMonths,18);
});
test('generic key helper safeguards do not affect exact rules, unrelated vocabulary or owner readiness',()=>{
  const {vehicle,twin}=setup();
  for(const type of Object.values(jobs)){
    assert.equal(MAINTENANCE_SCHEDULES[type].recordOnly,true);assert.equal(getScheduleForVehicle(type,vehicle),null);assert.equal(getMaintenanceStatus({...vehicle,lastMileageUpdate:now} as never,[],type).status,'unknown');
    for(const context of [undefined,vehicle])assert(!getUpcomingMaintenance({...vehicle,lastMileageUpdate:now} as never,[],context).some(item=>item.type.id===type));
    for(const identity of [{...vehicle,year:2024},{...vehicle,trim:'Unreviewed'},resolveDemoVehicleTwin('mdx')!.identity,resolveDemoVehicleTwin('xt6')!.identity]){assert.equal(getExactTwinMaintenanceRule(type,identity),undefined);assert.equal(getVehicleMaintenanceIntervals(type,identity).intervalMiles,null);assert.equal(getVehicleMaintenanceIntervals(type,identity).intervalMonths,null);}
  }
  assert.equal(MAINTENANCE_SCHEDULES.battery.recordOnly,undefined);assert(getScheduleForVehicle('battery',vehicle));
  const originals={...MAINTENANCE_SCHEDULES};
  try{
    for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];for(const type of Object.values(jobs))MAINTENANCE_SCHEDULES[type]=originals[type];
    for(const identity of [undefined,vehicle,setup('kicks').vehicle])assert.deepEqual(estimateAnnualMaintenanceCost(12000,identity),{routine:0,periodic:0,major:0,total:0});
  }finally{for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];Object.assign(MAINTENANCE_SCHEDULES,originals);}
  assert.equal(ownerEquipmentReady(twin.identity),false);assert.deepEqual(VEHICLE_TWIN_CATALOG.filter(item=>!ownerEquipmentReady(item.identity)).map(item=>item.id).sort(),['aviator','kicks','mdx','murano','nautilus','xt6']);
});
