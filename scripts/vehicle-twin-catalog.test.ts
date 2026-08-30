import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { DEFAULT_TWIN_ID, VEHICLE_TWIN_CATALOG, getAdminTwinDefinitions, getTwinByFulfillmentId, resolveDemoVehicleTwin, resolveTwinDeepLink, validateVehicleTwinCatalog } from '../src/lib/vehicle-twin-catalog';
import { evaluateTwinAccess, getConfirmedTwinTransmission } from '../src/lib/twin-access';
import { TWIN_TREE_RESOLVERS, answerTwinQuestion, buildDemoTwinPresentation, buildModelOwnerTrees, collectHotspotNodes, mergeCatalogEvidenceIntoOwnerTrees, resolveTwinTrees, summarizeEvidence } from '../src/components/twin/demo-trees.js';
import { addCalendarInterval, buildTwinTrees, servicedFromRecords } from '../src/components/twin/twin-trees.js';
import { TWIN_UNAVAILABLE_VEHICLE, TwinDataCtx, useTwinLive, useTwinMiles, useTwinMode, useTwinVehicle } from '../src/components/twin/twin-context.jsx';
import { TH_DOT, TwinStage, openTwinHotspot, retainActiveHotspot, resolveActiveTwinEffect, thHot } from '../src/components/twin/stage/TwinStage.jsx';
import { TechTree, TTDetail, buildPartHelpContext, resolveAvailableTwinBranch, resolveKnownIssueAction, ttMatchesIntent, ttRisk, ttRiskLabel, ttThumb } from '../src/components/twin/stage/TechTree.jsx';
import { HubMinimal, openMinimalHotspot } from '../src/components/twin/hub/HubMinimal.jsx';
import { THSidebar, mobileComposerPlaceholder } from '../src/components/twin/hub/Hub.jsx';
import { buildOwnerTwinValue, FounderTransmissionPickerView, getFounderTransmissionPickerModel, pickNextService, saveFounderTransmission, suppressTwinTransmissionWhilePending } from '../src/components/twin/LiveTwinHub.jsx';
import { HERO_MARKER_VISUALS, TWIN_STAGE_FRAME_STYLE, resolveHeroHotspotTap } from '../src/components/home/RotatingTwinStage';
import { projectTwinHotspots } from '../src/components/twin/stage/mobile-hotspots.js';
import { resolveTwinPaintArtwork } from '../src/components/twin/stage/paint-art.js';
import { normalizeTwinChatInput, splitTwinAnswerLink } from '../src/components/twin/hub/hub-shared.jsx';
import { resolveNextServiceDue } from '../src/components/vehicle/MaintenanceLogFlow';
import { demoHubHref } from '../src/components/home/TwinHero';
import { AdminOverviewView, AdminPaintPalette, TwinAdminShell, TwinSelectedPreview } from '../src/components/admin/twins/TwinAdminShell';
import { buildAdminOverviewSnapshot } from '../src/app/api/admin/overview/admin-overview';
import { getAdminOverviewResponse } from '../src/app/api/admin/overview/admin-overview-response';
import type { TwinMarkerEvidence } from '../src/components/twin/stage/TwinMarker';
import { resolveTwinTransmissionBranch, sameTwinVehicleIdentity } from '../src/lib/twin-fulfillment';
import { isLoggableMaintenanceType, maintenanceTypeMatchesTransmission, resolveMaintenanceWriteType } from '../src/lib/maintenance';
import { buildLatestTwinServiceRecordQuery, getTwinHubData, loadLatestTwinServiceRecords, TWIN_SERVICE_RECORD_TYPES, twinServiceRecordTypesForBranch } from '../src/lib/twin-hub-data';

type ServiceEvidence = Record<string, { mileage: number; date: string | null; nextDueMileage: number | null; nextDueDate: string | null }>;
type TestTreeSet = Record<string, { nodes: Record<string, { overdueByDate?: boolean; dueNote?: string }> }>;
type LooseTreeSet = Record<string, { root: string; nodes: Record<string, Record<string, unknown>> }>;
type NextServiceResult = { nodeId: string; hot: string; overdue: boolean; unlogged: boolean; dueMileage: number | null; dueDate: string | null; dueSource: string; progress: number };
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

  const vehicleHubSource = readFileSync(path.join(process.cwd(), 'src/components/vehicle/VehicleHub.tsx'), 'utf8');
  const founderSource = readFileSync(path.join(process.cwd(), 'src/app/founder/signin/page.tsx'), 'utf8');
  assert.match(vehicleHubSource, /href="\/founder\/signin"[\s\S]*Founder sign in/);
  assert.match(founderSource, /isFounderEmail\(session\?\.user\?\.email\)[\s\S]*redirect\('\/admin'\)/);
  assert.match(founderSource, /session\?\.user[\s\S]*redirect\('\/garage'\)/);
  assert.match(founderSource, /redirect\('\/auth\/signin\?callbackUrl=%2Ffounder%2Fsignin'\)/);
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
  assert.match(stageSource, /const markers = projectTwinHotspots\(twin\.hotspots/);
  assert.match(stageSource, /<TwinMarkerDot evidence=\{hotspot\}/);
  assert.doesNotMatch(stageSource, /hotspots\.filter\(\(hotspot\) => twin\.art\.effects/);
});

test('mobile hotspot projection removes transmission, keeps desktop exact, and separates touch targets',()=>{
  for (const twin of VEHICLE_TWIN_CATALOG) {
    assert.equal(projectTwinHotspots(twin.hotspots,{mobile:false,twinId:twin.id}),twin.hotspots);
    const mobile=projectTwinHotspots(twin.hotspots,{mobile:true,twinId:twin.id});
    assert.equal(mobile.some((hotspot:{id:string})=>hotspot.id==='trans'),false,`${twin.id} mobile transmission hotspot`);
    for(let left=0;left<mobile.length;left+=1) for(let right=left+1;right<mobile.length;right+=1){
      const dx=Math.abs((mobile[left].x-mobile[right].x)*3.64);
      const dy=Math.abs((mobile[left].y-mobile[right].y)*2.05);
      assert.ok(dx>=44||dy>=44,`${twin.id} ${mobile[left].id}/${mobile[right].id} 44px mobile hitboxes overlap`);
    }
  }
  const camaro=projectTwinHotspots(VEHICLE_TWIN_CATALOG.find((twin)=>twin.id==='camaro')!.hotspots,{mobile:true,twinId:'camaro'});
  assert.deepEqual(camaro.find((hotspot:{id:string})=>hotspot.id==='wheel')&&[camaro.find((hotspot:{id:string})=>hotspot.id==='wheel')!.x,camaro.find((hotspot:{id:string})=>hotspot.id==='wheel')!.y],[45,63]);
  assert.equal(resolveHeroHotspotTap(null,'wheel'),'select');
  assert.equal(resolveHeroHotspotTap('wheel','wheel'),'open');
});

