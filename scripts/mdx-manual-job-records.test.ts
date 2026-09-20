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
import {TTServiceRow,TTSchedule} from '../src/components/twin/stage/TechTree';
import {TwinDataCtx} from '../src/components/twin/twin-context';

const twin=resolveDemoVehicleTwin('mdx')!;
const vehicle={...twin.identity,id:'synthetic-mdx',userId:'synthetic-owner',currentMileage:60000,transmission:null};
const now='2026-09-13T12:00:00Z';
const types={requirement_driveBelt:'drive_belt_inspection',requirement_timingBelt:'timing_belt',requirement_waterPumpInspection:'water_pump_inspection',requirement_valveInspection:'valve_clearance_inspection'};
function owner(rows:any[]=[]){const tree=buildModelOwnerTrees(twin,rows,60000 as never,null,now as never);applyOwnerMaintenanceIntervals(tree,rows,vehicle,60000,now);return tree;}

for(const [id,type] of Object.entries(types))test(`${type}: same reviewed schema, persistence, tree and schedule job`,async()=>{
  const input={type,mileage:59000,date:'2026-09-01',description:`Documented ${type}`};
  assert(ServiceReviewSchema.safeParse({requestId:'faaf932b-3d8a-43ea-b25a-8bfac8878e57',vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date:input.date,mileage:input.mileage,jobs:[{type,description:input.description}]}).success);
  const writes:any[]=[];
  const saved=await persistMaintenanceEntry({maintenanceRecord:{create:async({data}:any)=>{writes.push(data);return{id:'synthetic-record',...data};}}} as never,vehicle as never,input,new Date(now));
  assert.equal(writes.length,1);assert.equal(saved.type,type);
  assert.equal(saved.nextDueMileage,undefined);assert.equal(saved.nextDueDate,null,'Do not use generic timing-belt calendar');
  const tree=owner([{...saved,date:saved.date.toISOString()}]);
  for(const [otherId,otherType] of Object.entries(types)) {
    const node=tree.car.nodes[otherId];assert.equal(node.maintenanceType,otherType);assert.equal(node.unlogged,otherId!==id);
    assert.equal(node.serviceTiming,'minder');assert.equal(node.serviceIntervalMiles,null);assert.equal(node.serviceLogHold,undefined);
    assert.equal(node.buyUrl,undefined);assert.equal(node.imageUnavailable,false);
  }
  assert.equal(tree.car.nodes.sparkPlugs.unlogged,true);assert.equal(tree.car.nodes.coolant.unlogged,true);
  const requirement=buildTwinMaintenanceSchedule(tree,60000).requirements.find(r=>r.id===id);
  assert.equal(requirement?.status,'recorded');assert.equal(requirement?.dueMileage,null);
  assert.equal(ownerEquipmentReady(twin.identity),false);
});

test('unknown/future/other work never completes separate MDX requirements',()=>{
  for(const rows of [[],[{type:'spark_plugs',mileage:59000,date:'2026-09-01'}],[{type:'other_service',mileage:59000,date:'2026-09-01',description:'Minder 4'}],[{type:'timing_belt',mileage:59000,date:'2027-01-01'}]]) {
    const tree=owner(rows),schedule=buildTwinMaintenanceSchedule(tree,60000);
    for(const id of Object.keys(types)){assert.equal(tree.car.nodes[id].unlogged,true);assert.equal(schedule.requirements.find(r=>r.id===id)?.status,'never-logged');}
    assert.equal(tree.car.nodes.requirement_requiredChecks,undefined,'The old bundle is replaced by individually recorded inspections');
    assert.equal(schedule.requirements.find(r=>r.id==='requirement_tireRepairKitExpiration')?.status,'coverage-hold');
  }
});

test('normal Minder clocks never leak to other identities; inspection is never replacement',()=>{
  assert.equal(getExactTwinMaintenanceRule('timing_belt',{...vehicle,year:2020}),undefined);
  assert.equal(getExactTwinMaintenanceRule('timing_belt',{...vehicle,trim:'Sport Hybrid'}),undefined);
  assert.equal(getExactTwinMaintenanceRule('timing_belt',vehicle)?.action,'replace');
  assert.match(getExactTwinMaintenanceRule('timing_belt',vehicle)!.severeGuidance!,/60,000 miles/);
  for(const type of ['drive_belt_inspection','water_pump_inspection','valve_clearance_inspection']) {
    assert.equal(getExactTwinMaintenanceRule(type,vehicle)?.action,'inspect');
    const outside=getVehicleMaintenanceIntervals(type,{year:2000,make:'Unreviewed',model:'Car'});
    assert.equal(outside.intervalMiles,null);assert.equal(outside.intervalMonths,null);
  }
  const belt=owner([{type:'serpentine_belt',mileage:59000,date:'2026-09-01'}]);
  assert.equal(belt.car.nodes.requirement_driveBelt.unlogged,true);
});

test('actual service row and shared review expose the canonical job; schedule opens that exact leaf',()=>{
  const tree=owner(),clicked:string[]=[];
  for(const [id,type] of Object.entries(types)) {
    const node=tree.car.nodes[id];
    const row=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner'} as never},React.createElement(TTServiceRow,{node,miles:60000} as any)));
    assert.match(row,/Log service/);assert.match(row,/Maintenance Minder/);assert.doesNotMatch(row,/recording is not yet mapped/);
    const review=renderToStaticMarkup(React.createElement(ServiceReview,{vehicleId:vehicle.id,currentMileage:60000,service:{typeId:type,label:node.label}}));
    assert(review.includes(`value="${type}"`));
  }
  const element=TTSchedule({schedule:buildTwinMaintenanceSchedule(tree,60000),miles:60000,onOpenNode:(id:string)=>clicked.push(id)}) as any;
  const visit=(e:any)=>{if(!e)return;if(Array.isArray(e)){e.forEach(visit);return;}if(Object.keys(types).includes(e.props?.['data-schedule-node']))e.props.onClick();visit(e.props?.children);};
  visit(element);assert.deepEqual(new Set(clicked),new Set(Object.keys(types)));
  const held=renderToStaticMarkup(React.createElement(TTServiceRow,{node:tree.car.nodes.requirement_tireRepairKitExpiration,miles:60000} as any));
  assert.match(held,/data-service-coverage-hold/);assert.doesNotMatch(held,/Log service/);
});
