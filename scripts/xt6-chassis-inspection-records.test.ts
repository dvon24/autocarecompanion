import { ownerEquipmentReady } from '../src/lib/twin-owner-equipment';
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveDemoVehicleTwin, VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';
import { getExactTwinMaintenanceCoverage, getExactTwinMaintenanceRule } from '../src/lib/exact-twin-maintenance-rules';
import { MAINTENANCE_SCHEDULES, getScheduleForVehicle, getMaintenanceStatus, getUpcomingMaintenance, estimateAnnualMaintenanceCost } from '../src/lib/maintenance';
import { getVehicleMaintenanceIntervals, applyOwnerMaintenanceIntervals } from '../src/lib/vehicle-maintenance-intervals';
import { buildModelOwnerTrees } from '../src/components/twin/demo-trees';
import { buildTwinMaintenanceSchedule } from '../src/components/twin/maintenance-schedule';
import { loadLatestTwinServiceRecords, serializeTwinServiceRecord, TWIN_SERVICE_RECORD_TYPES } from '../src/lib/twin-hub-data';
import { ServiceReviewSchema } from '../src/lib/maintenance-service-review';
import { persistServiceReview, persistMaintenanceEntry } from '../src/lib/maintenance-service-mutation';
import { TwinDataCtx } from '../src/components/twin/twin-context';
import { TTServiceRow } from '../src/components/twin/stage/TechTree';

const expected = {
  brakeSystemInspection:{type:'brake_system_inspection',months:null,category:'brakes'},
  steeringSystemInspection:{type:'steering_system_inspection',months:12,category:'chassis'},
  suspensionInspection:{type:'suspension_inspection',months:12,category:'chassis'},
  chassisInspection:{type:'chassis_inspection',months:12,category:'chassis'},
  powerSteeringInspection:{type:'power_steering_inspection',months:null,category:'chassis'},
  drivelineInspection:{type:'driveline_inspection',months:null,category:'driveline'},
};
const twin=resolveDemoVehicleTwin('xt6')!;
const vehicle={...twin.identity,id:'synthetic-xt6',userId:'synthetic-owner',currentMileage:60000,transmission:null};
const now=new Date('2026-09-13T12:00:00Z');
function rebuild(records:any[]=[],miles=60000){
  const trees=buildModelOwnerTrees(twin,records,miles as never,null,now.toISOString() as never);
  applyOwnerMaintenanceIntervals(trees,records,vehicle,miles,now.toISOString());
  return trees;
}
function confirmed(type:string,mileage=59000,date='2026-09-01'){
  return ServiceReviewSchema.parse({requestId:'faaf932b-3d8a-43ea-b25a-8bfac8878e57',vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date,mileage,jobs:[{type,description:'Completed the full scope of this inspection only'}]});
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
    assert.equal(query.where.mileage.gte,0);assert.equal(query.where.mileage.lte,miles);
    return rows.filter(row=>row.vehicleId===query.where.vehicleId&&row.type===query.where.type&&row.mileage>=query.where.mileage.gte&&row.mileage<=query.where.mileage.lte&&row.date<=query.where.date.lte)
      .sort((a,b)=>b.date.getTime()-a.date.getTime()||b.mileage-a.mileage||b.id.localeCompare(a.id))[0]??null;
  });
  return JSON.parse(JSON.stringify(selected.map(serializeTwinServiceRecord)));
}
const retainedEvidence=(trees:any)=>Object.entries(trees.car.nodes).map(([id,node]:[string,any])=>({id,knownIssue:node.knownIssue,partNo:node.partNo,price:node.price,buyUrl:node.buyUrl,products:node.products}));