test('paint, issue help, time-only service, and twin chat helpers fail truthfully',()=>{
  const catalog=VEHICLE_TWIN_CATALOG[0];
  const identity=resolveTwinPaintArtwork(catalog,{choice:catalog.identity.paint,options:catalog.paintPalette.colors});
  assert.equal(identity.art?.base,catalog.art.base);
  const pendingColor=catalog.paintPalette.colors.find((color)=>color.artStatus!=='rendered')!;
  assert.deepEqual(resolveTwinPaintArtwork(catalog,{choice:pendingColor.name,options:catalog.paintPalette.colors}).art,null);
  const issueNode={label:'Differential fluid',spec:'Reviewed fluid specification',knownIssue:{id:'issue',description:'Whine under load',solution:'Inspect the differential before replacing parts',href:'/known-issues/car#issue',fixParts:[]}};
  assert.equal(resolveKnownIssueAction(issueNode)?.summary,'Whine under load');
  assert.match(buildPartHelpContext(issueNode,{year:2019,make:'Chevrolet',model:'Camaro',trim:'ZL1 1LE'}),/2019 Chevrolet Camaro ZL1 1LE context loaded/);
  const camaro=resolveDemoVehicleTwin('camaro');
  const differential=resolveTwinTrees(camaro).trans.nodes.driveline;
  const differentialPrompt=buildPartHelpContext(differential,camaro.identity);
  assert.match(differentialPrompt,/ACDelco GM Original Equipment DEXRON LS 75W-90 gear oil/);
  assert.match(differentialPrompt,/88862624 \/ 10-4034/);
  assert.deepEqual(resolveNextServiceDue({intervalMonths:1},12000,'2025-01-31'),{nextDueMileage:null,nextDueDate:'2025-02-28'});
  assert.equal(normalizeTwinChatInput('  differential fluid?  '),'differential fluid?');
  assert.equal(normalizeTwinChatInput('   '),null);
  assert.deepEqual(splitTwinAnswerLink('Reviewed answer · Buy: https://parts.example/item'),{text:'Reviewed answer',url:'https://parts.example/item'});
  const automaticCamaro=resolveTwinTrees(camaro,{transmission:'automatic'});
  const manualCamaro=resolveTwinTrees(camaro,{transmission:'manual'});
  assert.match(automaticCamaro.trans.nodes.transFluid.label,/10L90 Automatic/);
  assert.match(manualCamaro.trans.nodes.transFluid.label,/TR-6060 Manual/);
  assert.equal(automaticCamaro.wheel.nodes.brakeFluid.serviceIntervalMonths,60);
  assert.equal(manualCamaro.wheel.nodes.brakeFluid.serviceIntervalMonths,36);
  const treeSource=readFileSync(path.join(process.cwd(),'src/components/twin/stage/TechTree.jsx'),'utf8');
  const hubSource=readFileSync(path.join(process.cwd(),'src/components/twin/hub/Hub.jsx'),'utf8');
  const chatSource=readFileSync(path.join(process.cwd(),'src/components/twin/hub/hub-shared.jsx'),'utf8');
  assert.match(treeSource,/onPartHelp \? onPartHelp\(context, n\)/);
  assert.match(hubSource,/setChatPrefill\(\{ value:context, key:\+\+chatPrefillSeq\.current \}\)/);
  assert.match(chatSource,/input\?\.setSelectionRange\(prefill\.value\.length, prefill\.value\.length\)/);
});

