import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveDemoVehicleTwin } from '../src/lib/vehicle-twin-catalog';
import { getExactTwinMaintenanceRule, getExactTwinMaintenanceCoverage } from '../src/lib/exact-twin-maintenance-rules';
import { getOwnersManualSchedule } from '../src/lib/owners-manual-schedule';
import { getVehicleMaintenanceIntervals, applyOwnerMaintenanceIntervals } from '../src/lib/vehicle-maintenance-intervals';
import { maintenanceDeadlines, persistMaintenanceEntry } from '../src/lib/maintenance-service-mutation';
import { executeGarageAssistantProductionTool } from '../src/lib/garage-assistant-production-tool';
import { buildMaintenanceSuggestions } from '../src/lib/maintenance-suggestions';
import { resolveTwinTrees, buildModelOwnerTrees, buildDemoTwinPresentation } from '../src/components/twin/demo-trees';
import { buildTwinMaintenanceSchedule } from '../src/components/twin/maintenance-schedule';
import { TTSchedule, TTServiceRow, TTDetail } from '../src/components/twin/stage/TechTree';
import { TwinDataCtx } from '../src/components/twin/twin-context';
import { buildTwinTrees, servicedFromRecords } from '../src/components/twin/twin-trees';

const now = '2026-09-13T12:00:00.000Z';
const ids = ['xt6','nautilus','aviator','mdx','murano','kicks'];
const car = (id: string) => ({...resolveDemoVehicleTwin(id)!.identity,transmission:null,id:'synthetic',userId:'owner',currentMileage:60000,updatedAt:new Date(now)});
type Row = {type:string;mileage:number;date:string;nextDueMileage?:number|null;nextDueDate?:string|null};
function owner(id:string, rows:Row[]=[], mileage=60000) {
  const trees = buildModelOwnerTrees(resolveDemoVehicleTwin(id),rows,mileage as never,null,now as never);
  applyOwnerMaintenanceIntervals(trees,rows,car(id),mileage,now);
  return trees;
}
for(const id of ids) test(`${id}: exact shared rules, card metadata and immutable readiness`,()=>{
  const v=car(id), manual=getOwnersManualSchedule(v), trees=owner(id);
  assert(manual);
  for(const node of Object.values(trees.car.nodes) as any[]) {
    const rule=getExactTwinMaintenanceRule(node.maintenanceType,v);
    if(!rule)continue;
    assert.deepEqual(getVehicleMaintenanceIntervals(node.maintenanceType,v),{intervalMiles:rule.intervalMiles,intervalMonths:rule.intervalMonths,source:'owners-manual'});
    assert.equal(node.serviceIntervalMiles,rule.intervalMiles);
    assert.equal(node.serviceIntervalMonths,rule.intervalMonths);
    assert.equal(node.serviceTiming,rule.timing);
    assert(node.life.includes(rule.guidance));
    assert.equal(node.serviceSourceUrl,rule.source.url);
    assert.equal(node.dueDate,null,'No date invented from vehicle year');
    assert.equal(node.unlogged,true);
  }
  assert.equal(resolveDemoVehicleTwin(id)!.ownerReady,true,'Reviewed six are owner-ready; this does not grant public visual/year scope');
  assert.equal(getExactTwinMaintenanceRule('oil_change',{...v,year:v.year+1}),undefined);
  assert.equal(getExactTwinMaintenanceRule('oil_change',{...v,trim:'unreviewed trim'}),undefined);
});

