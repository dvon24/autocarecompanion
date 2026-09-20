import './helpers/reservation-test-boundary';
import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { createReservationHandler } from '../src/lib/reservation-handler';
import { createReservationUnsubscribeHandler } from '../src/lib/reservation-unsubscribe-handler';
import { createTwinClaimPostHandler } from '../src/lib/twin-claim-post-handler';
import { loadTwinClaimPageOutcome } from '../src/lib/twin-claim-page-loader';
import { getTwinHubData } from '../src/lib/twin-hub-data';
import { isUSReservationCountry, reservationRequestKey, sameReservationFitment, selectedReservation, reservationOfferId } from '../src/lib/reservation-identity';
import { reservationOfferEligible } from '../src/lib/reservation-offer-summary';
import { twinReadyEmail } from '../src/lib/twin-ready-email';
import { readyInvitationOffer } from '../src/lib/twin-ready-invitation';

process.env.VERCEL = '1';
const now = new Date('2026-09-08T12:00:00Z');
const owner = {user:{id:'synthetic-owner',email:'owner@example.invalid'}};
const base = {
  id:'offer-manual',email:owner.user.email,vehicle:'2015 Dodge Challenger SRT 392',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',
  transmission:'manual' as string|null,vehicleVerified:true,trimVerified:true,country:'United States',
  twinStatus:'ready',assignedTwin:'dodge-challenger',trialDays:7,claimedAt:null as Date|null,readyAt:now,
  createdAt:now,updatedAt:now,source:'hero',path:'/original',note:null as string|null,
  unsubscribedAt:null as Date|null,unsubscribeToken:'a'.repeat(32),invitedAt:null as Date|null,
};
type Row = typeof base;
type Car = {id:string;userId:string;year:number;make:string;model:string;trim:string;transmission:string|null;currentMileage:number|null;updatedAt:Date;color:null};
function fixture(initial:Row[] = [], initialCars:Car[] = []) {
  const rows = structuredClone(initial), cars=structuredClone(initialCars);
  let sequence=0, locks=0, writes=0;
  let queue=Promise.resolve();
  const tx = {
    $queryRaw:async(strings:TemplateStringsArray,...values:unknown[]) => {
      if(strings.join('').includes('SELECT "id"'))return rows.filter(row=>row.email.trim().toLowerCase()===values[0]).map(row=>({id:row.id}));
      if(strings.join('').includes('pg_advisory'))locks++;return[{now}];
    },
    reservation:{
      findMany:async({where}:{where:{id?:{in:string[]}}})=>rows.filter(row=>!where.id||where.id.in.includes(row.id)),
      findUnique:async({where}:{where:{unsubscribeToken:string}})=>rows.find(row=>row.unsubscribeToken===where.unsubscribeToken)||null,
      create:async({data}:{data:Record<string,unknown>})=>{writes++;const row={...base,id:'capture-'+(++sequence),twinStatus:'reserved',...data} as Row;rows.push(row);return row;},
      updateMany:async({where,data}:{where:{id?:string|{in:string[]};unsubscribedAt?:null};data:Partial<Row>})=>{
        const matches=rows.filter(row=>typeof where.id==='string'?row.id===where.id:!!where.id?.in.includes(row.id)&&!row.unsubscribedAt);
        matches.forEach(row=>Object.assign(row,data));writes+=matches.length;return{count:matches.length};
      },
    },
    user:{findUnique:async()=>({emailVerified:now,subscriptionId:null})},
    vehicle:{
      findFirst:async({where}:{where:{id:string;userId:string}})=>cars.find(car=>car.id===where.id&&car.userId===where.userId)||null,
      findMany:async()=>cars,
      create:async({data}:{data:Record<string,unknown>})=>{writes++;const car={id:'car-'+(++sequence),color:null,updatedAt:now,...data} as Car;cars.push(car);return car;},
      update:async({where,data}:{where:{id:string};data:Record<string,unknown>})=>{const car=cars.find(car=>car.id===where.id)!;Object.assign(car,data);writes++;return car;},
      updateMany:async({where,data}:{where:{id:string};data:Record<string,unknown>})=>{const car=cars.find(car=>car.id===where.id);if(!car)return{count:0};Object.assign(car,data);writes++;return{count:1};},
    },
    maintenanceRecord:{findFirst:async()=>null},
  };
  // In-memory transaction queue exercises simultaneous handler calls; PostgreSQL
  // contention and expression constraints are checked by the rollback verifier.
  const database={...tx,modification:{findMany:async()=>[]},knownIssue:{findMany:async()=>[]},
    $transaction:async<T>(fn:(transaction:typeof tx)=>Promise<T>)=>{
      const pending=queue.then(()=>fn(tx));queue=pending.then(()=>{},()=>{});return pending;
    }};
  const prisma=database as unknown as Parameters<typeof createTwinClaimPostHandler>[0]['prisma'];
  return {rows,cars,prisma,get locks(){return locks;},get writes(){return writes;},
    capture:(body:Record<string,unknown>)=>createReservationHandler({prisma,auth:async()=>owner,rateLimit:()=>null})(new NextRequest('https://au7o.invalid/api/reservation',{method:'POST',headers:{'Content-Type':'application/json','x-vercel-ip-country':'US'},body:JSON.stringify({email:owner.user.email,country:'US',source:'hub-owner',vehicle:base.vehicle,...body})})),
    claim:(reservationId?:string,extra:Record<string,unknown>={})=>createTwinClaimPostHandler({prisma,auth:async()=>owner})(new Request('https://au7o.invalid/api/twin/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reservationId,...extra})})),
    load:(reservationId?:unknown)=>loadTwinClaimPageOutcome(owner,{prisma,reservationId}),
  };
}

test('exact keys normalize case/space, retain free/null branches and distinguish trim/gearbox',()=>{
  assert.equal(reservationRequestKey(base),reservationRequestKey({...base,make:' DODGE ',trim:'SRT   392'}));
  for(const change of [{trim:'R/T'},{transmission:'automatic'},{transmission:null},{year:2016},{vehicleVerified:false}])assert.notEqual(reservationRequestKey(base),reservationRequestKey({...base,...change}));
  assert.equal(reservationRequestKey({vehicle:null}),reservationRequestKey({vehicle:' '}));
  assert.equal(sameReservationFitment(base,{...base,transmission:'automatic'}),false);
  assert.equal(selectedReservation([base,{...base,id:'second'}]),null);
  assert.equal(reservationOfferId('../offer'),null);assert.equal(reservationOfferId('a'.repeat(101)),null);
});

test('recognized US countries are consistent; foreign, missing and misleading names stay closed',()=>{
  for(const country of ['US','us','USA','United States',' United  States of America ']){
    assert.equal(isUSReservationCountry(country),true);
    assert.equal(reservationOfferEligible({...base,country}),true);
    assert.equal(readyInvitationOffer({...base,country})?.trialDays,7);
  }
  for(const country of [null,'','Germany','DE','US,DE','United States Minor Outlying Islands']){
    assert.equal(isUSReservationCountry(country),false);
    assert.equal(reservationOfferEligible({...base,country}),false);
  }
  assert.equal(reservationOfferEligible({...base,trialDays:null}),false);
  assert.equal(reservationOfferEligible({...base,trimVerified:false}),false);
});

test('concurrent repeated capture deduplicates exact vehicles and preserves first metadata',async()=>{

  const original={...base,email:' OWNER@example.invalid ',unsubscribedAt:new Date('2026-08-01T00:00:00Z'),twinStatus:'claimed',claimedAt:new Date('2026-09-01T00:00:00Z')};
  const f=fixture([original]);
  const post={year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',source:'hero',path:'/first'};
  const responses=await Promise.all(Array.from({length:8},()=>f.capture(post)));
  assert(responses.every(row=>row.status===200));assert.equal(f.rows.length,2);
  assert.deepEqual(f.rows[0],original);assert.equal(f.rows[1].source,'hero');assert.equal(f.rows[1].path,'/first');
  assert.deepEqual(f.rows[1].unsubscribedAt,original.unsubscribedAt);assert.equal(f.locks,8);
  await f.capture({...post,source:'demo',path:'/later'});assert.equal(f.rows[1].source,'hero');assert.equal(f.rows[1].path,'/first');
});

test('public free text never downgrades structured rows or reveals an existing request',async()=>{
const f=fixture([base]);const original=structuredClone(base);
  const response=await f.capture({source:'hero',vehicle:base.vehicle});
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{success:true});assert.deepEqual(f.rows[0],original);
  await f.capture({source:'hero',vehicle:'  '+base.vehicle.toLowerCase()+'  '});assert.equal(f.rows.length,2);
  assert.equal((await f.capture({country:'Germany'})).status,403);
});

test('owner configuration notes are saved on new manual requests and identical retries preserve them',async()=>{
  const f=fixture();
  const note='Engine: 3.6L V6. Drivetrain: unknown. Wheel size: 18-inch aftermarket; factory size unknown. '.repeat(7);
  assert(note.length>120&&note.length<1000);
  const body={vehicle:'2020 Cadillac XT6 Premium Luxury',note};
  assert.equal((await f.capture(body)).status,200);
  assert.equal(f.rows.length,1);assert.equal(f.rows[0].note,note.trim());assert.equal(f.rows[0].vehicleVerified,false);
  const saved=structuredClone(f.rows[0]),writes=f.writes;
  assert.equal((await f.capture(body)).status,200);assert.equal(f.writes,writes);assert.deepEqual(f.rows[0],saved);
});

test('different owner configuration notes cannot silently overwrite or disappear behind the unique request key',async()=>{
  const f=fixture();
  const vehicle='2020 Cadillac XT6 Premium Luxury';
  assert.equal((await f.capture({vehicle,note:'Factory wheels unknown'})).status,200);
  const before=structuredClone(f.rows),writes=f.writes;
  const response=await f.capture({vehicle,note:'Confirmed 18-inch aftermarket wheels, engine unknown'});
  assert.equal(response.status,409);const payload=await response.json();
  assert.equal(payload.error,'configuration_details_conflict');assert.match(payload.message,/were not saved/);
  assert.equal(f.writes,writes);assert.deepEqual(f.rows,before);
  // A distinguishing actual configuration uses the existing free-text identity,
  // not a new schema/key or an edit to previously reviewed request metadata.
  assert.equal((await f.capture({vehicle:vehicle+' with 18-inch aftermarket wheels',note:'Engine unknown'})).status,200);
  assert.equal(f.rows.length,2);assert.deepEqual(f.rows[0],before[0]);
});

test('owner notes added to a prior empty-note free request fail explicitly while public metadata semantics remain unchanged',async()=>{
  const f=fixture();const vehicle='Actual custom vehicle';
  await f.capture({vehicle});const before=structuredClone(f.rows),writes=f.writes;
  assert.equal((await f.capture({vehicle,note:'Different installed equipment'})).status,409);
  assert.equal(f.writes,writes);assert.deepEqual(f.rows,before);
  assert.equal((await f.capture({vehicle,source:'hero',note:'Public resubmission'})).status,200);
  assert.equal(f.writes,writes);assert.deepEqual(f.rows,before);
});

test('unsubscribe is email-wide and concurrent capture inherits opt-out without changing other email',async()=>{

  const f=fixture([base,{...base,id:'auto',transmission:'automatic',unsubscribeToken:'b'.repeat(32)},{...base,id:'outsider',email:'other@example.invalid',unsubscribeToken:'c'.repeat(32)}]);
  const unsubscribe=createReservationUnsubscribeHandler(f.prisma);
  assert.equal((await unsubscribe(new Request('https://au7o.invalid/api/reservation/unsubscribe?token='+base.unsubscribeToken))).status,200);
  await Promise.all([f.capture({vehicle:'Another free-text vehicle'}),unsubscribe(new Request('https://au7o.invalid/api/reservation/unsubscribe?token='+base.unsubscribeToken))]);
  assert(f.rows.filter(row=>row.email===owner.user.email).every(row=>row.unsubscribedAt instanceof Date));
  assert.equal(f.rows.find(row=>row.id==='outsider')?.unsubscribedAt,null);
});

test('no-ID multiple offer chooser and POST reject ambiguity; foreign IDs never select another owner',async()=>{
  const f=fixture([base,{...base,id:'auto',transmission:'automatic',trialDays:30},{...base,id:'private',email:'other@example.invalid'}]);
  const outcome=await f.load();assert.equal(outcome.kind,'choose');
  if(outcome.kind==='choose')assert.deepEqual(outcome.reservations.map(row=>row.id),['offer-manual','auto']);
  assert.equal((await f.claim(undefined,{mileage:10000})).status,409);
  assert.equal((await f.claim('private',{mileage:10000})).status,404);assert.equal(f.writes,0);
  for(const id of ['private','../offer',['offer-manual']]){const result=await f.load(id);assert.equal(result.kind,'display');if(result.kind==='display')assert.equal(result.ready,false);}
  const selected=await f.load('auto');assert.equal(selected.kind,'display');
  if(selected.kind==='display'){assert.equal(selected.reservationId,'auto');assert.equal(selected.trialDays,30);assert.equal(selected.transmission,'automatic');assert.equal(selected.ready,true);}
});

test('two same-YMMT gearbox offers claim independent cars and 7/30-day clocks without rewriting history',async()=>{
  const f=fixture([base,{...base,id:'auto',transmission:'automatic',trialDays:30}]);
  const first=await f.claim('offer-manual',{mileage:12345,expectedUpdatedAt:now.toISOString(),expectedTrialDays:7});
  assert.equal(first.status,200);const firstCar=structuredClone(f.cars[0]);const firstClaim=structuredClone(f.rows[0]);
  assert.equal(f.rows[1].claimedAt,null);assert.equal(f.rows[1].twinStatus,'ready');
  const second=await f.claim('auto',{mileage:54321,expectedUpdatedAt:now.toISOString(),expectedTrialDays:30});
  assert.equal(second.status,200);assert.equal(f.cars.length,2);assert.deepEqual(f.cars[0],firstCar);assert.deepEqual(f.rows[0],firstClaim);
  assert.match((await first.json()).href,new RegExp('vehicleId='+firstCar.id));assert.match((await second.json()).href,new RegExp('vehicleId='+f.cars[1].id));
  const replay=await f.claim('offer-manual',{mileage:99999});assert.equal(replay.status,200);assert.deepEqual(f.cars[0],firstCar);assert.deepEqual(f.rows[0],firstClaim);
  for(const [index,days] of [[0,7],[1,30]]){
    const outcome=await getTwinHubData(owner.user.id,owner.user.email,f.cars[index].id,{prisma:f.prisma,getRecentThreads:async()=>[]});
    assert.equal(outcome.access.kind,'allowed');assert.equal(outcome.access.expiresAt?.getTime(),now.getTime()+days*86400000);assert.equal(outcome.data?.vehicleId,f.cars[index].id);
  }
});

test('legacy single offer works; stale, non-US, ambiguous and expired offers fail closed',async()=>{
  const f=fixture([base]);const selected=await f.load(base.id);assert.equal(selected.kind,'display');if(selected.kind==='display')assert.equal(selected.transmission,'manual');assert.equal((await f.claim(undefined,{mileage:12345})).status,200);
  assert.equal((await fixture([base]).claim(base.id,{expectedTrialDays:30,mileage:1000})).status,409);
  assert.equal((await fixture([{...base,country:'DE'}]).claim(base.id,{mileage:1000})).status,403);
  const car:Car={id:'car',userId:owner.user.id,year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'manual',currentMileage:12345,updatedAt:now,color:null};
  for(const rows of [[{...base,twinStatus:'claimed',claimedAt:new Date('2026-08-01T00:00:00Z')}],[{...base,twinStatus:'claimed',claimedAt:now},{...base,id:'duplicate',twinStatus:'claimed',claimedAt:now}]]){
    const h=fixture(rows,[car]);const result=await getTwinHubData(owner.user.id,owner.user.email,car.id,{prisma:h.prisma,getRecentThreads:async()=>[]});
    assert.equal(result.access.kind,'denied');assert.equal(result.data,null);
  }
});

test('invitation links retain bounded selected ID through signup and signin without granting rights',()=>{
  const mail=twinReadyEmail({vehicle:base.vehicle,artwork:'/twin-stage/challenger/base-granite-crystal.webp',trialDays:7,baseUrl:'https://au7o.invalid',unsubscribeToken:base.unsubscribeToken,reservationId:base.id});
  assert(mail.text.includes('intent=reservation&reservationId=offer-manual'));
  assert(mail.text.includes('callbackUrl=%2Ftwin%2Fclaim%3FreservationId%3Doffer-manual'));
  assert(!mail.text.includes('/api/twin/claim'));assert(mail.text.includes('No payment card is required'));
});

test('canonical structured underscores and hyphens preserve legacy match but free text stays separate',()=>{
  for(const trim of ['SRT_392','SRT-392',' SRT   392 ','\tSRT_392\n','\u00a0SRT-392\ufeff']){
    assert.equal(reservationRequestKey(base),reservationRequestKey({...base,trim}));
    assert.equal(sameReservationFitment(base,{...base,trim}),true);
  }
  assert.notEqual(reservationRequestKey({vehicle:'SRT_392'}),reservationRequestKey({vehicle:'SRT 392'}));
});
test('same-YMMT unresolved saved gearbox blocks claim before writes and explains confirmation',async()=>{
  for(const transmission of [null,'invalid']){
    const car:Car={id:'legacy-car',userId:owner.user.id,year:2015,make:'Dodge',model:'Challenger',trim:'SRT_392',transmission,currentMileage:12345,updatedAt:now,color:null};
    const f=fixture([base],[car]);const before=structuredClone(f.cars);
    const outcome=await f.load(base.id);
    assert.equal(outcome.kind,'display');
    if(outcome.kind==='display'){assert.equal(outcome.ready,false);assert.equal(outcome.reason,'existing-transmission-unconfirmed');assert.equal(outcome.needsMileage,undefined);}
    const response=await f.claim(base.id,{mileage:99999});
    assert.equal(response.status,409);assert.match((await response.json()).error,/confirm/i);
    assert.equal(f.writes,0);assert.deepEqual(f.cars,before);assert.deepEqual(f.rows,[base]);
  }
});
test('confirmed canonical legacy car and claimed replay preserve mileage, history and clock',async()=>{
  const car:Car={id:'legacy-car',userId:owner.user.id,year:2015,make:'Dodge',model:'Challenger',trim:'SRT-392',transmission:'manual',currentMileage:12345,updatedAt:now,color:null};
  const row={...base,twinStatus:'claimed',claimedAt:now};
  const f=fixture([row],[car]);const response=await f.claim(row.id,{mileage:99999});
  assert.equal(response.status,200);assert.equal(f.writes,0);assert.deepEqual(f.cars,[car]);assert.deepEqual(f.rows,[row]);
  const hub=await getTwinHubData(owner.user.id,owner.user.email,car.id,{prisma:f.prisma,getRecentThreads:async()=>[]});
  assert.equal(hub.access.kind,'allowed');assert.equal(hub.data?.vehicleId,car.id);
});
