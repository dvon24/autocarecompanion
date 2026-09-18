import test from 'node:test';
import assert from 'node:assert/strict';
import { REVIEWED_OWNER_EQUIPMENT as profiles, ownerEquipmentReady, confirmedOwnerEquipment, ownerEquipmentFitmentKey, validOwnerEquipmentSelection } from '../src/lib/twin-owner-equipment';
import { getLiveTwinForVehicle } from '../src/lib/twin-fulfillment';
import { getTwinByFulfillmentId } from '../src/lib/vehicle-twin-catalog';
import { buildOwnerMaintenanceTrees } from '../src/components/twin/owner-maintenance-trees';
import { createTwinClaimPostHandler } from '../src/lib/twin-claim-post-handler';
import { loadTwinClaimPageOutcome } from '../src/lib/twin-claim-page-loader';
import { createVehiclePatchHandler } from '../src/lib/vehicle-patch-handler';
import { getTwinHubData } from '../src/lib/twin-hub-data';
import { readyInvitationOffer } from '../src/lib/twin-ready-invitation';
import { twinReadyEmail } from '../src/lib/twin-ready-email';
import { hubVehiclePayload, createHubVehicle, HubVehicleSaveUnconfirmedError } from '../src/components/twin/hub/hub-add-vehicle';
import { hubAddTwinFields } from '../src/lib/hub-add-twin-options';
import { buildOwnerTwinIssueSummary } from '../src/lib/twin-owner-issues';
import { buildTwinIssueSummary, type TwinIssueSummary } from '../src/lib/twin-known-issues';
import { resolveMaintenanceWriteType, resolveMaintenanceReadTypes } from '../src/lib/maintenance';
import { buildOwnerMaintenanceReminders } from '../src/lib/maintenance-reminder-data';
import { prepareTwinReadyInvitationArtwork } from '../src/lib/twin-ready-invitation-artwork';
import { createMaintenancePatchHandler } from '../src/lib/maintenance-patch-handler';
import published from './fixtures/published-six-content.json';
import { XT6_OWNER_ISSUE_NODES, attachXt6OwnerIssueNodes } from '../src/lib/twin-owner-issue-nodes';

