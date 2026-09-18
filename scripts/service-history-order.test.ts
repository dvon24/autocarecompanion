import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDemoVehicleTwin } from '../src/lib/vehicle-twin-catalog';
import { buildModelOwnerTrees } from '../src/components/twin/demo-trees';
import { applyOwnerMaintenanceIntervals } from '../src/lib/vehicle-maintenance-intervals';
import { buildMaintenanceReminders } from '../src/lib/maintenance-reminder-data';
import { compareServiceRecordsNewestFirst } from '../src/lib/service-record-order';
import { loadLatestTwinServiceRecords, serializeTwinServiceRecord } from '../src/lib/twin-hub-data';

const now='2026-09-13T12:00:00Z', twin=resolveDemoVehicleTwin('xt6')!;
const vehicle={...twin.identity,id:'synthetic-xt6',currentMileage:160000,transmission:null};
const row=(id:string,mileage:number,date:string,nextDueMileage:number,type='rear_axle_fluid')=>({id,type,mileage,date,nextDueMileage});
function compare(rows:ReturnType<typeof row>[],expected:string,deadline:number){
  const before=JSON.stringify(rows);
  const trees=buildModelOwnerTrees(twin,rows,vehicle.currentMileage as never,null,now as never);
  applyOwnerMaintenanceIntervals(trees,rows,vehicle,vehicle.currentMileage,now);
  const node=Object.values(trees.car.nodes).find((n:any)=>n.maintenanceType==='rear_axle_fluid') as any;
  const alerts=buildMaintenanceReminders(vehicle,rows.map(r=>({...r,date:new Date(r.date)})),new Date(now));
  const alert=alerts.find(r=>r.maintenanceType==='rear_axle_fluid')!;
  assert.equal(node.serviceRecordId,expected);assert.equal(node.dueMileage,deadline);
  assert.equal(alert.status.dueAtMileage,deadline);
  assert.equal(alert.lastServiceDate,new Date(rows.find(r=>r.id===expected)!.date).toISOString());
  assert.equal(JSON.stringify(rows),before,'projection must not mutate history');
}
test('newer service date wins over higher historical mileage in either input order',()=>{
  const rows=[row('old',159000,'2026-01-01',180000),row('new',150000,'2026-09-01',160000)];
  compare(rows,'new',160000);compare([...rows].reverse(),'new',160000);
});
test('date tie uses mileage, then stable record id including explicit deadline identity',()=>{
  const rows=[row('z',150000,'2026-09-01',160000),row('a',150000,'2026-09-01',180000),row('low',140000,'2026-09-01',150000)];
  compare(rows,'z',160000);compare([...rows].reverse(),'z',160000);
});
test('invalid, future, unrelated and above-current rows cannot replace valid evidence',()=>{
  compare([row('valid',150000,'2026-01-01',160000),row('future',155000,'2027-01-01',180000),
    row('negative',-1,'2026-09-01',180000),row('nan',NaN,'2026-09-01',180000),
    row('infinite',Infinity,'2026-09-01',180000),row('above',170000,'2026-09-01',180000),
    row('invalid',155000,'not-a-date',180000),row('other',155000,'2026-09-01',180000,'awd_clutch_fluid')],'valid',160000);
});
test('normal order, missing history and unknown odometer retain established semantics',()=>{
  compare([row('old',140000,'2026-01-01',150000),row('new',150000,'2026-09-01',160000)],'new',160000);
  for(const miles of [null,NaN,-1]) {
    const tree=buildModelOwnerTrees(twin,[row('zero',0,'2026-01-01',160000)],miles as never,null,now as never);
    const node=Object.values(tree.car.nodes).find((n:any)=>n.maintenanceType==='rear_axle_fluid') as any;
    assert.equal(node.unlogged,true);assert.equal(node.serviceRecordId,undefined);
  }
  assert.deepEqual(buildMaintenanceReminders(vehicle,[],new Date(now)),[]);
});
test('shared comparator accepts Date and ISO evidence, and missing-id stable ties',()=>{
  const a={mileage:100,date:new Date('2026-09-01')},b={mileage:100,date:'2026-09-01'};
  assert.equal(compareServiceRecordsNewestFirst(a,b),0);
  assert(compareServiceRecordsNewestFirst(a,{...b,date:'2026-01-01'})<0);
});
test('selected id is respected or cleared; legacy nodes without ids still project',()=>{
  const records=[row('a',150000,'2026-09-01',160000)];
  const node:any={maintenanceType:'rear_axle_fluid',servicedAt:150000,servicedDate:'2026-09-01'};
  applyOwnerMaintenanceIntervals({car:{nodes:{node}}},records,vehicle,160000,now);
  assert.equal(node.unlogged,false);assert.equal(node.dueMileage,160000);
  node.serviceRecordId='removed';
  applyOwnerMaintenanceIntervals({car:{nodes:{node}}},records,vehicle,160000,now);
  assert.equal(node.unlogged,true);assert.equal(node.serviceRecordId,undefined);
  assert.equal(node.servicedAt,undefined);
});
test('captured missing-id selection does not use legacy fallback to another identified row',()=>{
  const records=[row('z',150000,'2026-09-01',180000),{...row('a',150000,'2026-09-01',160000),id:undefined}];
  const node:any={maintenanceType:'rear_axle_fluid',servicedAt:150000,servicedDate:'2026-09-01',serviceRecordId:undefined};
  applyOwnerMaintenanceIntervals({car:{nodes:{node}}},records,vehicle,160000,now);
  assert.equal(node.dueMileage,160000);assert.equal(node.unlogged,false);
});
test('bounded server query and serialized evidence preserve Hub/reminder tie and invalid-row parity',async()=>{
  const rows=[row('a',150000,'2026-09-01',180000),row('z',150000,'2026-09-01',160000),row('negative',-1,'2026-09-12',180000)]
    .map(r=>({...r,date:new Date(r.date),nextDueDate:null}));
  const loaded=await loadLatestTwinServiceRecords(vehicle.id,160000,new Date(now),async query=>{
    assert.equal(query.where.mileage.gte,0);
    assert.deepEqual(query.orderBy,[{date:'desc'},{mileage:'desc'},{id:'desc'}]);
    // Independently emulate the actual bounded database query, not the new helper.
    return rows.filter(r=>r.type===query.where.type&&r.mileage>=query.where.mileage.gte&&r.mileage<=query.where.mileage.lte&&r.date<=query.where.date.lte)
      .sort((a,b)=>b.date.getTime()-a.date.getTime()||b.mileage-a.mileage||b.id.localeCompare(a.id))[0]??null;
  },['rear_axle_fluid']);
  const payload=JSON.parse(JSON.stringify(loaded.map(serializeTwinServiceRecord)));
  assert.equal(payload[0].id,'z');
  compare(payload,'z',160000);
  const alert=buildMaintenanceReminders(vehicle,rows,new Date(now)).find(r=>r.maintenanceType==='rear_axle_fluid')!;
  assert.equal(alert.status.dueAtMileage,160000);
});
