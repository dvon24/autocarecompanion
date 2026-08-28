import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { DEFAULT_TWIN_ID, VEHICLE_TWIN_CATALOG, getAdminTwinDefinitions, getTwinByFulfillmentId, resolveDemoVehicleTwin, resolveTwinDeepLink, validateVehicleTwinCatalog } from '../src/lib/vehicle-twin-catalog';
import { evaluateTwinAccess, getConfirmedTwinTransmission } from '../src/lib/twin-access';
import { TWIN_TREE_RESOLVERS, answerTwinQuestion, buildDemoTwinPresentation, collectHotspotNodes, mergeCatalogEvidenceIntoOwnerTrees, resolveTwinTrees, summarizeEvidence } from '../src/components/twin/demo-trees.js';
import { addCalendarInterval, buildTwinTrees, servicedFromRecords } from '../src/components/twin/twin-trees.js';
import { TWIN_UNAVAILABLE_VEHICLE, TwinDataCtx, useTwinLive, useTwinMiles, useTwinMode, useTwinVehicle } from '../src/components/twin/twin-context.jsx';
import { TH_DOT, TwinStage, retainActiveHotspot, resolveActiveTwinEffect, thHot } from '../src/components/twin/stage/TwinStage.jsx';
import { TechTree, TTDetail, resolveAvailableTwinBranch, ttMatchesIntent, ttRisk, ttRiskLabel } from '../src/components/twin/stage/TechTree.jsx';
import { HubMinimal } from '../src/components/twin/hub/HubMinimal.jsx';
import { THSidebar, mobileComposerPlaceholder } from '../src/components/twin/hub/Hub.jsx';
import { buildOwnerTwinValue, FounderTransmissionPickerView, getFounderTransmissionPickerModel, pickNextService, saveFounderTransmission, suppressTwinTransmissionWhilePending } from '../src/components/twin/LiveTwinHub.jsx';
import { HERO_MARKER_VISUALS, TWIN_STAGE_FRAME_STYLE } from '../src/components/home/RotatingTwinStage';
import { demoHubHref } from '../src/components/home/TwinHero';
import { TwinAdminShell, TwinSelectedPreview } from '../src/components/admin/twins/TwinAdminShell';
import type { TwinMarkerEvidence } from '../src/components/twin/stage/TwinMarker';
import { resolveTwinTransmissionBranch, sameTwinVehicleIdentity } from '../src/lib/twin-fulfillment';
import { isLoggableMaintenanceType, maintenanceTypeMatchesTransmission, resolveMaintenanceWriteType } from '../src/lib/maintenance';
import { buildLatestTwinServiceRecordQuery, getTwinHubData, loadLatestTwinServiceRecords, TWIN_SERVICE_RECORD_TYPES, twinServiceRecordTypesForBranch } from '../src/lib/twin-hub-data';

type ServiceEvidence = Record<string, { mileage: number; date: string | null; nextDueMileage: number | null; nextDueDate: string | null }>;
type TestTreeSet = Record<string, { nodes: Record<string, { overdueByDate?: boolean; dueNote?: string }> }>;
type LooseTreeSet = Record<string, { root: string; nodes: Record<string, Record<string, unknown>> }>;
type NextServiceResult = { nodeId: string; overdue: boolean; dueMileage: number | null; dueDate: string | null; dueSource: string; progress: number };
const foldServiceRecords = servicedFromRecords as unknown as (records: Array<Record<string, unknown>>, mileage: number, transmission?: 'automatic' | 'manual' | null, evaluatedAt?: string | null) => ServiceEvidence;
const buildTestTrees = buildTwinTrees as unknown as (serviced: ServiceEvidence, mileage: number, transmission: 'automatic' | 'manual' | null, evaluatedAt?: string | null) => TestTreeSet;
const pickTestNextService = pickNextService as unknown as (trees: LooseTreeSet, miles: number, evaluatedAt?: string | null) => NextServiceResult | null;
const testHotspotEvidence = thHot as unknown as (hotspot: Record<string, unknown>, equipped: Record<string, boolean>, trees: LooseTreeSet, miles: number) => TwinMarkerEvidence & { due: number | null } | null;
const testRiskLabel = ttRiskLabel as unknown as (node: Record<string, unknown>, miles: number, risk: 'critical' | 'watch') => string | null;
const TestTechTree = TechTree as unknown as React.ComponentType<{ branch: string; setBranch: (branch: string) => void; miles: number; onClose: () => void; say: (message: string) => void; startNode: string; compact: boolean; detailMode: string; vertical: boolean }>;

test('mobile twin surfaces keep mode copy and artwork inside a shared responsive frame', () => {
  assert.equal(mobileComposerPlaceholder('demo', 'Nautilus'), 'Ask about this Nautilus demo…');
  assert.equal(mobileComposerPlaceholder('owner', 'Challenger'), 'Ask about your car…');
  assert.equal(TWIN_STAGE_FRAME_STYLE.width, '100%');
  assert.equal(TWIN_STAGE_FRAME_STYLE.minWidth, 0);
  assert.equal(TWIN_STAGE_FRAME_STYLE.aspectRatio, '16 / 9');
  assert.equal('minHeight' in TWIN_STAGE_FRAME_STYLE, false);

  const hubSource = readFileSync(path.join(process.cwd(), 'src/components/twin/hub/Hub.jsx'), 'utf8');
  const mobileBody = hubSource.slice(hubSource.indexOf('function THMobile'), hubSource.indexOf('function HubTechTree'));
  assert.match(mobileBody, /const twinMode = useTwinMode\(\)/);
  assert.match(mobileBody, /twinMode === "owner" \? `your \$\{vehicle\.model\}` : `this \$\{vehicle\.model\} demo`/);
});

