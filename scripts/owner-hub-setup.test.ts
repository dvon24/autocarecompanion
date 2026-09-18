import test from 'node:test';
import assert from 'node:assert/strict';
import { createOwnerHubSetupHandler } from '../src/lib/owner-hub-setup-handler';
import { ownerHubSetupChanges,pendingOwnerHubSetup } from '../src/lib/owner-hub-setup';
import { getTwinHubData } from '../src/lib/twin-hub-data';
const now=new Date('2026-09-16T16:00:00.000Z'),revision=new Date('2026-09-16T15:00:00.000Z');
const initial={id:'second',userId:'owner',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',currentMileage:null as number|null,transmission:null as string|null,reviewedEquipmentId:null as string|null,updatedAt:revision,color:'B5 Blue',isPrimary:false};
function fixture(change:Record<string,unknown>={}){
  let vehicle={...initial,...change},logs:any[]=[],writes=0,locks=0,reads=0,session:any={user:{id:'owner'}},user:any={id:'owner',email:'owner@example.invalid',emailVerified:now,subscriptionId:'sub_test',subscriptionStatus:'active',subscriptionTier:'hub'},conflict=false,logFailure=false;
  const tx:any={
    $queryRaw:async()=>{locks++;return[{now}]},user:{findUnique:async()=>user},reservation:{findMany:async()=>[]},
    vehicle:{findFirst:async({where}:any)=>where.id===vehicle.id&&where.userId===vehicle.userId?{...vehicle}:null,updateMany:async({where,data}:any)=>{
      if(conflict||where.updatedAt.getTime()!==vehicle.updatedAt.getTime())return{count:0};assert.equal(where.id,vehicle.id);assert.equal(where.userId,'owner');assert.equal(where.currentMileage,vehicle.currentMileage);writes++;vehicle={...vehicle,...data};return{count:1};}},
    mileageLog:{create:async({data}:any)=>{if(logFailure)throw Error('fixture log failure');logs.push(data);return data}},
    maintenanceRecord:{findFirst:async()=>{reads++;return null}},modification:{findMany:async()=>[]},knownIssue:{findMany:async()=>[]},
  };
  const db:any={...tx,$transaction:async(run:any)=>{const before=structuredClone({vehicle,logs,writes});try{return await run(tx)}catch(error){({vehicle,logs,writes}=before);throw error}}};
  const handler=createOwnerHubSetupHandler({auth:async()=>session,prisma:db,now:()=>now});
  const origin=new URL(process.env.APP_URL||process.env.NEXTAUTH_URL||'https://fixture.invalid').origin;
  return {db,post:(body:Record<string,unknown>={},id='second',requestOrigin=origin)=>handler(new Request('http://localhost:3028/api/vehicles/second/hub-setup',{method:'POST',headers:{origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify({expectedUpdatedAt:revision.toISOString(),currentMileage:12345,transmission:'manual',...body})}),{params:Promise.resolve({id})}),state:()=>({vehicle,logs,writes,locks,reads}),setSession:(value:any)=>session=value,setUser:(value:any)=>user=value,setConflict:()=>conflict=true,setLogFailure:()=>logFailure=true};
}
test('setup requires configured canonical origin and rejects spoofed or absent origins',async()=>{
  const previous=process.env.APP_URL;process.env.APP_URL='https://preview.trycloudflare.com';
  try{const f=fixture();assert.equal((await f.post({},'second','https://evil.invalid')).status,403);assert.equal((await f.post({},'second','')).status,403);assert.equal(f.state().writes,0);assert.equal((await f.post()).status,200);}finally{if(previous===undefined)delete process.env.APP_URL;else process.env.APP_URL=previous;}
});
test('paid exact owner completes missing Challenger fields atomically without changing confirmed state',async()=>{
  const previous=process.env.APP_URL;process.env.APP_URL='https://fixture.invalid';
  try{const f=fixture(),response=await f.post();assert.equal(response.status,200);const result=await response.json();assert.equal(result.href,'/vehicle/2015-dodge-challenger-srt-392?vehicleId=second');assert.equal(result.vehicle.currentMileage,12345);assert.equal(result.vehicle.transmission,'manual');assert.equal(f.state().vehicle.color,'B5 Blue');assert.equal(f.state().vehicle.isPrimary,false);assert.equal(f.state().writes,1);assert.equal(f.state().reads,0);assert.deepEqual(f.state().logs,[{vehicleId:'second',mileage:12345,source:'manual'}]);
    assert.equal((await f.post()).status,409);assert.equal(f.state().logs.length,1);
    assert.equal((await f.post({expectedUpdatedAt:f.state().vehicle.updatedAt.toISOString()})).status,200);assert.equal(f.state().logs.length,1);
  }finally{if(previous===undefined)delete process.env.APP_URL;else process.env.APP_URL=previous;}
});
test('missing fields, forbidden edits, stale revisions, and unowned or unpaid requests perform no writes',async()=>{
  const previous=process.env.APP_URL;process.env.APP_URL='https://fixture.invalid';
  try{
    for(const body of [{currentMileage:null},{currentMileage:0},{currentMileage:-1},{currentMileage:1.5},{currentMileage:2147483648},{transmission:null},{transmission:'CVT'},{transmission:undefined},{reviewedEquipmentId:'wrong'},{color:'Red'},{expectedUpdatedAt:'2026-09-15T00:00:00.000Z'}]){const f=fixture();assert((await f.post(body)).status>=400,JSON.stringify(body));assert.equal(f.state().writes,0);assert.equal(f.state().logs.length,0);}
    for(const mode of ['anonymous','foreign','unpaid','unsupported','cas','log-failure']){
      const f=fixture(mode==='unsupported'?{model:'Viper',trim:'ACR'}:{});if(mode==='anonymous')f.setSession(null);if(mode==='unpaid')f.setUser(null);if(mode==='cas')f.setConflict();if(mode==='log-failure')f.setLogFailure();
      assert((await f.post({},mode==='foreign'?'foreign':'second')).status>=400,mode);assert.equal(f.state().writes,0,mode);assert.equal(f.state().logs.length,0,mode);
    }
    const complete=fixture({currentMileage:22222,transmission:'automatic'});assert.equal((await complete.post()).status,400);assert.equal(complete.state().writes,0);
  }finally{if(previous===undefined)delete process.env.APP_URL;else process.env.APP_URL=previous;}
});
test('sole branch is derived and only missing equipment/mileage can be confirmed',()=>{
  const vehicle={id:'xt6',year:2020,make:'Cadillac',model:'XT6',trim:'Sport',currentMileage:10000,transmission:null,reviewedEquipmentId:null,updatedAt:revision};
  const setup=pendingOwnerHubSetup(vehicle)!;assert(setup);assert.equal(setup.needsMileage,false);assert.deepEqual(setup.transmissionOptions,[]);assert.equal(setup.equipment?.id,'xt6-2020-36l-awd-20-v1');
  assert.deepEqual(ownerHubSetupChanges(vehicle,{reviewedEquipmentId:setup.equipment!.id}),{reviewedEquipmentId:setup.equipment!.id});
  assert.throws(()=>ownerHubSetupChanges(vehicle,{reviewedEquipmentId:setup.equipment!.id,transmission:'manual'}),/transmission/);
});
test('actual Hub data returns setup rather than owner records for paid incomplete exact car; unpaid never gets setup',async()=>{
  const f=fixture();const result=await getTwinHubData('owner','owner@example.invalid','second',{prisma:f.db,getRecentThreads:async()=>[]});
  assert.equal(result.data,null);assert('ownerSetup'in result);assert.equal(result.ownerSetup?.vehicleId,'second');assert.equal(result.ownerSetup?.needsMileage,true);assert.deepEqual(result.ownerSetup?.transmissionOptions,['automatic','manual']);assert.equal(f.state().reads,0);assert.equal(f.state().writes,0);
  f.setUser(null);const denied=await getTwinHubData('owner','owner@example.invalid','second',{prisma:f.db,getRecentThreads:async()=>[]});assert.equal(denied.data,null);assert(!('ownerSetup'in denied));assert.equal(f.state().writes,0);
});
