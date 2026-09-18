/* Actual delete/checkout/webhook handlers. In-memory transactional journals and FIFO advisory locks; no providers/network. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
let api;
test.before(async()=>{
 const mocks={
  '@/lib/auth':"export async function auth(){return globalThis.__deletion.session}",
  '@/lib/db':"export const prisma=new Proxy({},{get(_,key){return globalThis.__deletion.db[key]}})",
  '@/lib/stripe':"export function getStripe(){return globalThis.__deletion.stripe};export function getPriceIdForTier(){return 'price_visual'}",
  './stripe':"export function getStripe(){return globalThis.__deletion.stripe};export function getPriceIdForTier(){return 'price_visual'}",
  '@/lib/photo-storage':"export async function deleteDiagnosisPhotos(keys){return globalThis.__deletion.purge(keys)}",
  '@/lib/maintenance-service-mutation':"export async function lockServiceOwner(tx,id){tx.requireLock(id);tx.events.push('service-lock')}",
  '@/lib/maintenance-receipt-cleanup':"export async function queueReceiptCleanup(tx,{userId}){tx.requireLock(userId);tx.stage.push(()=>globalThis.__deletion.cleanup.push(userId))}",
 };
 const built=await esbuild.build({stdin:{resolveDir:root,contents:"export {DELETE} from './src/app/api/account/delete/route';export {createCheckoutHandler} from './src/lib/stripe-create-checkout-handler';export {createStripeWebhookHandler} from './src/lib/stripe-webhook-handler';"},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'offline',setup(b){b.onResolve({filter:/.*/},a=>Object.hasOwn(mocks,a.path)?{path:a.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));}}]});
 const m=new Module(path.join(root,'fixture-deletion.cjs'));m.filename=path.join(root,'fixture-deletion.cjs');m.paths=Module._nodeModulePaths(root);m._compile(built.outputFiles[0].text,m.filename);api=m.exports;
});
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
function fixture(){
 const f={session:{user:{id:'owner',email:'stale@fixture.invalid'}},user:{id:'owner',email:'owner@fixture.invalid',emailVerified:new Date(),stripeCustomerId:'cus_owner',subscriptionId:'sub_owner',subscriptionStatus:'active'},attempt:null,
  enrollments:[{email:'owner@fixture.invalid'},{email:'other@fixture.invalid'}],reviews:[],cleanup:[],events:[],deletes:[],providerCalls:[],rootReads:0,receipts:[],pendingUpgrade:null,photos:[],duplicateOwner:false,failCommit:false};
 const locks=new Map();
 async function transaction(fn){
  const held=new Map(),stage=[];
  const tx={stage,events:f.events,requireLock(key='owner'){assert(held.has(key),'All deletion reads/writes need billing lock');},
   $queryRaw:async(strings,...values)=>{
    const sql=strings.join('?');
    if(!sql.includes('pg_advisory_xact_lock'))return [];
    assert.match(sql,/hashtextextended\(\?, 0\)/,'Exact shared billing/enrollment key algorithm');
    const key=values[0];if(held.has(key))return [];
    const prior=locks.get(key)||Promise.resolve(),next=deferred();locks.set(key,prior.then(()=>next.promise));
    f.events.push('wait:'+key);await prior;held.set(key,next.resolve);f.events.push('lock:'+key);return [];
   },
   user:{
    findUnique:async({where})=>{tx.requireLock();assert.equal(where.id,'owner');f.events.push('user-read');return f.user&&structuredClone(f.user)},
    findUniqueOrThrow:async(args)=>{const user=await tx.user.findUnique(args);if(!user)throw Error('User not found');return user},
    findMany:async({where})=>{tx.requireLock('enrollment:owner@fixture.invalid');assert.deepEqual(where,{email:{equals:'owner@fixture.invalid',mode:'insensitive'}});return [{id:'owner'},...(f.duplicateOwner?[{id:'another'}]:[])]},
    delete:async({where})=>{tx.requireLock();assert.equal(where.id,'owner');stage.push(()=>{f.user=null;f.reviews=f.reviews.filter(row=>row.userId!=='owner');f.deletes.push('user');f.events.push('delete-user')})},
    update:async({where,data})=>{tx.requireLock();assert.equal(where.id,'owner');if(!f.user)throw Error('Missing user');stage.push(()=>Object.assign(f.user,data));return {...f.user,...data}},
   },
   billingAttempt:{
    findUnique:async({where})=>{tx.requireLock();assert.equal(where.userId,'owner');return f.attempt&&structuredClone(f.attempt)},
    findUniqueOrThrow:async(args)=>{const row=await tx.billingAttempt.findUnique(args);if(!row)throw Error('Missing attempt');return row},
    create:async({data})=>{tx.requireLock();const value={...data,createdAt:new Date()};stage.push(()=>{f.attempt=value});return value},
    update:async({data})=>{tx.requireLock();stage.push(()=>Object.assign(f.attempt,data));return {...f.attempt,...data}},
    deleteMany:async({where})=>{tx.requireLock();assert.deepEqual(where,{userId:'owner'});const count=Number(!!f.attempt);stage.push(()=>{f.attempt=null;f.deletes.push('billingAttempt')});return {count}},
   },
   accountEnrollment:{deleteMany:async({where})=>{tx.requireLock('enrollment:owner@fixture.invalid');assert.deepEqual(where,{email:'owner@fixture.invalid'});const count=f.enrollments.filter(x=>x.email===where.email).length;stage.push(()=>{f.enrollments=f.enrollments.filter(x=>x.email!==where.email);f.deletes.push('enrollments')});return {count}}},
   hubUpgradeAttempt:{findFirst:async({where})=>{tx.requireLock();assert.deepEqual(where,{userId:'owner',dispatchStartedAt:{not:null},completedAt:null});return f.pendingUpgrade}},
   billingEnrollmentReview:{findMany:async({where})=>{tx.requireLock();assert.deepEqual(where,{userId:'owner'});return f.reviews.filter(row=>row.userId===where.userId)}},
   diagnosisSample:{findMany:async({where})=>{tx.requireLock();assert.equal(where.userId,'owner');return f.photos}},
   billingEvent:{findUnique:async()=>{tx.requireLock();return null},create:async({data})=>{tx.requireLock();stage.push(()=>f.receipts.push(data));return data}},
  };
  for(const name of ['chatSession','chatPromptInsight','notificationLog','pushSubscription','userIssueFix'])tx[name]={deleteMany:async({where})=>{tx.requireLock();assert.deepEqual(where,{userId:'owner'});stage.push(()=>f.deletes.push(name));return {count:1}}};
  try{const value=await fn(tx);if(f.failCommit)throw Error('Commit failure');for(const write of stage)write();return value}finally{for(const [key,release]of [...held].reverse()){f.events.push('unlock:'+key);release()}}
 }
 f.db={$transaction:transaction,user:{findUnique:async({where})=>{f.rootReads++;return f.user&&(where.id==='owner'||where.stripeCustomerId==='cus_owner')?structuredClone(f.user):null}},billingAttempt:{}};
 f.subscription={id:'sub_owner',customer:'cus_owner',status:'active',pending_update:null,schedule:null,metadata:{},items:{data:[]}};
 f.checkout={id:'cs_owner',status:'complete',payment_status:'paid',customer:'cus_owner',subscription:'sub_owner',client_reference_id:'owner',metadata:{attemptKey:'attempt-owner'}};
 f.stripe={
  prices:{retrieve:async()=>({active:true,currency:'usd',unit_amount:499,type:'recurring',billing_scheme:'per_unit',recurring:{interval:'month',interval_count:1,usage_type:'licensed'}})},
  subscriptions:{
   retrieve:async(id)=>{f.providerCalls.push('retrieve:'+id);if(f.retrieveError)throw f.retrieveError;return structuredClone(f.subscription)},
   cancel:async(id)=>{f.providerCalls.push('cancel:'+id);f.events.push('cancel');if(f.onCancel)await f.onCancel();if(f.cancelError)throw f.cancelError;f.subscription.status='canceled';return {...f.subscription,...f.cancelResult}},
   list:async()=>{if(f.onList)await f.onList();return {data:[],has_more:false}},
  },
  checkout:{sessions:{
   retrieve:async(id)=>{f.providerCalls.push('checkout:'+id);if(f.checkoutError)throw f.checkoutError;return structuredClone(f.checkout)},
   create:async()=>{f.providerCalls.push('create-checkout');return {id:'cs_new',status:'open',url:'https://checkout.invalid/synthetic'}},
  }},
  webhooks:{constructEvent:()=>({id:'evt_fixture',type:'customer.subscription.updated',data:{object:{id:'sub_owner'}}})},
 };
 f.purge=async()=>{f.events.push('purge-photos');if(f.purgeError)throw f.purgeError};
 f.completed=()=>{f.attempt={userId:'owner',key:'attempt-owner',customerId:'cus_owner',sessionId:'cs_owner',subscriptionId:'sub_owner',state:'complete',product:'visual',vehicleId:null,createdAt:new Date()};return f};
 f.remove=(confirmed=true)=>api.DELETE(new Request('https://fixture.invalid/api/account/delete',{method:'DELETE',headers:confirmed?{'x-confirm-delete':'true'}:{}}));
 f.checkoutRequest=()=>api.createCheckoutHandler({auth:async()=>f.session,prisma:f.db,getStripe:()=>f.stripe,getPriceIdForTier:()=> 'price_visual'})(new Request('https://fixture.invalid/api/checkout',{method:'POST',headers:{'x-vercel-ip-country':'US'},body:JSON.stringify({product:'visual',billingCountry:'US'})}));
 f.webhook=()=>api.createStripeWebhookHandler({prisma:f.db,getStripe:()=>f.stripe,secret:()=> 'synthetic-secret'})(new Request('https://fixture.invalid/api/webhook',{method:'POST',body:'synthetic'}));
 globalThis.__deletion=f;return f;
}
function retained(f){assert(f.user);assert.deepEqual(f.deletes,[]);assert.deepEqual(f.cleanup,[]);assert.equal(f.enrollments.length,2);}
function checkoutEnvironment(t){
 const values={ACCOUNT_ENROLLMENT_ENABLED:'true',VERCEL:'1',VERCEL_ENV:'preview',STRIPE_SECRET_KEY:'sk_test_synthetic',STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV:'preview:test'};
 for(const [key,value]of Object.entries(values)){const old=process.env[key];process.env[key]=value;t.after(()=>old===undefined?delete process.env[key]:process.env[key]=old)}
}
test('delete requires authentication and explicit confirmation without reading billing',async()=>{
 const f=fixture();assert.equal((await f.remove(false)).status,400);f.session=null;assert.equal((await f.remove()).status,401);assert.equal(f.rootReads,0);retained(f);
});
for(const state of ['pending','creating','open','uncertain','billing_review','unknown','complete'])test('unsettled '+state+' preserves durable checkout key and all personal records',async()=>{
 const f=fixture().completed();f.attempt.state=state;if(state==='complete')f.attempt.subscriptionId=null;const before=structuredClone(f.attempt);
 assert.equal((await f.remove()).status,409);retained(f);assert.deepEqual(f.attempt,before);assert.deepEqual(f.providerCalls,[]);assert.equal(f.rootReads,0);
});
for(const payment of ['paid','no_payment_required'])test('settled '+payment+' cancels under lock then removes only owned journals',async()=>{
 const f=fixture().completed();f.checkout.payment_status=payment;const response=await f.remove();assert.equal(response.status,200);
 assert.equal(f.user,null);assert.equal(f.attempt,null);assert.deepEqual(f.enrollments,[{email:'other@fixture.invalid'}]);assert.deepEqual(f.cleanup,['owner']);assert.equal(f.rootReads,0);
 assert(f.events.indexOf('lock:owner')<f.events.indexOf('user-read'));assert(f.events.indexOf('cancel')<f.events.indexOf('delete-user'));assert(f.events.indexOf('delete-user')<f.events.indexOf('unlock:owner'));assert.equal((await response.json()).deleted.billingAttempts,1);
});
for(const change of [{status:'open'},{payment_status:'unpaid'},{id:'another'},{customer:'another'},{subscription:'another'},{client_reference_id:'another'},{metadata:{attemptKey:'another'}}])test('provider checkout binding/settlement mismatch refuses '+JSON.stringify(change),async()=>{
 const f=fixture().completed();Object.assign(f.checkout,change);assert.equal((await f.remove()).status,409);retained(f);assert(f.attempt);assert(!f.providerCalls.some(x=>x.startsWith('cancel:')));
});
test('provider cancellation failure or uncertain response never erases journals',async()=>{
 for(const failure of [new Error('Connection canceled before response'),new Error('No such subscription'),{status:'active'},{customer:'other'}]){
  const f=fixture().completed();if(failure instanceof Error)f.cancelError=failure;else f.cancelResult=failure;
  assert.equal((await f.remove()).status,502);retained(f);assert(f.attempt);
 }
 for(const field of ['retrieveError','checkoutError']){const f=fixture().completed();f[field]=Error('offline timeout');assert.equal((await f.remove()).status,502);retained(f)}
});
test('authoritatively terminal subscriptions are idempotent; foreign identity/schedules/dispatch uncertainty are held',async()=>{
 for(const status of ['canceled','incomplete_expired']){const f=fixture();f.subscription.status=status;assert.equal((await f.remove()).status,200);assert(!f.providerCalls.some(x=>x.startsWith('cancel:')))}
 for(const change of [{customer:'foreign'},{pending_update:{}},{schedule:'sched_fixture'}]){const f=fixture();Object.assign(f.subscription,change);assert.equal((await f.remove()).status,409);retained(f)}
 const f=fixture();f.pendingUpgrade={subscriptionId:'sub_owner'};assert.equal((await f.remove()).status,409);retained(f);assert.deepEqual(f.providerCalls,[]);
});
test('ambiguous email ownership blocks erasure; missing email cannot erase unproven enrollment rows',async()=>{
 let f=fixture();f.duplicateOwner=true;assert.equal((await f.remove()).status,409);retained(f);
 f=fixture();f.user.email=null;f.user.subscriptionId=null;assert.equal((await f.remove()).status,200);assert.equal(f.enrollments.length,2);
});
test('unresolved or superseded enrollment reviews cannot be erased as a side effect of canceling the current subscription',async()=>{
 const confirmed={userId:'owner',subscriptionId:'sub_owner',customerId:'cus_owner',state:'confirmed',initialVerified:true};
 for(const change of [{state:'review_required'},{initialVerified:false},{subscriptionId:'sub_other'},{customerId:'cus_other'}]){
  const f=fixture();f.reviews=[{...confirmed,...change}];const before=structuredClone(f.reviews);
  assert.equal((await f.remove()).status,409);retained(f);assert.deepEqual(f.reviews,before);assert.deepEqual(f.providerCalls,[]);
 }
 const f=fixture().completed();f.subscription.status='canceled';const foreign={...confirmed,userId:'foreign',subscriptionId:'sub_foreign'};f.reviews=[confirmed,foreign];
 assert.equal((await f.remove()).status,200);assert.deepEqual(f.reviews,[foreign]);assert.deepEqual(f.providerCalls,['checkout:cs_owner','retrieve:sub_owner']);
});
test('blob and transaction failures retain journals; retry re-reads terminal cancellation',async()=>{
 let f=fixture().completed();f.photos=[{storageKey:'private/fixture'}];f.purgeError=Error('offline blob failure');assert.equal((await f.remove()).status,502);retained(f);assert(f.attempt);
 f.purgeError=null;assert.equal((await f.remove()).status,200);assert.equal(f.providerCalls.filter(x=>x.startsWith('cancel:')).length,1);
 f=fixture().completed();f.failCommit=true;assert.equal((await f.remove()).status,503);retained(f);assert(f.attempt);
});
test('actual checkout allocation wins lock first: delete sees creating key and refuses before checkout dispatch',async t=>{
 checkoutEnvironment(t);const f=fixture();f.user.subscriptionId=null;const entered=deferred(),release=deferred();let lists=0;
 f.onList=async()=>{if(++lists===1){entered.resolve();await release.promise}};
 const checkout=f.checkoutRequest();await entered.promise;const deletion=f.remove();await new Promise(setImmediate);release.resolve();
 assert.equal((await deletion).status,409);assert.equal((await checkout).status,200);assert(f.user);assert.equal(f.attempt.state,'open');assert(f.providerCalls.includes('create-checkout'));assert.deepEqual(f.deletes,[]);
});
test('delete wins lock: actual checkout and webhook cannot mutate or recreate billing after erasure',async t=>{
 checkoutEnvironment(t);const f=fixture();const entered=deferred(),release=deferred();f.onCancel=async()=>{entered.resolve();await release.promise};
 const deletion=f.remove();await entered.promise;const checkout=f.checkoutRequest(),webhook=f.webhook();await new Promise(setImmediate);release.resolve();
 assert.equal((await deletion).status,200);assert.equal((await checkout).status,503);assert.equal((await webhook).status,503);assert.equal(f.user,null);assert.equal(f.attempt,null);assert.deepEqual(f.receipts,[]);assert(!f.providerCalls.includes('create-checkout'));
});
