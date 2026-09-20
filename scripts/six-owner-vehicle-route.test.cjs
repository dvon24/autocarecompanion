const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
test('actual POST route validates exact profiles before any write; quota/session and missing-equipment recovery preserved',async()=>{
  const built=await esbuild.build({entryPoints:[path.join(root,'src/app/api/vehicles/route.ts')],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',tsconfig:path.join(root,'tsconfig.json'),plugins:[{name:'no-provider',setup(b){
    b.onResolve({filter:/^@\/lib\/(?:db|auth|pricing\/limits)$/},args=>({path:args.path,namespace:'fixture'}));
    b.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path.endsWith('/auth')?'export const auth=()=>globalThis.__sixRoute.auth();':args.path.endsWith('/db')?'export const prisma=globalThis.__sixRoute.db;':'export const checkVehicleLimit=()=>globalThis.__sixRoute.limit;',loader:'js'}));
  }}]});
  let writes=[],session={user:{id:'owner'}},limit={allowed:true,current:1,limit:3,tier:'plus'};
  globalThis.__sixRoute={auth:async()=>session,get limit(){return limit},db:{vehicle:{create:async({data})=>{writes.push(data);return{id:'created',...data}},updateMany:async()=>{writes.push('primary')}},mileageLog:{create:async({data})=>{writes.push(data)}}}};
  const compiled=new Module(path.join(root,'fixture-six-route.cjs'));compiled.filename=path.join(root,'fixture-six-route.cjs');compiled.paths=Module._nodeModulePaths(root);compiled._compile(built.outputFiles[0].text,compiled.filename);
  const send=body=>compiled.exports.POST(new Request('https://fixture.invalid/api/vehicles',{method:'POST',body:JSON.stringify(body)}));
  const identities=[
    [2019,'Lincoln','Nautilus','Standard','nautilus-2019-2l-fwd-18-solid-rear-v1'],[2023,'Nissan','Murano','SV','murano-2023-35l-fwd-18-v1'],[2020,'Cadillac','XT6','Sport','xt6-2020-36l-awd-20-v1'],
    [2025,'Nissan','Kicks','SV','kicks-2025-2l-fwd-17-v1'],[2019,'Acura','MDX','Technology','mdx-2019-35l-sh-awd-20-v1'],[2026,'Lincoln','Aviator','Premiere','aviator-2026-3l-rwd-20-v1'],
  ];
  try{for(const[year,make,model,trim,id]of identities){const vehicle={year,make,model,trim,currentMileage:12345};
    for(const profile of ['unknown',identities.find(row=>row[4]!==id)[4]]){writes=[];assert.equal((await send({...vehicle,reviewedEquipmentId:profile,isPrimary:true})).status,400);assert.deepEqual(writes,[])}
    writes=[];const response=await send({...vehicle,reviewedEquipmentId:id});assert.equal(response.status,201);assert.equal((await response.json()).vehicle.reviewedEquipmentId,id);assert.equal(writes[0].currentMileage,12345);assert.equal(writes[0].maintenanceRecords,undefined);assert.equal(writes.length,2);
    writes=[];assert.equal((await send(vehicle)).status,201);assert.equal(writes[0].reviewedEquipmentId,undefined,'ordinary garage creation may remain unconfirmed; never grants a Hub');
  }
  writes=[];session=null;assert.equal((await send({})).status,401);assert.deepEqual(writes,[]);
  session={user:{id:'owner'}};limit={allowed:false,current:3,limit:3,tier:'plus'};assert.equal((await send({})).status,403);assert.deepEqual(writes,[]);
  }finally{delete globalThis.__sixRoute}
});
