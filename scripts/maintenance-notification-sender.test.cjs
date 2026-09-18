/* Actual production sender bundled with an isolated in-memory DB and fake fetch.
 * No environment files, database clients, cron route or real provider are loaded. */
const test=require('node:test');
const assert=require('node:assert/strict');
const esbuild=require('esbuild');
async function loadSender(state){
  const result=await esbuild.build({entryPoints:['src/lib/notifications.ts'],bundle:true,write:false,metafile:true,platform:'node',format:'cjs',packages:'external',plugins:[{name:'no-database',setup(build){build.onResolve({filter:/^\.\/twin-hub-data$/},()=>({path:'owner',namespace:'owner-fixture'}));build.onLoad({filter:/.*/,namespace:'owner-fixture'},()=>({contents:'export const getTwinHubData=globalThis.__reminderFixtureOwner;'}));build.onResolve({filter:/^(\.\/db|@\/lib\/db)$/},()=>({path:'db',namespace:'fixture'}));build.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const prisma=globalThis.__reminderFixtureDb; export default prisma;'}));}}]});
  for (const input of Object.keys(result.metafile.inputs)) {assert.doesNotMatch(input,/\.(jsx|tsx)$/,'Server sender must not import JSX');if(input.startsWith('src/'))assert.doesNotMatch(require('node:fs').readFileSync(input,'utf8'),/^['\"]use client['\"];?/m,'Server sender must not import client modules');}
  globalThis.__reminderFixtureDb={user:{findMany:async(args)=>{state.query=args;return state.users;}},notificationLog:{findFirst:async()=>state.sent?{id:'logged'}:null,create:async()=>{state.sent=true;state.logs++;}}};
  globalThis.__reminderFixtureOwner=async(userId,email,vehicleId)=>{state.ownerCalls??=[];state.ownerCalls.push({userId,email,vehicleId});if(state.ownerFailure)throw new Error('fixture unavailable');const owner=state.users.find(user=>user.id===userId);const vehicle=owner.vehicles.find(car=>car.id===vehicleId);return state.denied?{access:{kind:'denied'},data:null}:{access:{kind:'allowed'},data:{vehicleId,vehicle:{...vehicle,engine:'6.4L'},miles:vehicle.currentMileage,fulfillmentId:'dodge-challenger',transmission:vehicle.transmission,evaluatedAt:new Date().toISOString(),records:vehicle.maintenanceRecords.map(row=>({...row,date:row.date.toISOString(),nextDueDate:row.nextDueDate?.toISOString()??null})),installedParts:state.installedParts??[],issues:[],recent:[]}};};
  const module={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(require,module,module.exports);delete globalThis.__reminderFixtureDb;delete globalThis.__reminderFixtureOwner;return module.exports;
}
test('sender reads saved branch/history, excludes Visual, honors preferences and skips same-day replays',async()=>{
  const vehicle={id:'synthetic-car',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',color:'Granite Crystal Metallic',transmission:'manual',nickname:null,currentMileage:65000,maintenanceRecords:[{id:'service',type:'transmission_fluid_manual',mileage:50000,date:new Date('2026-01-01'),nextDueMileage:60000,nextDueDate:null}]};
  const hub={id:'synthetic-user',email:'owner@example.invalid',name:'Synthetic',emailVerified:new Date('2026-01-01'),subscriptionId:'synthetic-sub',subscriptionStatus:'active',subscriptionTier:'hub',emailNotifications:true,pushNotifications:false,vehicles:[vehicle]};
  const state={users:[hub,{...hub,id:'visual',subscriptionTier:'visual'},{...hub,id:'empty',vehicles:[{...vehicle,maintenanceRecords:[]}]},{...hub,id:'muted',emailNotifications:false}],logs:0,sent:false,query:null};
  const sender=await loadSender(state);
  const originalFetch=global.fetch,originalKey=process.env.RESEND_API_KEY;
  const sent=[];process.env.RESEND_API_KEY='synthetic-not-a-real-key';
  global.fetch=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');sent.push(options);return {ok:true};};
  try{
    const first=await sender.processMaintenanceNotifications();assert.equal(first.emailsSent,1);assert.equal(sent.length,1);
    assert.equal(state.query.select.vehicles.select.transmission,true);
    const body=JSON.parse(sent[0].body);assert.equal(body.to,hub.email);assert.match(body.html,/Manual transmission fluid/);assert.match(body.html,/vehicleId=synthetic-car&amp;view=schedule/);assert.match(sent[0].headers['Idempotency-Key'],/^maintenance\/\d{4}-\d{2}-\d{2}\/[a-f0-9]+$/);
    assert.equal((await sender.processMaintenanceNotifications()).emailsSent,0);assert.equal(sent.length,1);assert.equal(state.logs,1);
  }finally{global.fetch=originalFetch;if(originalKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=originalKey;}
});


test('actual sender skips stale installed deadlines, fails closed on loader error and labels denied records fallback',async()=>{
 const vehicle={id:'fixture-car',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'manual',currentMileage:65000,maintenanceRecords:[{id:'old',type:'tire_replacement',mileage:10000,date:new Date('2026-01-01'),nextDueMileage:60000,nextDueDate:null}]};
 const user={id:'owner',email:'owner@example.invalid',emailVerified:new Date('2026-01-01'),subscriptionId:'sub',subscriptionStatus:'active',subscriptionTier:'hub',vehicles:[vehicle]};
 const state={users:[user],installedParts:[{nodeId:'tire',kind:'installed-part',lifespanMiles:30000,installedAtMileage:64000,installDate:'2026-09-12'}]};
 const sender=await loadSender(state);
 assert.deepEqual(await sender.getUsersWithDueMaintenance(),[]);
 state.ownerFailure=true;
 assert.deepEqual(await sender.getUsersWithDueMaintenance(),[]);
 state.ownerFailure=false;state.denied=true;
 const result=await sender.getUsersWithDueMaintenance();
 assert.equal(result.length,1);
 const html=sender.generateMaintenanceEmailHtml(null,result[0].alerts);
 assert.match(html,/Review service records/);
 assert.doesNotMatch(html,/Open my schedule/);
 assert.match(html,/vehicleId=fixture-car&amp;view=records/);
 assert.deepEqual(state.ownerCalls[0],{userId:'owner',email:user.email,vehicleId:vehicle.id});
});
