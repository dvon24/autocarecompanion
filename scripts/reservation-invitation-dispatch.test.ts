import './helpers/reservation-test-boundary';
import assert from 'node:assert/strict';
import test from 'node:test';
import {createEmailSender,passwordResetEmail} from '../src/lib/email';
import {NextRequest} from 'next/server';
import {createReservationHandler} from '../src/lib/reservation-handler';
import {createReservationUnsubscribeHandler} from '../src/lib/reservation-unsubscribe-handler';
import {createTwinReadyInvitationHandler} from '../src/lib/twin-ready-invitation';
import {createLockedReservationSender} from '../src/lib/reservation-invitation-dispatch';

function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
const mail={to:'synthetic@example.invalid',subject:'Synthetic only',html:'<p>test</p>',idempotencyKey:'offer-test'};
function fixture(){
  let current=0,providerCalls=0,guardProbes=0,optedOut=false,suppressed=false;
  let globalCheck:()=>Promise<boolean>=async()=>false;
  let transactionCheck:()=>Promise<boolean>=async()=>false;let rootCalls=0;
  let probe:()=>Promise<unknown>=async()=>[{live:1}];
  let transactionPromise:Promise<unknown>|undefined;let sendContinuation:ReturnType<typeof send>|undefined;
  const expired=deferred<never>(),started=deferred<void>();
  const tx={$queryRaw:async(strings:TemplateStringsArray)=>{
    if(strings.join('').includes('SELECT "id"'))return[{id:'offer'}];
    if(strings.join('').includes('invitation_transaction_live')){guardProbes++;return probe();}
    return[];
  },reservation:{findFirst:async()=>optedOut?{id:'offer'}:null},emailSuppression:{findUnique:async()=>{started.resolve();return (await transactionCheck())||suppressed?{id:'suppression'}:null;}}};
  const send=createEmailSender({client:()=>({emails:{send:async(payload:unknown,options:unknown)=>{providerCalls++;assert.deepEqual(options,{idempotencyKey:mail.idempotencyKey});return{data:{id:'synthetic-provider'},error:null};}}} as never),isSuppressed:()=>{rootCalls++;return globalCheck();},recipientAllowed:()=>true});
  const prisma={$transaction:async(fn:(tx:unknown)=>Promise<unknown>)=>{
    transactionPromise=fn(tx);return Promise.race([transactionPromise,expired.promise]);
  }} as never;
  return {send,locked:createLockedReservationSender({prisma,send:args=>{sendContinuation=send(args);return sendContinuation;},clock:()=>current}),started,
    expire(){expired.resolve(Promise.reject(new Error('Transaction expired')) as never);},
    setGlobal(check:()=>Promise<boolean>){globalCheck=check;},setTransactionSuppression(check:()=>Promise<boolean>){transactionCheck=check;},setProbe(check:()=>Promise<unknown>){probe=check;},
    setTime(value:number){current=value;},optOut(){optedOut=true;},suppress(){suppressed=true;},
    get rootCalls(){return rootCalls;},get calls(){return providerCalls;},get probes(){return guardProbes;},get continuation(){return sendContinuation;}};
}
test('delayed transaction suppression resumes after transaction release without provider invocation',async()=>{
  const f=fixture(),suppression=deferred<boolean>();f.setTransactionSuppression(()=>suppression.promise);
  const pending=f.locked(mail);await f.started.promise;f.expire();await assert.rejects(pending,/Transaction expired/);
  suppression.resolve(false);const result=await f.continuation as {ok:boolean};assert.equal(result.ok,false);assert.equal(f.calls,0);assert.equal(f.probes,0);assert.equal(f.rootCalls,0);
});
test('deadline lapsing at final live transaction await blocks immediate provider invocation',async()=>{
  const f=fixture();f.setProbe(async()=>{f.setTime(19000);return[{live:1}];});
  assert.equal((await f.locked(mail)).ok,false);assert.equal(f.probes,1);assert.equal(f.calls,0);
});
test('final transaction rejection after delayed transaction suppression blocks dispatch',async()=>{
  const f=fixture();f.setProbe(async()=>{throw new Error('Closed transaction');});
  assert.equal((await f.locked(mail)).ok,false);assert.equal(f.calls,0);
});
test('email-wide opt-out and global suppression each prevent dispatch under the lock',async()=>{
  for(const action of ['optOut','suppress'] as const){const f=fixture();f[action]();assert.equal((await f.locked(mail)).ok,false);assert.equal(f.calls,0);}
  const f=fixture();f.setGlobal(async()=>true);assert.equal((await f.send(mail)).ok,false);assert.equal(f.calls,0);assert.equal(f.rootCalls,1);
});
test('live consent invokes provider once with idempotency key',async()=>{
  const f=fixture();assert.deepEqual(await f.locked(mail),{ok:true,providerId:'synthetic-provider'});assert.equal(f.calls,1);assert.equal(f.probes,1);
});
test('ordinary password reset send still requires no invitation transaction guard',async()=>{
  const f=fixture();assert.equal((await f.send({...mail,...passwordResetEmail('https://au7o.invalid/reset')})).ok,true);assert.equal(f.calls,1);assert.equal(f.probes,0);assert.equal(f.rootCalls,1);
});


