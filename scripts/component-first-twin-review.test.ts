import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {resolveDemoVehicleTwin} from '../src/lib/vehicle-twin-catalog';
import {resolveTwinTrees,summarizeEvidence} from '../src/components/twin/demo-trees';
import {componentGraphNodes,EMBEDDED_INSPECTION_TYPES} from '../src/components/twin/inspection-presentation';
import {buildTwinMaintenanceSchedule} from '../src/components/twin/maintenance-schedule';
import {buildOwnerTwinValue} from '../src/components/twin/LiveTwinHub';
import {REVIEWED_OWNER_EQUIPMENT,ownerEquipmentFitmentKey} from '../src/lib/twin-owner-equipment';
import {TTDetail,TTSchedule,ttThumb} from '../src/components/twin/stage/TechTree';
import {TwinDataCtx} from '../src/components/twin/twin-context';
import {KNOWN_ISSUE_TWIN_VISUALS} from '../src/lib/known-issue-twin-visuals';
import {projectKnownIssueTwinIssues} from '../src/lib/known-issue-twin-pilot';
import {buildIssueTree} from '../src/lib/known-issue-twin-tree';
import published from './fixtures/component-first-issue-sources.json';
test('approaching calendar deadline remains at its actual mileage even outside five projected stops',()=>{
 const value=owner('nautilus',[{id:'tomorrow',type:'coolant_flush',mileage:60000,date:'2025-01-01T00:00:00Z',nextDueMileage:160000,nextDueDate:'2026-09-15T00:00:00Z'}]);
 assert.equal(value.trees.car.nodes.coolant.overdueByDate,false);
 const schedule=buildTwinMaintenanceSchedule(value.trees,64000,5);
 const column=schedule.columns.find((column:any)=>column.mileage===160000);assert(column);
 const item=column.groups.flatMap((group:any)=>group.items).find((item:any)=>item.id==='coolant');
 assert.equal(item.dueDate,'2026-09-15T00:00:00Z');assert.equal(item.status,'scheduled');
 assert(!schedule.nextService.some((item:any)=>item.id==='coolant'));
});
test('unlogged first calendar interval differs from later recurrences and recorded repeats',()=>{
 for(const [model,id,firstMileage,firstMonths,repeatMonths] of [['nautilus','coolant',100000,72,36],['murano','requirement_keyBatteryReplace',45000,36,18]] as const){
  const value=owner(model,[],[],0),node=value.trees.car.nodes[id],schedule=buildTwinMaintenanceSchedule(value.trees,0,24);
  const items=schedule.columns.flatMap((column:any)=>column.groups.flatMap((group:any)=>group.items)).filter((item:any)=>item.id===id);
  assert.equal(items.find((item:any)=>item.dueMileage===firstMileage)?.calendarMonths,firstMonths,model);
  assert.equal(items.find((item:any)=>item.dueMileage===firstMileage+node.serviceIntervalMiles)?.calendarMonths,repeatMonths,model);
  const recorded=owner(model,[{id:'repeat',type:node.maintenanceType,mileage:1000,date:'2026-01-01T00:00:00Z'}],[],1000);
  const recurring=buildTwinMaintenanceSchedule(recorded.trees,1000,24).columns.flatMap((column:any)=>column.groups.flatMap((group:any)=>group.items)).find((item:any)=>item.id===id);
  assert.equal(recurring.calendarMonths,repeatMonths,model);
 }
});
test('graph preserves canonical identity for unchanged children and hidden service leaves',()=>{
 const nodes=owner('nautilus').trees.car.nodes,graph=componentGraphNodes(nodes);
 for(const [id,node] of Object.entries(nodes) as any[]){
  const pruned=node.kids.some((child:string)=>nodes[child].visualHidden);
  if(pruned){assert.notEqual(graph[id],node);assert.deepEqual(graph[id].kids,node.kids.filter((child:string)=>!nodes[child].visualHidden));}
  else assert.equal(graph[id],node,id);
 }
 graph.sparkPlugs.servicedAt=64000;assert.equal(nodes.sparkPlugs.servicedAt,64000);
 delete graph.sparkPlugs.servicedAt;assert.equal(nodes.sparkPlugs.servicedAt,undefined);
});
test('embedded service status reads actual servicedDate after confirmed owner history',()=>{
 const value=owner('nautilus',[{id:'wheel-inspected',type:'wheel_components_inspection',mileage:60000,date:'2026-09-01T00:00:00Z'}]);
 const html=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value},React.createElement(TTDetail,{node:value.trees.wheel.nodes.wheelRoot,nodeId:'wheelRoot',miles:64000,onClose:()=>{},onOpenNode:()=>{},risk:null,onEquip:()=>{},onAsk:()=>{},sheet:false,narrow:false})));
 assert(html.includes('Service recorded · '));assert.equal(value.trees.car.nodes.requirement_wheelComponentsInspection.servicedDate,'2026-09-01T00:00:00Z');
});
const models=['nautilus','murano','xt6','kicks','mdx','aviator'];
function owner(id:string,records:any[]=[],installedParts:any[]=[],miles=64000){
 const p=REVIEWED_OWNER_EQUIPMENT.find(p=>p.catalogId===id)!;
 return buildOwnerTwinValue({vehicleId:'offline',fulfillmentId:p.fulfillmentId,vehicle:{...p,reviewedEquipmentId:p.id,color:null},miles,transmission:'automatic',records,installedParts,issues:[],evaluatedAt:'2026-09-14T12:00:00Z'}) as any;
}
const seenImages=new Set<string>();
async function imageExists(src:string){assert(src);assert(!src.includes('service-inspection.svg'));const file=path.join('public',src);assert(fs.existsSync(file),file);if(!seenImages.has(file)){const meta=await sharp(file).metadata();assert(meta.width&&meta.height);seenImages.add(file);}}
for(const id of models){
 test(id+': every demo/owner component and detail has decoded artwork; hidden jobs retain evidence',async()=>{
  for(const trees of [resolveTwinTrees(resolveDemoVehicleTwin(id)),owner(id).trees]){
   const nodes=trees.car.nodes,graph=componentGraphNodes(nodes),before=JSON.stringify(nodes),visible=new Set<string>();
   const walk=(key:string)=>{visible.add(key);for(const child of graph[key].kids)walk(child);};walk(trees.car.root);
   for(const [key,node] of Object.entries(nodes) as any[]){
    await imageExists(node.img);await imageExists(ttThumb(node.img));
    if(EMBEDDED_INSPECTION_TYPES.has(node.maintenanceType)){
     assert(node.visualHidden);assert(!visible.has(key));assert.equal(graph[key].maintenanceType,node.maintenanceType);
     assert(Object.values(nodes).some((parent:any)=>parent.embeddedServiceIds?.includes(key)));
     const detail=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner',trees,vehicle:resolveDemoVehicleTwin(id).identity} as any},React.createElement(TTDetail,{node,nodeId:key,miles:64000,onClose:()=>{},risk:null,onEquip:()=>{},onAsk:()=>{},sheet:false,narrow:false})));
     assert(detail.includes(node.img));assert(detail.includes(node.serviceLabel.replace(/&/g,'&amp;')));
    }else assert(visible.has(key),key+' must remain in graph');
   }
   assert.equal(JSON.stringify(nodes),before,'presentation must not mutate source nodes');
   assert.deepEqual(summarizeEvidence(Object.values(nodes),64000),summarizeEvidence(Object.values(graph),64000));
  }
 });
 test(id+': one board separates only non-mileage jobs and preserves every canonical schedule destination',()=>{
  const value=owner(id),schedule=buildTwinMaintenanceSchedule(value.trees,64000,24),nodes=value.trees.car.nodes;
  const fixed=new Set(schedule.columns.flatMap((c:any)=>c.groups.flatMap((g:any)=>g.items.map((n:any)=>n.id))));
  for(const item of schedule.nextService){assert(!fixed.has(item.id));assert(!nodes[item.id].serviceIntervalMiles||['monitor','minder','equipment'].includes(nodes[item.id].serviceTiming));}
  for(const item of schedule.requirements){assert(schedule.nextService.some((n:any)=>n.id===item.id)||fixed.has(item.id),item.id);}
  for(const column of schedule.columns){const jobs=column.groups.flatMap((g:any)=>g.items);assert.equal(new Set(jobs.map((n:any)=>nodes[n.id].maintenanceType)).size,jobs.length);for(const item of jobs)assert.equal(item.dueMileage,column.mileage);}
  const html=renderToStaticMarkup(React.createElement(TTSchedule,{schedule,miles:64000,onOpenNode:()=>{}}));
  assert(!html.includes('data-schedule-requirements'));assert.equal((html.match(/data-schedule-board/g)||[]).length,1);assert(html.includes('No fixed mileage'));
  for(const node of Object.values(nodes) as any[])if(node.visualHidden&&node.canonicalRequirementId)assert(schedule.nextService.some((item:any)=>item.id===node.canonicalRequirementId));
 });
}
test('hidden full-job records and independent owner notes survive; rotation never completes them',()=>{
 const p=REVIEWED_OWNER_EQUIPMENT.find(p=>p.catalogId==='nautilus')!,key='requirement_steeringSuspensionDriveshaftInspection',alias=key+'_driveline',vehicle={...p,reviewedEquipmentId:p.id};
 const record={id:'complete-full-job',type:'steering_suspension_driveshaft_inspection',mileage:60000,date:'2026-09-01T00:00:00Z'};
 const note={nodeId:alias,kind:'known-issue-note',notes:'Owner concern retained',fitmentKey:ownerEquipmentFitmentKey('nautilus','automatic',vehicle)};
 const value=owner('nautilus',[record],[note]);
 for(const id of [key,alias]){const node=value.trees.car.nodes[id];assert.equal(node.serviceRecordId,record.id);assert.equal(node.unlogged,false);assert.equal(node.maintenanceType,record.type);}
 assert(value.presentation.summary.knownIssues.some((n:any)=>n.id==='owner:'+alias));
 const rotation=owner('nautilus',[{...record,id:'rotation-only',type:'tire_rotation'}]);
 assert(rotation.trees.car.nodes[key].unlogged);assert(rotation.trees.car.nodes.requirement_wheelComponentsInspection.unlogged);
});
test('saved date and mileage remain honest alternatives, not duplicated lane jobs',()=>{
 const value=owner('nautilus',[{id:'coolant',type:'coolant_flush',mileage:10000,date:'2020-01-01T00:00:00Z',nextDueMileage:110000}]);
 const schedule=buildTwinMaintenanceSchedule(value.trees,64000,24);
 const item=schedule.columns.flatMap((c:any)=>c.groups.flatMap((g:any)=>g.items)).find((n:any)=>n.id==='coolant');
 assert(item);assert(item.dueDate);assert(!schedule.nextService.some((n:any)=>n.id==='coolant'));
 const html=renderToStaticMarkup(React.createElement(TTSchedule,{schedule,miles:64000,onOpenNode:()=>{}}));assert(html.includes('whichever comes first'));
});
test('far-mileage but date-overdue confirmed job survives the five-column horizon',()=>{
 const value=owner('nautilus',[{id:'past-date',type:'coolant_flush',mileage:60000,date:'2025-01-01T00:00:00Z',nextDueMileage:160000,nextDueDate:'2026-01-01T00:00:00Z'}]);
 const node=value.trees.car.nodes.coolant;assert.equal(node.overdueByDate,true);
 const schedule=buildTwinMaintenanceSchedule(value.trees,64000,5);
 const column=schedule.columns.find((column:any)=>column.mileage===160000);assert(column,'Real outstanding date obligation is never clipped');
 const item=column.groups.flatMap((group:any)=>group.items).find((item:any)=>item.id==='coolant');assert(item);assert.equal(item.status,'overdue');assert.equal(item.dueDate,'2026-01-01T00:00:00Z');
 assert(!schedule.nextService.some((item:any)=>item.id==='coolant'));
});
test('all 28 mapped sibling trees decode images without generic missing-photo action art',async()=>{
 let count=0;
 for(const definition of KNOWN_ISSUE_TWIN_VISUALS){
  const rows=published.rows.map((row:any)=>({...row,symptoms:row.symptoms||[],dtcCodes:row.dtcCodes||[],vehicleMatch:{make:row.make,model:row.model,years:row.years,trims:row.trims,engines:row.engines},fixParts:[],communityRecommendations:[]}));
  for(const issue of projectKnownIssueTwinIssues(rows as any,definition).filter((row:any)=>row.hotspot)){
   count++;for(const node of Object.values(buildIssueTree(issue,definition).nodes) as any[]){await imageExists(node.img);await imageExists(ttThumb(node.img));}
  }
 }
 assert.equal(count,28);
});
