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

const now='2026-09-13T12:00:00Z',twin=resolveDemoVehicleTwin('kicks')!;
const vehicle={...twin.identity,id:'synthetic-kicks',userId:'synthetic-owner',currentMileage:40000,transmission:null};
const jobs={requirement_keyBatteryInspect:'key_battery_inspection',requirement_keyBatteryReplace:'key_battery_replacement'};
function owner(rows:any[]=[],miles=40000){const tree=buildModelOwnerTrees(twin,rows,miles as never,null,now as never);applyOwnerMaintenanceIntervals(tree,rows,vehicle,miles,now);return tree;}
for(const [id,type] of Object.entries(jobs))test(`Kicks ${type}: canonical record does not service the 12V battery`,async()=>{
  const input={type,mileage:39000,date:'2026-09-01',description:`Documented ${type}`};
  assert(ServiceReviewSchema.safeParse({requestId:'faaf932b-3d8a-43ea-b25a-8bfac8878e57',vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date:input.date,mileage:input.mileage,jobs:[{type,description:input.description}]}).success);
  const writes:any[]=[];
  const saved=await persistMaintenanceEntry({maintenanceRecord:{create:async({data}:any)=>{writes.push(data);return{id:'synthetic-record',...data};}}} as never,vehicle as never,input,new Date(now));
  assert.equal(writes.length,1);assert.equal(saved.type,type);
  const replacement=type==='key_battery_replacement';
  assert.equal(saved.nextDueMileage,replacement?54000:undefined);assert.equal(saved.nextDueDate?.toISOString()??null,replacement?'2028-03-01T00:00:00.000Z':null);
  const tree=owner([{...saved,date:saved.date.toISOString(),nextDueDate:saved.nextDueDate?.toISOString()}]),schedule=buildTwinMaintenanceSchedule(tree,40000);
  for(const [otherId,otherType] of Object.entries(jobs)) {
    const node=tree.car.nodes[otherId];assert.equal(node.maintenanceType,otherType);assert.equal(node.unlogged,otherId!==id);assert.equal(node.serviceLogHold,undefined);
    assert.equal(node.buyUrl,undefined);assert.equal(node.imageUnavailable,false);
    assert.equal(schedule.requirements.find(r=>r.id===otherId)?.status,otherId===id?'recorded':'never-logged');
    assert(renderToStaticMarkup(React.createElement(ServiceReview,{vehicleId:vehicle.id,currentMileage:40000,service:{typeId:otherType,label:node.label}})).includes(`value="${otherType}"`));
  }
  assert.notEqual(saved.type,'battery');assert.equal(tree.car.nodes.oil.unlogged,true);assert.equal(twin.ownerReady,false);
  assert.equal(schedule.requirements.find(r=>r.id==='requirement_requiredChecks')?.status,'coverage-hold');
});
test('Kicks first replacement and repeated replacement differ; inspection has no invented repeat clock',()=>{
  const tree=owner([],20000),cell=tree.car.nodes.requirement_keyBatteryReplace,inspect=tree.car.nodes.requirement_keyBatteryInspect;
  assert.equal(cell.dueMileage,30000);assert.equal(cell.serviceFirstIntervalMonths,36);assert.equal(cell.serviceIntervalMiles,15000);assert.equal(cell.serviceIntervalMonths,18);assert.equal(cell.dueDate,null);assert.equal(cell.unlogged,true);
  assert.equal(inspect.serviceIntervalMiles,null);assert.equal(inspect.serviceIntervalMonths,null);assert.match(inspect.serviceGuidance,/initial 15,000-mile or 18-month/);
  assert.match(cell.serviceGuidance,/original key uses CR2032/);assert.match(cell.serviceGuidance,/replacement key's cell marking/);
  const later=owner().car.nodes.requirement_keyBatteryReplace;assert.equal(later.dueMileage,45000);assert.equal(later.unlogged,true);assert.equal(later.dueDate,null);
  const groups=buildTwinMaintenanceSchedule(owner(),40000).columns.flatMap(c=>c.groups);
  const keyGroups=groups.filter(g=>g.items.some((i:any)=>i.id==='requirement_keyBatteryReplace'));
  assert(keyGroups.length>0);assert(keyGroups.every(g=>g.id==='keys'&&g.label==='Keys & access'));
  for(const rows of [[{type:'battery',mileage:39000,date:'2026-09-01'}],[{type:'other_service',mileage:39000,date:'2026-09-01',description:'Key battery replaced'}],[{type:'key_battery_replacement',mileage:39000,date:'2027-01-01'}]])for(const id of Object.keys(jobs))assert.equal(owner(rows).car.nodes[id].unlogged,true);
});
test('Kicks key schedule does not leak into another year, trim or generic battery type',()=>{
  for(const type of Object.values(jobs)){
    assert.equal(getExactTwinMaintenanceRule(type,{...vehicle,year:2024}),undefined);assert.equal(getExactTwinMaintenanceRule(type,{...vehicle,trim:'Unreviewed'}),undefined);
    const outside=getVehicleMaintenanceIntervals(type,{year:2000,make:'Unreviewed',model:'Car'});assert.equal(outside.intervalMiles,null);assert.equal(outside.intervalMonths,null);
  }
  assert.equal(getExactTwinMaintenanceRule('battery',vehicle),undefined);
});