const now=new Date('2026-09-13T12:00:00Z'),revision=new Date('2026-09-12T12:00:00Z');
const user={id:'fixture-owner',email:'owner@example.invalid'};
type Profile=(typeof profiles)[number];
const identity=(p:Profile)=>({year:p.year,make:p.make,model:p.model,trim:p.trim});
for(const state of ['missing','unpublished','changed-description','changed-solution'] as const)test(`XT6 ${state} evidence removes diagnostic details and keeps ordinary maintenance`,async()=>{
  const p=profiles.find(row=>row.catalogId==='xt6')!,f=fixture(p,[car(p)],{twinStatus:'claimed',claimedAt:revision});
  const rows=published.rows.filter(row=>XT6_OWNER_ISSUE_NODES.some(item=>item.id===row.id));
  f.db.knownIssue.findMany=async({where}:any)=>rows.map(row=>({...row,status:state==='unpublished'?'draft':row.status,
    description:row.description+(state==='changed-description'?' Source revised.':''),solution:row.solution+(state==='changed-solution'?' Source revised.':'')}))
    .filter(row=>state!=='missing'&&row.status===where.status).map(row=>({...row,fixParts:[],communityRecommendations:[]}));
  const outcome=await getTwinHubData(user.id,user.email,'car',{prisma:f.db,getRecentThreads:async()=>[]});assert(outcome.data);
  const baseline:any=buildOwnerMaintenanceTrees({...outcome.data,issues:[]}),trees:any=buildOwnerMaintenanceTrees(outcome.data);
  const confirmed=rows.map(row=>buildOwnerTwinIssueSummary({...row,fixParts:[],communityRecommendations:[]},car(p)));
  const reused:any=buildOwnerMaintenanceTrees({...outcome.data,issues:confirmed});
  attachXt6OwnerIssueNodes(reused,outcome.data.issues);
  for(const result of [trees,reused]){
    for(const item of XT6_OWNER_ISSUE_NODES)for(const tree of Object.values(result) as any[]){assert.equal(tree.nodes[item.key],undefined);assert(Object.values(tree.nodes).every((node:any)=>!node.kids?.includes(item.key)));}
    for(const[key,node]of Object.entries(baseline.car.nodes) as [string,any][])if(node.maintenanceType)assert.deepEqual(result.car.nodes[key],node,key+' ordinary service survives');
    const serialized=JSON.stringify(result);assert(!serialized.includes('replace the engine and rubber coolant hoses'));assert(!serialized.includes('MC-10198879-9999.pdf'));
  }
  if(state.startsWith('changed')){assert.equal(outcome.data.issues.length,5);for(const issue of outcome.data.issues)assert.match(issue.solution,/current equipment-specific diagnostic review/);}
  else assert.deepEqual(outcome.data.issues,[]);
});
function car(p:Profile,confirmed=true):any {return {...identity(p),id:'car',userId:user.id,transmission:null,reviewedEquipmentId:confirmed?p.id:null,currentMileage:64000,updatedAt:revision,color:null,isPrimary:false};}
function fixture(p:Profile,cars:any[]=[],changes:Record<string,unknown>={},conflict=false) {
  let garage=structuredClone(cars),reservation:any={...identity(p),id:'offer',email:user.email,vehicle:`${p.year} ${p.make} ${p.model} ${p.trim}`,country:'US',vehicleVerified:true,trimVerified:true,assignedTwin:p.fulfillmentId,transmission:null,trialDays:30,twinStatus:'ready',claimedAt:null,updatedAt:revision,...changes};
  let writes=0,created=0,recordReads=0;const issueQueries:any[]=[];
  const tx:any={
    $queryRaw:async()=>[{now}],
    user:{findUnique:async()=>null},
    reservation:{findMany:async()=>[reservation],updateMany:async({where,data}:any)=>{if(conflict||where.updatedAt.getTime()!==reservation.updatedAt.getTime())return{count:0};writes++;Object.assign(reservation,data);return{count:1};}},
    vehicle:{findMany:async()=>garage.map(v=>({...v})),findFirst:async({where}:any)=>garage.find(v=>v.id===where.id&&v.userId===where.userId)??null,findUnique:async({where}:any)=>garage.find(v=>v.id===where.id)??null,
      create:async({data}:any)=>{writes++;created++;const result={id:'created',color:null,updatedAt:now,...data};garage.push(result);return{...result};},
      update:async({where,data}:any)=>{writes++;const result=garage.find(v=>v.id===where.id);Object.assign(result,data,{updatedAt:now});return{...result};},
      updateMany:async({where,data}:any)=>{const result=garage.find(v=>v.id===where.id);if(!result||where.updatedAt&&result.updatedAt.getTime()!==where.updatedAt.getTime())return{count:0};writes++;Object.assign(result,data);return{count:1};}},
    maintenanceRecord:{findFirst:async()=>{recordReads++;return null;}},
    modification:{findMany:async()=>[]},knownIssue:{findMany:async(query:any)=>{issueQueries.push(query);return[];}},mileageLog:{create:async()=>{writes++;return{};}},
  };
  const db:any={...tx,$transaction:async(run:any)=>{const before=structuredClone({garage,reservation,writes,created});try{return await run(tx);}catch(error){({garage,reservation,writes,created}=before);throw error;}}};
  const handler=createTwinClaimPostHandler({auth:async()=>({user}),prisma:db});
  return {db,tx,post:(body:any={})=>handler(new Request('https://fixture.invalid/api/twin/claim',{method:'POST',body:JSON.stringify({reservationId:'offer',expectedUpdatedAt:reservation.updatedAt.toISOString(),expectedTrialDays:reservation.trialDays,...body})})),load:()=>loadTwinClaimPageOutcome({user},{prisma:db}),state:()=>({garage,reservation,writes,created,recordReads,issueQueries})};
}

