import { ownerEquipmentReady } from '../src/lib/twin-owner-equipment';
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {resolveDemoVehicleTwin} from '../src/lib/vehicle-twin-catalog';
import {buildModelOwnerTrees} from '../src/components/twin/demo-trees';
import {getExactTwinMaintenanceRule} from '../src/lib/exact-twin-maintenance-rules';
import {applyOwnerMaintenanceIntervals,getVehicleMaintenanceIntervals} from '../src/lib/vehicle-maintenance-intervals';
import {persistMaintenanceEntry} from '../src/lib/maintenance-service-mutation';
import {ServiceReviewSchema} from '../src/lib/maintenance-service-review';
import {ServiceReview} from '../src/components/maintenance/ServiceReview';
import {buildTwinMaintenanceSchedule} from '../src/components/twin/maintenance-schedule';
import {TTServiceRow} from '../src/components/twin/stage/TechTree';
import {TwinDataCtx} from '../src/components/twin/twin-context';

const now='2026-09-13T12:00:00Z',twin=resolveDemoVehicleTwin('xt6')!;
const vehicle={...twin.identity,id:'synthetic-xt6',userId:'synthetic-owner',currentMileage:60000,transmission:null};
const jobs={requirement_beltInspection:{type:'drive_belt_inspection',miles:150000,months:120,date:'2036-09-01T00:00:00.000Z'},requirement_evapInspection:{type:'evap_system_inspection',miles:45000,months:null,date:null},requirement_acDesiccant:{type:'ac_desiccant_replacement',miles:null,months:84,date:'2033-09-01T00:00:00.000Z'}};
function owner(rows:any[]=[]){const tree=buildModelOwnerTrees(twin,rows,60000 as never,null,now as never);applyOwnerMaintenanceIntervals(tree,rows,vehicle,60000,now);return tree;}
for(const [id,job] of Object.entries(jobs))test(`XT6 ${job.type}: schema, write/read deadline and isolated completion`,async()=>{
  const input={type:job.type,mileage:59000,date:'2026-09-01',description:`Documented ${job.type}`};
  assert(ServiceReviewSchema.safeParse({requestId:'faaf932b-3d8a-43ea-b25a-8bfac8878e57',vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date:input.date,mileage:input.mileage,jobs:[{type:job.type,description:input.description}]}).success);
  const writes:any[]=[];
  const saved=await persistMaintenanceEntry({maintenanceRecord:{create:async({data}:any)=>{writes.push(data);return{id:'synthetic-record',...data};}}} as never,vehicle as never,input,new Date(now));
  assert.equal(writes.length,1);assert.equal(saved.type,job.type);
  assert.equal(saved.nextDueMileage,job.miles===null?undefined:59000+job.miles);assert.equal(saved.nextDueDate?.toISOString()??null,job.date);
  const tree=owner([{...saved,date:saved.date.toISOString(),nextDueDate:saved.nextDueDate?.toISOString()}]),schedule=buildTwinMaintenanceSchedule(tree,60000);
  for(const [otherId,otherJob] of Object.entries(jobs)) {
    const node=tree.car.nodes[otherId];assert.equal(node.maintenanceType,otherJob.type);assert.equal(node.unlogged,otherId!==id);
    assert.equal(node.serviceIntervalMiles,otherJob.miles);assert.equal(node.serviceIntervalMonths,otherJob.months);assert.equal(node.serviceLogHold,undefined);
    assert.equal(node.buyUrl,undefined);assert.equal(node.imageUnavailable,false);
    const entry=schedule.requirements.find(r=>r.id===otherId);assert.equal(entry?.status,otherId===id?'recorded':'never-logged');
    if(otherId===id){assert.equal(node.dueDate,job.date);assert.equal(node.dueMileage,job.miles===null?null:59000+job.miles);}
    else assert.equal(node.dueDate,null);
    const html=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner'} as never},React.createElement(TTServiceRow,{node,miles:60000} as any)));
    assert.match(html,otherId===id?/Log again/:/Log service/);
    assert(renderToStaticMarkup(React.createElement(ServiceReview,{vehicleId:vehicle.id,currentMileage:60000,service:{typeId:otherJob.type,label:node.label}})).includes(`value="${otherJob.type}"`));
  }
  assert.equal(tree.car.nodes.oil.unlogged,true);assert.equal(ownerEquipmentReady(twin.identity),false);
  for(const held of ['requirement_requiredChecks','requirement_liftStruts'])assert.equal(schedule.requirements.find(r=>r.id===held)?.status,'coverage-hold');
});
test('XT6 unlogged, unrelated and future work cannot complete distinct manual jobs',()=>{
  for(const rows of [[],[{type:'serpentine_belt',mileage:59000,date:'2026-09-01'}],[{type:'other_service',mileage:59000,date:'2026-09-01',description:'A/C repair and vapor inspection'}],[{type:'ac_desiccant_replacement',mileage:59000,date:'2027-01-01'}]]){
    const tree=owner(rows),schedule=buildTwinMaintenanceSchedule(tree,60000);
    for(const id of Object.keys(jobs)){assert.equal(tree.car.nodes[id].unlogged,true);assert.equal(tree.car.nodes[id].dueDate,null);assert.equal(schedule.requirements.find(r=>r.id===id)?.status,'never-logged');}
  }
});
test('XT6 exact inspection semantics and clocks never leak to unreviewed vehicles',()=>{
  for(const {type} of Object.values(jobs)) {
    assert.equal(getExactTwinMaintenanceRule(type,{...vehicle,year:2021}),undefined);
    assert.equal(getExactTwinMaintenanceRule(type,{...vehicle,trim:'Unreviewed'}),undefined);
    const other=getVehicleMaintenanceIntervals(type,{year:2000,make:'Unreviewed',model:'Car'});assert.equal(other.intervalMiles,null);assert.equal(other.intervalMonths,null);
  }
  const tree=owner(),schedule=buildTwinMaintenanceSchedule(tree,60000);
  for(const id of ['requirement_beltInspection','requirement_evapInspection'])assert.equal(tree.car.nodes[id].serviceAction,'inspect');
  assert.match(tree.car.nodes.requirement_beltInspection.serviceGuidance,/fraying, excessive cracking or damage/);
  assert.match(tree.car.nodes.requirement_evapInspection.serviceGuidance,/attachment, connection, routing and condition/);
  assert.match(tree.car.nodes.requirement_acDesiccant.serviceGuidance,/qualified refrigerant-system professional/);
  const entries=schedule.columns.flatMap(c=>c.groups.flatMap((g:any)=>g.items)).filter(i=>i.id==='requirement_evapInspection');assert(entries.length>0);assert(entries.every(i=>i.purchaseKeys.length===0));
});