for(const [id,first,repeat,months] of [['nautilus',100000,50000,36],['aviator',200000,100000,60],['murano',105000,75000,60],['kicks',105000,75000,60]] as const) {
  test(`${id}: first factory coolant is not the repeat clock`,async()=>{
    const empty=owner(id).car.nodes.coolant;
    assert.equal(empty.dueMileage,first);
    assert.equal(empty.serviceFirstIntervalMiles,first);
    assert.equal(empty.serviceIntervalMiles,repeat);
    assert.equal(empty.dueDate,null);
    const input={type:'coolant_flush',mileage:50000,date:'2024-02-29T00:00:00.000Z'};
    const tx={maintenanceRecord:{create:async({data}:any)=>data}};
    const saved=await persistMaintenanceEntry(tx as never,car(id) as never,input,new Date(now));
    assert.equal(saved.nextDueMileage,50000+repeat);
    assert.equal(saved.nextDueDate?.toISOString(),months===36?'2027-02-28T00:00:00.000Z':'2029-02-28T00:00:00.000Z');
    const node=owner(id,[{...saved,date:saved.date.toISOString(),nextDueDate:saved.nextDueDate?.toISOString()}]).car.nodes.coolant;
    assert.equal(node.dueMileage,saved.nextDueMileage);
    assert.equal(node.dueDate,saved.nextDueDate?.toISOString());
    assert.equal(node.unlogged,false);
  });
}

for(const [id,months] of [['xt6',60],['aviator',36],['mdx',36]] as const) test(`${id}: calendar brake fluid uses the same service node, no mileage clock`,()=>{
  const blank=owner(id), row={type:'brake_fluid',mileage:50000,date:'2020-01-31T00:00:00.000Z'};
  const deadlines=maintenanceDeadlines(row.type,car(id),row.mileage,row.date);
  assert.equal(deadlines.nextDueMileage,undefined);
  assert.equal(deadlines.nextDueDate?.getUTCFullYear(),2020+months/12);
  const tree=owner(id,[row]);
  assert.equal(tree.car.nodes.brakeFluid.overdueByDate,true);
  const calendar=buildTwinMaintenanceSchedule(tree,60000).requirements.find((item:any)=>item.id==='brakeFluid');
  assert.equal(calendar?.status,'overdue');
  assert(calendar?.dueDate);
  assert.equal(buildTwinMaintenanceSchedule(blank,60000).requirements.find((item:any)=>item.id==='brakeFluid')?.dueDate,null);
});

test('monitor caps and exact 2019 MDX Minder do not become routine mileage jobs',()=>{
  for(const id of ['xt6','nautilus','aviator','mdx','kicks']) {
    const tree=owner(id), schedule=buildTwinMaintenanceSchedule(tree,60000);
    assert(!schedule.columns.flatMap((c:any)=>c.groups.flatMap((g:any)=>g.items)).some((i:any)=>i.id==='oil'));
    const oil=schedule.requirements.find((r:any)=>r.id==='oil');assert(oil);assert.match(oil.guidance,/monitor|Minder|indicator/i);
    assert.equal(tree.car.nodes.oil.firstServiceDeadline,false);
  }
  assert.deepEqual(getVehicleMaintenanceIntervals('oil_change',car('xt6')),{intervalMiles:null,intervalMonths:12,source:'owners-manual'});
  assert.deepEqual(getVehicleMaintenanceIntervals('oil_change',car('nautilus')),{intervalMiles:10000,intervalMonths:12,source:'owners-manual'});
  const mdx=owner('mdx');
  for(const id of ['transFluid','transferFluid','rearAxleFluid','sparkPlugs','coolant']) {
    assert.equal(mdx.car.nodes[id].serviceTiming,'minder');assert.equal(mdx.car.nodes[id].serviceIntervalMiles,null);
  }
  assert.match(mdx.car.nodes.sparkPlugs.serviceSourceUrl,/2019_MDX_Maintenance_Minder/);
  assert.equal(owner('xt6').car.nodes.airFilter.serviceTiming,'equipment');
  assert.equal(owner('xt6').car.nodes.airFilter.serviceIntervalMiles,null);
});

