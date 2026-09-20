import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOwnerMaintenanceReminders } from '../src/lib/maintenance-reminder-data';
import { buildOwnerMaintenanceTrees } from '../src/components/twin/owner-maintenance-trees';
import { TT_TREES } from '../src/components/twin/twin-tree-data';
import { maintenanceReminderHref, resolveMaintenanceReminderEntry } from '../src/lib/maintenance-reminder-entry';
import { requestEmailPreference } from '../src/lib/notification-preferences-client';
import type { TwinHubData, TwinHubOutcome } from '../src/lib/twin-hub-data';

const vehicle = {id:'owner-car',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',color:'Granite Crystal Metallic',transmission:'manual',currentMileage:65000};
const data = (overrides:Partial<TwinHubData>={}):TwinHubData => ({vehicleId:vehicle.id,vehicle:{...vehicle,engine:'6.4L'},miles:65000,fulfillmentId:'dodge-challenger',transmission:'manual',transmissionOptions:[],canSelectTransmission:false,vehicleRevision:'2026-09-13',evaluatedAt:'2026-09-13T12:00:00Z',records:[],installedParts:[],issues:[],recent:[],...overrides});
const record = {id:'old',type:'tire_replacement',mileage:10000,date:'2026-01-01',nextDueMileage:60000,nextDueDate:null};
const part = {nodeId:'tire',category:'tires',name:'Saved tires',brand:null,partNumber:null,cost:null,imageUrl:null,notes:null,kind:'installed-part',lifespanMiles:30000,installedAtMileage:64000,installDate:'2026-09-12',fitmentKey:null};
const allowed = (payload=data()):TwinHubOutcome => ({access:{kind:'allowed',allowed:true,claimable:false,reason:'allowed-paid-hub',expiresAt:null},data:payload});

test('pure tree extraction preserves every original template value',()=>{
  const original=JSON.parse(readFileSync('scripts/fixtures/accepted-template-before-extraction.json','utf8')).trees;
  assert.deepEqual(TT_TREES,original);
});
test('actual owner replacement node uses latest installed lifespan, no rotation alias',()=>{
  const payload=data({records:[record,{...record,id:'rotation',type:'tire_rotation',mileage:65000,date:'2026-09-12'}],installedParts:[part]});
  const trees=buildOwnerMaintenanceTrees(payload)!;
  assert.equal(trees.car.nodes.tire.maintenanceType,'tire_replacement');
  assert.equal(trees.car.nodes.tire.dueMileage,94000);
  assert.equal(Object.values(trees.car.nodes).some((n:any)=>n.maintenanceType==='tire_rotation'),false);
  assert.deepEqual(buildOwnerMaintenanceReminders(vehicle,payload),[]);
  const due=data({...payload,installedParts:[{...part,installedAtMileage:35000}]});
  const alert=buildOwnerMaintenanceReminders(vehicle,due)[0];
  assert.equal(alert.status.dueAtMileage,buildOwnerMaintenanceTrees(due)!.car.nodes.tire.dueMileage);
  assert.equal(alert.status.status,'due_soon');
  assert.equal(alert.destination,'hub');
});
test('transmission installed lifespan remains branch-scoped; no history remains silent',()=>{
  const payload=data({records:[{...record,type:'transmission_fluid_manual'}],installedParts:[{...part,nodeId:'transFluid',fitmentKey:'challenger:automatic'}]});
  const alert=buildOwnerMaintenanceReminders(vehicle,payload)[0];
  assert.equal(alert.status.dueAtMileage,60000);
  assert.equal(alert.status.status,'overdue');
  assert.deepEqual(buildOwnerMaintenanceReminders(vehicle,data()),[]);
});
test('duplicate oil components select overdue final lifespan before a due-soon node',()=>{
  const payload=data({records:[{...record,type:'oil_change',nextDueMileage:65200,nextDueDate:'2027-01-01'}],installedParts:[{...part,nodeId:'oilFilter',installedAtMileage:60000,lifespanMiles:4000}]});
  const alerts=buildOwnerMaintenanceReminders(vehicle,payload).filter(alert=>alert.maintenanceType==='oil_change');
  assert.equal(alerts.length,1);
  assert.equal(alerts[0].status.status,'overdue');
  assert.equal(alerts[0].status.dueAtMileage,64000);
  assert.equal(alerts[0].lastServiceDate,part.installDate);
});
test('entry preserves logged-out schedule/tree callback and scopes every outcome',async()=>{
  for(const view of ['schedule','tree'] as const) {
    const request={user:null,vehicleId:vehicle.id,view,findOwnedVehicle:async()=>{throw new Error('must authenticate first');},loadTwin:async()=>allowed()};
    const signIn=await resolveMaintenanceReminderEntry(request);
    assert.equal(new URL(signIn,'https://test.invalid').searchParams.get('callbackUrl'),maintenanceReminderHref(vehicle.id,view));
    const owned={...request,user:{id:'owner',email:'owner@example.invalid'},findOwnedVehicle:async(userId:string,id:string)=>{assert.equal(userId,'owner');assert.equal(id,vehicle.id);return vehicle;}};
    assert.equal(await resolveMaintenanceReminderEntry(owned),`/vehicle/2015-dodge-challenger-srt-392?vehicleId=owner-car&${view==='tree'?'open=car':'view=schedule'}`);
    assert.equal(await resolveMaintenanceReminderEntry({...owned,findOwnedVehicle:async()=>null}),'/garage');
    for(const outcome of [
      {access:{kind:'denied',allowed:false,claimable:false,reason:'unsupported-vehicle',expiresAt:null},data:null},
      {access:{kind:'claimable',allowed:false,claimable:true,reason:'claimable-ready',expiresAt:null},data:null},
    ] as TwinHubOutcome[]) assert.equal(await resolveMaintenanceReminderEntry({...owned,loadTwin:async()=>outcome}),'/garage/owner-car/records');
    assert.equal(await resolveMaintenanceReminderEntry({...owned,loadTwin:async()=>{throw new Error('unavailable');}}),'/garage/owner-car/records');
    assert.equal(await resolveMaintenanceReminderEntry({...owned,loadTwin:async()=>allowed(data({vehicleId:'another'}))}),'/garage/owner-car/records');
  }
});
test('preferences load/save only email; API and network failures remain visible',async()=>{
  const calls:any[]=[];
  const fetcher=(async(url:any,options:any)=>{calls.push({url,options});return {ok:true,json:async()=>({preferences:{emailNotifications:false,pushNotifications:true}})};}) as typeof fetch;
  assert.equal(await requestEmailPreference(fetcher),false);
  assert.equal(await requestEmailPreference(fetcher,false),false);
  assert.deepEqual(JSON.parse(calls[1].options.body),{emailNotifications:false});
  assert.equal(calls[1].options.method,'PATCH');
  await assert.rejects(requestEmailPreference(async()=>new Response(JSON.stringify({error:'Save failed'}),{status:500}),true),/Save failed/);
  await assert.rejects(requestEmailPreference((async()=>{throw new Error('Offline');}) as typeof fetch,true),/Offline/);
});
