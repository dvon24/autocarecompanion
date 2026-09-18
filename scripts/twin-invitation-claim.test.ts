import test from 'node:test';
import assert from 'node:assert/strict';
import { createTwinClaimPostHandler } from '../src/lib/twin-claim-post-handler';
import { loadTwinClaimPageOutcome } from '../src/lib/twin-claim-page-loader';

const now=new Date('2026-09-07T12:00:00Z');
const initial={id:'r',email:'owner@example.invalid',vehicle:'2015 Dodge Challenger SRT 392',country:'US',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',vehicleVerified:true,trimVerified:true,assignedTwin:'dodge-challenger',transmission:'manual',trialDays:30,twinStatus:'ready',claimedAt:null as Date|null,updatedAt:new Date('2026-09-01T12:00:00Z')};
type Car={id:string;year:number;make:string;model:string;trim:string;transmission:string|null;currentMileage:number|null;updatedAt:Date};
function harness(change:Partial<typeof initial>={},cars:Car[]=[],conflict=false){
  let reservation={...initial,...change};let garage=[...cars];let created=0;
  const tx={
    $queryRaw:async()=>[{now}],
    reservation:{findMany:async()=>[reservation],updateMany:async({data}:{data:Record<string,unknown>})=>{if(conflict)return {count:0};reservation={...reservation,...data};return {count:1};}},
    vehicle:{findMany:async()=>garage,create:async({data}:{data:Record<string,unknown>})=>{created++;const car={id:'created',...data,updatedAt:now} as Car;garage.push(car);return car;},update:async({where,data}:{where:{id:string};data:Record<string,unknown>})=>{const idx=garage.findIndex(car=>car.id===where.id);garage[idx]={...garage[idx],...data};return garage[idx];},updateMany:async()=>({count:1})},
  };
  const db={...tx,$transaction:async<T>(fn:(arg:typeof tx)=>Promise<T>)=>{const originalReservation={...reservation},originalGarage=[...garage];try{return await fn(tx);}catch(error){reservation=originalReservation;garage=originalGarage;throw error;}}} as unknown as Parameters<typeof createTwinClaimPostHandler>[0]['prisma'];
  const auth=async()=>({user:{id:'owner',email:initial.email}});
  const post=createTwinClaimPostHandler({auth,prisma:db});
  return {load:()=>loadTwinClaimPageOutcome({user:{id:'owner',email:initial.email}},{prisma:db}),post:(body:Record<string,unknown>={})=>post(new Request('https://au7o.io/api/twin/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedUpdatedAt:initial.updatedAt.toISOString(),expectedTrialDays:reservation.trialDays,...body})})),state:()=>({reservation,garage,created})};
}
test('new invitee sees setup instead of old garage dead end',async()=>{
  const outcome=await harness().load();assert.equal(outcome.kind,'display');if(outcome.kind==='display'){assert.equal(outcome.ready,true);assert.equal(outcome.needsMileage,true);assert.equal(outcome.updatedAt,initial.updatedAt.toISOString());}
});
test('7/30-day claims create exact owner car with actual mileage, never demo records or billing',async()=>{
  for(const trialDays of [7,30]){const h=harness({trialDays});const response=await h.post({mileage:155000});assert.equal(response.status,200);const state=h.state();assert.equal(state.reservation.twinStatus,'claimed');assert.equal(state.reservation.claimedAt?.toISOString(),now.toISOString());assert.equal(state.garage[0].currentMileage,155000);assert.equal(state.garage[0].transmission,'manual');assert.equal(state.garage[0].trim,'SRT 392');assert(!('maintenanceRecords' in state.garage[0]));assert(!('subscriptionStatus' in state.reservation));}
});
test('stale vehicle offer or duration never activates another offer',async()=>{
  for(const body of [{expectedUpdatedAt:'2026-08-01T00:00:00.000Z',mileage:20000},{expectedTrialDays:7,mileage:20000}]){const h=harness();assert.equal((await h.post(body)).status,409);assert.equal(h.state().created,0);}
});
test('non-US and mismatched transmissions cannot create a trial vehicle',async()=>{
  for(const change of [{country:'DE'},{country:'US',transmission:'cvt'},{country:'US',transmission:null}]){const h=harness(change as Partial<typeof initial>);assert((await h.post({mileage:1000})).status>=400);assert.equal(h.state().created,0);}
});
test('missing, zero, fractional and invalid odometers do not start a clock',async()=>{
  for(const mileage of [undefined,0,-1,1.5,2000001]){const h=harness();assert((await h.post({...(mileage==null?{}:{mileage})})).status>=400);assert.equal(h.state().created,0);assert.equal(h.state().reservation.claimedAt,null);}
});
test('claim conflict rolls back setup writes',async()=>{
  const h=harness({},[],true);assert.equal((await h.post({mileage:2000})).status,409);assert.deepEqual(h.state().garage,[]);assert.equal(h.state().reservation.claimedAt,null);
});
test('replayed claim does not duplicate a car or reset the trial',async()=>{
  const h=harness();assert.equal((await h.post({mileage:2000})).status,200);const state=h.state();const response=await h.post({expectedUpdatedAt:state.reservation.updatedAt.toISOString(),mileage:3000});assert.equal(response.status,200);assert.equal(h.state().created,1);assert.equal(h.state().garage[0].currentMileage,2000);assert.equal(h.state().reservation.claimedAt?.getTime(),now.getTime());
});
