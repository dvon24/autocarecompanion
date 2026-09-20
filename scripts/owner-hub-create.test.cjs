const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
test('actual vehicle POST enforces complete reviewed Hub workflow while preserving ordinary garage saves',async()=>{
  let writes=[],session={user:{id:'owner'}},paid=true;
  globalThis.__hubCreate={auth:async()=>session,limit:{allowed:true,current:1,limit:10,tier:'hub'},db:{user:{findUnique:async()=>paid?{email:'owner@example.invalid',emailVerified:new Date(),subscriptionId:'sub_test',subscriptionStatus:'active',subscriptionTier:'hub'}:null},vehicle:{create:async({data})=>{writes.push(data);return{id:'created',...data}},updateMany:async()=>writes.push('primary')},mileageLog:{create:async({data})=>writes.push(data)}}};
  const built=await esbuild.build({entryPoints:[path.join(root,'src/app/api/vehicles/route.ts')],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',tsconfig:path.join(root,'tsconfig.json'),plugins:[{name:'isolated',setup(b){
    b.onResolve({filter:/^@\/lib\/(?:db|auth|pricing\/limits)$/},a=>({path:a.path,namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path.endsWith('/auth')?'export const auth=()=>globalThis.__hubCreate.auth();':a.path.endsWith('/db')?'export const prisma=globalThis.__hubCreate.db;':'export const checkVehicleLimit=async()=>globalThis.__hubCreate.limit;',loader:'js'}));
  }}]});
  const mod=new Module(path.join(root,'fixture-hub-create.cjs'));mod.filename=path.join(root,'fixture-hub-create.cjs');mod.paths=Module._nodeModulePaths(root);mod._compile(built.outputFiles[0].text,mod.filename);
  const base={year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',hubSetup:true,currentMileage:12345,transmission:'manual'};
  const send=body=>mod.exports.POST(new Request('https://fixture.invalid/api/vehicles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
  try{
    for(const change of [{currentMileage:undefined},{currentMileage:0},{currentMileage:-1},{currentMileage:1.5},{currentMileage:2147483648},{transmission:undefined},{transmission:'cvT'},{model:'Viper',trim:'ACR'}]){writes=[];assert.equal((await send({...base,...change})).status,400,JSON.stringify(change));assert.deepEqual(writes,[]);}
    writes=[];let result=await send(base);assert.equal(result.status,201);assert.equal((await result.json()).vehicle.transmission,'manual');assert.equal(writes[0].hubSetup,undefined);assert.equal(writes.length,2);assert.equal(writes[1].source,'manual');
    const xt6={year:2020,make:'Cadillac',model:'XT6',trim:'Sport',currentMileage:54321,hubSetup:true};
    writes=[];assert.equal((await send(xt6)).status,400);assert.deepEqual(writes,[]);
    writes=[];result=await send({...xt6,reviewedEquipmentId:'xt6-2020-36l-awd-20-v1'});assert.equal(result.status,201);assert.equal(writes[0].transmission,undefined);
    writes=[];assert.equal((await send({...xt6,reviewedEquipmentId:'xt6-2020-36l-awd-20-v1',transmission:'automatic'})).status,400);assert.deepEqual(writes,[]);
    writes=[];paid=false;assert.equal((await send(base)).status,403);assert.deepEqual(writes,[]);paid=true;
    writes=[];session=null;assert.equal((await send(base)).status,401);assert.deepEqual(writes,[]);session={user:{id:'owner'}};
    writes=[];result=await send({year:2014,make:'Dodge',model:'Viper',trim:'ACR'});assert.equal(result.status,201);assert.equal(writes[0].currentMileage,null,'legacy freeform remains a saved vehicle, not an automatically configured Hub');
    writes=[];assert.equal((await send({...base,hubSetup:undefined})).status,400);assert.deepEqual(writes,[]);
  }finally{delete globalThis.__hubCreate;}
});
