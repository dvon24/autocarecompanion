/* Actual /vehicle/[slug] server page; I/O and large presentation leaves are offline fixtures. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
test('actual vehicle page preserves selected owner ID through pending setup and completed Hub without Account loop',async()=>{
  const car={id:'second',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',currentMileage:null,transmission:null};
  let state='pending',calls=[];
  globalThis.__hubRoute={
    db:{vehiclePartLookup:{findMany:async()=>[]},user:{findUnique:async()=>({name:'Fixture owner',email:'owner@example.invalid',createdAt:new Date('2026-01-01')})},vehicle:{findMany:async()=>[car]}},
    twin:async(userId,email,vehicleId)=>{calls.push({userId,email,vehicleId});return state==='pending'?{access:{kind:'denied',reason:'equipment-unconfirmed'},data:null,ownerSetup:{vehicleId,vehicleRevision:'2026-09-16T15:00:00.000Z',label:'2015 Dodge Challenger SRT 392',needsMileage:true,transmissionOptions:['automatic','manual'],equipment:null}}:state==='allowed'?{access:{kind:'allowed'},data:{vehicleId}}:{access:{kind:'denied',reason:'unsupported-vehicle'},data:null};},
  };
  const mocks={
    'next/navigation':'export function redirect(href){throw Object.assign(new Error("redirect"),{href})}export function notFound(){throw Error("not found")}',
    '@/lib/auth':'export const auth=async()=>({user:{id:"owner",subscriptionTier:"hub",capabilities:{personalAi:true}}})',
    '@/lib/db':'const db=globalThis.__hubRoute.db;export default db;',
    '@/lib/known-issues':'export const getKnownIssuesForArticle=async()=>[]',
    '@/lib/recalls':'export const getRecallsForArticle=async()=>[]',
    '@/lib/maintenance':'export const getVehicleSpecs=()=>null',
    '@/lib/maintenance-suggestions':'export const getMaintenanceSuggestions=async()=>[];export const getMaintenanceSchedule=async()=>null;export const renderOpener=()=>"";',
    '@/lib/hub-data':'export const getRecentThreads=async()=>[];export const getTrendingForVehicle=async()=>[];export const getAttachableIssues=async()=>[];',
    '@/lib/owners-manual-schedule':'export const getOwnersManualSchedule=()=>null',
    '@/lib/twin-hub-data':'export const getTwinHubData=(...args)=>globalThis.__hubRoute.twin(...args)',
    '@/components/vehicle/VehicleHub':'export function VehicleHub(){return null}',
    '@/components/twin/LiveTwinHub':'export function LiveTwinHub(){return null}',
    '@/components/twin/OwnerEquipmentConfirmation':'export function OwnerEquipmentConfirmation(){return null}',
    '@/components/twin/OwnerHubSetup':'export function OwnerHubSetup(){return null}',
  };
  const built=await esbuild.build({entryPoints:[path.join(root,'src/app/vehicle/[slug]/page.tsx')],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',tsconfig:path.join(root,'tsconfig.json'),plugins:[{name:'no-io',setup(b){b.onResolve({filter:/.*/},a=>Object.hasOwn(mocks,a.path)?{path:a.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));}}]});
  const mod=new Module(path.join(root,'fixture-hub-route.cjs'));mod.filename=path.join(root,'fixture-hub-route.cjs');mod.paths=Module._nodeModulePaths(root);mod._compile(built.outputFiles[0].text,mod.filename);
  const run=id=>mod.exports.default({params:Promise.resolve({slug:'2015-dodge-challenger-srt-392'}),searchParams:Promise.resolve({vehicleId:id})});
  try{
    const originalTwin=globalThis.__hubRoute.twin;
    globalThis.__hubRoute.twin=async()=>({access:{kind:'denied',reason:'equipment-unconfirmed'},data:null,equipmentSetup:{vehicleId:'second',vehicleRevision:'revision',profile:{id:'profile'},canConfirm:false}});
    await assert.rejects(()=>run('second'),e=>e.href==='/twin/claim');
    globalThis.__hubRoute.twin=async()=>({access:{kind:'denied',reason:'equipment-unconfirmed'},data:null,equipmentSetup:{vehicleId:'second',vehicleRevision:'revision',profile:{id:'profile'},canConfirm:true}});
    assert.equal((await run('second')).type.name,'OwnerEquipmentConfirmation');
    globalThis.__hubRoute.twin=originalTwin;
    let result=await run('second');assert.equal(result.type.name,'OwnerHubSetup');assert.equal(result.props.setup.vehicleId,'second');assert.equal(result.props.setup.needsMileage,true);assert.deepEqual(calls,[{userId:'owner',email:'owner@example.invalid',vehicleId:'second'}]);
    state='allowed';result=await run('second');assert.equal(result.type.name,'LiveTwinHub');assert.equal(result.props.data.vehicleId,'second');
    state='unsupported';await assert.rejects(()=>run('second'),e=>e.href==='/account');
    calls=[];await assert.rejects(()=>run('foreign'),e=>e.href==='/account');assert.deepEqual(calls,[],'a foreign ID never enters owner setup');
  }finally{delete globalThis.__hubRoute;}
});
