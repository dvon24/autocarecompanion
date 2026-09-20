/* Execute the real canonical route function; data and distant component leaves
 * are intercepted. The actual loader/projection and hydrated UI are tested separately. */
const assert=require('node:assert/strict'),test=require('node:test'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),esbuild=require('esbuild'),ts=require('typescript');
require('tsx/cjs');
const {CAR_CATALOG,MOTORCYCLE_CATALOG}=require('../src/lib/known-issues-catalog.ts');
const {KNOWN_ISSUE_TWIN_VISUALS:definitions}=require('../src/lib/known-issue-twin-visuals.ts');
const {compile,runtime}=require('./helpers/public-dtc-runtime.cjs');
const snapshot=require('./fixtures/published-six-content.json');
const root=path.resolve(__dirname,'..'),route=path.join(root,'src/components/known-issues/catalog/ArticleRoute.tsx');
let compiled,all=[];
test.before(async()=>{
  const app=runtime(await compile(`export {getKnownIssuesForArticle} from '@/lib/known-issues';`),{rows:snapshot.rows.map(row=>({...row,vehicleType:'car',reportCount:0,communityRecommendations:[]}))}).api;
  for(const definition of definitions)all.push(...await app.getKnownIssuesForArticle(definition.identity.make,definition.identity.model,'car'));
  const syntax=ts.createSourceFile(route,fs.readFileSync(route,'utf8'),ts.ScriptTarget.Latest,true),leaves={};
  for(const node of syntax.statements)if(ts.isImportDeclaration(node)&&node.moduleSpecifier.text.startsWith('@/components/')){
    const clause=node.importClause,names=clause.namedBindings?.elements?.map(row=>row.propertyName?.text||row.name.text)||[];
    leaves[node.moduleSpecifier.text]=names.map(name=>`export function ${name}(){return null}`).join(';')+(clause.name?';export default function DefaultLeaf(){return null}':'');
  }
  const result=await esbuild.build({entryPoints:[route],bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',packages:'external',tsconfig:path.join(root,'tsconfig.json'),plugins:[{name:'route-fixture',setup(build){
    build.onResolve({filter:/.*/},args=>{
      if(leaves[args.path]!=null)return{path:args.path,namespace:'leaf'};
      if(['@/lib/known-issues','@/lib/recalls','@/lib/dtc-codes','next/headers','next/navigation','next/link','next/image'].includes(args.path))return{path:args.path,namespace:'fixture'};
      if(args.path==='@/lib/db'||args.path==='@/lib/auth')throw Error('Forbidden real database/auth import');
      if(args.path.startsWith('@/')){const base=path.join(root,'src',args.path.slice(2));for(const ext of ['.ts','.tsx','.js','.json'])if(fs.existsSync(base+ext))return{path:base+ext};}
    });
    build.onLoad({filter:/.*/,namespace:'leaf'},args=>({contents:leaves[args.path],loader:'tsx'}));
    build.onLoad({filter:/.*/,namespace:'fixture'},args=>({loader:'tsx',contents:{
      '@/lib/known-issues':`export const parseSlug=async()=>globalThis.__identity;export const getAllKnownIssueSlugs=async()=>[];export const getKnownIssuesForArticle=async()=>globalThis.__issues;export const getArticleDates=async()=>({published:'2026-09-13',modified:'2026-09-13'});export const getRelatedVehicles=async()=>[];export const findRelatedVehiclesForIssues=async()=>new Map();export const getYearRange=rows=>{const years=rows.flatMap(row=>row.vehicleMatch.years);return years.length?{min:Math.min(...years),max:Math.max(...years)}:null;};`,
      '@/lib/recalls':'export const getRecallsForArticle=async()=>[];',
      '@/lib/dtc-codes':'export const getLinkableDtcCodes=async()=>[];',
      'next/headers':'export const headers=async()=>({get:()=>globalThis.__country});',
      'next/navigation':'export const notFound=()=>{throw Error("NOT_FOUND")};',
      'next/link':'export default function Link(){return null}',
      'next/image':'export default function Image(){return null}',
    }[args.path]}));
  }}]});compiled=result.outputFiles[0].text;
});
function walk(node,predicate){if(!node||typeof node!=='object')return[];if(Array.isArray(node))return node.flatMap(item=>walk(item,predicate));return[...(predicate(node)?[node]:[]),...walk(node.props?.children,predicate)];}
async function render(definition,{year=String(definition.year),country='US',flag='true',node='development',isolated='true',query,trim,engine,catalog=CAR_CATALOG,issues}={}){
  const module={exports:{}},env={NODE_ENV:node,AU7O_ISOLATED_SIGNUP_PREVIEW:isolated,KNOWN_ISSUE_TWIN_PILOT_ENABLED:flag,VERCEL:node==='production'?'1':undefined,VERCEL_ENV:'production'};
  const context={module,exports:module.exports,require,console,URL,URLSearchParams,process:{env},__identity:definition.identity,__country:country,__issues:issues||all.filter(row=>row.vehicleMatch.model===definition.identity.model)};
  vm.runInNewContext(compiled,context);return await module.exports.ArticlePage(catalog,{params:Promise.resolve({slug:definition.slug}),searchParams:Promise.resolve({year,twinPilot:query,trim,engine})});
}
for(const definition of definitions)test(`${definition.twinId}: actual ArticleRoute canonical entry and summary fallback`,async()=>{
  const positive=await render(definition),visual=walk(positive,row=>row.type?.name==='KnownIssueTwinPilot');
  assert.equal(visual.length,definition.twinId==='aviator'?0:1);
  if(visual.length){assert.equal(visual[0].props.definition.twinId,definition.twinId);assert.equal(visual[0].props.issues.filter(row=>row.hotspot).length,{nautilus:5,murano:5,xt6:10,kicks:3,mdx:5}[definition.twinId]);}
  for(const options of [{year:String(definition.year+1)},{year:String(definition.year)+'oops'},{trim:'wrong trim'},{engine:'wrong engine'},{node:'production',query:'1',country:'DE'},{node:'production',query:'1',flag:'false'},{catalog:MOTORCYCLE_CATALOG}]){
    const tree=await render(definition,options);assert.equal(walk(tree,row=>row.type?.name==='KnownIssueTwinPilot').length,0);
    assert(walk(tree,row=>row.type==='blockquote').every(row=>row.props.className!=='sr-only'));
  }
  if(definition.twinId!=='aviator'){
    const candidate=all.filter(row=>row.vehicleMatch.model===definition.identity.model&&row.vehicleMatch.years.includes(definition.year));
    const held=candidate.map(row=>({...row,id:'unmapped-'+row.id}));const tree=await render(definition,{issues:held});assert.equal(walk(tree,row=>row.type?.name==='KnownIssueTwinPilot').length,0);assert.equal(walk(tree,row=>row.type==='blockquote')[0].props.className,'border-l-4 border-[#3B82F6] pl-5 mb-10');
    const production=await render(definition,{node:'production',query:'1'});assert.equal(walk(production,row=>row.type?.name==='KnownIssueTwinPilot').length,1);
    assert.equal(walk(positive,row=>row.type?.name==='ArticleIssuesList').length,1);
  }
});
