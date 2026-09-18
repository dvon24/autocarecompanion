import './helpers/reservation-test-boundary';
import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { createAdminReservationPostHandler } from '../src/lib/admin-reservation-post-handler';
import { createLockedReservationSender } from '../src/lib/reservation-invitation-dispatch';
import { createEmailSender } from '../src/lib/email';
import { createReservationHandler } from '../src/lib/reservation-handler';
import { loadTwinClaimPageOutcome } from '../src/lib/twin-claim-page-loader';
import { createTwinClaimPostHandler } from '../src/lib/twin-claim-post-handler';
import { reservationCountry, reservationCountryCounts, isOpenReservation } from '../src/lib/reservation-queue';

const revision = new Date('2026-09-16T10:00:00.000Z');
process.env.VERCEL='1';
function fixture(providerResult?: Promise<{data:{id:string};error:null}>) {
  const row = { id:'request', email:'synthetic@example.invalid', vehicle:'Synthetic car', year:null, make:null, model:null, trim:null, transmission:null, vehicleVerified:false, trimVerified:false, country:'US', twinStatus:'reserved', assignedTwin:'unreviewed-old-assignment', trialDays:30, readyAt:revision, invitedAt:revision, claimedAt:null as Date|null, unsubscribedAt:null, note:'Customer original note', updatedAt:revision };
  let writes=0, locked=false, providerCalls=0, queue=Promise.resolve();
  let markInvoked!:()=>void;
  const invoked=new Promise<void>(resolve=>{markInvoked=resolve;});
  const sibling={...row,id:'sibling',twinStatus:'ready'};
  const tx={
    $queryRaw:async(strings:TemplateStringsArray)=>strings.join('').includes('CURRENT_TIMESTAMP')?[{now:revision}]:strings.join('').includes('SELECT "id"')?[{id:row.id},{id:sibling.id}]:[],
    reservation:{
      findUnique:async({where}:{where:{id:string}})=>where.id===row.id?row:where.id===sibling.id?sibling:null,
      findMany:async()=>[row],findFirst:async()=>null,
      updateMany:async({where,data}:{where:{updatedAt:Date;twinStatus:string};data:Partial<typeof row>})=>{assert(locked);if(where.updatedAt.getTime()!==row.updatedAt.getTime()||where.twinStatus!==row.twinStatus)return{count:0};writes++;Object.assign(row,data);return{count:1};},
      create:async()=>{throw new Error('No reservation create permitted');},
    }, emailSuppression:{findUnique:async()=>null},
    vehicle:{findMany:async()=>{throw new Error('Canceled claim must not read/write garage');}},
  };
  const db={...tx,$transaction:async<T>(callback:(connection:typeof tx)=>Promise<T>)=>{const result=queue.then(async()=>{locked=true;try{return await callback(tx);}finally{locked=false;}});queue=result.then(()=>{},()=>{});return result;}};
  const handler=createAdminReservationPostHandler({requireFounder:async()=>null,prisma:db as never,now:()=>revision});
  const request=(body:Record<string,unknown>,origin='https://preview.invalid')=>new Request('https://preview.invalid/api/admin/reservations',{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify({id:row.id,expectedUpdatedAt:revision.toISOString(),...body})});
  const send=createEmailSender({client:()=>({emails:{send:async()=>{assert(locked);providerCalls++;markInvoked();return providerResult??{data:{id:'synthetic-provider'},error:null};}}} as never),isSuppressed:async()=>false,recipientAllowed:()=>true});
  const lockedSend=createLockedReservationSender({prisma:db as never,send,requireReservation:true});
  const mail=(id='request')=>({reservationId:id,to:row.email,subject:'Synthetic',html:'<p>test</p>',idempotencyKey:id});
  return {row,sibling,db,handler,request,lockedSend,mail,invoked,get writes(){return writes;},get calls(){return providerCalls;}};
}
test('confirmed cancellation retains all history and is terminal/idempotent',async()=>{
  const f=fixture(),before={...f.row};
  assert.equal((await f.handler(f.request({action:'cancel',confirm:true}))).status,200);
  assert.equal(f.row.twinStatus,'canceled');assert.equal(f.writes,1);
  assert.deepEqual({...f.row,twinStatus:before.twinStatus,updatedAt:before.updatedAt},before);
  assert.equal(f.row.updatedAt.getTime(),revision.getTime()+1);
  assert.equal((await f.handler(f.request({action:'cancel',confirm:true}))).status,200);assert.equal(f.writes,1);
  assert.equal((await f.handler(f.request({status:'ready'}))).status,409);assert.equal(f.writes,1);
});
test('confirmation, origin, stale revision and claimed guards perform no writes',async()=>{
  for(const body of [{action:'cancel'},{action:'cancel',confirm:true,status:'ready'},{status:'canceled'}]){const f=fixture();assert.equal((await f.handler(f.request(body))).status,400);assert.equal(f.writes,0);}
  const origin=fixture();assert.equal((await origin.handler(origin.request({action:'cancel',confirm:true},'https://evil.invalid'))).status,403);
  for(const change of [{updatedAt:new Date(revision.getTime()+5)},{twinStatus:'claimed'},{claimedAt:revision}]){const f=fixture();Object.assign(f.row,change);assert.equal((await f.handler(f.request({action:'cancel',confirm:true}))).status,409);assert.equal(f.writes,0);}
});
test('founder refusal prevents reads or changes',async()=>{
  const handler=createAdminReservationPostHandler({requireFounder:async()=>new Response(null,{status:403}),prisma:{} as never});
  assert.equal((await handler(fixture().request({action:'cancel',confirm:true}))).status,403);
});
test('cancel before final send gate blocks exact target but leaves sibling eligible',async()=>{
  const f=fixture();f.row.twinStatus='ready';
  await f.handler(f.request({action:'cancel',confirm:true}));
  assert.equal((await f.lockedSend(f.mail())).ok,false);assert.equal(f.calls,0);
  assert.equal((await f.lockedSend(f.mail('sibling'))).ok,true);assert.equal(f.calls,1);
  assert.equal((await f.lockedSend({...f.mail(),reservationId:undefined})).ok,false);
});
test('provider invoked before cancellation cannot be recalled but status remains canceled',async()=>{
  let resolveProvider!:(value:{data:{id:string};error:null})=>void;
  const outcome=new Promise<{data:{id:string};error:null}>(resolve=>{resolveProvider=resolve;});
  const f=fixture(outcome);f.row.twinStatus='ready';
  const pending=f.lockedSend(f.mail());await f.invoked;assert.equal(f.calls,1);
  await f.handler(f.request({action:'cancel',confirm:true}));
  resolveProvider({data:{id:'synthetic-provider'},error:null});assert.equal((await pending).ok,true);
  assert.equal(f.row.twinStatus,'canceled');assert.equal((await f.lockedSend(f.mail())).ok,false);assert.equal(f.calls,1);
});
test('canceled claim page and POST reject before garage or trial changes',async()=>{
  const f=fixture();f.row.twinStatus='canceled';
  const auth=async()=>({user:{id:'synthetic-owner',email:f.row.email}});
  const page=await loadTwinClaimPageOutcome(await auth(),{prisma:f.db as never,reservationId:f.row.id});
  assert.equal(page.kind,'display');assert.equal('reason' in page&&page.reason,'reservation-canceled');
  const post=createTwinClaimPostHandler({auth,prisma:f.db as never});
  const result=await post(new Request('https://preview.invalid/api/twin/claim',{method:'POST',body:JSON.stringify({reservationId:f.row.id,mileage:10000})}));
  assert.equal(result.status,409);assert.match((await result.json()).error,/canceled/);assert.equal(f.writes,0);
});
test('recapture of canceled exact request is not reported as new successful reservation',async()=>{
  const f=fixture();f.row.twinStatus='canceled';
  const post=createReservationHandler({prisma:f.db as never,rateLimit:()=>null});
  const result=await post(new NextRequest('https://preview.invalid/api/reservation',{method:'POST',headers:{'x-vercel-ip-country':'US','content-type':'application/json'},body:JSON.stringify({email:f.row.email,vehicle:f.row.vehicle,country:'US',source:'hero'})}));
  assert.equal(result.status,409);assert.equal((await result.json()).error,'reservation_canceled');assert.equal(f.writes,0);
});
test('country counts normalize aliases and retain Unknown, Other and canceled history',()=>{
  const rows=[{country:'US'},{country:' usa '},{country:'United States'},{country:'United States of America'},{country:null},{country:'  '},{country:'Other'},{country:'germany'}];
  assert.deepEqual(reservationCountryCounts(rows),[['Germany',1],['Other',1],['United States',4],['Unknown',2]]);
  assert.equal(rows.filter(row=>reservationCountry(row.country)==='United States').length,4);
  assert.equal(isOpenReservation({twinStatus:'canceled'}),false);assert.equal(isOpenReservation({twinStatus:'claimed'}),false);assert.equal(isOpenReservation({twinStatus:'reserved'}),true);
});