const publicPath=(value:string)=>path.join(process.cwd(),'public',value.replace(/^\//,''));
type DemoNodeView={label?:string;sub?:string;img?:string;imageUnavailable?:boolean;where?:string;spec?:string;life?:string;partNo?:string;price?:string;buyUrl?:string;alt?:string;maintenanceType?:string;serviceIntervalMonths?:number;knownIssue?:{id:string;label?:string;href?:string}};
type DemoTreeView={short:string;nodes:Record<string,DemoNodeView>};
test('catalog validates, fulfillment null stays null, and every target is real',()=>{
  assert.deepEqual(validateVehicleTwinCatalog(),[]);
  assert.equal(getTwinByFulfillmentId(null),null);
  assert.equal(getTwinByFulfillmentId(undefined),null);
  for(const twin of VEHICLE_TWIN_CATALOG){
    assert.equal(typeof (TWIN_TREE_RESOLVERS as Record<string, unknown>)[twin.treeResolver],'function');
    const trees=resolveTwinTrees(twin);assert.equal(trees.car.nodes[trees.car.root].img,twin.art.base);
    for(const hot of twin.hotspots){const target=resolveTwinDeepLink(twin,hot.id);assert.ok(target.branch&&trees[target.branch]);if(target.node)assert.ok(trees[target.branch].nodes[target.node]);}
    for(const tree of Object.values(trees) as DemoTreeView[]) for(const node of Object.values(tree.nodes)) if(node.knownIssue?.id&&node.img)assert.notEqual(node.img,twin.art.base,`${twin.id}/${node.label} must use component art`);
    for(const system of twin.systems){assert.ok(twin.hotspots.some((hot)=>hot.id===system.hot));assert.ok(trees[system.branch]);}
    for(const record of twin.sampleState.records){assert.ok(record.intervalMiles>0);assert.ok(record.lastServiceMileage>=0);assert.match(record.sourceUrl,/^https:\/\//);assert.ok(record.sourceSection.length>3);}
  }
  assert.equal(resolveDemoVehicleTwin('unknown').id,DEFAULT_TWIN_ID);
});

test('non-Challenger demo trees provide honest illustrated model context at every hotspot',()=>{
  for(const twin of VEHICLE_TWIN_CATALOG.filter((entry)=>entry.id!=='challenger')){
    const trees=resolveTwinTrees(twin);const typedTrees=trees as unknown as Record<string,DemoTreeView>;
    for(const tree of Object.values(typedTrees))for(const [id,node] of Object.entries(tree.nodes)){
      assert.ok(node.label?.trim(),`${twin.id}/${tree.short}/${id} label`);assert.ok(node.sub?.trim(),`${twin.id}/${tree.short}/${id} context`);
      const img=node.img;if(node.imageUnavailable){assert.equal(img,undefined,`${twin.id}/${tree.short}/${id} must not pretend a component image exists`);continue;}assert.ok(img,`${twin.id}/${tree.short}/${id} art`);assert.ok(img.startsWith('/twin-stage/'),`${twin.id}/${tree.short}/${id} art path`);assert.ok(existsSync(publicPath(img)),`${twin.id}/${tree.short}/${id} missing ${img}`);assert.ok(existsSync(publicPath(ttThumb(img))),`${twin.id}/${tree.short}/${id} rendered thumbnail missing ${ttThumb(img)}`);
    }
    for(const hotspot of twin.hotspots){
      const nodes=collectHotspotNodes(trees,hotspot);assert.ok(nodes.length>0,`${twin.id}/${hotspot.id} is inert`);
      for(const node of nodes){
        assert.ok(node.label?.trim(),`${twin.id}/${node.id} label`);assert.ok(node.sub?.trim(),`${twin.id}/${node.id} context`);
        if(node.imageUnavailable)assert.equal(node.img,undefined,`${twin.id}/${node.id} must not claim an image`);else {assert.ok(node.img?.startsWith('/twin-stage/'),`${twin.id}/${node.id} art`);assert.ok(existsSync(publicPath(node.img)),`${twin.id}/${node.id} missing ${node.img}`);}
        assert.ok(node.where?.trim(),`${twin.id}/${node.id} location`);assert.ok(node.spec?.trim(),`${twin.id}/${node.id} specification context`);
        assert.doesNotMatch(`${node.partNo||''} ${node.spec||''}`,/68218925AA|ATF\+4|MMRAD-SRT|5XC13TRMAA/,`${twin.id}/${node.id} borrowed Challenger fitment`);
      }
    }
  }
});

test('demo detail data holds unresolved fitment without placeholders or generic commerce searches',()=>{
  const forbidden=/not sourced for this demo|price not sourced|verify current (?:retailer|dealer|price)|choose transmission|configuration required|confirmation required/i;
  const genericUrl=/TireSearchResults\.jsp|amazon\.com\/s\?|rockauto\.com\/en\/partsearch|parts\.nissanusa\.com\/v-|\/parts-list\//i;
  for(const twin of VEHICLE_TWIN_CATALOG){
    const trees=resolveTwinTrees(twin) as unknown as Record<string,DemoTreeView>;
    const nodes=new Map<string,DemoNodeView>();for(const tree of Object.values(trees))for(const [id,node] of Object.entries(tree.nodes))if(!nodes.has(id))nodes.set(id,node);
    for(const [id,node] of nodes){
      assert.doesNotMatch(JSON.stringify(node),forbidden,`${twin.id}/${id} placeholder`);
      assert.equal(node.alt,undefined,`${twin.id}/${id} unlinked alternate`);
      if(!node.buyUrl)continue;
      assert.match(node.buyUrl,/^https:\/\//,`${twin.id}/${id} destination`);assert.doesNotMatch(node.buyUrl,genericUrl,`${twin.id}/${id} generic destination`);
      assert.ok(node.partNo?.trim(),`${twin.id}/${id} linked part number`);assert.ok(node.price?.trim(),`${twin.id}/${id} linked price`);
    }
  }
  const twin=resolveDemoVehicleTwin('nautilus');const trees=resolveTwinTrees(twin);const node=trees.trans.nodes.driveline;
  const markup=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{catalog:twin,presentation:buildDemoTwinPresentation(twin),vehicle:twin.identity,miles:twin.demoMileage,trees,mode:'demo' as const}},React.createElement(TTDetail,{node,nodeId:'driveline',onEquip:()=>{},risk:null,miles:twin.demoMileage,onClose:()=>{},onAsk:()=>{},sheet:true,narrow:true})));
  assert.match(markup,/Confirm FWD or AWD by VIN/);assert.doesNotMatch(markup,/Order this part|Price not sourced|Not sourced for this demo/);
  const challenger=resolveDemoVehicleTwin('challenger');const challengerTrees=resolveTwinTrees(challenger);const pricedNode=challengerTrees.engine.nodes.oilFluid;
  const pricedMarkup=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{catalog:challenger,presentation:buildDemoTwinPresentation(challenger),vehicle:challenger.identity,miles:challenger.demoMileage,trees:challengerTrees,mode:'demo' as const}},React.createElement(TTDetail,{node:pricedNode,nodeId:'oilFluid',onEquip:()=>{},risk:null,miles:challenger.demoMileage,onClose:()=>{},onAsk:()=>{},sheet:true,narrow:true})));
  assert.match(pricedMarkup,/Fitment reviewed/);
});

test('hotspots select on the first tap and open immediately on the second tap',()=>{
  const selected:string[]=[];const opened:string[]=[];const hotspot={id:'rad'};
  openTwinHotspot(hotspot,null,(id:string)=>selected.push(id),(id:string)=>opened.push(id));assert.deepEqual(selected,['rad']);assert.equal(opened.length,0);
  selected.length=0;opened.length=0;openTwinHotspot(hotspot,'rad',(id:string)=>selected.push(id),(id:string)=>opened.push(id));assert.deepEqual(selected,['rad']);assert.deepEqual(opened,['rad']);
  selected.length=0;opened.length=0;openMinimalHotspot({selected:null,hotspot,select:(id:string)=>selected.push(id),open:(id:string)=>opened.push(id)});assert.deepEqual(selected,['rad']);assert.equal(opened.length,0);
  selected.length=0;opened.length=0;openMinimalHotspot({selected:'rad',hotspot,select:(id:string)=>selected.push(id),open:(id:string)=>opened.push(id)});assert.deepEqual(selected,['rad']);assert.deepEqual(opened,['rad']);
  const stageSource=readFileSync(path.join(process.cwd(),'src/components/twin/stage/TwinStage.jsx'),'utf8');const minimalSource=readFileSync(path.join(process.cwd(),'src/components/twin/hub/HubMinimal.jsx'),'utf8');assert.match(stageSource,/width:mobile\?44/);assert.match(minimalSource,/width:mobile\?44/);assert.match(stageSource,/touchAction:"manipulation"/);assert.match(minimalSource,/touchAction:"manipulation"/);
});

