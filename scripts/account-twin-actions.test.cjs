/* Actual server-page routing and safe-return helpers. All auth/DB/headers are offline fixtures. */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');

async function load() {
  const mocks = {
    '@/lib/auth': 'export async function auth(){globalThis.__twinActions.authReads++;return globalThis.__twinActions.session}',
    '@/lib/db': 'export const prisma=globalThis.__twinActions.db;',
    'next/headers': 'export async function headers(){return new Headers({"x-vercel-ip-country":globalThis.__twinActions.country})}',
    'next/navigation': 'export function redirect(href){throw Object.assign(new Error("redirect"),{href,digest:"NEXT_REDIRECT"})}',
    'next/link': 'export default function Link(props){return props}',
    '@/components/home/HeroReserveForm': 'export function HeroReserveForm(props){return props}',
    './GarageClient': 'export default function GarageClient(){return null}',
    '@/contexts/GarageContext': 'export function GarageProvider({children}){return children}',
  };
  const built = await esbuild.build({stdin:{resolveDir:root,contents:`
    export {default as reserve} from './src/app/reserve/hub/page';
    export {default as garage} from './src/app/garage/page';
    export {default as garageLayout} from './src/app/garage/layout';
    export {default as showcaseLayout} from './src/app/garage/[id]/showcase/layout';
    export {hubReservationNavigation} from './src/lib/hub-reservation-navigation';
  `},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',plugins:[{name:'offline',setup(b){
    b.onResolve({filter:/.*/},a=>Object.hasOwn(mocks,a.path)?{path:a.path,namespace:'fixture'}:undefined);
    b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:mocks[a.path],loader:'js'}));
  }}]});
  const mod=new Module(path.join(root,'fixture-account-twin-actions.cjs'));
  mod.filename=path.join(root,'fixture-account-twin-actions.cjs');mod.paths=Module._nodeModulePaths(root);
  mod._compile(built.outputFiles[0].text,mod.filename);return mod.exports;
}
function elements(node) {
  if(!node || typeof node!=='object')return [];
  if(Array.isArray(node))return node.flatMap(elements);
  return [node,...elements(node.props?.children)];
}

