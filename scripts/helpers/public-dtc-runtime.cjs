/* Actual source compilation with intercepted database/cache/provider leaves.
 * Fixtures are synthetic; this harness makes no database or provider requests. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const esbuild = require('esbuild');
const React = require('react');
const root = path.resolve(__dirname, '../..');
const leafNames = ['KnownIssueAlertSignup', 'AlertSignupPopup', 'SiteFooter', 'ShareButtons', 'MobileBottomBar', 'AdSlot', 'ReportIssueModal', 'FixIssueModal'];
const entry = `export * from '@/lib/dtc-codes'; export * from '@/lib/known-issue-diagnostics';
export * from '@/data/diagnostic-tools'; export {getKnownIssuesForArticle} from '@/lib/known-issues';
export {default as CodePage,generateMetadata as codeMetadata} from '@/app/known-issues/dtc/[code]/page';
export {default as MakePage,generateMetadata as makeMetadata} from '@/app/known-issues/dtc/[code]/[make]/page';
export {DtcModelSection} from '@/components/known-issues/DtcModelSection';
export {DtcSidebar,DtcMobileToc} from '@/components/known-issues/DtcSidebar';
export {DtcTriageBlock} from '@/components/known-issues/DtcTriageBlock';
export {KnownIssueCard} from '@/components/known-issues/KnownIssueCard';`;
function row(overrides = {}) {
  return {id:'published-issue', vehicleType:'car', make:'Toyota', model:'Camry', years:[2010,2016], trims:[], engines:[],
    category:'engine', title:'Documented timing issue', description:'Owner reports describe a timing fault. Recall eligibility depends on the VIN.',
    solution:'Inspect the timing components and confirm the cause before replacement.', severity:'medium', confidence:0.9,
    symptoms:['Rough idle'], affectedSystems:['engine'], estimatedCostLow:200, estimatedCostHigh:800,
    citations:[], communityRecommendations:[], fixParts:[], diagnosticSteps:[], diagnosticStepsStatus:'pending_review',
    source:'ai-researched', humanApproved:true, lastReportedByOwners:'2026-09-01', reviewedOn:'2026-09-01',
    reportCount:20, status:'published', dtcCodes:['P0016'], createdAt:new Date('2026-09-01'), updatedAt:new Date('2026-09-02'), ...overrides};
}
function triage(overrides = {}) {
  return {code:'P0016', make:'Toyota', intro:'Compare the symptoms before choosing a repair.', firstCheck:'Confirm oil level first.',
    branches:[{issueId:'published-issue',issueTitle:'Documented timing issue',condition:'Rough idle',why:'Timing can affect idle.'}],
    sourceIssueIds:['published-issue'], scanToolNotes:'', status:'published', updatedAt:'2026-09-02T00:00:00.000Z', ...overrides};
}
function plugin(browser=false) {
  return {name:'actual-public-dtc',setup(build) {
    build.onResolve({filter:/.*/},args=>{
      if (!browser && (args.path==='react'||args.path.startsWith('react/')||args.path==='zod')) return {path:args.path,external:true};
      if (args.path==='@/lib/db') return {path:'db',namespace:'fixture'};
      if (args.path==='next/cache') return {path:'cache',namespace:'fixture'};
      if (args.path==='next/link') return {path:'link',namespace:'fixture'};
      if (args.path==='next/image') return {path:'image',namespace:'fixture'};
      if (args.path==='next/navigation') return {path:'navigation',namespace:'fixture'};
      if (leafNames.includes(args.path.split('/').at(-1))) return {path:'leaf',namespace:'fixture'};
      if (args.path==='@/lib/analytics') return {path:'analytics',namespace:'fixture'};
      if (args.path==='next-auth/react') throw Error('Unexpected auth provider');
      if (browser && !args.path.startsWith('.') && !args.path.startsWith('@/') && !path.isAbsolute(args.path)) return {path:require.resolve(args.path)};
      if (args.path.startsWith('@/') || (args.path.startsWith('.') && args.importer)) {
        const base=args.path.startsWith('@/')?path.join(root,'src',args.path.slice(2)):path.resolve(path.dirname(args.importer),args.path);
        for (const ext of ['','.ts','.tsx','.js','.json']) if (fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile()) return {path:base+ext};
        throw Error('Missing source '+args.path);
      }
    });
    build.onLoad({filter:/.*/,namespace:'fixture'},args=>{
      const sources={db:'export default globalThis.__prisma;',cache:'export const unstable_cache=fn=>fn;',
        analytics:'export const trackAffiliateClick=()=>{};', navigation:'export const notFound=()=>{throw Error("FIXTURE_NOT_FOUND")};',
        leaf:leafNames.map(name=>`export const ${name}=()=>null;`).join('\n'),
        link:'import React from "react";export default function Link({href,children,prefetch,...props}){return React.createElement("a",{href,...props},children)}',
        image:'import React from "react";export default function Image({priority,fill,quality,unoptimized,...props}){return React.createElement("img",props)}'};
      assert(Object.hasOwn(sources,args.path)); return {contents:sources[args.path],loader:'tsx',resolveDir:root};
    });
  }};
}
async function compile(contents=entry,browser=false) {
  const result=await esbuild.build({stdin:{contents,loader:'tsx',resolveDir:root},bundle:true,write:false,
    platform:browser?'browser':'node',format:browser?'iife':'cjs',jsx:'automatic',tsconfig:path.join(root,'tsconfig.json'),plugins:[plugin(browser)],logLevel:'silent',
    define:{'process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID':'undefined','process.env.NEXT_PUBLIC_EBAY_MKRID':'undefined',...(browser?{'process.env.NODE_ENV':'"development"'}:{})}});
  return result.outputFiles[0].text;
}
function runtime(compiled,{rows=[row()],triageRow=triage(),thin=false,node='production'}={}) {
  const reads=[];
  const dtc={code:'P0016',name:'Crankshaft/camshaft correlation',system:'Engine',description:'Check timing correlation.',commonCauses:['Timing misalignment'],severity:'medium',createdAt:new Date('2026-09-01'),updatedAt:new Date('2026-09-02')};
  const match=(value,condition)=>typeof condition==='object'&&condition!==null
    ? (condition.equals===undefined || String(value).toLowerCase()===condition.equals.toLowerCase())
      && (condition.in===undefined || condition.in.includes(value)) && (condition.has===undefined || value.includes(condition.has))
      && (condition.startsWith===undefined || value.startsWith(condition.startsWith)) && (condition.not===undefined || value!==condition.not)
    : value===condition;
  const prisma={knownIssue:{findMany:async(args={})=>{
    reads.push(['knownIssue.findMany',args]);
    // Every DTC query must preserve public car-only eligibility.
    assert.equal(args.where?.status,'published'); assert.equal(args.where?.vehicleType,'car');
    let result=rows.filter(item=>Object.entries(args.where||{}).every(([key,val])=>match(item[key],val)));
    if(args.distinct)result=result.filter((item,index)=>result.findIndex(other=>args.distinct.every(key=>item[key]===other[key]))===index);
    return result;
  }},dTCCode:{findUnique:async args=>args.where.code===dtc.code?dtc:null,findMany:async(args={})=>{
    if(args.NOT)return [];
    return !args.where?.code || match(dtc.code,args.where.code)?[dtc]:[];
  }},dtcTriage:{findFirst:async args=>{
    reads.push(['dtcTriage.findFirst',args]); assert.equal(args.where.status,'published');
    return triageRow && match(triageRow.code,args.where.code)&&match(triageRow.make,args.where.make)&&match(triageRow.status,args.where.status)?triageRow:null;
  }},$queryRaw:async(strings)=>{
    const sql=strings.join('?'); reads.push(['sql',sql]); assert.match(sql,/published/); assert.match(sql,/vehicleType[^]*car/);
    if(sql.includes('SELECT DISTINCT make, dtc'))return rows.filter(item=>item.status==='published'&&item.vehicleType==='car').map(item=>({make:item.make,dtc:item.dtcCodes[0]}));
    return thin?[{code:'P0016',make:'Toyota'}]:[];
  }};
  const module={exports:{}};
  const cache=fn=>{const values=new Map();return(...args)=>{const key=JSON.stringify(args);if(!values.has(key))values.set(key,fn(...args));return values.get(key)}};
  vm.runInNewContext(compiled,{module,exports:module.exports,__prisma:prisma,process:{env:{NODE_ENV:node,DTC_DIAG_PREVIEW:'1'}},URL,Date,console,
    require(name){if(name==='react')return {...React,cache};assert(['react/jsx-runtime','zod'].includes(name),name);return require(name)}},{timeout:10000});
  return {api:module.exports,reads};
}
module.exports={root,compile,runtime,row,triage,React};
