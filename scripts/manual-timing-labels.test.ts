import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {resolveDemoVehicleTwin} from '../src/lib/vehicle-twin-catalog';
import {buildModelOwnerTrees} from '../src/components/twin/demo-trees';
import {applyOwnerMaintenanceIntervals} from '../src/lib/vehicle-maintenance-intervals';
import {TTServiceRow} from '../src/components/twin/stage/TechTree';
import {TwinDataCtx} from '../src/components/twin/twin-context';

function nodeFor(id:string,nodeId:string){
  const twin=resolveDemoVehicleTwin(id)!;
  const trees=buildModelOwnerTrees(twin,[],60000 as never,null,'2026-09-13' as never);
  applyOwnerMaintenanceIntervals(trees,[],twin.identity,60000,'2026-09-13');
  return trees.car.nodes[nodeId];
}
function render(node:any,live=true){return renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:live?{mode:'owner'} as never:null},React.createElement(TTServiceRow,{node,miles:60000} as any)));}
for(const [id,key] of [['nautilus','requirement_driveBelt'],['aviator','requirement_driveBelt'],['nautilus','requirement_driveBeltReplace'],['aviator','requirement_driveBeltReplace'],['kicks','requirement_keyBatteryInspect']])test(id+'/'+key+': manual visit does not invent a monitored service',()=>{
  const node=nodeFor(id,key),html=render(node);
  assert.doesNotMatch(html,/follow the vehicle monitor|maximum cap/);
  assert.match(html,/Never logged/);assert.match(html,/Log service/);
  assert.equal(node.dueMileage,null);assert.equal(node.dueDate,null);
  assert.equal(node.serviceIntervalMiles,null);assert.equal(node.serviceIntervalMonths,null);
  if(key.endsWith('Replace'))assert.match(node.serviceGuidance,/150,000-mile.*previous 100,000 miles/);
  else {
    assert.match(html,/manual inspection steps and visit timing/);
    assert.match(render({...node,servicedAt:59000},false),/manual inspection steps and visit timing/);
    assert.match(node.serviceGuidance,id==='kicks'?/initial 15,000-mile or 18-month/:/100,000 miles.*every other oil change/);
  }
});
test('genuine vehicle monitor and Maintenance Minder retain their instructions',()=>{
  assert.match(render(nodeFor('nautilus','oil')),/follow the vehicle monitor and its stated maximum cap/);
  assert.match(render(nodeFor('mdx','requirement_timingBelt')),/follow the Maintenance Minder code/);
});
