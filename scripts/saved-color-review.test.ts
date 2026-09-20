import assert from 'node:assert/strict';
import test from 'node:test';
import { createVehiclePatchHandler } from '../src/lib/vehicle-patch-handler';
import { REVIEWED_OWNER_EQUIPMENT } from '../src/lib/twin-owner-equipment';
import { getTwinByFulfillmentId, getTwinPaintOptions } from '../src/lib/vehicle-twin-catalog';

const start=new Date('2026-09-14T10:00:00.000Z');
const profiles=REVIEWED_OWNER_EQUIPMENT.filter(p=>['nautilus','murano','xt6','kicks','mdx','aviator'].includes(p.catalogId));
function fixture(profile=profiles[0],userId:string|null='owner') {
  const colors=getTwinPaintOptions(getTwinByFulfillmentId(profile.fulfillmentId)!,profile.trim);
  const initial={id:profile.catalogId,userId:'owner',year:profile.year,make:profile.make,model:profile.model,trim:profile.trim,transmission:null as string|null,reviewedEquipmentId:profile.id,color:colors[0].name,updatedAt:start,isPrimary:true,currentMileage:64000};
  let state={...initial},writes=0,transactions=0;let race:(()=>void)|undefined;let transactionError:unknown;
  const db={vehicle:{findFirst:async({where}:{where:{id:string;userId:string}})=>{const found=where.id===state.id&&where.userId===state.userId?{...state}:null;race?.();return found;},update:async()=>{throw Error('Color must not use an unguarded update');}},$transaction:async(callback:(tx:unknown)=>Promise<unknown>,options:unknown)=>{
    assert.deepEqual(options,{isolationLevel:'Serializable'});transactions++;
    if(transactionError)throw transactionError;
    return callback({vehicle:{updateMany:async({where,data}:{where:Record<string,unknown>;data:Record<string,unknown>})=>{
      assert.deepEqual(Object.keys(data).sort(),['color','updatedAt']);
      const matches=Object.entries(where).every(([key,value])=>value instanceof Date?(state as Record<string,unknown>)[key] instanceof Date&&((state as Record<string,unknown>)[key] as Date).getTime()===value.getTime():(state as Record<string,unknown>)[key]===value);
      if(!matches)return {count:0};writes++;state={...state,...data};return {count:1};
    },findUnique:async()=>({...state})}});
  }};
  const handler=createVehiclePatchHandler({auth:async()=>userId?{user:{id:userId}}:null,prisma:db as never,now:()=>start});
  return {colors,initial,get state(){return state;},get writes(){return writes;},get transactions(){return transactions;},fail(error:unknown){transactionError=error;},race(fn:()=>void){race=fn;},change(patch:Partial<typeof state>){state={...state,...patch};},patch:(body:unknown)=>handler(new Request('https://paint.invalid/api/vehicles/'+initial.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),{params:Promise.resolve({id:initial.id})})};
}
for(const profile of profiles)test(`${profile.catalogId}: actual handler acknowledges exact color/revision and preserves all other fields`,async()=>{
  const f=fixture(profile),color=f.colors[1].name;
  const response=await f.patch({color,expectedUpdatedAt:start.toISOString()});assert.equal(response.status,200);
  const payload=await response.json();assert.equal(payload.vehicle.id,f.initial.id);assert.equal(payload.vehicle.color,color);assert.equal(payload.vehicle.updatedAt,new Date(start.getTime()+1).toISOString());assert.deepEqual(payload.paintSave,{expectedUpdatedAt:start.toISOString()});
  assert.deepEqual(f.state,{...f.initial,color,updatedAt:new Date(start.getTime()+1)});assert.equal(f.writes,1);
  assert.equal((await f.patch({color:f.colors[2].name,expectedUpdatedAt:start.toISOString()})).status,409);assert.equal(f.writes,1);
  assert.equal((await f.patch({color:f.colors[2].name,expectedUpdatedAt:f.state.updatedAt.toISOString()})).status,200);assert.equal(f.state.color,f.colors[2].name);assert.equal(f.writes,2);
});
test('all six reviewed exact profiles were exercised',()=>assert.equal(profiles.length,6));
for(const [name,body,status] of [
  ['missing revision',{color:'Black'},400],
  ['malformed revision',{color:'Black',expectedUpdatedAt:'no'},400],
  ['foreign palette',{color:'Not a reviewed paint',expectedUpdatedAt:start.toISOString()},400],
] as const)test(name,async()=>{const f=fixture();const r=await f.patch(body);assert.equal(r.status,status);assert.equal(f.writes,0);});
test('allowed color still requires a current revision',async()=>{const f=fixture();assert.equal((await f.patch({color:f.colors[1].name})).status,409);assert.equal(f.transactions,0);});
test('color cannot smuggle a concurrent identity or equipment edit',async()=>{const f=fixture();for(const extra of [{trim:'Other'},{reviewedEquipmentId:null},{transmission:'manual'},{nickname:'Other'}])assert.equal((await f.patch({color:f.colors[1].name,expectedUpdatedAt:start.toISOString(),...extra})).status,400);assert.equal(f.writes,0);});
for(const user of [null,'another-owner'])test(`auth/ownership ${user}`,async()=>{const f=fixture(profiles[0],user);assert.equal((await f.patch({color:f.colors[1].name,expectedUpdatedAt:start.toISOString()})).status,user?404:401);assert.equal(f.writes,0);});
for(const field of ['updatedAt','year','make','model','trim','transmission','reviewedEquipmentId','color','userId'] as const)test(`read→write ${field} race loses CAS without overwriting`,async()=>{
  const f=fixture();f.race(()=>f.change({[field]:field==='updatedAt'?new Date(start.getTime()+1):field==='year'?2000:'concurrent value'}));
  assert.equal((await f.patch({color:f.colors[1].name,expectedUpdatedAt:start.toISOString()})).status,409);assert.equal(f.writes,0);assert.notEqual(f.state.color,f.colors[1].name);
});
test('Kicks SV cannot save SR-only two-tone paint',async()=>{const f=fixture(profiles.find(p=>p.catalogId==='kicks')!);assert.equal((await f.patch({color:'Two-tone Yuzu Yellow Metallic/Super Black',expectedUpdatedAt:start.toISOString()})).status,400);assert.equal(f.writes,0);});
test('simultaneous saves using one revision acknowledge exactly one writer',async()=>{
  const f=fixture();const responses=await Promise.all([1,2].map(index=>f.patch({color:f.colors[index].name,expectedUpdatedAt:start.toISOString()})));
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal(f.writes,1);
});
test('serialization conflict returns a retryable conflict without writes',async()=>{
  const f=fixture();f.fail({code:'P2034'});assert.equal((await f.patch({color:f.colors[1].name,expectedUpdatedAt:start.toISOString()})).status,409);assert.equal(f.writes,0);
});
test('unexpected storage error cannot acknowledge paint and allows a later retry',async()=>{
  const f=fixture();f.fail(new Error('Injected storage failure'));const old=console.error;console.error=()=>{};
  try{const response=await f.patch({color:f.colors[1].name,expectedUpdatedAt:start.toISOString()});assert.equal(response.status,500);assert.equal((await response.json()).paintSave,undefined);assert.equal(f.writes,0)}finally{console.error=old}
  f.fail(null);assert.equal((await f.patch({color:f.colors[1].name,expectedUpdatedAt:start.toISOString()})).status,200);assert.equal(f.writes,1);
});