test('Kicks plug calendar and key inspection/replacement are not Murano rules or fictitious products',()=>{
  assert.equal(getExactTwinMaintenanceRule('spark_plugs',car('kicks'))?.intervalMonths,126);
  assert.equal(getExactTwinMaintenanceRule('spark_plugs',car('murano'))?.intervalMonths,null);
  const items=getExactTwinMaintenanceCoverage(car('kicks'));
  assert.equal(items.find(i=>i.id==='keyBatteryInspect')?.action,'inspect');
  assert.match(items.find(i=>i.id==='keyBatteryInspect')!.guidance,/15,000-mile \/ 18-month/);
  assert.equal(items.find(i=>i.id==='keyBatteryReplace')?.action,'replace');
  assert.match(items.find(i=>i.id==='keyBatteryReplace')!.guidance,/30,000 miles \/ 36 months/);
  const tree=owner('kicks');
  for(const [id,node] of Object.entries(tree.car.nodes) as [string,any][]) if(node.manualRequirement){
    assert.equal(node.buyUrl,undefined);
    const keyType=({requirement_keyBatteryInspect:'key_battery_inspection',requirement_keyBatteryReplace:'key_battery_replacement'} as Record<string,string>)[id];
    if(keyType){assert.equal(node.maintenanceType,keyType);assert.equal(node.serviceLogHold,undefined);assert.equal(node.unlogged,true);}
    else {assert(node.serviceLogHold);assert.equal(node.maintenanceType,undefined);assert.equal(node.unlogged,false);}
  }
});

test('future/invalid/missing history never supplies elapsed-age or overdue proof; explicit deadlines survive',()=>{
  for(const date of ['2027-01-01','not-a-date']) assert.equal(owner('xt6',[{type:'brake_fluid',mileage:50000,date}]).car.nodes.brakeFluid.unlogged,true);
  const v=car('mdx'), rows=[{type:'transmission_fluid_auto',mileage:50000,date:'2026-01-01',nextDueMileage:65000}];
  const node=owner('mdx',rows).car.nodes.transFluid;
  assert.equal(node.dueMileage,65000);assert.match(node.dueNote,/Saved service-record deadline/);
  assert.deepEqual(buildMaintenanceSuggestions({vehicleId:'synthetic',vehicle:v,currentMileage:200000,evaluatedAt:new Date(now)},[]),[]);
  assert.deepEqual(buildMaintenanceSuggestions({vehicleId:'synthetic',vehicle:v,currentMileage:200000,evaluatedAt:new Date(now)},[{type:'oil_change',mileage:50000,date:new Date('2027-01-01')}]),[]);
  const saved=buildMaintenanceSuggestions({vehicleId:'synthetic',vehicle:v,currentMileage:64000,evaluatedAt:new Date(now)},[{type:'transmission_fluid_auto',mileage:50000,date:new Date('2026-01-01'),nextDueMileage:65000}]);
  assert.equal(saved[0]?.nextDueMileage,65000);assert.equal(saved[0]?.deadlineSource,'saved-record');assert.equal(saved[0]?.intervalMiles,null);
});

test('retained tire/brake/wiper symptoms and no duplicate canonical oil action',()=>{
  assert.match(owner('xt6').car.nodes.tire.life,/tread|vibration/);
  assert.match(owner('xt6').car.nodes.brakeFluid.life,/spongy/);
  assert.match(owner('xt6').car.nodes.wiperBlades.life,/chatter/);
  const details=renderToStaticMarkup(React.createElement(TTDetail,{node:owner('xt6').car.nodes.tire,nodeId:'tire',miles:60000,onClose:()=>{},onAsk:()=>{},readOnly:true} as any));
  assert.match(details,/tread/);assert.match(details,/7,500 miles/);
  const node={maintenanceType:'oil_change',serviceIntervalMiles:7500,unlogged:true,serviceLabel:'Oil and filter'};
  const schedule=buildTwinMaintenanceSchedule({car:{root:'car',nodes:{oil:node,filter:{...node}}}},60000);
  for(const column of schedule.columns){const all=column.groups.flatMap((g:any)=>g.items);assert.equal(all.length,new Set(all.map((n:any)=>n.dueMileage)).size);}
});

test('actual live service row explains calendar or Minder timing and retains shared Log service entry',()=>{
  for(const [id,nodeId,expected] of [['xt6','brakeFluid',/every 60 months/],['mdx','transFluid',/Maintenance Minder/]] as const) {
    const markup=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner'} as never},React.createElement(TTServiceRow,{node:owner(id).car.nodes[nodeId],miles:60000} as any)));
    assert.match(markup,expected);assert.match(markup,/Log service/);assert.doesNotMatch(markup,/condition-based/);
  }
  const selected:string[]=[];
  const element=TTSchedule({schedule:buildTwinMaintenanceSchedule(owner('mdx'),60000),miles:60000,onOpenNode:(id:string)=>selected.push(id)}) as any;
  function visit(value:any){if(!value)return;if(Array.isArray(value)){value.forEach(visit);return;}if(value.props?.['data-schedule-node']==='brakeFluid')value.props.onClick();visit(value.props?.children);}
  visit(element);assert.deepEqual(selected,['brakeFluid']);
});

