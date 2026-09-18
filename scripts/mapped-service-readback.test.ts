import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDemoVehicleTwin } from '../src/lib/vehicle-twin-catalog';
import { getExactTwinMaintenanceCoverage } from '../src/lib/exact-twin-maintenance-rules';
import { persistMaintenanceEntry } from '../src/lib/maintenance-service-mutation';
import { ServiceReviewSchema } from '../src/lib/maintenance-service-review';
import { loadLatestTwinServiceRecords, serializeTwinServiceRecord, TWIN_SERVICE_RECORD_TYPES, twinServiceRecordTypesForBranch } from '../src/lib/twin-hub-data';
import { buildModelOwnerTrees } from '../src/components/twin/demo-trees';
import { applyOwnerMaintenanceIntervals } from '../src/lib/vehicle-maintenance-intervals';

const evaluated='2026-09-13T12:00:00Z';
const ids=['xt6','mdx','nautilus','aviator','kicks','murano'];
for(const id of ids)test(id+': mapped manual work survives actual write -> bounded load -> serialization -> tree',async()=>{
  const twin=resolveDemoVehicleTwin(id)!;
  const vehicle={...twin.identity,id:'synthetic-'+id,userId:'synthetic-owner',currentMileage:60000,transmission:null};
  const mapped=getExactTwinMaintenanceCoverage(vehicle).filter(r=>r.maintenanceType);
  for(const requirement of mapped){
    const type=requirement.maintenanceType!;
    assert((TWIN_SERVICE_RECORD_TYPES as readonly string[]).includes(type),type+' missing from server readback');
    const input={type,mileage:59000,date:'2026-09-01',description:'Completed '+type};
    assert(ServiceReviewSchema.safeParse({requestId:'faaf932b-3d8a-43ea-b25a-8bfac8878e57',vehicleId:vehicle.id,confirmed:true,timeZone:'UTC',date:input.date,mileage:input.mileage,jobs:[{type,description:input.description}]}).success);
    const store:any[]=[];
    await persistMaintenanceEntry({maintenanceRecord:{create:async({data}:any)=>{
      const row={id:'record-'+type,...data};store.push(row);return row;
    }}} as never,vehicle as never,input,new Date(evaluated));
    assert.equal(store.length,1);
    const valid=store[0];
    store.push(
      {...valid,id:'older',mileage:58000,date:new Date('2026-01-01')},
      {...valid,id:'negative',mileage:-1,date:new Date('2026-09-12')},
      {...valid,id:'above-current',mileage:60001,date:new Date('2026-09-12')},
      {...valid,id:'future',date:new Date('2027-01-01')},
      {...valid,id:'other-vehicle',vehicleId:'another-owner-car',date:new Date('2026-09-12')},
      {...valid,id:'unsupported',type:'arbitrary_service',date:new Date('2026-09-12')},
    );
    const queries:any[]=[];
    const rows=await loadLatestTwinServiceRecords(vehicle.id,60000,new Date(evaluated),async query=>{
      queries.push(query);
      assert.deepEqual(query.orderBy,[{date:'desc'},{mileage:'desc'},{id:'desc'}]);
      assert.equal(query.where.vehicleId,vehicle.id);assert.equal(query.where.mileage.gte,0);
      assert.equal(query.where.mileage.lte,60000);assert.equal(query.where.date.lte.getTime(),Date.parse(evaluated));
      const found=store.filter(r=>r.vehicleId===query.where.vehicleId&&r.type===query.where.type&&r.mileage>=query.where.mileage.gte&&r.mileage<=query.where.mileage.lte&&r.date<=query.where.date.lte)
        .sort((a,b)=>b.date.getTime()-a.date.getTime()||b.mileage-a.mileage||b.id.localeCompare(a.id))[0];
      return found ? Object.fromEntries(Object.keys(query.select).filter(key=>query.select[key as keyof typeof query.select]).map(key=>[key,found[key]])) as any : null;
    });
    assert.equal(queries.length,TWIN_SERVICE_RECORD_TYPES.length);
    assert.equal(rows.length,1);assert.equal(rows[0].type,type);assert.equal(rows[0].id,'record-'+type);
    const payload=JSON.parse(JSON.stringify(rows.map(serializeTwinServiceRecord)));
    const trees=buildModelOwnerTrees(twin,payload,60000 as never,null,evaluated as never);
    applyOwnerMaintenanceIntervals(trees,payload,vehicle,60000,evaluated);
    const node=trees.car.nodes['requirement_'+requirement.id];
    assert.equal(node.maintenanceType,type);assert.equal(node.unlogged,false);
    assert.equal(node.servicedAt,59000);assert.equal(node.serviceRecordId,'record-'+type);
    assert.equal(Date.parse(node.servicedDate),Date.parse('2026-09-01'));
    for(const other of mapped.filter(r=>r.maintenanceType!==type))assert.equal(trees.car.nodes['requirement_'+other.id].unlogged,true);
    assert.equal(trees.car.nodes.oil.unlogged,true);
  }
  assert.equal(twin.ownerReady,false);
});
test('fixed supported list remains unique and transmission branch scoped',()=>{
  assert.equal(new Set(TWIN_SERVICE_RECORD_TYPES).size,TWIN_SERVICE_RECORD_TYPES.length);
  const automatic=twinServiceRecordTypesForBranch('automatic'),manual=twinServiceRecordTypesForBranch('manual'),unknown=twinServiceRecordTypesForBranch(null);
  assert(automatic.includes('transmission_fluid_auto'));assert(!automatic.includes('transmission_fluid_manual'));
  assert(manual.includes('transmission_fluid_manual'));assert(!manual.includes('transmission_fluid_auto'));
  assert(!unknown.includes('transmission_fluid_manual'));assert(!unknown.includes('transmission_fluid_auto'));
  assert(!(TWIN_SERVICE_RECORD_TYPES as readonly string[]).includes('arbitrary_service'));
});
