/* Current launch contract: public enrollment is closed unless explicitly enabled. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const Module = require('node:module');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
async function load() {
  const built = await esbuild.build({stdin:{resolveDir:root,contents:`
    export { startEnrollment, finishEnrollment } from './src/lib/account-enrollment';
    export { createCheckoutHandler } from './src/lib/stripe-create-checkout-handler';
    export { publicEnrollmentEnabled, productEntitlements } from './src/lib/product-entitlements';
  `},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'no-provider',setup(b){
    b.onResolve({filter:/^(?:\.\/|@\/lib\/)(db|email)$/},a=>({path:a.path,namespace:'offline'}));
    b.onLoad({filter:/.*/,namespace:'offline'},a=>({contents:a.path.endsWith('db')
      ? 'export const prisma=new Proxy({},{get(){throw Error("Unexpected database access")}});export default prisma;'
      : 'export const appUrl=()=>"https://fixture.invalid";export async function sendEmailDetailed(){throw Error("Unexpected email send")}',loader:'js'}));
  }}]});
  const mod = new Module(path.join(root,'fixture-public-entrypoints.cjs'));
  mod.filename=path.join(root,'fixture-public-entrypoints.cjs');mod.paths=Module._nodeModulePaths(root);
  mod._compile(built.outputFiles[0].text,mod.filename);return mod.exports;
}
test('unset enrollment closes actual signup, verification and checkout without database/provider work',async t=>{
  const previous=process.env.ACCOUNT_ENROLLMENT_ENABLED;delete process.env.ACCOUNT_ENROLLMENT_ENABLED;
  t.after(()=>previous===undefined?delete process.env.ACCOUNT_ENROLLMENT_ENABLED:process.env.ACCOUNT_ENROLLMENT_ENABLED=previous);
  const api=await load();assert.equal(api.publicEnrollmentEnabled(),false);
  const forbidden=()=>{throw Error('Unexpected provider/auth work')};
  const checkout=api.createCheckoutHandler({auth:forbidden,prisma:{},getStripe:forbidden,getPriceIdForTier:forbidden});
  for(const handler of [api.startEnrollment,api.finishEnrollment,checkout]){
    const response=await handler(new Request('https://fixture.invalid/api/test',{method:'POST',body:'{}'}));
    assert.equal(response.status,410);assert.equal((await response.json()).error,'enrollment_closed');
  }
});
test('enabled enrollment still refuses checkout without runtime billing attestation',async t=>{
  const keys=['ACCOUNT_ENROLLMENT_ENABLED','STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV','VERCEL','VERCEL_ENV','STRIPE_SECRET_KEY'];
  const before=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  t.after(()=>{for(const key of keys)before[key]===undefined?delete process.env[key]:process.env[key]=before[key]});
  process.env.ACCOUNT_ENROLLMENT_ENABLED='true';process.env.VERCEL='1';process.env.VERCEL_ENV='production';
  delete process.env.STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV;delete process.env.STRIPE_SECRET_KEY;
  const api=await load();let providerCalls=0;
  const handler=api.createCheckoutHandler({auth:async()=>({user:{id:'synthetic-owner'}}),prisma:{},
    getStripe:()=>{providerCalls++;throw Error('Unexpected provider')},getPriceIdForTier:()=>{providerCalls++;throw Error('Unexpected price')}});
  const response=await handler(new Request('https://fixture.invalid/api/test',{method:'POST',headers:{'x-vercel-ip-country':'US'},body:'{}'}));
  assert.equal(response.status,503);assert.equal((await response.json()).error,'us_billing_enforcement_unverified');assert.equal(providerCalls,0);
});
test('entitlements preserve founders and explicit legacy review independently, never inferring unreviewed access',async t=>{
  const previous=process.env.SUBSCRIPTION_REGION_BYPASS_EMAILS;
  process.env.SUBSCRIPTION_REGION_BYPASS_EMAILS='founder@fixture.invalid';
  t.after(()=>previous===undefined?delete process.env.SUBSCRIPTION_REGION_BYPASS_EMAILS:process.env.SUBSCRIPTION_REGION_BYPASS_EMAILS=previous);
  const api=await load();
  assert.equal(api.productEntitlements({email:'founder@fixture.invalid'}).founder,true);
  assert.equal(api.productEntitlements({email:'founder@fixture.invalid'}).hub,true);
  const legacy={email:'legacy@fixture.invalid',subscriptionId:'synthetic-sub',subscriptionStatus:'active',subscriptionTier:'plus'};
  assert.equal(api.productEntitlements(legacy).hub,false);
  assert.equal(api.productEntitlements({...legacy,legacySubscriptionTier:'plus'}).hub,true);
  assert.equal(api.productEntitlements({...legacy,legacySubscriptionTier:'pro'}).hub,false);
  assert.equal(api.productEntitlements({email:'ordinary@fixture.invalid',emailVerified:new Date()}).hub,false);
});
test('article alerts stay account-free and client components cannot import private founder policy',()=>{
  const alert=fs.readFileSync(path.join(root,'src/components/known-issues/KnownIssueAlertSignup.tsx'),'utf8');
  assert.match(alert,/fetch\('\/api\/interest'/);assert.match(alert,/Free, no account needed/);
  function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):/\.(tsx?|jsx)$/.test(e.name)?[path.join(dir,e.name)]:[])}
  assert.deepEqual(files(path.join(root,'src/components')).filter(file=>{const s=fs.readFileSync(file,'utf8');return s.startsWith("'use client';")&&s.includes('@/lib/founder')}),[]);
});