test('transaction suppression errors fail closed without consulting root suppression',async()=>{
  const f=fixture();f.setTransactionSuppression(async()=>{throw new Error('Suppression unavailable');});
  assert.equal((await f.locked(mail)).ok,false);assert.equal(f.calls,0);assert.equal(f.rootCalls,0);
});
test('staging recipient restriction still rejects an invitation before any dispatch',async()=>{
  let provider=0,root=0,guard=0;
  const send=createEmailSender({client:()=>({emails:{send:async()=>{provider++;}}} as never),isSuppressed:async()=>{root++;return false;},recipientAllowed:()=>false});
  assert.equal((await send({...mail,invitationConsentGuard:async()=>{guard++;return()=>true;}})).ok,false);
  assert.equal(provider+root+guard,0);
});
for(const sameEmail of [false,true]){
  test('two-connection pool progresses with '+(sameEmail?'a same-email lock waiter':'two simultaneous invitations'),async()=>{
    let held=0,peak=0,rootCalls=0,providerCalls=0,txSuppression=0,waiterCount=0;
    const capacity=2,acquired=deferred<void>(),waiterStarted=deferred<void>();
    const poolWaiters:Array<{resolve:()=>void;reject:(error:Error)=>void}>=[];
    const take=async()=>{
      if(held===capacity)await new Promise<void>((resolve,reject)=>poolWaiters.push({resolve,reject}));
      held++;peak=Math.max(peak,held);if(held===capacity)acquired.resolve();
    };
    const release=()=>{held--;poolWaiters.shift()?.resolve();};
    const locks=new Map<string,ReturnType<typeof deferred<void>>>();
    const prisma={$transaction:async(fn:(tx:unknown)=>Promise<unknown>)=>{
      await take();await acquired.promise;let owned:string|undefined;
      const tx={$queryRaw:async(strings:TemplateStringsArray,...values:unknown[])=>{
        const sql=strings.join('');
        if(sql.includes('pg_advisory')){
          const key=String(values[0]);
          const pending=locks.get(key);if(pending){waiterCount++;waiterStarted.resolve();await pending.promise;}
          locks.set(key,deferred<void>());owned=key;
        }
        if(sql.includes('SELECT "id"'))return[{id:'synthetic-offer'}];return[{live:1}];
      },reservation:{findFirst:async()=>null},emailSuppression:{findUnique:async()=>{txSuppression++;return null;}}};
      try{return await fn(tx);}finally{if(owned){const lock=locks.get(owned)!;locks.delete(owned);lock.resolve();}release();}
    }} as never;
    const send=createEmailSender({
      client:()=>({emails:{send:async(_payload:unknown,options:{idempotencyKey:string})=>{
        if(sameEmail&&providerCalls===0)await waiterStarted.promise;
        providerCalls++;assert.match(options.idempotencyKey,/^synthetic-offer-[12]$/);return{data:{id:'synthetic-'+providerCalls},error:null};
      }}} as never),
      // A regression acquires a third connection here and is bounded by the test.
      isSuppressed:async()=>{rootCalls++;await take();try{return false;}finally{release();}},
      recipientAllowed:()=>true,
    });
    const locked=createLockedReservationSender({prisma,send,clock:()=>0});
    const pending=Promise.all([1,2].map(index=>locked({...mail,to:sameEmail?mail.to:'synthetic-'+index+'@example.invalid',idempotencyKey:'synthetic-offer-'+index})));
    let timer:ReturnType<typeof setTimeout>|undefined;
    try{
      const result=await Promise.race([pending,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Bounded pool made no progress')),1000);})]);
      assert(result.every(row=>row.ok));assert.equal(providerCalls,2);assert.equal(txSuppression,2);
      assert.equal(rootCalls,0);assert.equal(peak,2);assert.equal(held,0);assert.equal(waiterCount,sameEmail?1:0);
    }finally{
      clearTimeout(timer);
      for(const waiter of poolWaiters.splice(0))waiter.reject(new Error('Synthetic pool closed'));
      await pending.catch(()=>{});
    }
  });
}

test('a supplied invitation guard must return a callable live lease',async()=>{
  const f=fixture();
  for(const value of [null,undefined,true]){
    const result=await f.send({...mail,invitationConsentGuard:async()=>value as never});
    assert.equal(result.ok,false);
  }
  assert.equal(f.calls,0);assert.equal(f.rootCalls,0);
});

function delayedProviderFixture(commitFails=false){
  process.env.VERCEL='1';
  let held=false,calls=0,current=0,queue=Promise.resolve();
  let rejectProvider!:(error:Error)=>void,resolveProvider!:(value:{data:{id:string};error:null})=>void;
  const provider=new Promise<{data:{id:string};error:null}>((resolve,reject)=>{resolveProvider=resolve;rejectProvider=reject;});
  const invoked=deferred<void>(),released=deferred<void>(),suppression=deferred<void>();
  let delaySuppression=false;
  const row={id:'offer',email:mail.to,year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'manual',
    vehicle:'2015 Dodge Challenger SRT 392',vehicleVerified:true,trimVerified:true,country:'US',trialDays:7,twinStatus:'ready',assignedTwin:'dodge-challenger',
    readyAt:new Date('2026-09-01T00:00:00Z'),updatedAt:new Date('2026-09-01T00:00:00Z'),invitedAt:null,unsubscribedAt:null as Date|null,unsubscribeToken:'a'.repeat(32)};
  const rows:Array<Record<string,unknown>>=[row];
  const tx={$queryRaw:async(strings:TemplateStringsArray)=>{
    assert(held);
    return strings.join('').includes('SELECT "id"')?rows.map(item=>({id:item.id})):[{live:1}];
  },reservation:{
    findUnique:async()=>row,
    findFirst:async()=>rows.find(item=>item.unsubscribedAt)||null,
    findMany:async()=>rows,
    create:async({data}:{data:Record<string,unknown>})=>{const added={...data,id:'capture-'+rows.length};rows.push(added);return added;},
    updateMany:async()=>{for(const item of rows)item.unsubscribedAt=new Date();return{count:rows.length};},
  },emailSuppression:{findUnique:async()=>{if(delaySuppression)await suppression.promise;return null;}}};
  const prisma={$transaction:async<T>(fn:(tx:unknown)=>Promise<T>)=>{
    const pending=queue.then(async()=>{
      held=true;
      try{const result=await fn(tx);if(commitFails){commitFails=false;throw new Error('Commit acknowledgement lost');}return result;}
      finally{held=false;released.resolve();}
    });
    queue=pending.then(()=>{},()=>{});return pending;
  }} as never;
  const send=createEmailSender({client:()=>({emails:{send:(_payload:unknown,options:{idempotencyKey:string})=>{
    assert(held,'provider invocation must occur with consent lock held');assert(options.idempotencyKey);calls++;invoked.resolve();return provider;
  }}} as never),isSuppressed:async()=>{throw new Error('Root suppression forbidden');},recipientAllowed:()=>true});
  let sendPromise:ReturnType<typeof send>|undefined;
  const locked=createLockedReservationSender({prisma,send:args=>{sendPromise=send(args);return sendPromise;},clock:()=>current});
  const capture=createReservationHandler({prisma,rateLimit:()=>null});
  const unsubscribe=createReservationUnsubscribeHandler(prisma);
  return{row,rows,locked,invoked,released,
    capture:(vehicle:string)=>capture(new NextRequest('https://local.invalid/api/reservation',{method:'POST',headers:{'Content-Type':'application/json','x-vercel-ip-country':'US'},body:JSON.stringify({email:mail.to,country:'US',vehicle,source:'hero'})})),
    unsubscribe:()=>unsubscribe(new Request('https://local.invalid/api/reservation/unsubscribe?token='+row.unsubscribeToken)),
    delay(){delaySuppression=true;},allow(){suppression.resolve();},deadline(){current=19000;},
    resolve(){resolveProvider({data:{id:'actual-synthetic-result'},error:null});},reject(){rejectProvider(new Error('Delayed provider failure'));},
    get held(){return held;},get calls(){return calls;},get sendPromise(){return sendPromise;},
  };
}
async function bounded<T>(promise:Promise<T>){
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{return await Promise.race([promise,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Synthetic progress deadline exceeded')),1000);})]);}
  finally{clearTimeout(timer);}
}
test('slow provider releases consent for actual capture and unsubscribe before response, retaining the same result',async()=>{
  const f=delayedProviderFixture();let finished=false;
  const pending=f.locked(mail).then(result=>{finished=true;return result;});
  await bounded(f.invoked.promise);await bounded(f.released.promise);
  assert.equal(f.held,false);assert.equal(finished,false);assert.equal(f.calls,1);
  assert.equal((await bounded(f.capture('Independent synthetic request'))).status,200);
  assert.equal((await bounded(f.unsubscribe())).status,200);
  assert(f.rows.every(row=>row.unsubscribedAt));
  assert.equal((await bounded(f.capture('Later synthetic request'))).status,200);assert(f.rows.every(row=>row.unsubscribedAt));
  assert.equal((await bounded(f.locked(mail))).ok,false);assert.equal(f.calls,1);assert.equal(finished,false);
  f.resolve();assert.deepEqual(await bounded(pending),{ok:true,providerId:'actual-synthetic-result'});
});
test('release notification does not precede delayed final suppression checks',async()=>{
  const f=delayedProviderFixture();f.delay();const pending=f.locked(mail);
  await new Promise<void>(resolve=>setImmediate(resolve));
  assert.equal(f.held,true);assert.equal(f.calls,0);
  f.allow();await bounded(f.invoked.promise);await bounded(f.released.promise);
  assert.equal(f.held,false);f.resolve();assert.equal((await pending).ok,true);
});
for(const outcome of ['commit','provider','timeout'] as const){
  test('actual invitation retains its durable reconciliation hold for '+outcome+' uncertainty after invocation',async()=>{
    const f=delayedProviderFixture(outcome==='commit');let deliveryExists=false,finishResult:unknown;
    const handler=createTwinReadyInvitationHandler({authorize:async()=>null,baseUrl:'https://local.invalid',enabled:()=>true,
      load:async()=>f.row,suppressed:async()=>false,deliveryExists:async()=>deliveryExists,
      reserve:async()=>{deliveryExists=true;return'durable-delivery';},send:f.locked,finish:async(_id,_row,result)=>{finishResult=result;}});
    const request=()=>handler(new Request('https://local.invalid/api/admin/reservations/invitation',{method:'POST',headers:{origin:'https://local.invalid','Content-Type':'application/json'},body:JSON.stringify({id:f.row.id,expectedUpdatedAt:f.row.updatedAt.toISOString(),action:'send',confirm:true})}));
    const pending=request();await bounded(f.invoked.promise);
    if(outcome==='timeout')f.deadline();
    await bounded(f.released.promise);assert.equal(f.held,false);
    if(outcome==='provider')f.reject();if(outcome==='commit')f.resolve();
    assert.equal((await bounded(pending)).status,502);
    assert(deliveryExists);assert.equal((finishResult as {ok:boolean}).ok,false);assert.equal(f.calls,1);
    if(outcome==='commit')assert.equal((finishResult as {providerId:string}).providerId,'actual-synthetic-result');
    assert.equal((await request()).status,409);assert.equal(f.calls,1);
    if(outcome==='timeout'){f.reject();await f.sendPromise;assert.equal(f.calls,1);}
  });
}