test('exact XT6 has six scoped checks, 7500-mile visits and only three annual limits',()=>{
  const coverage=getExactTwinMaintenanceCoverage(vehicle);
  assert.deepEqual(coverage.map(item=>item.id),[...Object.keys(expected),'requiredChecks','beltInspection','evapInspection','liftStruts','acDesiccant']);
  const trees=rebuild(),schedule=buildTwinMaintenanceSchedule(trees,60000);
  for(const [id,{type,months,category}] of Object.entries(expected)){
    assert.equal(coverage.find(item=>item.id===id)?.maintenanceType,type);
    assert((TWIN_SERVICE_RECORD_TYPES as readonly string[]).includes(type));
    const rule=getExactTwinMaintenanceRule(type,vehicle)!;
    assert.equal(rule.intervalMiles,7500);assert.equal(rule.intervalMonths,months);assert.equal(rule.action,'inspect');assert.equal(rule.timing,'routine');
    assert.match(rule.source.url,/2020-xt6.pdf/);assert.match(rule.guidance,/7,500/);assert.match(rule.guidance,/qualified service/i);assert.match(rule.guidance,/does not certify current condition or a repaired known issue/);
    const node=trees.car.nodes['requirement_'+id];
    assert.equal(node.unlogged,true);assert.equal(node.dueMileage,60000);assert.equal(node.dueDate,null);
    assert.equal(node.imageUnavailable,false);assert.match(node.img,/^\/twin-stage\/parts\//);assert.equal(node.buyUrl,undefined);assert.equal(node.products,undefined);
    assert.equal(schedule.requirements.find(item=>item.id==='requirement_'+id)?.status,'never-logged');
    const group=schedule.columns[0].groups.find((group:any)=>group.items.some((item:any)=>item.id==='requirement_'+id));
    assert.equal(group?.id,category);
  }
  assert.match(trees.car.nodes.requirement_brakeSystemInspection.serviceGuidance,/lines and hoses.*pads.*rotor.*all other brake parts/);
  assert.match(trees.car.nodes.requirement_powerSteeringInspection.serviceGuidance,/electrical connections, binding, cracks and chafing/);
  assert.match(trees.car.nodes.requirement_drivelineInspection.serviceGuidance,/tube dents or cracks.*joint looseness.*boots.*clamps.*fasteners.*center-bearing.*axle-seal/);
  for(const id of ['steeringSystemInspection','suspensionInspection','chassisInspection'])assert.match(trees.car.nodes['requirement_'+id].serviceGuidance,/once a year.*cracks or tears in rubber boots and loose or missing parts/);
  assert.equal(ownerEquipmentReady(twin.identity),false);
  assert.deepEqual(VEHICLE_TWIN_CATALOG.filter(item=>!ownerEquipmentReady(item.identity)).map(item=>item.id).sort(),['aviator','kicks','mdx','murano','nautilus','xt6']);
});
test('remaining source obligations and lift-strut replacement stay explicitly held',()=>{
  const trees=rebuild(),hold=trees.car.nodes.requirement_requiredChecks;
  assert.equal(hold.label,'Remaining required checks');assert.equal(hold.maintenanceType,undefined);assert(hold.serviceLogHold);
  for(const phrase of ['oil level and oil-life','air-filter life if equipped','otherwise filter inspection','coolant and washer-fluid levels','tire pressures and wear','fluid leaks','restraint components','fuel-system damage/leaks','exhaust and nearby heat shields','body-component lubrication','starter switch','parking brake and automatic-transmission park mechanism','accelerator-pedal damage, binding or high effort','gas-strut wear, cracks, damage and hold-open','sunroof track and seal if equipped'])assert(hold.serviceGuidance.includes(phrase),phrase);
  assert.doesNotMatch(hold.serviceGuidance,/halfshafts|driveshafts|steering components|suspension components/);
  assert.match(trees.car.nodes.requirement_liftStruts.serviceGuidance,/75,000 miles or ten years/);assert(trees.car.nodes.requirement_liftStruts.serviceLogHold);
  const html=renderToStaticMarkup(React.createElement(TTServiceRow,{node:hold,miles:60000,dense:false}));
  assert.match(html,/data-service-coverage-hold/);assert.doesNotMatch(html,/<button/);
});
for(const [id,{type,months}] of Object.entries(expected))test(type+': confirmed write and bounded readback completes only this full inspection',async()=>{
  const {tx,rows}=fixture();const before=rebuild();
  const result=await persistServiceReview(tx as never,vehicle.userId,confirmed(type),now);
  assert.equal(result.records.length,1);assert.equal(rows[0].type,type);assert.equal(rows[0].nextDueMileage,66500);
  assert.equal(rows[0].nextDueDate?.toISOString()??null,months?'2027-09-01T00:00:00.000Z':null);
  const valid=rows[0];rows.push({...valid,id:'negative',mileage:-1},{...valid,id:'ahead',mileage:60001},{...valid,id:'future',date:new Date('2027-01-01')},{...valid,id:'other-car',vehicleId:'other-car'},{...valid,id:'older',date:new Date('2026-01-01')});
  const payload=await readback(rows),trees=rebuild(payload),schedule=buildTwinMaintenanceSchedule(trees,60000);
  assert.equal(payload.length,1);assert.equal(payload[0].id,valid.id);
  for(const other of Object.keys(expected))assert.equal(trees.car.nodes['requirement_'+other].unlogged,other!==id);
  const node=trees.car.nodes['requirement_'+id];
  assert.equal(node.servicedAt,59000);assert.equal(node.servicedDate,'2026-09-01T00:00:00.000Z');assert.equal(node.serviceRecordId,valid.id);
  assert.equal(node.dueMileage,66500);assert.equal(node.dueDate,months?'2027-09-01T00:00:00.000Z':null);
  assert.equal(schedule.requirements.find(item=>item.id==='requirement_'+id)?.status,'recorded');
  assert.equal(trees.car.nodes.oil.unlogged,true);assert.equal(trees.car.nodes.brakeFluid.unlogged,true);
  assert.deepEqual(retainedEvidence(trees),retainedEvidence(before),'No inspection resolves known issues or changes purchase evidence');
  const markup=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner',vehicle,miles:60000,trees,ownerActions:{vehicleId:vehicle.id,refresh:()=>{}}} as never},React.createElement(TTServiceRow,{node,miles:60000,dense:false})));
  assert.match(markup,/Last logged at/);assert.match(markup,/59,000/);assert.match(markup,/Log again/);assert.doesNotMatch(markup,/Mark as done/);
});
test('narrow legacy inspections, fluids, repairs, rotation and oil do not fan out into full XT6 checks',async()=>{
  const {tx,rows}=fixture();
  for(const type of ['brake_inspection','brake_axles_inspection','brake_lines_inspection','steering_inspection','driveshaft_boots_inspection','oil_change','tire_rotation','brake_service','brake_fluid','other_service']) {
    await persistMaintenanceEntry(tx as never,vehicle as never,{type,mileage:59000,date:'2026-09-01',description:'Limited work; other systems were not inspected'},now,type);
  }
  const preserved=structuredClone(rows);
  for(const payload of [await readback(rows),rows.map(serializeTwinServiceRecord)]){
    const trees=rebuild(payload);
    for(const id of Object.keys(expected))assert.equal(trees.car.nodes['requirement_'+id].unlogged,true);
  }
  assert.deepEqual(rows,preserved);
});
test('explicit mileage limits below, equal and above the odometer agree across both Schedule representations',()=>{
  for(const [id,{type}] of Object.entries(expected))for(const limit of [59999,60000,60001]){
    const record={id:'explicit-'+type,type,mileage:59000,date:'2026-09-01',nextDueMileage:limit,nextDueDate:'2027-09-01'};
    const trees=rebuild([record]),schedule=buildTwinMaintenanceSchedule(trees,60000),nodeId='requirement_'+id;
    assert.equal(trees.car.nodes[nodeId].dueMileage,limit);assert.equal(trees.car.nodes[nodeId].dueDate,'2027-09-01');
    const requirement=schedule.requirements.find(item=>item.id===nodeId)!;
    const item=schedule.columns.find(column=>column.mileage===limit)?.groups.flatMap((group:any)=>group.items).find((item:any)=>item.id===nodeId);
    assert(item,nodeId+' is missing its real deadline');
    assert.equal(requirement.status,limit<60000?'overdue':'recorded');assert.equal(item.status,limit<60000?'overdue':'scheduled');
  }
  const trees=rebuild([{id:'calendar',type:'suspension_inspection',mileage:59000,date:'2025-09-13',nextDueMileage:70000,nextDueDate:now.toISOString()}]);
  const schedule=buildTwinMaintenanceSchedule(trees,60000);
  assert.equal(schedule.requirements.find(item=>item.id==='requirement_suspensionInspection')?.status,'overdue','Calendar equality retains the shared existing rule');
});
test('valid zero-mile history and rejection boundaries retain source clocks without model-year dates',async()=>{
  const {tx,rows}=fixture();await persistServiceReview(tx as never,vehicle.userId,confirmed('power_steering_inspection',0),now);
  const trees=rebuild(await readback(rows,0),0),node=trees.car.nodes.requirement_powerSteeringInspection;
  assert.equal(node.unlogged,false);assert.equal(node.servicedAt,0);assert.equal(node.dueMileage,7500);assert.equal(node.dueDate,null);
  assert.equal(ServiceReviewSchema.safeParse({...confirmed('power_steering_inspection'),confirmed:false}).success,false);
  assert.equal(ServiceReviewSchema.safeParse({...confirmed('power_steering_inspection'),mileage:-1}).success,false);
  await assert.rejects(persistServiceReview(tx as never,vehicle.userId,confirmed('power_steering_inspection',100,'2027-01-01'),now),/future/);
  await assert.rejects(persistServiceReview(tx as never,'other-owner',confirmed('power_steering_inspection'),now),/Vehicle not found/);
  assert.equal(rows.length,1);
});
test('XT6 visit clocks do not leak to MDX, other years or trims; generic inspection inference stays unavailable',()=>{
  const mdx=resolveDemoVehicleTwin('mdx')!;
  for(const identity of [{...vehicle,year:2021},{...vehicle,trim:'Premium Luxury'},mdx.identity])for(const {type} of Object.values(expected)){
    const rule=getExactTwinMaintenanceRule(type,identity);
    if(identity===mdx.identity&&type==='suspension_inspection'){assert.equal(rule?.timing,'minder');assert.equal(rule?.intervalMiles,null);assert.equal(rule?.intervalMonths,null);}
    else assert.equal(rule,undefined);
  }
  for(const {type} of Object.values(expected)){
    assert.equal(MAINTENANCE_SCHEDULES[type].recordOnly,true);assert.equal(getScheduleForVehicle(type,vehicle),null);
    assert.equal(getMaintenanceStatus({...vehicle,lastMileageUpdate:now} as never,[],type).status,'unknown');
    for(const context of [undefined,vehicle])assert(!getUpcomingMaintenance({...vehicle,lastMileageUpdate:now} as never,[],context).some(item=>item.type.id===type));
    assert.equal(getVehicleMaintenanceIntervals(type,{year:2024,make:'Other',model:'Other'}).intervalMiles,null);
  }
  const originals={...MAINTENANCE_SCHEDULES};
  try {
    for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];
    for(const {type} of Object.values(expected))MAINTENANCE_SCHEDULES[type]=originals[type];
    assert.deepEqual(estimateAnnualMaintenanceCost(12000),{routine:0,periodic:0,major:0,total:0});
    assert.deepEqual(estimateAnnualMaintenanceCost(12000,vehicle),{routine:0,periodic:0,major:0,total:0});
  } finally {for(const key of Object.keys(MAINTENANCE_SCHEDULES))delete MAINTENANCE_SCHEDULES[key];Object.assign(MAINTENANCE_SCHEDULES,originals);}
});
