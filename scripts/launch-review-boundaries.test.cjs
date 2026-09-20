/* Actual narrow authorization and server pages; all provider/DB I/O mocked. */
const test=require('node:test'), assert=require('node:assert/strict');
const path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
async function load(f){
  globalThis.__launchReview=f;
  const mocks={
    '@/lib/auth':'export async function auth(){return globalThis.__launchReview.session}',
    '@/lib/db':'export const prisma=globalThis.__launchReview.db;export default prisma',
    './db':'export const prisma=globalThis.__launchReview.db;export default prisma',
    './twin-hub-data':'export async function getTwinHubData(u,e,id){return globalThis.__launchReview.twin(u,e,id)}',
    '@/lib/vehicle-patch-handler':'export function createVehiclePatchHandler(){return async function(request){globalThis.__launchReview.writes++;return Response.json(await request.json())}}',
    '@/lib/maintenance-service-mutation':'export async function lockServiceOwner(){};export async function lockServiceVehicle(){}',
    '@/lib/maintenance-receipt-cleanup':'export async function queueReceiptCleanup(){}',
    '@/components/maintenance/GarageServiceRecordsClient':'export function GarageServiceRecordsClient(){return null}',
    'next/navigation':'export function redirect(href){throw Object.assign(new Error("redirect"),{href})}',
    'next/link':'export default function Link(){return null}',
    '@vercel/blob':'export async function put(){throw Error("provider must not run")};export const del=put,get=put,list=put;',
  };
  const built=await esbuild.build({stdin:{resolveDir:root,contents:`
    export {canConfirmPersonalVehicleEquipment} from './src/lib/vehicle-capabilities';
    export {PATCH} from './src/app/api/vehicles/[id]/route';
    export {default as records} from './src/app/garage/[id]/records/page';
    export {default as visual} from './src/app/visual/page';
    export {maintenanceReceiptUploadsConfigured,maintenanceReceiptStorageConfigured,storeMaintenanceReceipt} from './src/lib/maintenance-receipt-storage';
  `},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',plugins:[{name:'offline',setup(b){
    b.onResolve({filter:/.*/},a=>Object.hasOwn(mocks,a.path)?{path:a.path,namespace:'mock'}:undefined);
    b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));
  }}]});
  const mod=new Module(path.join(root,'fixture-launch-review.cjs'));mod.filename=path.join(root,'fixture-launch-review.cjs');mod.paths=Module._nodeModulePaths(root);mod._compile(built.outputFiles[0].text,mod.filename);return mod.exports;
}
function fixture(){
  const f={session:{user:{id:'owner',capabilities:{garage:false,visual:true}}},verified:true,writes:0,kind:'equipment',canConfirm:true};
  f.db={user:{findUnique:async()=>({id:'owner',email:'owner@example.invalid',emailVerified:f.verified?new Date():null,subscriptionTier:'free',subscriptionStatus:null})},vehicle:{findFirst:async({where})=>where.userId==='owner'&&where.id==='claimed'?{id:'claimed'}:null}};
  f.twin=async(u,e,id)=>u!=='owner'||id!=='claimed'?{access:{allowed:false},data:null}:f.kind==='allowed'?{access:{allowed:true},data:{}}:f.kind==='equipment'?{access:{allowed:false,reason:'equipment-unconfirmed'},data:null,equipmentSetup:{vehicleId:'claimed',vehicleRevision:'2026-09-18T00:00:00.000Z',profile:{id:'reviewed'},canConfirm:f.canConfirm}}:{access:{allowed:false,reason:f.kind},data:null};
  return f;
}
function elements(node){if(!node||typeof node!=='object')return[];if(Array.isArray(node))return node.flatMap(elements);return[node,...elements(node.props?.children)]}