test('hero demo CTA and marker vocabulary follow selected truthful catalog state', () => {
  for (const twin of VEHICLE_TWIN_CATALOG) {
    assert.equal(demoHubHref(twin.id), `/demo/hub?vehicle=${twin.id}`);
  }
  assert.equal(HERO_MARKER_VISUALS['known-issue'].icon, 'shield-alert');
  assert.equal(HERO_MARKER_VISUALS['known-issue'].edge, '#A78BFA');
  assert.equal(HERO_MARKER_VISUALS.overdue.icon, 'alert');
  assert.equal(HERO_MARKER_VISUALS.overdue.edge, '#FF6B63');
  assert.equal(HERO_MARKER_VISUALS.unavailable.icon, 'minus');
  assert.equal(HERO_MARKER_VISUALS.unlogged.icon, 'minus');
  assert.equal(TH_DOT({ risk:true, knownIssue:true }).icon, 'shield-alert');
  assert.equal(TH_DOT({ risk:false, knownIssue:true }).icon, 'shield-alert');
  assert.equal(TH_DOT({ risk:false, knownIssue:false, unavailable:true }).icon, 'minus');

  const heroSource = readFileSync(path.join(process.cwd(), 'src/components/home/TwinHero.tsx'), 'utf8');
  const stageSource = readFileSync(path.join(process.cwd(), 'src/components/home/RotatingTwinStage.tsx'), 'utf8');
  assert.match(heroSource, /<RotatingTwinStage onSelectedVehicleChange=\{setSelectedTwinId\} \/>/);
  assert.match(heroSource, /<Reserve selectedTwin=\{selectedTwin\} \/>/);
  assert.match(stageSource, /const markers = twin\.hotspots;/);
  assert.match(stageSource, /<TwinMarkerDot evidence=\{hotspot\}/);
  assert.doesNotMatch(stageSource, /hotspots\.filter\(\(hotspot\) => twin\.art\.effects/);
});

const publicPath=(value:string)=>path.join(process.cwd(),'public',value.replace(/^\//,''));
test('catalog validates, fulfillment null stays null, and every target is real',()=>{
  assert.deepEqual(validateVehicleTwinCatalog(),[]);
  assert.equal(getTwinByFulfillmentId(null),null);
  assert.equal(getTwinByFulfillmentId(undefined),null);
  for(const twin of VEHICLE_TWIN_CATALOG){
    assert.equal(typeof (TWIN_TREE_RESOLVERS as Record<string, unknown>)[twin.treeResolver],'function');
    const trees=resolveTwinTrees(twin);assert.equal(trees.car.nodes[trees.car.root].img,twin.art.base);
    for(const hot of twin.hotspots){const target=resolveTwinDeepLink(twin,hot.id);assert.ok(target.branch&&trees[target.branch]);if(target.node)assert.ok(trees[target.branch].nodes[target.node]);}
    for(const system of twin.systems){assert.ok(twin.hotspots.some((hot)=>hot.id===system.hot));assert.ok(trees[system.branch]);}
    for(const record of twin.sampleState.records){assert.ok(record.intervalMiles>0);assert.ok(record.lastServiceMileage>=0);assert.match(record.sourceUrl,/^https:\/\//);assert.ok(record.sourceSection.length>3);}
  }
  assert.equal(resolveDemoVehicleTwin('unknown').id,DEFAULT_TWIN_ID);
});

test('five Challenger assets register full-resolution and effects remain localized RGBA',async()=>{
  const twin=resolveDemoVehicleTwin('challenger');
  const paths=[twin.art.base,...Object.values(twin.art.effects)];assert.equal(paths.length,5);
  const base=await sharp(publicPath(twin.art.base)).metadata();assert.equal(base.width,1672);assert.equal(base.height,941);
  for(const effectPath of Object.values(twin.art.effects)){assert.ok(existsSync(publicPath(effectPath)));const meta=await sharp(publicPath(effectPath)).metadata();assert.equal(meta.width,base.width);assert.equal(meta.height,base.height);assert.equal(meta.channels,4);const {data,info}=await sharp(publicPath(effectPath)).ensureAlpha().raw().toBuffer({resolveWithObject:true});let visible=0;for(let i=3;i<data.length;i+=4)if(data[i]>5)visible++;assert.ok(visible/(info.width*info.height)<.4);}
});

test('opaque art has masks, full URLs are preserved, and absent effects are not markers',()=>{
  for(const twin of VEHICLE_TWIN_CATALOG.filter((entry)=>entry.art.strategy==='opaque-masked'))for(const id of Object.keys(twin.art.effects))assert.ok(twin.art.masks?.[id]);
  for(const twin of VEHICLE_TWIN_CATALOG){assert.match(twin.art.base,/^\/twin-stage\//);assert.doesNotMatch(twin.art.base,/thumb/);}
  assert.equal(resolveDemoVehicleTwin('challenger').art.effects.airbox,undefined);
});

test('published known issues and sample service evidence drive tree/catalog parity',()=>{
  for(const twin of VEHICLE_TWIN_CATALOG){const trees=resolveTwinTrees(twin);const presentation=buildDemoTwinPresentation(twin);assert.equal(twin.sampleState.label,'Sample demo state');assert.ok(twin.sampleState.records.length>0);for(const hot of twin.hotspots){const nodes=collectHotspotNodes(trees,hot);const ids=nodes.flatMap((node)=>node.knownIssue?.id?[node.knownIssue.id]:[]);assert.deepEqual([...ids].sort(),[...(hot.knownIssueIds||[])].sort(),`${twin.id}/${hot.id}`);assert.equal(hot.status==='known-issue',ids.length>0);assert.equal(presentation.hotspots.find((item:{id:string})=>item.id===hot.id).status,hot.status);if(hot.status==='overdue')assert.ok(typeof twin.demoMileage==='number'&&nodes.some((node)=>typeof node.riskAt==='number'&&typeof node.servicedAt==='number'&&node.servicedAt+node.riskAt<=twin.demoMileage!));}}
  const murano=resolveDemoVehicleTwin('murano');const trees=resolveTwinTrees(murano);assert.equal(trees.trans.nodes.transFluid.knownIssue,undefined);assert.equal(trees.trans.nodes.transFluid.sampleRecord,true);assert.match(trees.trans.nodes.transFluid.sub,/Sample record/);
  const challenger=buildDemoTwinPresentation(resolveDemoVehicleTwin('challenger'));const trans=challenger.hotspots.find((hot:{id:string})=>hot.id==='trans');assert.equal(trans.status,'known-issue');assert.equal(trans.serviceStatus,'overdue');assert.match(trans.label,/Known issue on record.*overdue/i);
  const challengerTwin=resolveDemoVehicleTwin('challenger');assert.equal(challengerTwin.sampleState.records.find((record)=>record.node==='oilFluid')?.intervalMiles,6000);assert.match(challengerTwin.hotspots.find((hot)=>hot.id==='wheel')?.statusDetail||'',/no sample service event logged/i);
  const muranoRecord=resolveDemoVehicleTwin('murano').sampleState.records;assert.equal(muranoRecord.find((record)=>record.node==='tire')?.intervalMiles,7500);assert.equal(muranoRecord.find((record)=>record.node==='transFluid')?.intervalMiles,60000);
});

test('every demo shield resolves to a published snapshot row applicable to that vehicle',()=>{
  const snapshot=JSON.parse(readFileSync(path.join(process.cwd(),'data/known-issues-catalog-deeplink-snapshot-2026-07-17.json'),'utf8'));
  assert.match(snapshot.source,/live published KnownIssue rows/);
  const rows=new Map(snapshot.records.map((row:{id:string})=>[row.id,row]));
  for(const twin of VEHICLE_TWIN_CATALOG)for(const id of twin.hotspots.flatMap((hot)=>hot.knownIssueIds||[])){
    const row=rows.get(id) as {vehicle:{year?:number;years:number[];make:string;model:string;trims?:string[]}}|undefined;
    assert.ok(row,`${id} is not published in the catalog snapshot`);
    assert.equal(row.vehicle.make,twin.identity.make,id);assert.equal(row.vehicle.model,twin.identity.model,id);assert.ok(row.vehicle.years.includes(twin.identity.year),id);
    if(row.vehicle.trims?.length){const trim=twin.identity.trim.toLowerCase();assert.ok(row.vehicle.trims.some((candidate)=>candidate.toLowerCase().includes(trim)||trim.includes(candidate.toLowerCase())),`${id} excludes ${twin.identity.trim}`);}
  }
});

test('structure twins stay neutral and missing transmission is filtered',()=>{
  for(const twin of VEHICLE_TWIN_CATALOG.filter((entry)=>entry.treeStatus==='structure-only')){const p=buildDemoTwinPresentation(twin);assert.ok(p.hotspots.every((hot:{status:string})=>hot.status==='unavailable'));assert.equal(p.mileage,null);assert.equal(p.mileageLabel,'Mileage unavailable');assert.ok(p.systems.every((system:{branch:string})=>system.branch!=='trans'));}
});

test('owner evidence merge preserves catalog issues and rejects future records',()=>{
  const serviced=foldServiceRecords([{type:'oil_change',mileage:70000},{type:'oil_change',mileage:50000}],65000);
  assert.equal(serviced.oilFluid.mileage,50000);assert.equal(serviced.oilFilter.mileage,50000);assert.equal(serviced.oilPlug.mileage,50000);
  const twin=resolveDemoVehicleTwin('challenger');const owner=resolveTwinTrees(twin);owner.wheel.nodes.rotor.knownIssue=undefined;owner.engine.nodes.oilFluid.servicedAt=70000;owner.engine.nodes.oilFluid.riskAt=6000;
  const merged=mergeCatalogEvidenceIntoOwnerTrees(twin,owner,65000);assert.equal(merged.wheel.nodes.rotor.knownIssue.id,'dodge-challenger-warped-front-brake-rotors-causing-pedal-pulsation-steering-s');assert.equal(merged.engine.nodes.oilFluid.servicedAt,undefined);assert.equal(merged.engine.nodes.oilFluid.unlogged,true);assert.equal(merged.car.nodes.car.partNo,undefined);assert.equal(merged.car.nodes.car.spec,undefined);assert.match(merged.car.nodes.car.sub,/Owner/);
});

test('shared summaries never claim false zero and selected presentation drives chrome/sidebar data',()=>{
  const empty=summarizeEvidence([{id:'x',label:'X',unlogged:true}],65000);assert.equal(empty.status,'unlogged');assert.equal(empty.label,'No service event logged');assert.equal(empty.due,null);assert.equal(empty.watch,null);
  const partial=summarizeEvidence([{id:'x',label:'X',riskAt:10000,servicedAt:5000},{id:'y',label:'Y',riskAt:10000,unlogged:true}],12000);assert.equal(partial.status,'unlogged');assert.equal(partial.label,'Service history incomplete');assert.equal(partial.due,null);assert.equal(partial.watch,null);
  const coexist=summarizeEvidence([{id:'x',label:'X',riskAt:10000,unlogged:true,knownIssue:{id:'issue-x'}}],12000);assert.equal(coexist.status,'known-issue');assert.match(coexist.label,/Known issue on record.*No service event logged/);assert.equal(coexist.serviceStatus,'unlogged');assert.equal(coexist.due,null);assert.deepEqual(coexist.knownIssues,[{id:'issue-x'}]);
  const mixed=summarizeEvidence([{id:'x',label:'X',riskAt:10000,servicedAt:5000,overdueByDate:true,knownIssue:{id:'issue-x'}},{id:'y',label:'Y',riskAt:10000,unlogged:true}],12000);assert.equal(mixed.status,'known-issue');assert.equal(mixed.serviceStatus,'overdue');assert.match(mixed.label,/Known issue on record.*1 overdue.*history incomplete/i);assert.equal(mixed.due,null);assert.equal(mixed.watch,null);
  const murano=buildDemoTwinPresentation(resolveDemoVehicleTwin('murano'));assert.match(murano.chrome,/Murano demo/);assert.equal(murano.wholeCarArt,'/twin-stage/murano/base-red.webp');assert.equal(murano.recent.length,0);assert.equal(murano.nextService,null);assert.ok(murano.systems.some((system:{branch:string})=>system.branch==='trans'));
  const ownerTrees={engine:{root:'oil',nodes:{oil:{label:'Engine oil',kids:[],servicedAt:23000,riskAt:6000,unlogged:false,availability:'owner'}}}} as unknown as LooseTreeSet;const ownerHot=testHotspotEvidence({id:'hood',branch:'engine',node:'oil',status:'overdue'}, {}, ownerTrees, 24000);assert.equal(ownerHot?.status,'on-track');assert.equal(TH_DOT(ownerHot||{}).icon,'check');
});

test('assistant is selected-tree and field safe',()=>{
  for(const twin of VEHICLE_TWIN_CATALOG){const trees=resolveTwinTrees(twin);for(const query of ['oil','transmission','unknown field']){const answer=answerTwinQuestion(twin,trees,query);assert.match(answer,new RegExp(twin.identity.model,'i'));assert.doesNotMatch(answer,/undefined|null|Mopar.*(?:Nautilus|Murano|XT6)/i);}}
});

test('access matrix separates founder, claimable, customer, expired, and malformed states',()=>{
  const now=new Date('2026-08-25T00:00:00Z');
  const common={supported:true,garageMatches:true,positiveMileage:true,assignmentMatches:true,requiresTransmissionChoice:true,customerTransmissionMatches:true,now};
  const founder=evaluateTwinAccess({...common,founder:true,reservation:null});assert.equal(founder.kind,'allowed');assert.equal(founder.reason,'allowed-founder');
  assert.equal(evaluateTwinAccess({...common,founder:true,garageMatches:false,reservation:null}).reason,'garage-mismatch');
  assert.equal(evaluateTwinAccess({...common,founder:true,positiveMileage:false,reservation:null}).reason,'missing-mileage');
  assert.equal(evaluateTwinAccess({...common,founder:true,supported:false,reservation:null}).reason,'unsupported-vehicle');

  const ready={twinStatus:'ready',transmission:'automatic',trialDays:7,claimedAt:null,vehicleVerified:true,year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true};
  assert.equal(getConfirmedTwinTransmission(ready,true),'automatic');
  assert.equal(getConfirmedTwinTransmission(ready,false),null);
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:ready}).kind,'claimable');
  assert.equal(evaluateTwinAccess({...common,founder:false,requiresTransmissionChoice:false,reservation:{...ready,transmission:null}}).kind,'claimable');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,transmission:null}}).reason,'transmission-unconfirmed');
  assert.equal(evaluateTwinAccess({...common,founder:false,assignmentMatches:false,reservation:ready}).reason,'assignment-mismatch');

  for(const transmission of ['automatic','manual']){
    const claim={twinStatus:'claimed',transmission,trialDays:30,claimedAt:'2026-08-20T00:00:00Z',vehicleVerified:true,year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true};
    assert.equal(evaluateTwinAccess({...common,founder:false,reservation:claim}).kind,'allowed');
  }
  const claimed={twinStatus:'claimed',transmission:'automatic',trialDays:30,claimedAt:'2026-08-20T00:00:00Z',vehicleVerified:true,year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true};
  assert.equal(evaluateTwinAccess({...common,founder:false,customerTransmissionMatches:false,reservation:claimed}).reason,'transmission-mismatch');
  assert.equal(evaluateTwinAccess({...common,founder:false,customerTransmissionMatches:false,reservation:{...claimed,twinStatus:'ready',claimedAt:null}}).kind,'claimable');
  const singleTransmissionClaim={twinStatus:'claimed',transmission:null,trialDays:30,claimedAt:'2026-08-20T00:00:00Z',vehicleVerified:true,year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',trimVerified:true};
  assert.equal(evaluateTwinAccess({...common,founder:false,requiresTransmissionChoice:false,reservation:singleTransmissionClaim}).kind,'allowed');
  for(const status of [null,'reserved','building','cancelled','unknown'])assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,twinStatus:status}}).reason,'status-not-eligible');
  for(const trialDays of [null,0,8,31,Number.NaN])assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,trialDays}}).reason,'invalid-trial-duration');
  assert.equal(evaluateTwinAccess({...common,founder:false,requiresTransmissionChoice:false,reservation:{...singleTransmissionClaim,claimedAt:null}}).reason,'claim-timestamp-missing');
  assert.equal(evaluateTwinAccess({...common,founder:false,requiresTransmissionChoice:false,reservation:{...singleTransmissionClaim,claimedAt:'not-a-date'}}).reason,'claim-timestamp-invalid');
  assert.equal(evaluateTwinAccess({...common,founder:false,requiresTransmissionChoice:false,reservation:{...singleTransmissionClaim,claimedAt:'2026-08-26T00:00:00Z'}}).reason,'claim-timestamp-future');
  assert.equal(evaluateTwinAccess({...common,founder:false,requiresTransmissionChoice:false,reservation:{...singleTransmissionClaim,trialDays:7,claimedAt:'2026-08-18T00:00:00Z'}}).reason,'claim-expired');
  assert.equal(evaluateTwinAccess({...common,founder:false,requiresTransmissionChoice:false,reservation:singleTransmissionClaim,now:new Date(Number.NaN)}).reason,'invalid-current-time');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,vehicleVerified:false}}).reason,'vehicle-unverified');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,year:Number.NaN}}).reason,'vehicle-unverified');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,make:'  '}}).reason,'vehicle-unverified');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,model:''}}).reason,'vehicle-unverified');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,trim:'  '}}).reason,'trim-unverified');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,trimVerified:false}}).reason,'trim-unverified');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,trimVerified:undefined}}).reason,'trim-unverified');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:{...ready,trim:null,trimVerified:null}}).reason,'trim-unverified');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:ready,garageMatches:undefined} as never).reason,'garage-mismatch');
  assert.equal(evaluateTwinAccess({...common,founder:false,reservation:ready,now:undefined} as never).reason,'invalid-current-time');
  assert.ok(sameTwinVehicleIdentity({year:2015,make:' Dodge ',model:'Challenger',trim:'SRT_392'},{year:2015,make:'dodge',model:'challenger',trim:'srt 392'}));
  assert.equal(sameTwinVehicleIdentity({year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392'},{year:2015,make:'Dodge',model:'Challenger',trim:'R/T'}),false);
});

test('owner builder requires exact registered identity and keeps transmission branches exact',()=>{
  const base={fulfillmentId:'dodge-challenger',vehicleId:'v1',vehicle:{year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',engine:'6.4L V8 HEMI'},miles:65000,records:[],recent:[]};
  const automatic=buildOwnerTwinValue({...base,transmission:'automatic'});assert.ok(automatic);assert.match(automatic.trees.trans.nodes.trx.sub,/automatic/i);assert.match(automatic.trees.trans.nodes.transFluid.buyLabel,/automatic/i);assert.equal(automatic.trees.car.nodes.transFluid,automatic.trees.trans.nodes.transFluid);
  const manual=buildOwnerTwinValue({...base,transmission:'manual'});assert.ok(manual);assert.match(manual.trees.trans.nodes.trx.sub,/manual/i);assert.match(manual.trees.trans.nodes.transFluid.buyLabel,/manual/i);assert.equal(manual.trees.trans.nodes.transPan,undefined);assert.equal(manual.trees.car.nodes.transPan,undefined);assert.equal(manual.trees.car.nodes.transFluid,manual.trees.trans.nodes.transFluid);
  const unknown=buildOwnerTwinValue({...base,transmission:null});assert.ok(unknown);assert.equal(unknown.trees.trans,undefined);assert.ok(!unknown.trees.car.nodes.car.kids.includes('trx'));assert.ok(unknown.presentation.systems.every((system:{branch:string})=>system.branch!=='trans'));assert.ok(unknown.presentation.hotspots.every((hotspot:{branch:string})=>hotspot.branch!=='trans'));assert.doesNotMatch(JSON.stringify(unknown.trees),/transmission|ATF\+?4|automatic|manual|buyUrl/i);
  assert.ok(unknown.catalog.systems.every((system:{branch:string})=>system.branch!=='trans'));assert.ok(unknown.catalog.hotspots.every((hotspot:{branch:string})=>hotspot.branch!=='trans'));assert.deepEqual(resolveTwinDeepLink(unknown.catalog,'trans',unknown.trees),{hotspot:null,branch:null,node:null});
  const partial=buildOwnerTwinValue({...base,transmission:'automatic',records:[{type:'oil_change',mileage:64000}]});assert.ok(partial);assert.equal(partial.presentation.summary.due,null);assert.equal(partial.presentation.summary.watch,null);assert.notEqual(partial.presentation.hotspots.find((hotspot:{id:string})=>hotspot.id==='hood')?.status,'overdue');
  assert.equal(buildOwnerTwinValue({...base,fulfillmentId:'unknown-owner'}),null);
  assert.equal(buildOwnerTwinValue({...base,vehicle:{...base.vehicle,model:'Camaro'}}),null);
});

test('registered transmission rules fail closed and pending refresh removes the old branch',()=>{
  const definition={id:'test',label:'Test',make:'dodge',model:'challenger',yearFrom:2015,yearTo:2015,trims:['srt 392'],live:true,transmissions:['automatic','manual'] as const};
  assert.deepEqual(resolveTwinTransmissionBranch(definition,null),{branch:null,requiresChoice:true,options:['automatic','manual']});
  assert.equal(resolveTwinTransmissionBranch(definition,'manual').branch,'manual');
  assert.deepEqual(resolveTwinTransmissionBranch({...definition,transmissions:['automatic']},null),{branch:'automatic',requiresChoice:false,options:['automatic']});
  assert.deepEqual(resolveTwinTransmissionBranch({...definition,transmissions:[]},'automatic'),{branch:null,requiresChoice:false,options:[]});
  const data={transmission:'automatic',vehicleId:'v1'};assert.equal(suppressTwinTransmissionWhilePending(data,false),data);assert.equal(suppressTwinTransmissionWhilePending(data,true).transmission,null);
  const hotspots=[{id:'hood'},{id:'wheel'}];assert.equal(retainActiveHotspot('hood',hotspots),'hood');assert.equal(retainActiveHotspot('trans',hotspots),null);assert.equal(retainActiveHotspot(null,hotspots),null);
  assert.equal(resolveActiveTwinEffect('hotspots','hood',{hood:'/hood.webp'}),'hood');
  assert.equal(resolveActiveTwinEffect('hotspots','trans',{hood:'/hood.webp'}),null);
  assert.equal(resolveActiveTwinEffect('rail','hood',{hood:'/hood.webp'}),null);
});

test('service evidence is branch-specific, rejects future records, and keeps date deadlines',()=>{
  const now='2026-08-26T00:00:00.000Z';
  const records=[
    {type:'transmission_fluid',mileage:59000,date:'2026-03-01T00:00:00.000Z'},
    {type:'transmission_fluid_auto',mileage:50000,date:'2026-01-01T00:00:00.000Z'},
    {type:'transmission_fluid_manual',mileage:51000,date:'2026-02-01T00:00:00.000Z'},
    {type:'oil_change',mileage:52000,date:'2026-01-01T00:00:00.000Z',nextDueDate:'2026-07-01T00:00:00.000Z'},
    {type:'air_filter',mileage:53000,date:'2027-01-01T00:00:00.000Z'},
  ];
  const automatic=foldServiceRecords(records,60000,'automatic',now);assert.equal(automatic.transFluid.mileage,50000);assert.equal(automatic.transPan.mileage,50000);assert.equal(automatic.airFilter,undefined);
  const manual=foldServiceRecords(records,60000,'manual',now);assert.equal(manual.transFluid.mileage,51000);assert.equal(manual.transPan,undefined);
  const automaticTrees=buildTestTrees(automatic,60000,'automatic',now);assert.equal(automaticTrees.engine.nodes.oilFluid.overdueByDate,true);assert.match(automaticTrees.engine.nodes.oilFluid.dueNote || '',/time interval passed/i);
  const evidence=summarizeEvidence([automaticTrees.engine.nodes.oilFluid],60000);assert.equal(evidence.status,'overdue');assert.equal(evidence.due,1);
  assert.equal(isLoggableMaintenanceType('transmission_fluid_auto'),true);assert.equal(isLoggableMaintenanceType('transmission_fluid_manual'),true);
  assert.equal(isLoggableMaintenanceType('__proto__'),false);assert.equal(isLoggableMaintenanceType('constructor'),false);
  assert.equal(maintenanceTypeMatchesTransmission('transmission_fluid_auto','automatic'),true);assert.equal(maintenanceTypeMatchesTransmission('transmission_fluid_auto','manual'),false);assert.equal(maintenanceTypeMatchesTransmission('transmission_fluid','manual'),true);
  const dual={year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392'};
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',{...dual,transmission:'automatic'}),{ok:true,type:'transmission_fluid_auto'});
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',{...dual,transmission:'manual'}),{ok:true,type:'transmission_fluid_manual'});
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',{...dual,transmission:null}),{ok:false,reason:'transmission-unselected'});
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid_auto',{...dual,transmission:'manual'}),{ok:false,reason:'transmission-mismatch'});
  const singleDefinition={id:'single',label:'Single',make:'lincoln',model:'nautilus',yearFrom:2019,yearTo:2019,trims:['reserve'],live:true,transmissions:['automatic'] as const};
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',{year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:null},singleDefinition),{ok:true,type:'transmission_fluid_auto'});
  assert.deepEqual(resolveMaintenanceWriteType('__proto__',{...dual,transmission:'automatic'}),{ok:false,reason:'invalid-type'});
});

test('latest eligible supported history is bounded per type and shared annotations stay shared',async()=>{
  const records=Array.from({length:250},(_,index)=>({type:'unrelated',mileage:index,date:'2026-01-01T00:00:00.000Z'}));
  records.push({type:'oil_change',mileage:55000,date:'2026-05-01T00:00:00.000Z'});
  const folded=foldServiceRecords(records,60000,'automatic','2026-08-26T00:00:00.000Z');assert.equal(folded.oilFluid.mileage,55000);
  const now=new Date('2026-08-26T00:00:00.000Z');
  const queries:Array<ReturnType<typeof buildLatestTwinServiceRecordQuery>>=[];
  const latest=await loadLatestTwinServiceRecords('v1',60000,now,async(query)=>{
    queries.push(query);
    return query.where.type==='oil_change'
      ? {id:'oil-1',type:'oil_change',mileage:55000,date:new Date('2026-05-01T00:00:00.000Z'),nextDueMileage:61000,nextDueDate:null}
      : null;
  });
  assert.equal(queries.length,TWIN_SERVICE_RECORD_TYPES.length);assert.equal(latest.length,1);assert.equal(latest[0].type,'oil_change');
  assert.deepEqual(new Set(queries.map((query)=>query.where.type)),new Set(TWIN_SERVICE_RECORD_TYPES));
  for(const query of queries){assert.equal(query.where.vehicleId,'v1');assert.equal(query.where.mileage.lte,60000);assert.equal(query.where.date.lte,now);assert.deepEqual(query.orderBy,[{date:'desc'},{mileage:'desc'},{id:'desc'}]);}
  const demo=resolveTwinTrees(resolveDemoVehicleTwin('challenger'));assert.equal(demo.wheel.nodes.lugs,demo.car.nodes.lugs);
  const merged=mergeCatalogEvidenceIntoOwnerTrees(resolveDemoVehicleTwin('challenger'),demo,65000);assert.equal(merged.wheel.nodes.lugs,merged.car.nodes.lugs);assert.equal(merged.wheel.nodes.lugs.knownIssue,merged.car.nodes.lugs.knownIssue);
});

test('explicit due mileage/date drive next service, hotspot risk, and independent tree details',()=>{
  const node={label:'Transmission Fluid',servicedAt:50000,riskAt:60000,dueMileage:56000,dueDate:'2026-08-20T00:00:00.000Z',overdueByDate:true,dueNote:'1,000 mi past due · time interval passed Aug 20, 2026.',unlogged:true,knownIssue:{id:'known-x'},issue:'Known branch issue.'};
  assert.equal(ttRisk({...node,unlogged:false},55000),'critical');
  assert.equal(ttRisk({...node,overdueByDate:false,unlogged:false},55000),'watch');
  assert.equal(ttRisk(node,65000),null);
  assert.equal(ttMatchesIntent(node,'maint',65000),true);assert.equal(ttMatchesIntent(node,'issues',65000),true);
  const trees={car:{root:'car',nodes:{car:{group:true},transFluid:{...node,unlogged:false}}}};
  const next=pickTestNextService(trees,55000,'2026-08-26T00:00:00.000Z');assert.ok(next);assert.equal(next.nodeId,'transFluid');assert.equal(next.overdue,true);assert.equal(next.dueMileage,56000);assert.equal(next.dueDate,node.dueDate);assert.equal(next.dueSource,'date');
  const evidence=summarizeEvidence([{id:'transFluid',...node,unlogged:false,servicedDate:'2026-01-01T00:00:00.000Z'}],55000);assert.equal(evidence.status,'known-issue');assert.equal(evidence.serviceStatus,'overdue');
  const incompleteTrees={car:{root:'car',nodes:{car:{group:true,kids:['due','missing']},due:{label:'Due',servicedAt:1000,riskAt:1000,overdueByDate:true},missing:{label:'Missing',unlogged:true,riskAt:1000}}}};
  const incompleteHot=testHotspotEvidence({id:'hood',branch:'car'}, {}, incompleteTrees, 2500);assert.ok(incompleteHot);assert.equal(incompleteHot.due,null);assert.equal(incompleteHot.risk,true);assert.equal(incompleteHot.unlogged,false);
  const dateOnlyTrees={car:{root:'car',nodes:{car:{group:true},later:{label:'Later',servicedAt:1000,servicedDate:'2026-08-01T00:00:00.000Z',dueDate:'2026-09-15T00:00:00.000Z'},sooner:{label:'Sooner',servicedAt:1000,servicedDate:'2026-08-01T00:00:00.000Z',dueDate:'2026-09-01T00:00:00.000Z'}}}};
  const dateOnly=pickTestNextService(dateOnlyTrees,1000,'2026-08-26T00:00:00.000Z');assert.ok(dateOnly);assert.equal(dateOnly.nodeId,'sooner');assert.equal(dateOnly.dueSource,'date');assert.ok(dateOnly.progress>.75&&dateOnly.progress<1);
  const sourceLabel=testRiskLabel({...node,unlogged:false},55000,'critical');assert.match(sourceLabel || '',/Past due by date/);assert.doesNotMatch(sourceLabel || '',/mileage/);
  const mileageLabel=testRiskLabel({...node,dueDate:null,overdueByDate:false,unlogged:false},57000,'critical');assert.match(mileageLabel || '',/Past due by mileage.*56,000 mi deadline/);
  const detail=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner'}},React.createElement(TTDetail,{node:{...node,unlogged:false},nodeId:'transFluid',risk:'critical',miles:55000,onClose:()=>{},onEquip:undefined,onAsk:undefined,sheet:false,narrow:false})));assert.match(detail,/Past due by date/);assert.match(detail,/time interval passed/);assert.match(detail,/Known issue on record/);assert.match(detail,/Known branch issue/);
  const redKnown=TH_DOT({risk:true,knownIssue:true});assert.equal(redKnown.icon,'shield-alert');assert.equal(redKnown.edge,'#A78BFA');assert.match(detail,/Known issue on record/);
});

test('founder transmission picker renders only for editable reviewed dual fitment',()=>{
  const options=[{value:'automatic',label:'Automatic'},{value:'manual',label:'Manual'}];
  const renderPicker=(data:{canSelectTransmission:boolean;transmissionOptions:Array<{value:string;label:string}>;transmission:string|null})=>{
    const model=getFounderTransmissionPickerModel(data);
    return model ? renderToStaticMarkup(React.createElement(FounderTransmissionPickerView,{model,choice:model.current||''})) : '';
  };
  const unselected=renderPicker({canSelectTransmission:true,transmissionOptions:options,transmission:null});
  assert.match(unselected,/aria-label="Transmission fitment"/);assert.match(unselected,/>Automatic</);assert.match(unselected,/>Manual</);assert.match(unselected,/Choose transmission to reveal exact fluid and parts/);
  assert.equal(renderPicker({canSelectTransmission:true,transmissionOptions:[],transmission:null}),'');
  assert.equal(renderPicker({canSelectTransmission:true,transmissionOptions:[options[0]],transmission:null}),'');
  assert.equal(renderPicker({canSelectTransmission:false,transmissionOptions:options,transmission:null}),'');
  const saved=renderPicker({canSelectTransmission:true,transmissionOptions:options,transmission:'manual'});
  assert.match(saved,/<option value="manual" selected="">Manual<\/option>/);assert.match(saved,/>Transmission<\/label>/);
});

test('iteration-five exact branches, calendar clocks, owner sentinels, and picker state execute',async()=>{
  const automatic=twinServiceRecordTypesForBranch('automatic');
  const manual=twinServiceRecordTypesForBranch('manual');
  const unselected=twinServiceRecordTypesForBranch(null);
  assert.ok(automatic.includes('transmission_fluid'));assert.ok(automatic.includes('transmission_fluid_auto'));assert.ok(!automatic.includes('transmission_fluid_manual'));
  assert.ok(manual.includes('transmission_fluid'));assert.ok(manual.includes('transmission_fluid_manual'));assert.ok(!manual.includes('transmission_fluid_auto'));
  assert.ok(!unselected.includes('transmission_fluid_auto'));assert.ok(!unselected.includes('transmission_fluid_manual'));
  assert.equal(new Date(addCalendarInterval('2024-01-31T00:00:00.000Z',{months:1}) as number).toISOString(),'2024-02-29T00:00:00.000Z');
  assert.equal(new Date(addCalendarInterval('2023-01-31T00:00:00.000Z',{months:1}) as number).toISOString(),'2023-02-28T00:00:00.000Z');

  function OwnerProbe(){const vehicle=useTwinVehicle() as {make:string;model:string;miles?:number};return React.createElement('span',null,`${vehicle.make}|${vehicle.model}|${vehicle.miles}`);}
  const malformed=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner'}},React.createElement(OwnerProbe)));
  assert.match(malformed,/Vehicle\|unavailable/);assert.doesNotMatch(malformed,/Dodge|Challenger|65000/);assert.equal(TWIN_UNAVAILABLE_VEHICLE.model,'unavailable');

  const overdueTrees={car:{root:'car',nodes:{car:{group:true},mileage:{label:'Mileage',servicedAt:0,dueMileage:100},date:{label:'Date',servicedAt:0,servicedDate:'2026-01-01T00:00:00.000Z',dueDate:'2026-02-01T00:00:00.000Z'}}}};
  const overdue=pickTestNextService(overdueTrees,400,'2026-03-20T00:00:00.000Z');assert.ok(overdue);assert.equal(overdue.nodeId,'mileage');assert.equal(overdue.progress,1);

  const states:string[]=[];const pending:boolean[]=[];const errors:string[]=[];let refreshed=0;let requestBody='';
  const saved=await saveFounderTransmission({fetcher:async(_url:string,init:{body:string})=>{requestBody=init.body;return {ok:true,json:async()=>({})};},vehicleId:'v/1',vehicleRevision:'rev',choice:'manual',onPendingChange:(value:boolean)=>pending.push(value),setState:(value:string)=>states.push(value),setError:(value:string)=>errors.push(value),refresh:()=>{refreshed+=1;}});
  assert.equal(saved,true);assert.deepEqual(states,['saving','refreshing']);assert.deepEqual(pending,[true]);assert.deepEqual(errors,['']);assert.equal(refreshed,1);assert.deepEqual(JSON.parse(requestBody),{transmission:'manual',expectedUpdatedAt:'rev'});
  const failed=await saveFounderTransmission({fetcher:async()=>({ok:false,json:async()=>({error:'stale'})}),vehicleId:'v1',vehicleRevision:'rev',choice:'automatic',onPendingChange:(value:boolean)=>pending.push(value),setState:(value:string)=>states.push(value),setError:(value:string)=>errors.push(value),refresh:()=>{refreshed+=1;}});
  assert.equal(failed,false);assert.deepEqual(states.slice(-2),['saving','error']);assert.deepEqual(pending.slice(-2),[true,false]);assert.equal(errors.at(-1),'stale');assert.equal(refreshed,1);
});

test('owner snapshot denies ambiguous exact garage rows before history crosses the boundary',async()=>{
  const updatedAt=new Date('2026-08-25T00:00:00.000Z');let maintenanceReads=0;let isolation='';
  const vehicle={id:'v1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',currentMileage:65000,updatedAt};
  const reservation={twinStatus:'claimed',assignedTwin:'dodge-challenger',transmission:'automatic',trialDays:30,claimedAt:new Date('2026-08-20T00:00:00.000Z'),year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true,vehicleVerified:true};
  const tx={$queryRaw:async()=>[{now:new Date('2026-08-26T00:00:00.000Z')}],vehicle:{findFirst:async()=>vehicle,findMany:async()=>[vehicle,{...vehicle,id:'v2'}]},reservation:{findUnique:async()=>reservation},maintenanceRecord:{findFirst:async()=>{maintenanceReads+=1;return null;}}};
  const outcome=await getTwinHubData('u1','owner@example.com','v1',{prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>,options:{isolationLevel:string})=>{isolation=options.isolationLevel;return callback(tx);}} as never,getRecentThreads:async()=>[]});
  assert.equal(isolation,'Serializable');assert.equal(outcome.data,null);assert.equal(outcome.access.kind,'denied');assert.equal(outcome.access.reason,'garage-mismatch');assert.equal(maintenanceReads,0);
});

test('owner snapshot denies unverified customer trim before loading history or exact-fit parts',async()=>{
  const updatedAt=new Date('2026-08-25T00:00:00.000Z');let maintenanceReads=0;let catalogReads=0;
  const vehicle={id:'v1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',currentMileage:65000,updatedAt};
  const baseReservation={twinStatus:'claimed',assignedTwin:'dodge-challenger',transmission:'automatic',trialDays:30,claimedAt:new Date('2026-08-20T00:00:00.000Z'),year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',vehicleVerified:true};
  for(const trimVerified of [false,undefined]){
    const tx={$queryRaw:async()=>[{now:new Date('2026-08-26T00:00:00.000Z')}],vehicle:{findFirst:async()=>vehicle,findMany:async()=>[vehicle]},reservation:{findUnique:async()=>({...baseReservation,trimVerified})},maintenanceRecord:{findFirst:async()=>{maintenanceReads+=1;return null;}}};
    const outcome=await getTwinHubData('u1','owner@example.com','v1',{prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(tx)} as never,getRecentThreads:async()=>[],resolveOwnerCatalog:()=>{catalogReads+=1;return null;}});
    assert.equal(outcome.data,null);assert.equal(outcome.access.kind,'denied');assert.equal(outcome.access.reason,'trim-unverified');
  }
  assert.equal(maintenanceReads,0);assert.equal(catalogReads,0);
});

test('owner snapshot denies corrupt reviewed single-fitment state before loading records or exact-fit payloads',async()=>{
  const updatedAt=new Date('2026-08-27T00:00:00.000Z');let maintenanceReads=0;let catalogReads=0;let threadReads=0;
  const baseReservation={twinStatus:'claimed',assignedTwin:'dodge-challenger',transmission:null as string|null,trialDays:30,claimedAt:new Date('2026-08-20T00:00:00.000Z'),year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',trimVerified:true,vehicleVerified:true};
  const corruptStates=[
    {vehicleTransmission:'automatic',reservationTransmission:null},
    {vehicleTransmission:'manual',reservationTransmission:null},
    {vehicleTransmission:null,reservationTransmission:'automatic'},
    {vehicleTransmission:null,reservationTransmission:'manual'},
  ];
  for(const state of corruptStates){
    const vehicle={id:'v1',year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:state.vehicleTransmission,currentMileage:65000,updatedAt};
    const reservation={...baseReservation,transmission:state.reservationTransmission};
    const tx={$queryRaw:async()=>[{now:new Date('2026-08-27T12:00:00.000Z')}],vehicle:{findFirst:async()=>vehicle,findMany:async()=>[vehicle]},reservation:{findUnique:async()=>reservation},maintenanceRecord:{findFirst:async()=>{maintenanceReads+=1;return null;}}};
    const outcome=await getTwinHubData('u1','owner@example.com','v1',{
      prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(tx)} as never,
      getRecentThreads:async()=>{threadReads+=1;return[];},
      resolveOwnerCatalog:()=>{catalogReads+=1;return null;},
    });
    assert.equal(outcome.data,null);assert.equal(outcome.access.kind,'denied');assert.equal(outcome.access.reason,'unsupported-vehicle');
  }
  assert.equal(maintenanceReads,0);assert.equal(catalogReads,0);assert.equal(threadReads,0);
});

test('URL resolver clears absent and removed airbox opens while engine tree retains air filter',()=>{
  const twin=resolveDemoVehicleTwin('challenger');const trees=resolveTwinTrees(twin);assert.deepEqual(resolveTwinDeepLink(twin,null),{hotspot:null,branch:null,node:null});assert.deepEqual(resolveTwinDeepLink(twin,'car'),{hotspot:'car',branch:'car',node:null});assert.deepEqual(resolveTwinDeepLink(twin,'glass'),{hotspot:'glass',branch:'wipers',node:null});assert.deepEqual(resolveTwinDeepLink(twin,'airbox'),{hotspot:null,branch:null,node:null});assert.ok(trees.engine.nodes.airFilter);assert.ok(trees.engine.nodes.engineRoot?.kids?.includes('airFilter')||trees.engine.nodes.eng?.kids?.includes('airFilter'));
});

test('runtime renders TwinStage, null-mile provider, Minimal masks, and selected admin art',()=>{
  const twin=resolveDemoVehicleTwin('nautilus');const presentation=buildDemoTwinPresentation(twin);function Probe(){return React.createElement('span',{'data-testid':'miles-probe'},`${String(useTwinMiles())}|${String(useTwinLive())}|${useTwinMode()}`);}
  const value={catalog:twin,presentation,vehicle:twin.identity,miles:null,trees:presentation.trees,mode:'demo' as const};
  const stage=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value},React.createElement(React.Fragment,null,React.createElement(Probe),React.createElement(TwinStage,{mode:'hotspots',setMode:()=>{},onOpen:()=>{},mobile:false,hideNote:false,noteDark:false,fill:false,allowFullscreen:false,onExpand:undefined}))));assert.match(stage,/data-testid="miles-probe">null\|false\|demo</);assert.match(stage,/Lincoln Nautilus/);assert.match(stage,/clip-path/);assert.doesNotMatch(stage,/65000|0 due|0 watch|Your garage/);
  const minimal=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value},React.createElement(HubMinimal,{tc:{theme:'light'},mobile:true,onExit:()=>{}})));assert.match(minimal,/Lincoln Nautilus/);assert.match(minimal,/clip-path/);
  const sampleMinimal=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{...value,miles:twin.demoMileage}},React.createElement(HubMinimal,{tc:{theme:'light'},mobile:true,onExit:()=>{}})));assert.match(sampleMinimal,/42,000 mi sample/);
  const ownerTwin=buildOwnerTwinValue({fulfillmentId:'dodge-challenger',vehicleId:'v1',vehicle:{year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',engine:'6.4L V8 HEMI'},miles:24000,records:[],recent:[],transmission:'automatic'});assert.ok(ownerTwin);
  const ownerStage=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{...ownerTwin,mode:'owner' as const}},React.createElement(React.Fragment,null,React.createElement(Probe),React.createElement(TwinStage,{mode:'hotspots',setMode:()=>{},onOpen:()=>{},mobile:false,hideNote:false,noteDark:false,fill:false,allowFullscreen:false,onExpand:undefined}),React.createElement(THSidebar,{onOpen:()=>{},onClose:()=>{},drawer:false,onFeedback:()=>{}}))));assert.match(ownerStage,/true\|owner/);assert.match(ownerStage,/Your garage · live/);assert.match(ownerStage,/No service event logged/);assert.doesNotMatch(ownerStage,/Public demo|0 due|0 watch/);
  const baseOwnerData={fulfillmentId:'dodge-challenger',vehicleId:'v1',vehicle:{year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',engine:'6.4L V8 HEMI'},miles:24000,records:[],recent:[],transmission:'automatic',evaluatedAt:'2026-08-26T00:00:00.000Z'};
  const pendingTwin=buildOwnerTwinValue(suppressTwinTransmissionWhilePending(baseOwnerData,true));assert.ok(pendingTwin);assert.equal(resolveAvailableTwinBranch('trans',pendingTwin.trees),'car');
  const pendingMarkup=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{...pendingTwin,mode:'owner' as const}},React.createElement(React.Fragment,null,React.createElement(TwinStage,{mode:'hotspots',setMode:()=>{},onOpen:()=>{},mobile:false,hideNote:false,noteDark:false,fill:false,allowFullscreen:false,onExpand:undefined}),React.createElement(TestTechTree,{branch:'trans',setBranch:()=>{},miles:24000,onClose:()=>{},say:()=>{},startNode:'transFluid',compact:true,detailMode:'sheet',vertical:true}))));
  assert.match(pendingMarkup,/2015 Dodge Challenger/);assert.doesNotMatch(pendingMarkup,/8HP70|TR-6060|Order 6-qt|automatic transmission confirmed|manual transmission confirmed/);
  const admin=renderToStaticMarkup(React.createElement(TwinSelectedPreview,{twin:getAdminTwinDefinitions()[2]}));assert.match(admin,/Nissan Murano selected twin/);assert.match(admin,/base-red.webp/);
  const emptyAdmin=renderToStaticMarkup(React.createElement(TwinAdminShell,{operations:React.createElement('div',null,'ops'),initialTwins:[]}));assert.match(emptyAdmin,/Twin inventory is unavailable/);assert.doesNotMatch(emptyAdmin,/No twins match/);
  const fullAdmin=renderToStaticMarkup(React.createElement(TwinAdminShell,{operations:React.createElement('div',null,'ops'),initialTwins:getAdminTwinDefinitions()}));assert.match(fullAdmin,/Admin Dashboard/);assert.match(fullAdmin,/Vehicle Twin readiness from the live catalog/);
  const adminSource=readFileSync(path.join(process.cwd(),'src/components/admin/twins/TwinAdminShell.tsx'),'utf8');assert.match(adminSource,/Art coverage matrix/);assert.match(adminSource,/Artwork intake/);assert.match(adminSource,/Preview layer/);assert.match(adminSource,/Array\.isArray\(data\.twins\)/);assert.match(adminSource,/AbortController/);
  const hubShared=readFileSync(path.join(process.cwd(),'src/components/twin/hub/hub-shared.jsx'),'utf8');const hub=readFileSync(path.join(process.cwd(),'src/components/twin/hub/Hub.jsx'),'utf8');assert.match(hubShared,/<Link href="\/" aria-label="Au7o home"/);assert.match(hub,/label: "Home", href: "\/"/);
  const challengerXray=resolveDemoVehicleTwin('challenger');assert.equal(challengerXray.art.xray,'/twin-stage/car-xray.webp');assert.match(renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{catalog:challengerXray,presentation:buildDemoTwinPresentation(challengerXray),vehicle:challengerXray.identity,miles:challengerXray.demoMileage,trees:resolveTwinTrees(challengerXray),mode:'demo' as const}},React.createElement(TwinStage,{mode:'xray',setMode:()=>{},onOpen:()=>{},mobile:false,hideNote:false,noteDark:false,fill:false,allowFullscreen:false,onExpand:undefined}))),/car-xray\.webp/);
});
