import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {resolveDemoVehicleTwin} from '../src/lib/vehicle-twin-catalog';
import {getExactTwinMaintenanceCoverage,getExactTwinMaintenanceRule} from '../src/lib/exact-twin-maintenance-rules';
import {buildModelOwnerTrees,summarizeEvidence,collectHotspotNodes} from '../src/components/twin/demo-trees';
import {buildTwinMaintenanceSchedule,categoryFor} from '../src/components/twin/maintenance-schedule';
import {TTDetail,TTSchedule} from '../src/components/twin/stage/TechTree';
import {TwinDataCtx} from '../src/components/twin/twin-context';
import {buildOwnerTwinValue} from '../src/components/twin/LiveTwinHub';
import {REVIEWED_OWNER_EQUIPMENT,ownerEquipmentFitmentKey} from '../src/lib/twin-owner-equipment';
const models=['nautilus','murano','xt6','kicks','mdx','aviator'];
function setup(id:string){const twin=resolveDemoVehicleTwin(id);const trees=buildModelOwnerTrees(twin,[],60000 as never,null,'2026-09-14' as never);return {twin,trees};}
for(const id of models){
  test(id+': explicit requirements remain reachable, sourced and canonical across every branch',()=>{
    const {twin,trees}=setup(id);
    assert.equal(trees.wipers.label,'Interior');assert.equal(trees.wipers.nodes.wiperRoot.label,'Interior');
    assert.equal(twin.systems.find(s=>s.branch==='wipers')?.label,'Interior');assert.equal(twin.hotspots.find(s=>s.id==='glass')?.label,'Interior');
    for(const tree of Object.values(trees) as any[]){
      const reached=new Set<string>();const walk=(key:string)=>{assert(tree.nodes[key],key);assert(!reached.has(key),'No duplicate/cyclic graph placement: '+key);reached.add(key);for(const child of tree.nodes[key].kids||[])walk(child);};walk(tree.root);
      assert.equal(reached.size,Object.keys(tree.nodes).length,'No orphaned nodes');assert(!tree.nodes.manualRequirements);
    }
    for(const item of getExactTwinMaintenanceCoverage(twin.identity)){
      const node=trees.car.nodes['requirement_'+item.id];assert(node,item.id);
      assert.equal(node.maintenanceType,item.maintenanceType);assert.equal(node.sourceRequirementId,item.id);
      assert.equal(node.spec,item.guidance);assert.equal(node.serviceSourceUrl,item.source.url);
      const rule=item.maintenanceType?getExactTwinMaintenanceRule(item.maintenanceType,twin.identity):null;
      assert.equal(node.serviceGuidance,rule?.guidance||item.guidance);
      if(!item.maintenanceType){assert(node.serviceLogHold);assert.equal(node.buyUrl,undefined);}
      for(const alias of Object.values(trees.car.nodes) as any[]){if(alias.canonicalRequirementId===node.canonicalRequirementId){assert.equal(alias.maintenanceType,node.maintenanceType);assert.equal(alias.serviceGuidance,node.serviceGuidance);assert.equal(alias.serviceLogHold,node.serviceLogHold);}}
    }
    if(id==='nautilus')assert(trees.trans.nodes.driveline.kids.includes('requirement_halfshaftBootsInspection'));
    if(id==='mdx')assert(trees.trans.nodes.driveline.kids.includes('requirement_driveshaftBootsInspection'));
  });
  test(id+': preview contains only title/action, opened actual detail retains all guidance and holds',()=>{
    const {twin,trees}=setup(id),schedule=buildTwinMaintenanceSchedule(trees,60000);
    const html=renderToStaticMarkup(React.createElement(TTSchedule,{schedule,miles:60000,onOpenNode:()=>{}}));
    assert(!html.includes('data-schedule-requirements'));
    const section=html.split('data-schedule-next-service')[1].split('</section>')[0];
    for(const button of section.matchAll(/<button[^>]*data-schedule-node="([^"]+)"[^>]*>(.*?)<\/button>/g)){
      const item=schedule.nextService.find(r=>r.id===button[1])!;assert(item);
      assert(button[2].includes(item.logHold?'Review requirement':'Open complete service'));
      const node=trees.car.nodes[item.id];if(node.maintenanceType)assert.equal(node.canonicalRequirementId||item.id,item.id);
      const detail=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner',vehicle:twin.identity,trees,catalog:twin,miles:60000,ownerActions:{vehicleId:'offline',refresh:()=>{}}} as never},React.createElement(TTDetail,{node,nodeId:item.id,miles:60000,onClose:()=>{},onAsk:()=>{},onEquip:()=>{},risk:null,sheet:false,narrow:false})));
      assert(detail.includes(renderToStaticMarkup(React.createElement(React.Fragment,null,node.life))),'Full guidance remains visible');
      if(item.logHold)assert(detail.includes('data-service-coverage-hold'));
    }
  });
}
test('spark plugs do not match lug nuts; held system previews do not disappear behind the first portion',()=>{
  for(const id of models){const {trees}=setup(id);const schedule=buildTwinMaintenanceSchedule(trees,64000,24);
    assert.equal(categoryFor('sparkPlugs',trees.car.nodes.sparkPlugs).id,'engine',id);
    assert.equal(categoryFor('cabinFilter',trees.car.nodes.cabinFilter).label,'Interior',id);
    for(const column of schedule.columns)for(const group of column.groups)for(const item of group.items)if(item.maintenanceType==='spark_plugs')assert.equal(group.id,'engine',id);
    for(const [key,node] of Object.entries(trees.car.nodes) as any[])if(node.manualRequirement&&!node.maintenanceType)assert(schedule.requirements.some(item=>item.id===key),key);
  }
  assert.equal(categoryFor('lug_nuts',{maintenanceType:'lug_nuts'}).id,'wheels');
  assert.equal(categoryFor('requirement_halfshaftBootsInspection',{maintenanceType:'halfshaft_boots_inspection'}).id,'driveline');
  assert.equal(categoryFor('requirement_steeringSuspensionInspection',{maintenanceType:'steering_suspension_inspection'}).id,'chassis');
});