test('assistant status shares calendar and Minder guidance rather than asserting condition-only service',async()=>{
  const v={...car('mdx'),maintenanceRecords:[{type:'transmission_fluid_auto',mileage:50000,date:new Date('2026-01-01'),nextDueMileage:null,nextDueDate:null}]};
  const output=JSON.parse(await executeGarageAssistantProductionTool('get_maintenance_status',{vehicleId:'synthetic'},'owner',{vehicle:{findFirst:async()=>v}} as never,new Date(now)));
  assert(output.some((x:any)=>x.message.includes('Maintenance Minder 3')));
  assert(!output.some((x:any)=>x.message.includes('condition-based service')));
  assert(output.some((x:any)=>x.message.includes('every three years')));
});

test('Challenger replacement is never reset by rotation or assigned a rotation-derived life',()=>{
  const replacement={type:'tire_replacement',mileage:50000,date:'2026-01-01',nextDueMileage:85000};
  const rotation={type:'tire_rotation',mileage:59000,date:'2026-08-01'};
  const records=servicedFromRecords([replacement,rotation],60000,null,now as never);
  const tree:any=buildTwinTrees(records as never,60000,null,now as never);
  assert.equal(tree.car.nodes.tire.maintenanceType,'tire_replacement');
  assert.equal(tree.car.nodes.tire.servicedAt,50000);
  assert.equal(tree.car.nodes.tire.dueMileage,85000);
  assert.equal(tree.car.nodes.tire.serviceIntervalMiles,null);
  const plain:any=buildTwinTrees(servicedFromRecords([{...replacement,nextDueMileage:null}],60000,null,now as never) as never,60000,null,now as never);
  assert.equal(plain.car.nodes.tire.dueMileage,null);
});

for(const width of [320,390,1280]) test(`${width}px: actual Schedule SSR has bounded responsive requirements and existing node actions`,()=>{
  const schedule=buildTwinMaintenanceSchedule(owner('mdx'),60000);
  const markup=renderToStaticMarkup(React.createElement('div',{style:{width}},React.createElement(TTSchedule,{schedule,miles:60000,onOpenNode:()=>{}})));
  assert.match(markup,/data-schedule-node="brakeFluid"/);
  assert.match(markup,/data-schedule-node="transFluid"/);
  assert.match(markup,/data-schedule-scroll="true"[^>]*min-width:0[^>]*overflow:auto/);
  assert.match(markup,/data-schedule-board="true"/);
  assert.match(markup,/minmax\(218px, 1fr\)/);
  assert.doesNotMatch(markup,/data-schedule-requirements/,'Superseded duplicate requirements grid must not return');
  assert.match(markup,/data-schedule-node="requirement_tireRepairKitExpiration"/);
  assert.match(markup,/Review requirement/);
  const hold=renderToStaticMarkup(React.createElement(TTServiceRow,{node:owner('mdx').car.nodes.requirement_tireRepairKitExpiration,miles:60000} as any));
  assert.match(hold,/data-service-coverage-hold/);assert.doesNotMatch(hold,/<button/);
});

test('sample history is preserved but fixed rotation status is not fabricated for monitor-driven Nautilus',()=>{
  const twin=resolveDemoVehicleTwin('nautilus')!, trees=resolveTwinTrees(twin);
  const sample=twin.sampleState.records.find(r=>r.node==='tire')!;
  assert.equal(trees.car.nodes.tire.servicedAt,sample.lastServiceMileage);
  assert.equal(trees.car.nodes.tire.dueMileage,null);
  assert.notEqual(buildDemoTwinPresentation(twin).hotspots.find((h:any)=>h.id==='wheel')?.status,'overdue');
});