for(const catalogId of ['mdx','nautilus','kicks','xt6'])test(`${catalogId}: actual owner query carries complete source fingerprint and fails closed on unchanged-prose drift`,async()=>{
  const p=profiles.find(row=>row.catalogId===catalogId)!;
  const id=catalogId==='mdx'?'acura-mdx-torque-converter-shudder-2014':catalogId==='nautilus'?'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph':catalogId==='kicks'?'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne':XT6_OWNER_ISSUE_NODES[0].id;
  const raw=published.rows.find(row=>row.id===id)!;
  const variants=[{}, {years:[...raw.years,2030]}, {trims:['Changed scope']}, {engines:['Changed scope']}, {citations:[{url:'https://example.invalid/revised-source'}]},
    {years:undefined}, {trims:undefined}, {engines:undefined}, {citations:undefined}, {citations:[null]}];
  for(const [index,change] of variants.entries()){
    const f=fixture(p,[car(p)],{twinStatus:'claimed',claimedAt:revision});let reads=0;
    f.db.knownIssue.findMany=async({where,select}:any)=>{
      reads++;assert.equal(where.status,'published');assert.equal(where.years.has,p.year);assert(where.id.in.includes(id));
      for(const key of ['years','trims','engines','citations'])assert.equal(select[key],true,key+' must be selected from the real owner source');
      const source={...raw,fixParts:[],communityRecommendations:[],...change};
      // Respect Prisma select instead of returning unrequested metadata.
      return[Object.fromEntries(Object.keys(select).filter(key=>select[key]).map(key=>[key,(source as any)[key]]))];
    };
    const outcome=await getTwinHubData(user.id,user.email,'car',{prisma:f.db,getRecentThreads:async()=>[]});assert(outcome.data);assert.equal(reads,1);assert.equal(f.state().writes,0);
    const issue=outcome.data.issues.find(row=>row.id===id)!;assert(issue);
    if(index===0){assert.doesNotMatch(issue.solution,/current equipment-specific diagnostic review is required/);if(catalogId==='mdx'||catalogId==='nautilus')assert.equal(issue.fixParts.length,1);}
    else{assert.match(issue.solution,/current equipment-specific diagnostic review is required/);assert.deepEqual(issue.fixParts,[]);}
  }
});

for(const catalogId of ['mdx','nautilus'])test(`${catalogId}: actual owner query preserves recall-first over diagnostic fluid commerce`,async()=>{
  const p=profiles.find(row=>row.catalogId===catalogId)!,f=fixture(p,[car(p)],{twinStatus:'claimed',claimedAt:revision});
  const id=catalogId==='mdx'?'acura-mdx-torque-converter-shudder-2014':'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph';
  const raw=published.rows.find(row=>row.id===id)!;
  f.db.knownIssue.findMany=async({select}:any)=>{const source={...raw,fixParts:[{component:'Recall action',recallFirst:true}],communityRecommendations:[]};return[Object.fromEntries(Object.keys(select).map(key=>[key,(source as any)[key]]))];};
  const outcome=await getTwinHubData(user.id,user.email,'car',{prisma:f.db,getRecentThreads:async()=>[]});assert(outcome.data);assert.equal(f.state().writes,0);
  assert.deepEqual(outcome.data.issues.find(row=>row.id===id)!.fixParts,[]);
});