test('multiple system views count one complete inspection, including incomplete-history overdue summaries',()=>{
  const {trees}=setup('nautilus'),base=trees.car.nodes.requirement_steeringSuspensionDriveshaftInspection;
  const completed={...base,unlogged:false,servicedAt:10000,dueMileage:20000,servicedDate:'2026-01-01',dueDate:null};
  const alias={...completed,presentationSystem:'trans'};
  assert.equal(summarizeEvidence([completed,alias],30000).due,1);
  assert.equal(summarizeEvidence([alias],30000).due,1);
  assert.match(summarizeEvidence([completed,alias,{unlogged:true}],30000).serviceLabel,/^1 overdue/);
});

function ownerData(id:string){const p=REVIEWED_OWNER_EQUIPMENT.find(row=>row.catalogId===id)!;return {vehicleId:'offline-layout-review',fulfillmentId:p.fulfillmentId,vehicle:{...p,reviewedEquipmentId:p.id,color:null},miles:64000,transmission:'automatic',records:[],installedParts:[],issues:[],evaluatedAt:'2026-09-14T12:00:00Z'};}
test('actual XT6 evaporation inspection is overdue in hood and whole-car evidence, without absorbing the radiator',()=>{
  const data=ownerData('xt6');const value:any=buildOwnerTwinValue({...data,records:[{id:'evap-confirmed',type:'evap_system_inspection',mileage:10000,date:'2025-01-01T00:00:00Z',nextDueMileage:55000}]});assert(value);
  const node=value.trees.car.nodes.requirement_evapInspection;assert.equal(node.serviceRecordId,'evap-confirmed');assert.equal(node.dueMileage,55000);
  const hood=value.catalog.hotspots.find((hotspot:any)=>hotspot.id==='hood');assert.equal(hood.node,'hoodRoot');
  const nodes=collectHotspotNodes(value.trees,hood);assert(nodes.some((n:any)=>n.id==='requirement_evapInspection'));assert(!nodes.some((n:any)=>n.id==='rad'||n.id==='coolant'));
  for(const summary of [summarizeEvidence(nodes,64000),value.presentation.hotspots.find((hotspot:any)=>hotspot.id==='hood'),value.presentation.summary]){
    assert.equal(summary.serviceStatus,'overdue');assert.match(summary.serviceLabel,/^1 overdue/);
  }
});
test('actual MDX full-fluid owner notes survive canonical/alias order while service counts remain deduplicated',()=>{
  const data=ownerData('mdx'),canonical='requirement_fluidLevelsInspection',alias=canonical+'_wheel';
  for(const notedId of [canonical,alias]){
    const value:any=buildOwnerTwinValue({...data,records:[{id:'full-fluids',type:'fluid_levels_inspection',mileage:10000,date:'2025-01-01T00:00:00Z',nextDueMileage:55000}],installedParts:[{nodeId:notedId,kind:'known-issue-note',notes:'Owner observed fluid concern',fitmentKey:ownerEquipmentFitmentKey('mdx','automatic',data.vehicle)}]});assert(value);
    const original=value.trees.car.nodes[canonical],view=value.trees.car.nodes[alias];assert.equal(value.trees.car.nodes[notedId].knownIssue.id,'owner:'+notedId);
    for(const nodes of [[original,view],[view,original]]){
      const summary=summarizeEvidence(nodes,64000);assert.equal(summary.status,'known-issue');assert.equal(summary.due,1);assert.deepEqual(summary.knownIssues.map((issue:any)=>issue.id),['owner:'+notedId]);
    }
    assert(value.presentation.summary.knownIssues.some((issue:any)=>issue.id==='owner:'+notedId));
  }
});
