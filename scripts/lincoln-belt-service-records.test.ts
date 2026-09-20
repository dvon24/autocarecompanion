import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {resolveDemoVehicleTwin} from '../src/lib/vehicle-twin-catalog';
import {buildModelOwnerTrees} from '../src/components/twin/demo-trees';
import {getExactTwinMaintenanceRule} from '../src/lib/exact-twin-maintenance-rules';
import {applyOwnerMaintenanceIntervals} from '../src/lib/vehicle-maintenance-intervals';
import {persistMaintenanceEntry} from '../src/lib/maintenance-service-mutation';
import {ServiceReviewSchema} from '../src/lib/maintenance-service-review';
import {ServiceReview} from '../src/components/maintenance/ServiceReview';
import {buildTwinMaintenanceSchedule} from '../src/components/twin/maintenance-schedule';
import {TTServiceRow} from '../src/components/twin/stage/TechTree';
import {TwinDataCtx} from '../src/components/twin/twin-context';

const now='2026-09-13T12:00:00Z';
const jobs={requirement_driveBelt:'drive_belt_inspection',requirement_driveBeltReplace:'serpentine_belt'};
for(const model of ['nautilus','aviator']) {
  const twin=resolveDemoVehicleTwin(model)!;
  const vehicle={...twin.identity,id:`synthetic-${model}`,userId:'synthetic-owner',currentMileage:155000,transmission:null};
  const owner=(rows:any[]=[])=>{const tree=buildModelOwnerTrees(twin,rows,155000 as never,null,now as never);applyOwnerMaintenanceIntervals(tree,rows,vehicle,155000,now);return tree;};
  for(const [id,type] of Object.entries(jobs))test(`${model}: ${type} records only its own job without a generic deadline`,async()=>{
    const input={type,mileage:150000,date:'2026-09-01',description:`Documented ${type}`};
    assert(ServiceReviewSchema.safeParse({requestId:'faaf932b-3d8a-43ea-b25a-8bfac8878e57',vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date:input.date,mileage:input.mileage,jobs:[{type,description:input.description}]}).success);
    const writes:any[]=[];
    const saved=await persistMaintenanceEntry({maintenanceRecord:{create:async({data}:any)=>{writes.push(data);return{id:'synthetic-record',...data};}}} as never,vehicle as never,input,new Date(now));
    assert.equal(writes.length,1);assert.equal(saved.type,type);
    assert.equal(saved.nextDueMileage,undefined);assert.equal(saved.nextDueDate,null);
    const tree=owner([{...saved,date:saved.date.toISOString()}]),schedule=buildTwinMaintenanceSchedule(tree,155000);
    for(const [otherId,otherType] of Object.entries(jobs)) {
      const node=tree.car.nodes[otherId];assert.equal(node.maintenanceType,otherType);assert.equal(node.unlogged,otherId!==id);
      assert.equal(node.serviceTiming,otherType==='drive_belt_inspection'?'inspection':'condition');assert.equal(node.serviceIntervalMiles,null);assert.equal(node.serviceIntervalMonths,null);assert.equal(node.serviceLogHold,undefined);
      assert.equal(node.buyUrl,undefined);assert.equal(node.imageUnavailable,false);
      const row=schedule.requirements.find(r=>r.id===otherId);assert.equal(row?.status,otherId===id?'recorded':'never-logged');assert.equal(row?.dueMileage,null);
      const html=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner'} as never},React.createElement(TTServiceRow,{node,miles:155000} as any)));
      assert.match(html,otherId===id?/Log again/:/Log service/);
      assert(renderToStaticMarkup(React.createElement(ServiceReview,{vehicleId:vehicle.id,currentMileage:155000,service:{typeId:otherType,label:node.label}})).includes(`value="${otherType}"`));
    }
    assert.equal(tree.car.nodes.oil.unlogged,true);assert.equal(twin.ownerReady,false);
    assert.equal(schedule.requirements.find(r=>r.id==='requirement_requiredChecks')?.status,'coverage-hold');
  });
  test(`${model}: unrelated/future records do not complete belts and manual exceptions remain visible`,()=>{
    for(const rows of [[],[{type:'oil_change',mileage:150000,date:'2026-09-01'}],[{type:'other_service',mileage:150000,date:'2026-09-01',description:'Belt inspected and replaced'}],[{type:'serpentine_belt',mileage:150000,date:'2027-01-01'}]]) {
      const tree=owner(rows);for(const id of Object.keys(jobs))assert.equal(tree.car.nodes[id].unlogged,true);
    }
    const inspect=getExactTwinMaintenanceRule('drive_belt_inspection',vehicle)!;
    const replace=getExactTwinMaintenanceRule('serpentine_belt',vehicle)!;
    assert.match(inspect.guidance,/100,000 miles.*every other oil change/);assert.equal(inspect.action,'inspect');
    assert.match(replace.guidance,/150,000-mile.*previous 100,000 miles/);assert.equal(replace.action,'replace');
    assert.equal(getExactTwinMaintenanceRule('serpentine_belt',{...vehicle,year:2000}),undefined);
    assert.equal(getExactTwinMaintenanceRule('drive_belt_inspection',{...vehicle,trim:'Unreviewed'}),undefined);
  });
}