test('factory paint palettes cite OEM material and never present missing art as selectable',()=>{
  for(const twin of VEHICLE_TWIN_CATALOG){
    assert.match(twin.paintPalette.sourceUrl,/^https:\/\//);assert.ok(twin.paintPalette.sourceLabel.includes(String(twin.identity.year)));assert.ok(twin.paintPalette.colors.length>=5);
    const rendered=twin.paintPalette.colors.filter((color)=>color.artStatus==='rendered');assert.deepEqual(rendered.map((color)=>color.name),[twin.identity.paint]);assert.ok(twin.paintPalette.colors.some((color)=>color.artStatus==='awaiting-art'));
    const markup=renderToStaticMarkup(React.createElement(AdminPaintPalette,{twin:getAdminTwinDefinitions().find((entry)=>entry.id===twin.id)!}));assert.match(markup,new RegExp(twin.identity.paint.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.match(markup,/Rendered/);assert.match(markup,/Awaiting art/);assert.doesNotMatch(markup,/<button/);
  }
  const malformed={...getAdminTwinDefinitions()[0],paintPalette:undefined} as unknown as Parameters<typeof AdminPaintPalette>[0]['twin'];
  assert.match(renderToStaticMarkup(React.createElement(AdminPaintPalette,{twin:malformed})),/Factory paint palette unavailable/);
});

test('five Challenger SRT 392 assets register as aligned full-resolution masked frames',async()=>{
  const twin=resolveDemoVehicleTwin('challenger');
  const paths=[twin.art.base,...Object.values(twin.art.effects)];assert.equal(paths.length,5);
  assert.equal(twin.identity.trim,'SRT 392');assert.equal(twin.art.strategy,'opaque-masked');
  const base=await sharp(publicPath(twin.art.base)).metadata();assert.equal(base.width,1680);assert.equal(base.height,945);
  for(const [id,effectPath] of Object.entries(twin.art.effects)){assert.ok(existsSync(publicPath(effectPath)));assert.ok(twin.art.masks?.[id]);const meta=await sharp(publicPath(effectPath)).metadata();assert.equal(meta.width,base.width);assert.equal(meta.height,base.height);}
  const archivedHellcat=path.join(process.cwd(),'public','twin-stage','challenger-hellcat');
  for(const file of ['base-granite-crystal.webp','glow-wheel-granite-crystal.webp','glow-rearwheel-granite-crystal.webp','glow-hood-granite-crystal.webp','glow-radiator-granite-crystal.webp'])assert.ok(existsSync(path.join(archivedHellcat,file)));
  assert.equal(VEHICLE_TWIN_CATALOG.some((entry)=>entry.id==='challenger-hellcat'),false);
});

test('opaque art has masks, full URLs are preserved, and absent effects are not markers',()=>{
  for(const twin of VEHICLE_TWIN_CATALOG.filter((entry)=>entry.art.strategy==='opaque-masked'))for(const id of Object.keys(twin.art.effects))assert.ok(twin.art.masks?.[id]);
  for(const twin of VEHICLE_TWIN_CATALOG){assert.match(twin.art.base,/^\/twin-stage\//);assert.doesNotMatch(twin.art.base,/thumb/);}
  assert.equal(resolveDemoVehicleTwin('challenger').art.effects.airbox,undefined);
});

test('every rendered Twin ships one aligned base plus four required effect views',async()=>{
  for(const twin of VEHICLE_TWIN_CATALOG){
    const required=['wheel','rearwheel','hood','rad'];assert.deepEqual(Object.keys(twin.art.effects).sort(),required.sort(),twin.id);
    const files=[twin.art.base,...required.map((id)=>twin.art.effects[id])];for(const file of files)assert.ok(existsSync(publicPath(file)),`${twin.id} missing ${file}`);
    const base=await sharp(publicPath(twin.art.base)).metadata();for(const file of files.slice(1)){const meta=await sharp(publicPath(file)).metadata();assert.equal(meta.width,base.width,`${twin.id}/${file} width`);assert.equal(meta.height,base.height,`${twin.id}/${file} height`);}
  }
});

test('published known issues and sample service evidence drive tree/catalog parity',()=>{
  for(const twin of VEHICLE_TWIN_CATALOG){const trees=resolveTwinTrees(twin);const presentation=buildDemoTwinPresentation(twin);assert.equal(twin.sampleState.label,'Sample demo state');for(const hot of twin.hotspots){const nodes=collectHotspotNodes(trees,hot);const ids=nodes.flatMap((node)=>node.knownIssue?.id?[node.knownIssue.id]:[]);assert.deepEqual([...ids].sort(),[...(hot.knownIssueIds||[])].sort(),`${twin.id}/${hot.id}`);assert.equal(hot.status==='known-issue',ids.length>0);assert.equal(presentation.hotspots.find((item:{id:string})=>item.id===hot.id).status,hot.status,`${twin.id}/${hot.id} status`);if(hot.status==='overdue')assert.ok(typeof twin.demoMileage==='number'&&nodes.some((node)=>typeof node.riskAt==='number'&&typeof node.servicedAt==='number'&&node.servicedAt+node.riskAt<=twin.demoMileage!));}}
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

test('reviewed exact-fit issue inventory is complete and each issue has useful linked detail',()=>{
  const expected:Record<string,string[]>={
    nautilus:['lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white','lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph','lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart','lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots'],
    murano:['nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa','nissan-murano-battery-drain-and-no-start-2021','nissan-murano-front-driver-seat-frametrack-2021','nissan-murano-front-radarsensor-malfunctions-triggering-2021','nissan-murano-rearview-camera-image-blank-2021'],
    xt6:['cadillac-xt6-9speed-transmission-2020','cadillac-xt6-auto-stop-2020','cadillac-xt6-ptu-leak-2020','cadillac-xt6-transmission-shudder-2020','cadillac-xt6-timing-chain-2020'],
    kicks:['nissan-kicks-blank-partial-instrument-cluster-cold-start','nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image','nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne'],
    mdx:['acura-mdx-fuel-pump-impeller-deformation-causing-stall','acura-mdx-infotainment-reboot-2014','acura-mdx-torque-converter-shudder-2014','acura-mdx-zf-9-speed-transmission-hesitation-hard-shifts-stalling'],
    aviator:[],
    camaro:['chevrolet-camaro-mylink-hmi-infotainment-module-failure','chevy-camaro-rear-differential-noise'],
  };
  for(const twin of VEHICLE_TWIN_CATALOG.filter((entry)=>entry.id!=='challenger')){
    const mapped=[...new Set(twin.hotspots.flatMap((hotspot)=>hotspot.knownIssueIds||[]))].sort();assert.deepEqual(mapped,[...expected[twin.id]].sort(),`${twin.id} reviewed issue inventory`);
    const trees=resolveTwinTrees(twin) as unknown as Record<string,DemoTreeView>;const issueNodes=Object.values(trees).flatMap((tree)=>Object.values(tree.nodes)).filter((node)=>node.knownIssue?.id);
    for(const id of mapped){const node=issueNodes.find((candidate)=>candidate.knownIssue?.id===id);assert.ok(node?.knownIssue,`${twin.id}/${id} node`);assert.ok(node.knownIssue.label?.trim(),`${id} label`);assert.match(node.knownIssue.href||'',new RegExp(`#${id}$`));}
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
  const unknown=buildOwnerTwinValue({...base,transmission:null});assert.ok(unknown);assert.equal(unknown.trees.trans,undefined);assert.ok(!unknown.trees.car.nodes.car.kids.includes('trx'));assert.ok(unknown.presentation.systems.every((system:{branch:string})=>system.branch!=='trans'));assert.ok(unknown.presentation.hotspots.every((hotspot:{branch:string})=>hotspot.branch!=='trans'));assert.doesNotMatch(JSON.stringify(unknown.trees),/ATF\+?4|8HP70|TR-6060/i);
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
  const node={label:'Transmission Fluid',servicedAt:50000,riskAt:60000,dueMileage:56000,dueDate:'2026-08-20T00:00:00.000Z',overdueByDate:true,dueNote:'1,000 mi past due · time interval passed Aug 20, 2026.',unlogged:true,firstServiceDeadline:true,knownIssue:{id:'known-x'},issue:'Known branch issue.'};
  assert.equal(ttRisk({...node,unlogged:false},55000),'critical');
  assert.equal(ttRisk({...node,overdueByDate:false,unlogged:false},55000),'watch');
  assert.equal(ttRisk(node,65000),'critical');
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
  const firstDeadline={car:{root:'car',nodes:{car:{group:true},radiator:{label:'Radiator',unlogged:true,firstServiceDeadline:true,dueMileage:90000,riskAt:90000}}}};
  assert.equal(pickTestNextService(firstDeadline,65000,'2026-08-26T00:00:00.000Z'),null);
  assert.equal(pickTestNextService(firstDeadline,90000,'2026-08-26T00:00:00.000Z'),null);
  const overdueFirst=pickTestNextService(firstDeadline,95000,'2026-08-26T00:00:00.000Z');assert.ok(overdueFirst);assert.equal(overdueFirst.nodeId,'radiator');assert.equal(overdueFirst.overdue,true);assert.equal(overdueFirst.unlogged,true);
  const maintainableGroup={car:{root:'car',nodes:{car:{group:true},rad:{label:'Radiator & Coolant',group:true,maintenanceType:'cooling_system_service',serviceIntervalMiles:90000,unlogged:true,firstServiceDeadline:true,dueMileage:90000,riskAt:90000}}}};
  const groupDue=pickTestNextService(maintainableGroup,90001,'2026-08-26T00:00:00.000Z');assert.ok(groupDue);assert.equal(groupDue.nodeId,'rad');assert.equal(groupDue.hot,'rad');
  const detail=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{mode:'owner'}},React.createElement(TTDetail,{node:{...node,unlogged:false},nodeId:'transFluid',risk:'critical',miles:55000,onClose:()=>{},onEquip:undefined,onAsk:undefined,sheet:false,narrow:false})));assert.match(detail,/Past due by date/);assert.match(detail,/time interval passed/);assert.match(detail,/Known issue on record/);assert.match(detail,/Known branch issue/);
  const redKnown=TH_DOT({risk:true,knownIssue:true});assert.equal(redKnown.icon,'shield-alert');assert.equal(redKnown.edge,'#A78BFA');assert.match(detail,/Known issue on record/);
});

test('Camaro owner tree sources exact service parts and keeps manual history on the manual branch',()=>{
  const camaro=resolveDemoVehicleTwin('camaro');
  const records=[
    {type:'transmission_fluid_auto',mileage:25000,date:'2026-01-01T00:00:00.000Z'},
    {type:'transmission_fluid_manual',mileage:28000,date:'2026-02-01T00:00:00.000Z'},
    {type:'transmission_fluid',mileage:29500,date:'2026-03-01T00:00:00.000Z'},
  ];
  const manual=buildModelOwnerTrees(camaro,records,30000 as never,'manual' as never,'2026-08-26T00:00:00.000Z' as never);
  assert.equal(manual.trans.nodes.transFluid.maintenanceType,'transmission_fluid_manual');
  assert.equal(manual.trans.nodes.transFluid.partNo,'88861800');
  assert.equal(manual.trans.nodes.transFluid.servicedAt,28000);
  const pending=buildModelOwnerTrees(camaro,records,30000 as never,null as never,'2026-08-26T00:00:00.000Z' as never);
  assert.ok(pending.trans);assert.equal(pending.trans.nodes.transFluid,undefined);assert.ok(pending.trans.nodes.driveline);assert.ok(pending.car.nodes.driveline);
  assert.match(manual.wheel.nodes.tire.partNo,/305\/30ZR19.*325\/30ZR19/);
  assert.match(manual.engine.nodes.airFilter.partNo,/23323508/);
  assert.match(manual.engine.nodes.coolant.partNo,/12346290/);
  assert.match(manual.wheel.nodes.frontRotor.partNo,/84271643.*23399101/);
  assert.equal(manual.wheel.nodes.tire.maintenanceType,'tire_replacement');assert.doesNotMatch(manual.wheel.nodes.tire.serviceLabel,/rotation/i);
  assert.equal(manual.wheel.nodes.brakeFluid.serviceIntervalMonths,36);assert.match(manual.wheel.nodes.brakeFluid.spec,/three years.*manual|manual.*three years/i);
  for(const node of [manual.wheel.nodes.frontRotor,manual.wheel.nodes.rearBrake]){
    assert.match(node.life,/pulsation/i);assert.match(node.life,/steering-wheel vibration/i);assert.match(node.life,/runout/i);assert.match(node.life,/scoring/i);
  }
  assert.match(manual.wheel.nodes.frontRotor.buyUrl,/\/parts\/chevrolet-pad-kit-frt-disc-brk~23399101\.html$/);
  for(const node of [manual.wheel.nodes.tire,manual.wheel.nodes.frontRotor,manual.wheel.nodes.brakeFluid,manual.engine.nodes.oil,manual.engine.nodes.airFilter,manual.engine.nodes.coolant,manual.trans.nodes.driveline]){
    assert.match(node.buyUrl,/^https:\/\//);
    assert.ok(node.price && node.price !== '—');
  }
  const automatic=buildModelOwnerTrees(camaro,records,30000 as never,'automatic' as never,'2026-08-26T00:00:00.000Z' as never);
  assert.equal(automatic.wheel.nodes.brakeFluid.serviceIntervalMonths,60);
});

test('Camaro ZL1 1LE eLSD gear-oil action is exact and does not conflate the hydraulic circuit',()=>{
  const twin=resolveDemoVehicleTwin('camaro');const trees=resolveTwinTrees(twin);const diff=trees.trans.nodes.driveline;
  assert.equal(diff.serviceIntervalMiles,45000);assert.match(diff.partNo,/88862624.*10-4034.*2 × 32 oz/);assert.match(diff.price,/\$44\.28.*\$88\.56/);
  assert.equal(diff.buyUrl,'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dexron-ls-75w-90-gear-oil-32-oz-88862624');
  assert.match(diff.spec,/ZL1 1LE coupe.*1\.5 L \(1\.6 qt\).*separate eLSD clutch hydraulic circuit holds 160 mL \(5\.4 oz\).*not for that circuit/i);
  assert.match(diff.sourceUrl,/2019\/Chevrolet\/camaro\/19_CHEV_Camaro_OM/);assert.match(diff.capacitySourceUrl,/2019-high-performance-owner-manual/);
});

test('XT6 publishes exact 2020 evidence while holding dealer-only AWD fluid and using reviewed PTU imagery',()=>{
  const xt6=resolveDemoVehicleTwin('xt6');const trees=resolveTwinTrees(xt6);
  assert.match(trees.engine.nodes.oil.partNo,/12693541.*UPF63R/);assert.match(trees.engine.nodes.oil.spec,/6\.0 qt/);
  assert.equal(trees.engine.nodes.airFilter.partNo,'23321606 / A3212C');assert.match(trees.engine.nodes.airFilter.buyUrl,/parts\.cadillac\.com\/product\/.*23321606$/);
  assert.equal(trees.engine.nodes.sparkPlugs.partNo,'12646780 / 41-130');assert.equal(trees.wipers.nodes.cabinFilter.partNo,'13508023 / CF185');
  assert.match(trees.trans.nodes.transFluid.spec,/DEXRON-VI—not DEXRON ULV/);assert.equal(trees.trans.nodes.transFluid.buyUrl,undefined);
  assert.match(trees.wheel.nodes.tire.partNo,/235\/55R20 102H.*235 mm/);assert.match(trees.wheel.nodes.tire.spec,/9\.6\d? in section width.*Optional 21-inch/i);assert.match(trees.wheel.nodes.tire.buyUrl,/discounttire\.com\/buy-tires\/pirelli-scorpion-all-season-plus-3\/p\/103603/);
  assert.equal(trees.wheel.nodes.brakeFluid.partNo,'19353126 / 10-4110');assert.equal(trees.wheel.nodes.brakeFluid.serviceIntervalMonths,60);assert.match(trees.wheel.nodes.brakeFluid.buyUrl,/parts\.cadillac\.com\/product\/.*19353126$/);
  const driveline=trees.trans.nodes.driveline;assert.equal(driveline.label,'AWD Rear-Axle Fluid & Power Transfer Unit Inspection');assert.equal(driveline.imageUnavailable,false);assert.equal(driveline.img,'/twin-stage/parts/part-power-transfer-unit.webp');assert.ok(existsSync(publicPath(driveline.img)));assert.equal(driveline.serviceIntervalMiles,150000);assert.equal(driveline.buyUrl,undefined);assert.equal(driveline.partNo,undefined);assert.match(driveline.spec,/Active Twin-Clutch.*60,000 and 150,000.*See your dealer.*no PTU product or interval is asserted/i);
  assert.equal(trees.trans.nodes.transFluid.img,'/twin-stage/parts/part-transmission-fluid.webp');assert.ok(existsSync(publicPath(trees.trans.nodes.transFluid.img)));
  for(const node of [trees.wheel.nodes.tire,trees.wheel.nodes.frontRotor,trees.wheel.nodes.rearBrake])assert.match(`${node.spec} ${node.life}`,/tread|pulsation|vibration|runout|scoring/i);
});

test('Challenger commerce uses product pages and holds unreviewed alternates',()=>{
  const trees=resolveTwinTrees(resolveDemoVehicleTwin('challenger'));
  assert.match(trees.wheel.nodes.tire.buyUrl,/discounttire\.com\/buy-tires\/pirelli-p-zero-as-plus-3\/p\/137905/);assert.doesNotMatch(trees.wheel.nodes.tire.buyUrl,/TireSearchResults|tirerack\.com/);
  assert.equal(trees.wheel.nodes.pads.alt,undefined);assert.equal(trees.wheel.nodes.rotor.alt,undefined);assert.equal(trees.wheel.nodes.lugs.alt,undefined);
  assert.match(trees.engine.nodes.cabinFilter.buyUrl,/\/parts\/mopar-filter-cabin-air~68071668aa\.html$/);
  assert.match(trees.engine.nodes.radCore.upgrade.buyUrl,/mishimoto\.com\/dodge-challenger-srt8-hellcat-radiator/);
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

test('Admin overview exposes only real aggregates and explicit unsupported states',async()=>{
  const now=new Date('2026-08-28T12:00:00.000Z');
  const overview=buildAdminOverviewSnapshot({
    now,
    interests:[{createdAt:new Date('2026-08-27T00:00:00.000Z')},{createdAt:new Date('2026-07-01T00:00:00.000Z')}],
    reservations:[{createdAt:new Date('2026-08-26T00:00:00.000Z'),vehicle:'2019 Lincoln Nautilus',source:'hero',twinStatus:'pending',vehicleVerified:true}],
    clicks:[
      {clickedAt:new Date('2026-08-27T00:00:00.000Z'),knownIssueId:'issue-covered',partBrand:'Gates',partName:'Timing belt kit',link:'https://www.ebay.com/itm/123456789012'},
      {clickedAt:new Date('2026-08-26T00:00:00.000Z'),knownIssueId:'issue-gap',partBrand:'Mopar',partName:'Transmission fluid',link:'https://www.amazon.com/s?k=transmission+fluid'},
    ],
    issues:[
      {id:'issue-covered',make:'Acura',model:'MDX',title:'Timing belt wear',reviewedOn:'2026-08-20',updatedAt:new Date('2026-08-20T00:00:00.000Z'),communityRecommendations:[],fixParts:[{name:'Timing belt kit',verified:true,buyLinks:[{vendor:'eBay',url:'https://www.ebay.com/itm/123456789012',verified:true,linkType:'product'}]}]},
      {id:'issue-gap',make:'Dodge',model:'Challenger',title:'Transmission service',reviewedOn:'',updatedAt:new Date('2026-08-27T00:00:00.000Z'),fixParts:[],communityRecommendations:[{text:'Check this fluid',needsReview:true}]},
    ],
    feedback:[{kind:'vehicle-correction',message:'Correct trim',createdAt:new Date('2026-08-25T00:00:00.000Z')}],
    userCount:5,
    activeSubscriberCount:2,
    vehicleCorrectionCount:12,
  });
  assert.equal(overview.kpis.interestTotal,2);assert.equal(overview.kpis.interestAdded7d,1);assert.equal(overview.kpis.deepLinkRate,50);assert.equal(overview.kpis.issuesWithBuyLinks,1);assert.equal(overview.kpis.issuesWithoutBuyLinks,1);
  assert.equal(overview.queues.recommendationReviews,1);assert.equal(overview.queues.vehicleCorrections.total,12);assert.equal(overview.affiliate.searchLinkQueue[0]?.issueId,'issue-gap');assert.equal(overview.affiliate.searchLinkQueue[0]?.href,'/known-issues/dodge-challenger#issue-gap');assert.equal(overview.analytics.sessions.status,'not-connected');
  const dataMarkup=renderToStaticMarkup(React.createElement(AdminOverviewView,{twins:getAdminTwinDefinitions(),state:{data:overview,loading:false,error:null}}));assert.doesNotMatch(dataMarkup,/Captured demand and affiliate clicks|12-month series/);assert.match(dataMarkup,/Do clicks reach product pages/);assert.match(dataMarkup,/Missing buy links/);assert.match(dataMarkup,/Actionable queues/);assert.match(dataMarkup,/50%/);assert.match(dataMarkup,/Transmission service/);assert.match(dataMarkup,/Not connected/);assert.match(dataMarkup,/2019 Lincoln Nautilus/);
  const empty=buildAdminOverviewSnapshot({now,interests:[],reservations:[],clicks:[],issues:[],feedback:[],userCount:0,activeSubscriberCount:0});
  const emptyMarkup=renderToStaticMarkup(React.createElement(AdminOverviewView,{twins:[],state:{data:empty,loading:false,error:null}}));assert.doesNotMatch(emptyMarkup,/No records in this period/);assert.match(emptyMarkup,/No affiliate clicks in the last 30 days/);assert.match(emptyMarkup,/Every published issue has a renderable buy link/);
  const loadingMarkup=renderToStaticMarkup(React.createElement(AdminOverviewView,{twins:[],state:{data:null,loading:true,error:null}}));assert.match(loadingMarkup,/Loading live records/);
  const errorMarkup=renderToStaticMarkup(React.createElement(AdminOverviewView,{twins:[],state:{data:null,loading:false,error:'Overview unavailable'}}));assert.match(errorMarkup,/Overview unavailable/);
  const partial=buildAdminOverviewSnapshot({now,interests:[],reservations:[],clicks:[],issues:[],feedback:[],userCount:0,activeSubscriberCount:0,sourceErrors:{clicks:'offline'}});
  const partialMarkup=renderToStaticMarkup(React.createElement(AdminOverviewView,{twins:[],state:{data:partial,loading:false,error:null}}));assert.match(partialMarkup,/Partial Admin data/);assert.match(partialMarkup,/clicks unavailable/);
  const splitGaps=buildAdminOverviewSnapshot({now,interests:[],reservations:[],clicks:[{clickedAt:now,knownIssueId:'i1',partBrand:'A',partName:'Part A',link:'https://example.com/search'},{clickedAt:now,knownIssueId:'i1',partBrand:'B',partName:'Part B',link:'https://example.com/search'}],issues:[],feedback:[],userCount:0,activeSubscriberCount:0});assert.equal(splitGaps.affiliate.searchLinkQueue.length,2);
  let protectedLoadCalled=false;
  const denied=await getAdminOverviewResponse(async()=>{protectedLoadCalled=true;return empty;},{authorize:async()=>NextResponse.json({error:'Forbidden'},{status:403})});assert.equal(denied.status,403);assert.equal(protectedLoadCalled,false);
  const emptyResponse=await getAdminOverviewResponse(async()=>empty,{authorize:async()=>null});assert.equal(emptyResponse.status,200);assert.equal((await emptyResponse.json()).kpis.interestTotal,0);
  const failedResponse=await getAdminOverviewResponse(async()=>{throw new Error('missing')},{authorize:async()=>null,reportError:()=>{}});assert.equal(failedResponse.status,500);assert.deepEqual(await failedResponse.json(),{error:'Failed to build Admin overview'});
  const overviewRouteSource=readFileSync(path.join(process.cwd(),'src/app/api/admin/overview/route.ts'),'utf8');assert.match(overviewRouteSource,/requireFounder/);assert.match(overviewRouteSource,/buildAdminOverviewSnapshot/);assert.match(overviewRouteSource,/ISSUE_SCAN_LIMIT=250/);assert.doesNotMatch(overviewRouteSource,/342|2,847|18\.4k/);
});

test('runtime renders TwinStage, null-mile provider, Minimal masks, and selected admin art',()=>{
  const twin=resolveDemoVehicleTwin('nautilus');const presentation=buildDemoTwinPresentation(twin);function Probe(){return React.createElement('span',{'data-testid':'miles-probe'},`${String(useTwinMiles())}|${String(useTwinLive())}|${useTwinMode()}`);}
  const value={catalog:twin,presentation,vehicle:twin.identity,miles:null,trees:presentation.trees,mode:'demo' as const};
  const stage=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value},React.createElement(React.Fragment,null,React.createElement(Probe),React.createElement(TwinStage,{mode:'hotspots',setMode:()=>{},onOpen:()=>{},mobile:false,hideNote:false,noteDark:false,fill:false,allowFullscreen:false,onExpand:undefined}))));assert.match(stage,/data-testid="miles-probe">null\|false\|demo</);assert.match(stage,/Lincoln Nautilus/);assert.match(stage,/clip-path/);assert.doesNotMatch(stage,/65000|0 due|0 watch|Your garage/);
  const minimal=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value},React.createElement(HubMinimal,{tc:{theme:'light'},mobile:true,onExit:()=>{}})));assert.match(minimal,/Lincoln Nautilus/);assert.match(minimal,/clip-path/);
  const sampleMinimal=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{...value,miles:twin.demoMileage}},React.createElement(HubMinimal,{tc:{theme:'light'},mobile:true,onExit:()=>{}})));assert.match(sampleMinimal,/42,000 mi sample/);
  const ownerTwin=buildOwnerTwinValue({fulfillmentId:'dodge-challenger',vehicleId:'v1',vehicle:{year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',engine:'6.4L V8 HEMI'},miles:24000,records:[],recent:[],transmission:'automatic'});assert.ok(ownerTwin);
  const ownerStage=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{...ownerTwin,mode:'owner' as const}},React.createElement(React.Fragment,null,React.createElement(Probe),React.createElement(TwinStage,{mode:'hotspots',setMode:()=>{},onOpen:()=>{},mobile:false,hideNote:false,noteDark:false,fill:false,allowFullscreen:false,onExpand:undefined}),React.createElement(THSidebar,{onOpen:()=>{},onClose:()=>{},drawer:false,onFeedback:()=>{}}))));assert.match(ownerStage,/true\|owner/);assert.match(ownerStage,/Your garage · live/);assert.match(ownerStage,/No service event logged/);assert.doesNotMatch(ownerStage,/Public demo|0 due|0 watch/);
  const ownerActions={vehicleId:'v1',refresh:()=>{},installUpgrade:async()=>true,saveInstalledPart:async()=>true,annotateIssue:async()=>true};
  const parentDetail=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{...ownerTwin,mode:'owner' as const,ownerActions}},React.createElement(TTDetail,{node:{label:'Brakes',sub:'Front and rear',group:true,kids:['front','rear']},nodeId:'brakes',onEquip:()=>{},risk:null,miles:24000,onClose:()=>{},onAsk:()=>{},sheet:false,narrow:false})));
  assert.doesNotMatch(parentDetail,/Change installed part|I have an issue/);
  const leafDetail=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{...ownerTwin,mode:'owner' as const,ownerActions}},React.createElement(TTDetail,{node:{label:'Front pads',sub:'Front axle'},nodeId:'pads',onEquip:()=>{},risk:null,miles:24000,onClose:()=>{},onAsk:()=>{},sheet:false,narrow:false})));
  assert.match(leafDetail,/Change installed part/);assert.match(leafDetail,/I have an issue/);
  const baseOwnerData={fulfillmentId:'dodge-challenger',vehicleId:'v1',vehicle:{year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',engine:'6.4L V8 HEMI'},miles:24000,records:[],recent:[],transmission:'automatic',evaluatedAt:'2026-08-26T00:00:00.000Z'};
  const pendingTwin=buildOwnerTwinValue(suppressTwinTransmissionWhilePending(baseOwnerData,true));assert.ok(pendingTwin);assert.equal(resolveAvailableTwinBranch('trans',pendingTwin.trees),'car');
  const pendingMarkup=renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{...pendingTwin,mode:'owner' as const}},React.createElement(React.Fragment,null,React.createElement(TwinStage,{mode:'hotspots',setMode:()=>{},onOpen:()=>{},mobile:false,hideNote:false,noteDark:false,fill:false,allowFullscreen:false,onExpand:undefined}),React.createElement(TestTechTree,{branch:'trans',setBranch:()=>{},miles:24000,onClose:()=>{},say:()=>{},startNode:'transFluid',compact:true,detailMode:'sheet',vertical:true}))));
  assert.match(pendingMarkup,/2015 Dodge Challenger/);assert.match(pendingMarkup,/Collapse 2015 Dodge Challenger/);assert.doesNotMatch(pendingMarkup,/8HP70|TR-6060|Order 6-qt|automatic transmission confirmed|manual transmission confirmed/);
  const admin=renderToStaticMarkup(React.createElement(TwinSelectedPreview,{twin:getAdminTwinDefinitions()[2]}));assert.match(admin,/Nissan Murano selected twin/);assert.match(admin,/base-red.webp/);
  const emptyAdmin=renderToStaticMarkup(React.createElement(TwinAdminShell,{operations:React.createElement('div',null,'ops'),initialTwins:[]}));assert.match(emptyAdmin,/Admin Dashboard/);assert.match(emptyAdmin,/Loading live records/);assert.doesNotMatch(emptyAdmin,/No twins match/);
  const fullAdmin=renderToStaticMarkup(React.createElement(TwinAdminShell,{operations:React.createElement('div',null,'ops'),initialTwins:getAdminTwinDefinitions()}));assert.match(fullAdmin,/Admin Dashboard/);assert.match(fullAdmin,/Founder-only operational data/);assert.match(fullAdmin,/Loading live records/);
  const adminSource=readFileSync(path.join(process.cwd(),'src/components/admin/twins/TwinAdminShell.tsx'),'utf8');assert.match(adminSource,/Art coverage matrix/);assert.match(adminSource,/Artwork intake/);assert.match(adminSource,/Preview layer/);assert.match(adminSource,/Factory paint choices/);assert.match(adminSource,/Awaiting art/);assert.match(adminSource,/Array\.isArray\(data\.twins\)/);assert.match(adminSource,/AbortController/);assert.match(adminSource,/\/api\/admin\/overview/);assert.doesNotMatch(adminSource,/className="avatar"|function OverviewChart|12-month series|Captured demand and affiliate clicks/);
  const hubShared=readFileSync(path.join(process.cwd(),'src/components/twin/hub/hub-shared.jsx'),'utf8');const hub=readFileSync(path.join(process.cwd(),'src/components/twin/hub/Hub.jsx'),'utf8');assert.match(hubShared,/<Link href="\/" aria-label="Au7o home"/);assert.match(hub,/label: "Home", href: "https:\/\/au7o\.io\/"/);assert.doesNotMatch(hub,/label: "Garage"/);assert.match(hub,/label: "Add vehicle", href: "\/garage\?add=1"/);assert.match(hub,/label: "Service records", href: `\/garage\/\$\{encodeURIComponent\(ownerActions\.vehicleId\)\}\/maintenance\?view=history`/);assert.match(hub,/label: "Account", href: "\/account"/);assert.match(hub,/label: "Founder sign in", href: "\/founder\/signin"/);
  const vehicleHub=readFileSync(path.join(process.cwd(),'src/components/vehicle/VehicleHub.tsx'),'utf8');assert.match(vehicleHub,/<Link href="https:\/\/au7o\.io\/" className="brand">/);assert.match(vehicleHub,/<Link href="https:\/\/au7o\.io\/" className="md-link" onClick=\{onClose\}>/);assert.match(vehicleHub,/href="\/garage\?add=1"/);
  const challengerXray=resolveDemoVehicleTwin('challenger');assert.equal(challengerXray.art.xray,'/twin-stage/car-xray.webp');assert.match(renderToStaticMarkup(React.createElement(TwinDataCtx.Provider,{value:{catalog:challengerXray,presentation:buildDemoTwinPresentation(challengerXray),vehicle:challengerXray.identity,miles:challengerXray.demoMileage,trees:resolveTwinTrees(challengerXray),mode:'demo' as const}},React.createElement(TwinStage,{mode:'xray',setMode:()=>{},onOpen:()=>{},mobile:false,hideNote:false,noteDark:false,fill:false,allowFullscreen:false,onExpand:undefined}))),/car-xray\.webp/);
});