test('claimed beta equipment recovery is exact, revision checked and cannot perform other vehicle writes',async t=>{
  const f=fixture(),api=await load(f);t.after(()=>delete globalThis.__launchReview);
  const valid={reviewedEquipmentId:'reviewed',expectedUpdatedAt:'2026-09-18T00:00:00.000Z'};
  const confirm=body=>api.canConfirmPersonalVehicleEquipment('owner','claimed',body);
  assert.equal(await confirm(valid),true);
  for(const body of [null,{},[],{...valid,color:'red'},{...valid,reviewedEquipmentId:null},{...valid,reviewedEquipmentId:'other'},{...valid,expectedUpdatedAt:'stale'}])assert.equal(await confirm(body),false);
  assert.equal(await api.canConfirmPersonalVehicleEquipment('owner','foreign',valid),false);
  f.verified=false;assert.equal(await confirm(valid),false);f.verified=true;
  f.canConfirm=false;assert.equal(await confirm(valid),false);f.canConfirm=true;
  for(const kind of ['expired','unclaimed','denied']){f.kind=kind;assert.equal(await confirm(valid),false)}f.kind='equipment';
  const send=body=>api.PATCH(new Request('https://fixture.invalid/api/vehicles/claimed',{method:'PATCH',body:JSON.stringify(body)}),{params:Promise.resolve({id:'claimed'})});
  assert.equal((await send({...valid,color:'red'})).status,403);assert.equal(f.writes,0);
  const response=await send(valid);assert.equal(response.status,200);assert.deepEqual(await response.json(),valid);assert.equal(f.writes,1);
});
test('service history grants only exact active vehicle access, not account-wide beta access',async t=>{
  const f=fixture(),api=await load(f);t.after(()=>delete globalThis.__launchReview);f.kind='allowed';
  const page=id=>api.records({params:Promise.resolve({id})});
  assert.equal((await page('claimed')).type.name,'GarageServiceRecordsClient');
  await assert.rejects(()=>page('foreign'),e=>e.href==='/account');
  for(const kind of ['expired','unclaimed','equipment']){f.kind=kind;await assert.rejects(()=>page('claimed'),e=>e.href==='/account')}
  f.session=null;await assert.rejects(()=>page('claimed'),e=>e.href.startsWith('/auth/signin?callbackUrl='));
});
test('member Visual library contains reviewed mappings, excludes empty Aviator and keeps paid gate',async t=>{
  const f=fixture(),api=await load(f);t.after(()=>delete globalThis.__launchReview);
  const rendered=elements(await api.visual());
  assert.equal(rendered.filter(n=>n.type==='article').length,5);
  const links=rendered.map(n=>n.props?.href).filter(h=>h?.startsWith('/known-issues/'));
  for(const slug of ['cadillac-xt6','lincoln-nautilus','nissan-murano','nissan-kicks','acura-mdx'])assert(links.some(h=>h.startsWith('/known-issues/'+slug+'?')));
  assert(!links.some(h=>h.includes('aviator')));
  for(const img of rendered.filter(n=>n.type==='img'))assert(img.props.width>0&&img.props.height>0&&img.props.src.startsWith('/twin-stage/'));
  f.session.user.capabilities.visual=false;await assert.rejects(()=>api.visual(),e=>e.href==='/subscribe?product=visual');
});
test('private receipt uploads fail closed without cleanup configuration while existing reads remain configured',async t=>{
  const f=fixture(),api=await load(f);t.after(()=>delete globalThis.__launchReview);
  const values={BLOB_READ_WRITE_TOKEN:'synthetic',MAINTENANCE_RECEIPT_CLEANUP_ENABLED:'true',MAINTENANCE_RECEIPT_CLEANUP_SECRET:'synthetic-cleanup-secret-32-characters-long',DATABASE_URL:'postgresql://fixture@127.0.0.1:55438/test',MAINTENANCE_RECEIPT_CLEANUP_DATABASE_HOST:'127.0.0.1',MAINTENANCE_RECEIPT_CLEANUP_DATABASE_NAME:'test'};
  const old=Object.fromEntries(Object.keys(values).map(k=>[k,process.env[k]]));t.after(()=>{for(const [k,v]of Object.entries(old))v===undefined?delete process.env[k]:process.env[k]=v});
  Object.assign(process.env,values);assert.equal(api.maintenanceReceiptUploadsConfigured(),true);
  for(const key of Object.keys(values)){delete process.env[key];assert.equal(api.maintenanceReceiptUploadsConfigured(),false,key);process.env[key]=values[key]}
  process.env.MAINTENANCE_RECEIPT_CLEANUP_ENABLED='false';assert.equal(api.maintenanceReceiptStorageConfigured(),true);
  await assert.rejects(()=>api.storeMaintenanceReceipt({userId:'owner',vehicleId:'claimed',file:new File(['%PDF-1'], 'receipt.pdf',{type:'application/pdf'})}),/cleanup must be configured/);
});