test('account Twin destinations and reservation pages preserve authentication, ownership, and fixed returns',async t=>{
  const priorVercel=process.env.VERCEL;process.env.VERCEL='1';
  t.after(()=>priorVercel===undefined?delete process.env.VERCEL:process.env.VERCEL=priorVercel);
  const vehicle={id:'owned-second',year:2020,make:'Cadillac',model:'XT6',trim:'Sport'};
  let queries=[];
  const f={country:'US',authReads:0,session:{user:{id:'owner',capabilities:{garage:true}}},db:{vehicle:{findFirst:async query=>{
    queries.push(query);assert.equal(query.where.userId,'owner');
    return !query.where.id || query.where.id===vehicle.id?vehicle:null;
  }}}};
  globalThis.__twinActions=f;t.after(()=>delete globalThis.__twinActions);
  const api=await load();
  const reserve=sp=>api.reserve({searchParams:Promise.resolve(sp)});
  const form=node=>elements(node).find(item=>item.type?.name==='HeroReserveForm')?.props;
  const links=node=>elements(node).filter(item=>item.type?.name==='Link').map(item=>item.props);

  await t.test('account marker routes to Account without reading or preselecting a rejected vehicle',async()=>{
    const tree=await reserve({source:'hub-owner',return:'account',intent:'equipment',vehicleId:'foreign'});
    assert.equal(queries.length,0);assert.equal(f.authReads,1);
    assert.deepEqual(form(tree),{source:'hub-owner',ownerReturnHref:'/account?reservation=received',ownerReturnLabel:'Return to Account',equipmentRequest:true,ctaLabel:'Request a Twin',wide:true});
    assert(links(tree).some(link=>link.href==='/account'&&link.children==='Return to Account'));
  });
  await t.test('ordinary owner requests return to the exact owned saved ID',async()=>{
    queries=[];
    const tree=await reserve({source:'hub-owner',vehicleId:vehicle.id});
    assert.deepEqual(queries[0].where,{userId:'owner',id:vehicle.id});
    assert.equal(form(tree).ownerReturnHref,'/vehicle/2020-cadillac-xt6-sport?vehicleId=owned-second&reservation=received');
    assert.equal(form(tree).ownerReturnLabel,'Return to My Hub');
    assert.equal(form(tree).equipmentRequest,false);
  });
  await t.test('foreign saved ID has only the Account fallback',async()=>{
    queries=[];
    const tree=await reserve({source:'hub-owner',vehicleId:'foreign'});
    assert.deepEqual(queries[0].where,{userId:'owner',id:'foreign'});
    assert.equal(form(tree).ownerReturnHref,'/account?reservation=received');
    assert.equal(form(tree).ownerReturnLabel,'Return to Account');
  });
  await t.test('raw URLs and malformed account markers cannot redirect outside the application',async()=>{
    for(const marker of ['https://evil.invalid','//evil.invalid','account?next=evil',['account'],null,undefined]){
      const nav=api.hubReservationNavigation(marker,vehicle);
      assert.equal(nav.beforeHref,'/vehicle/2020-cadillac-xt6-sport?vehicleId=owned-second');
    }
    const tree=await reserve({source:'hub-owner',return:'https://evil.invalid',vehicleId:vehicle.id,intent:'equipment'});
    assert.equal(form(tree).equipmentRequest,false);
    assert(!JSON.stringify(form(tree)).includes('evil.invalid'));
  });
  await t.test('anonymous owner entry never reads a vehicle, retains only gated Account destination',async()=>{
    const session=f.session;f.session=null;queries=[];
    try{const tree=await reserve({source:'hub-owner',vehicleId:vehicle.id});assert.equal(queries.length,0);assert.equal(form(tree).ownerReturnHref,'/account?reservation=received');}
    finally{f.session=session;}
  });
  await t.test('ineligible regions show no reservation form and a safe Account return without auth or vehicle reads',async()=>{
    for(const country of ['DE','', 'UNKNOWN']){
      f.country=country;f.authReads=0;queries=[];
      const tree=await reserve({source:'hub-owner',return:'account',intent:'equipment'});
      assert.equal(form(tree),undefined);assert.equal(f.authReads,0);assert.equal(queries.length,0);
      assert(links(tree).some(link=>link.href==='/account'));
    }
    f.country='US';
  });
  await t.test('demo and public requests never accept owner-return markers',async()=>{
    f.authReads=0;queries=[];
    for(const source of ['hub-demo','unknown']){
      const tree=await reserve({source,return:'account',intent:'equipment',vehicleId:vehicle.id});
      assert.equal(form(tree).ownerReturnHref,undefined);assert.equal(form(tree).equipmentRequest,false);
      assert(links(tree).some(link=>link.href==='/'));
    }
    assert.equal(f.authReads,0);assert.equal(queries.length,0);
  });
  await t.test('legacy add/empty reach Account and explicit settings preserve paid guards without old add editor',async()=>{
    for(const sp of [{add:'1'},{add:'1',manage:'1'}]){
      queries=[];await assert.rejects(()=>api.garage({searchParams:Promise.resolve(sp)}),e=>e.href==='/account');assert.equal(queries.length,0);
    }
    queries=[];const settings=await api.garage({searchParams:Promise.resolve({manage:'1'})});
    assert.equal(settings.type.name,'GarageClient');assert.equal(settings.props.ownerSettings,true);assert.equal(queries.length,0);
    await assert.rejects(()=>api.garage({searchParams:Promise.resolve({})}),e=>e.href==='/vehicle/2020-cadillac-xt6-sport?vehicleId=owned-second');
    const find=f.db.vehicle.findFirst;f.db.vehicle.findFirst=async()=>null;
    try{await assert.rejects(()=>api.garage({searchParams:Promise.resolve({})}),e=>e.href==='/account');}finally{f.db.vehicle.findFirst=find;}
    f.session.user.capabilities.garage=false;queries=[];
    await assert.rejects(()=>api.garage({searchParams:Promise.resolve({manage:'1'})}),e=>e.href==='/account');
    await assert.rejects(()=>api.showcaseLayout({children:'private'}),e=>e.href==='/account');assert.equal(queries.length,0);
    assert.equal(api.garageLayout({children:'vehicle-scoped child'}).props.children,'vehicle-scoped child');
    f.session=null;
    assert.equal((await api.garage({searchParams:Promise.resolve({add:'1'})})).type.name,'GarageClient');
  });
});