for(const p of profiles) {
  test(`${p.catalogId}: bounded published snapshot reaches exact owner issue nodes without incompatible records`,async()=>{
    const f=fixture(p,[car(p)],{twinStatus:'claimed',claimedAt:revision});
    const catalog=getTwinByFulfillmentId(p.fulfillmentId)!;
    const allowed=new Set([...catalog.hotspots,...catalog.knownIssueHotspots||[]].flatMap(h=>h.knownIssueIds||[]));
    const expected=published.rows.filter(row=>allowed.has(row.id)&&row.years.includes(p.year)&&row.status==='published');
    f.db.knownIssue.findMany=async({where}:any)=>published.rows.filter(row=>where.id.in.includes(row.id)&&row.years.includes(where.years.has)&&row.status===where.status).map(row=>({...row,fixParts:[],communityRecommendations:[]}));
    const outcome=await getTwinHubData(user.id,user.email,'car',{prisma:f.db,getRecentThreads:async()=>[]});assert(outcome.data);
    assert.deepEqual(outcome.data.issues.map(row=>row.id).sort(),expected.map(row=>row.id).sort());
    const trees:any=buildOwnerMaintenanceTrees(outcome.data);
    const mapped=new Set(Object.values(trees.car.nodes).map((node:any)=>node.knownIssue?.id).filter(Boolean));
    for(const row of expected)assert(mapped.has(row.id),row.id+' has an actual owner node');
    if(p.catalogId==='xt6')for(const item of XT6_OWNER_ISSUE_NODES){
      const node=trees[item.branch].nodes[item.key];assert.equal(trees.car.nodes[item.key],node);assert(trees[item.branch].nodes[item.parent].kids.includes(item.key));
      for(const key of ['maintenanceType','servicedAt','serviceIntervalMiles','serviceIntervalMonths','buyUrl','products'])assert.equal(node[key],undefined);
      assert.equal(node.sub,item.review.scope);assert.equal(node.spec,item.review.reviewedMechanism);assert.equal(node.img,'/twin-stage/parts/'+item.review.image);
      const summary:TwinIssueSummary=outcome.data.issues.find(row=>row.id===item.id)!;assert(summary.solution.startsWith(item.review.reviewedAction!));assert.deepEqual(summary.fixParts,[]);
    }
    assert.equal(expected.length>0,p.catalogId!=='aviator');
    assert(outcome.data.issues.every(row=>!(/LSY|1\.6L|Kicks Play/.test(row.title))));
    if(p.catalogId==='murano'){const battery='nissan-murano-battery-drain-and-no-start-2021';assert(catalog.hotspots.find(h=>h.id==='hood')?.knownIssueIds?.includes(battery));assert(!catalog.hotspots.find(h=>h.id==='glass')?.knownIssueIds?.includes(battery));}
    if(p.catalogId==='mdx'){
      const shudder=outcome.data.issues.find(row=>row.id==='acura-mdx-torque-converter-shudder-2014')!;
      assert.match(shudder.solution,/Type 3\.1.*08200-9017.*page 677/);assert.doesNotMatch(shudder.solution,/DW-1/);assert.equal(shudder.fixParts.length,1);assert.equal(shudder.fixParts[0].oemPartNumber,'08200-9017');assert.match(shudder.fixParts[0].note!,/Only if diagnosed fluid service is indicated/);
      const raw=published.rows.find(row=>row.id===shudder.id)!;assert.match(raw.solution,/DW-1/);
      assert.deepEqual(buildOwnerTwinIssueSummary({...raw,fixParts:[],communityRecommendations:[]},car(p,false)),buildTwinIssueSummary({...raw,fixParts:[],communityRecommendations:[]}));
    }
  });
  test(`${p.catalogId}: exact versioned profile gates a real, unlogged owner tree`,()=>{
    assert.equal(getLiveTwinForVehicle(p)?.id,p.fulfillmentId);
    for(const id of [null,'unknown',profiles.find(other=>other!==p)!.id])assert.equal(ownerEquipmentReady({...identity(p),reviewedEquipmentId:id}),false);
    assert.equal(confirmedOwnerEquipment(car(p))?.engine,p.engine);
    assert.equal(validOwnerEquipmentSelection({...identity(p),year:p.year+1},p.id),false);
    const base={fulfillmentId:p.fulfillmentId,vehicle:car(p),records:[],installedParts:[],miles:64000,transmission:'automatic',evaluatedAt:now.toISOString()};
    assert.equal(buildOwnerMaintenanceTrees({...base,vehicle:car(p,false)}),null);
    const trees:any=buildOwnerMaintenanceTrees(base);assert(trees);
    for(const node of Object.values(trees.car.nodes) as any[]) {assert.equal(node.sampleRecord,undefined);assert.equal(node.servicedAt,undefined);if(node.maintenanceType)assert.equal(node.unlogged,true);}
    const oil={id:'actual-oil',type:'oil_change',mileage:62000,date:'2026-09-01T12:00:00Z',nextDueMileage:null,nextDueDate:null};
    const logged:any=buildOwnerMaintenanceTrees({...base,records:[oil]});assert(Object.values(logged.car.nodes).some((node:any)=>node.serviceRecordId==='actual-oil'));
    const part={nodeId:'transFluid',kind:'installed-part',lifespanMiles:1234,installedAtMileage:60000,installDate:oil.date,fitmentKey:`${p.catalogId}:automatic`};
    const old:any=buildOwnerMaintenanceTrees({...base,installedParts:[part]});assert.equal(old.car.nodes.transFluid.servicedAt,undefined);
    const fitted:any=buildOwnerMaintenanceTrees({...base,installedParts:[{...part,fitmentKey:ownerEquipmentFitmentKey(p.catalogId,'automatic',car(p))}]});assert.equal(fitted.car.nodes.transFluid.dueMileage,61234);
    if(['nautilus','murano','kicks'].includes(p.catalogId)){
      assert.deepEqual(trees.trans.nodes.driveline.kids.filter((id:string)=>!trees.trans.nodes[id].manualRequirement),['transFluid']);
      for(const id of trees.trans.nodes.driveline.kids.filter((id:string)=>trees.trans.nodes[id].manualRequirement)){
        const node=trees.trans.nodes[id];assert(node.sourceRequirementId);assert(node.serviceGuidance);
        assert(node.serviceLogHold||['halfshaft_boots_inspection','steering_suspension_driveshaft_inspection'].includes(node.maintenanceType),'No newly enabled AWD fluid service');
      }
    }
    if(p.catalogId==='xt6'){assert.match(trees.car.nodes.rearAxleFluid.partNo,/88862624/);assert.match(trees.car.nodes.clutchFluid.partNo,/88901975/);}
    if(p.catalogId==='mdx'){assert.match(trees.car.nodes.rearAxleFluid.partNo,/08200-9007A/);assert.match(trees.car.nodes.transferFluid.partNo,/08200-9014A/);}
  });
  test(`${p.catalogId}: add payload requires attestation and validates returned profile`,async()=>{
    assert.throws(()=>hubVehiclePayload(hubAddTwinFields(p.catalogId,{vin:'',currentMileage:'64000'})),/Confirm/);
    const fields=hubAddTwinFields(p.catalogId,{vin:'',currentMileage:'64000',reviewedEquipmentId:p.id});const payload=hubVehiclePayload(fields);
    assert.deepEqual(payload,{...identity(p),reviewedEquipmentId:p.id,currentMileage:64000,hubSetup:true,isPrimary:false});
    const request=(async()=>Response.json({vehicle:{id:'saved',...payload}})) as typeof fetch;
    assert.equal((await createHubVehicle(fields,request)).reviewedEquipmentId,p.id);
    await assert.rejects(createHubVehicle(fields,(async()=>Response.json({vehicle:{id:'saved',...payload,reviewedEquipmentId:null}})) as typeof fetch),HubVehicleSaveUnconfirmedError);
  });
  test(`${p.catalogId}: setup, atomic claim and bounded owner readback use actual equipment only`,async()=>{
    const f=fixture(p);const page=await f.load();assert.equal(page.kind,'display');if(page.kind==='display'){assert.equal(page.equipment?.id,p.id);assert.equal(page.needsMileage,true);}
    for(const value of [undefined,'unknown',profiles.find(other=>other!==p)!.id]){assert((await f.post({mileage:64000,...(value?{reviewedEquipmentId:value}:{})})).status>=400);assert.equal(f.state().writes,0);}
    assert.equal((await f.post({mileage:64000,reviewedEquipmentId:p.id})).status,200);
    const saved=f.state().garage[0];assert.equal(saved.reviewedEquipmentId,p.id);assert.equal(saved.transmission,null);assert.equal(saved.currentMileage,64000);assert.equal(saved.maintenanceRecords,undefined);
    assert.equal((await f.post()).status,200);assert.equal(f.state().created,1);assert.equal(f.state().reservation.claimedAt.getTime(),now.getTime());
    const outcome=await getTwinHubData(user.id,user.email,saved.id,{prisma:f.db,getRecentThreads:async()=>[]});assert.equal(outcome.access.kind,'allowed');assert(outcome.data);assert.equal(outcome.data.vehicle.engine,p.engine);assert.equal(outcome.data.vehicle.reviewedEquipmentId,p.id);assert.deepEqual(outcome.data.records,[]);assert(buildOwnerMaintenanceTrees(outcome.data));
    assert(f.state().recordReads>0);assert(f.state().issueQueries.every(query=>query.where.status==='published'&&query.where.years.has===p.year));
  });
  test(`${p.catalogId}: existing equipment setup and stale/mismatched claim preserve history and clock`,async()=>{
    const existing={...car(p,false),historyMarker:'preserve'};const f=fixture(p,[existing]);
    const page=await f.load();assert.equal(page.kind,'display');if(page.kind==='display'){assert.equal(page.equipment?.id,p.id);assert.equal(page.vehicleRevision,revision.toISOString());}
    for(const body of [{reviewedEquipmentId:p.id},{reviewedEquipmentId:p.id,expectedVehicleUpdatedAt:'2020-01-01T00:00:00Z'},{reviewedEquipmentId:profiles.find(other=>other!==p)!.id,expectedVehicleUpdatedAt:revision.toISOString()}]){assert((await f.post(body)).status>=400);assert.equal(f.state().writes,0);}
    assert.equal((await f.post({reviewedEquipmentId:p.id,expectedVehicleUpdatedAt:revision.toISOString()})).status,200);assert.equal(f.state().garage[0].historyMarker,'preserve');assert.equal(f.state().created,0);
    const c=fixture(p,[],{},true);assert.equal((await c.post({mileage:64000,reviewedEquipmentId:p.id})).status,409);assert.equal(c.state().created,0);assert.deepEqual(c.state().garage,[]);
  });
  test(`${p.catalogId}: unconfirmed owners cannot load records; PATCH is an owned, revision-guarded recovery`,async()=>{
    const f=fixture(p,[car(p,false)],{twinStatus:'claimed',claimedAt:revision});
    const outcome=await getTwinHubData(user.id,user.email,'car',{prisma:f.db,getRecentThreads:async()=>[]});assert.equal(outcome.access.reason,'equipment-unconfirmed');assert.equal(outcome.data,null);assert.equal(f.state().recordReads,0);assert('equipmentSetup' in outcome);assert.equal(outcome.equipmentSetup?.profile.id,p.id);
    assert.equal(outcome.equipmentSetup?.canConfirm,true);
    const unclaimed=fixture(p,[car(p,false)]);
    const pending=await getTwinHubData(user.id,user.email,'car',{prisma:unclaimed.db,getRecentThreads:async()=>[]});
    assert('equipmentSetup' in pending);assert.equal(pending.equipmentSetup?.canConfirm,false);
    const expired=fixture(p,[car(p,false)],{twinStatus:'claimed',claimedAt:new Date('2020-01-01')});
    const ended=await getTwinHubData(user.id,user.email,'car',{prisma:expired.db,getRecentThreads:async()=>[]});
    assert.notEqual('equipmentSetup' in ended && ended.equipmentSetup?.canConfirm,true);
    const patch=createVehiclePatchHandler({auth:async()=>({user}),prisma:f.db,now:()=>now});
    const send=(body:any)=>patch(new Request('https://fixture.invalid/api/vehicles/car',{method:'PATCH',body:JSON.stringify(body)}),{params:Promise.resolve({id:'car'})});
    assert.equal((await send({reviewedEquipmentId:p.id})).status,400);
    assert.equal((await send({reviewedEquipmentId:p.id,expectedUpdatedAt:'2020-01-01T00:00:00Z'})).status,409);assert.equal(f.state().writes,0);
    assert.equal((await send({reviewedEquipmentId:p.id,expectedUpdatedAt:revision.toISOString()})).status,200);
    assert.equal(f.state().garage[0].reviewedEquipmentId,p.id);assert.equal(f.state().reservation.claimedAt.getTime(),revision.getTime());
    assert.equal((await send({year:p.year+1})).status,200);assert.equal(f.state().garage[0].reviewedEquipmentId,null);
  });
  test(`${p.catalogId}: unsent 7/30-day invitation retains exact artwork and country/provenance gates`,async()=>{
    const f=fixture(p);for(const days of [7,30]){
      const row={...f.state().reservation,trialDays:days,readyAt:revision,invitedAt:null,unsubscribedAt:null,unsubscribeToken:'fixture-token'};
      const offer=readyInvitationOffer(row);assert(offer);assert.equal(offer.artwork,getTwinByFulfillmentId(p.fulfillmentId)!.art.base);assert.equal(offer.trialDays,days);
      const mail=twinReadyEmail({...offer,baseUrl:'https://fixture.invalid'} as never);assert(JSON.stringify(mail).includes('fixture.invalid'));assert(JSON.stringify(mail).includes('offer'));
      assert(mail.text.includes(p.details));
      const prepared=await prepareTwinReadyInvitationArtwork({mail,artwork:offer.artwork,baseUrl:'https://fixture.invalid'});assert.equal(prepared.attachments.length,1);assert.match(prepared.html,/cid:au7o-ready-twin/);
      for(const change of [{country:'DE'},{vehicleVerified:false},{trimVerified:false},{twinStatus:'building'},{year:p.year+1}])assert.equal(readyInvitationOffer({...row,...change}),null);
    }
  });
}
test('confirmed equipment scopes new circuit jobs but preserves unknown-equipment and legacy history reads',()=>{
  for(const p of profiles){
    const equipped=car(p),unknown=car(p,false);
    for(const type of ['differential_fluid','transfer_case_fluid'])assert.equal(resolveMaintenanceWriteType(type,unknown).ok,true);
    if(['nautilus','murano','kicks'].includes(p.catalogId))for(const type of ['differential_fluid','transfer_case_fluid','rear_axle_fluid','awd_clutch_fluid'])assert.equal(resolveMaintenanceWriteType(type,equipped).ok,false);
    assert.deepEqual(resolveMaintenanceReadTypes('differential_fluid',equipped),['differential_fluid']);
    if(p.catalogId==='xt6'){assert.equal(resolveMaintenanceWriteType('rear_axle_fluid',equipped).ok,true);assert.equal(resolveMaintenanceWriteType('awd_clutch_fluid',equipped).ok,true);}
    if(p.catalogId==='mdx'){assert.equal(resolveMaintenanceWriteType('rear_axle_fluid',equipped).ok,true);assert.equal(resolveMaintenanceWriteType('transfer_case_fluid',equipped).ok,true);}
    if(p.catalogId==='aviator'){assert.equal(resolveMaintenanceWriteType('differential_fluid',equipped).ok,true);assert.equal(resolveMaintenanceWriteType('transfer_case_fluid',equipped).ok,false);}
  }
});
test('six owner reminder clocks use the final installed-part node and never unknown equipment',()=>{
  for(const p of profiles){const vehicle=car(p),data:any={vehicleId:'car',vehicle,fulfillmentId:p.fulfillmentId,miles:64000,transmission:'automatic',records:[],installedParts:[{nodeId:'transFluid',kind:'installed-part',lifespanMiles:1234,installedAtMileage:60000,installDate:revision.toISOString(),fitmentKey:ownerEquipmentFitmentKey(p.catalogId,'automatic',vehicle)}],evaluatedAt:now.toISOString()};
    const alerts=buildOwnerMaintenanceReminders(vehicle,data);assert.equal(alerts.length,1);assert.equal(alerts[0].status.dueAtMileage,61234);assert.equal(alerts[0].destination,'hub');assert.deepEqual(buildOwnerMaintenanceReminders(vehicle,{...data,vehicle:car(p,false)}),[]);
  }
});
test('MDX owner diagnostic override is exact, source-bound, no-commerce and leaves published records unchanged',()=>{
  const row={id:'acura-mdx-auto-idle-stop-failure-to-restart',title:'Idle-stop',severity:'Medium',make:'Acura',model:'MDX',description:'Published description',solution:'covered 10 years; install an aftermarket auto-disable module',fixParts:[],communityRecommendations:[]};
  const mdx=profiles.find(p=>p.catalogId==='mdx')!;const original=structuredClone(row);
  const safe=buildOwnerTwinIssueSummary(row,car(mdx));assert.match(safe.solution,/current equipment-specific diagnostic review/);assert.doesNotMatch(safe.solution,/covered 10 years|install an aftermarket/);assert.deepEqual(safe.fixParts,[]);assert.equal(safe.href,buildTwinIssueSummary(row).href);assert.deepEqual(row,original);
  for(const vehicle of [car(mdx,false),{...car(mdx),year:2020},car(profiles[0])])assert.deepEqual(buildOwnerTwinIssueSummary(row,vehicle),buildTwinIssueSummary(row));
  const unrelated={...row,id:'unrelated'};assert.deepEqual(buildOwnerTwinIssueSummary(unrelated,car(mdx)),buildTwinIssueSummary(unrelated));
});
test('new profiles never waive provenance, entitlement, duplicate or expired-offer checks',async()=>{
  for(const change of [{country:'DE'},{vehicleVerified:false},{trimVerified:false},{trialDays:14},{twinStatus:'claimed',claimedAt:new Date('2020-01-01T00:00:00Z')}]){
    const f=fixture(profiles[0],[car(profiles[0])],change);assert((await f.post()).status>=400);assert.equal(f.state().writes,0);
  }
  const f=fixture(profiles[0],[car(profiles[0]),{...car(profiles[0]),id:'duplicate'}]);assert((await f.post()).status>=400);assert.equal(f.state().writes,0);
  const noRights=fixture(profiles[0],[car(profiles[0])]);noRights.tx.reservation.findMany=async()=>[];
  const outcome=await getTwinHubData(user.id,user.email,'car',{prisma:noRights.db,getRecentThreads:async()=>[]});assert.equal(outcome.access.reason,'missing-reservation');assert.equal(noRights.state().recordReads,0);
});
test('already claimed six offers can confirm missing equipment without another trial or vehicle',async()=>{
  for(const p of profiles){const f=fixture(p,[car(p,false)],{twinStatus:'claimed',claimedAt:revision});const page=await f.load();assert.equal(page.kind,'display');if(page.kind==='display'){assert.equal(page.ready,true);assert.equal(page.resumeClaimed,true);assert.equal(page.equipment?.id,p.id);}
    assert.equal((await f.post({reviewedEquipmentId:p.id,expectedVehicleUpdatedAt:revision.toISOString()})).status,200);assert.equal(f.state().created,0);assert.equal(f.state().reservation.claimedAt.getTime(),revision.getTime());assert.equal(f.state().reservation.updatedAt.getTime(),revision.getTime());
    const opened=await f.load();assert.equal(opened.kind,'redirect-owner');
  }
});
test('equipment confirmation rejects a concurrent identity write at CAS without primary/mileage side effects',async()=>{
  const f=fixture(profiles[0],[car(profiles[0],false)]);f.tx.vehicle.updateMany=async()=>({count:0});
  const patch=createVehiclePatchHandler({auth:async()=>({user}),prisma:f.db,now:()=>now});
  const response=await patch(new Request('https://fixture.invalid',{method:'PATCH',body:JSON.stringify({reviewedEquipmentId:profiles[0].id,expectedUpdatedAt:revision.toISOString(),currentMileage:65000})}),{params:Promise.resolve({id:'car'})});
  assert.equal(response.status,409);assert.equal(f.state().writes,0);assert.equal(f.state().garage[0].reviewedEquipmentId,null);assert.equal(f.state().garage[0].currentMileage,64000);
});
test('paid Hub entitlement does not bypass the six equipment gate',async()=>{
  const f=fixture(profiles[0],[car(profiles[0],false)]);f.tx.reservation.findMany=async()=>[];f.tx.user.findUnique=async()=>({email:user.email,emailVerified:revision,subscriptionId:'fixture',subscriptionStatus:'active',subscriptionTier:'hub'});
  const blocked=await getTwinHubData(user.id,user.email,'car',{prisma:f.db,getRecentThreads:async()=>[]});assert.equal(blocked.access.reason,'equipment-unconfirmed');assert.equal(f.state().recordReads,0);
});
test('old generic driveline metadata remains editable after confirmation without reclassifying history',async()=>{
  const vehicle=car(profiles[0]);const existing={id:'legacy',vehicleId:'car',vehicle,type:'differential_fluid',mileage:50000,date:revision,nextDueMileage:null,nextDueDate:null,cost:null,description:null,notes:null,shopName:null,receiptUrl:null};
  const tx={vehicle:{updateMany:async()=>({count:1})},maintenanceRecord:{findUnique:async()=>existing,update:async({data}:any)=>({...existing,...data})}};
  const patch=createMaintenancePatchHandler({auth:async()=>({user}),prisma:{$transaction:async(run:any)=>run(tx)} as never,now:()=>now});
  const response=await patch(new Request('https://fixture.invalid',{method:'PATCH',body:JSON.stringify({notes:'Old receipt does not establish the circuit'})}),{params:Promise.resolve({id:'legacy'})});assert.equal(response.status,200);const result=await response.json();assert.equal(result.record.type,'differential_fluid');assert.match(result.record.notes,/does not establish/);
});
