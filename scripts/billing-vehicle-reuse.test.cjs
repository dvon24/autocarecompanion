/* Actual billing vehicle route with owned in-memory CAS writes; no database/provider/network. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');let POST;
test.before(async()=>{
 const built=await esbuild.build({entryPoints:[path.join(root,'src/app/api/billing/vehicle/route.ts')],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'offline',setup(b){
  b.onResolve({filter:/^@\/lib\/(auth|db)$/},a=>({path:a.path,namespace:'mock'}));
  b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:a.path.endsWith('/auth')?'export async function auth(){return globalThis.__vehicleReuse.session}':'export const prisma=new Proxy({},{get(_,key){return globalThis.__vehicleReuse.db[key]}})',loader:'js'}));
 }}]});
 const m=new Module(path.join(root,'fixture-vehicle-reuse.cjs'));m.filename=path.join(root,'fixture-vehicle-reuse.cjs');m.paths=Module._nodeModulePaths(root);m._compile(built.outputFiles[0].text,m.filename);POST=m.exports.POST;
});
function fixture(t){
 for(const [key,value] of Object.entries({ACCOUNT_ENROLLMENT_ENABLED:'true',VERCEL:'1'})){const old=process.env[key];process.env[key]=value;t.after(()=>old===undefined?delete process.env[key]:process.env[key]=old)}
 const f={session:{user:{id:'owner'}},verified:true,locks:[],writes:[],logs:[{vehicleId:'saved',mileage:9000,source:'manual'}],history:[{id:'oil',type:'oil_change',mileage:8000},{id:'tire',type:'tire_replacement',mileage:5000}],rows:[{id:'saved',userId:'owner',year:2020,make:'Cadillac',model:'XT6',trim:'Sport',transmission:null,currentMileage:12345,reviewedEquipmentId:'reviewed-equipment',color:'Satin Steel Metallic',updatedAt:new Date('2026-09-15T00:00:00.000Z')}]};
 const equals=(a,b)=>a instanceof Date&&b instanceof Date?a.getTime()===b.getTime():a===b;
 f.db={$transaction:async fn=>{
  const stage=[];const tx={$queryRaw:async(strings,...values)=>{f.locks.push({sql:strings.join('?'),key:values[0]});return []},
   user:{findUnique:async({where})=>{assert.deepEqual(where,{id:'owner'});return {emailVerified:f.verified?new Date():null}}},
   vehicle:{
    findMany:async({where,select})=>f.rows.filter(row=>Object.entries(where).every(([k,v])=>equals(row[k],v))).map(row=>Object.fromEntries(Object.keys(select).map(k=>[k,structuredClone(row[k])]))),
    count:async({where})=>f.rows.filter(row=>row.userId===where.userId).length,
    updateMany:async({where,data})=>{
     if(f.beforeCas)f.beforeCas();
     f.writes.push({where:structuredClone(where),data:structuredClone(data)});
     const row=f.rows.find(row=>Object.entries(where).every(([k,v])=>equals(row[k],v)));if(!row)return {count:0};
     assert.deepEqual(Object.keys(data).sort(),['currentMileage','lastMileageUpdate','updatedAt']);assert.equal(where.userId,'owner');
     stage.push(()=>Object.assign(row,data));return {count:1};
    },
    create:async({data})=>{const row={id:'created',...data};stage.push(()=>f.rows.push(row));return {id:row.id}},
   },
   mileageLog:{create:async({data})=>{if(f.failLog)throw Error('Log storage failed');stage.push(()=>f.logs.push(data));return data}},
  };const result=await fn(tx);for(const write of stage)write();return result;
 }};
 f.send=(mileage=10000,body={},country='US')=>POST(new Request('https://fixture.invalid/api/billing/vehicle',{method:'POST',headers:{'x-vercel-ip-country':country},body:JSON.stringify({catalogId:'xt6',mileage,...body})}));
 globalThis.__vehicleReuse=f;return f;
}
for(const mileage of [10000,16000])test('explicit corrected mileage '+mileage+' is saved with independent log, not service/equipment mutation',async t=>{
 const f=fixture(t),before=structuredClone(f.rows[0]),history=structuredClone(f.history);
 assert.deepEqual(await (await f.send(mileage)).json(),{vehicleId:'saved'});assert.equal(f.rows[0].currentMileage,mileage);
 for(const key of ['id','userId','year','make','model','trim','transmission','reviewedEquipmentId','color'])assert.deepEqual(f.rows[0][key],before[key]);
 assert.deepEqual(f.history,history);assert.deepEqual(f.logs,[{vehicleId:'saved',mileage:9000,source:'manual'},{vehicleId:'saved',mileage,source:'manual'}]);
 assert(f.rows[0].updatedAt>before.updatedAt);assert(f.rows[0].lastMileageUpdate instanceof Date);
 assert.deepEqual(f.locks.map(x=>x.key),['owner','maintenance-owner:owner','saved']);assert.match(f.locks[0].sql,/hashtextextended\(\?, 0\)/);
 const cas=f.writes[0].where;assert.deepEqual(cas,{id:'saved',userId:'owner',year:2020,make:'Cadillac',model:'XT6',trim:'Sport',transmission:null,currentMileage:12345,reviewedEquipmentId:'reviewed-equipment',updatedAt:before.updatedAt});
});
test('same mileage is idempotent and monotonic revision survives a future saved clock',async t=>{
 const f=fixture(t);assert.equal((await f.send(12345)).status,200);assert.deepEqual(f.writes,[]);assert.equal(f.logs.length,1);
 f.rows[0].updatedAt=new Date('2099-01-01');const before=f.rows[0].updatedAt.getTime();assert.equal((await f.send()).status,200);assert.equal(f.rows[0].updatedAt.getTime(),before+1);
});
for(const change of [{currentMileage:18000},{transmission:'manual'},{reviewedEquipmentId:'different'},{userId:'foreign'},{updatedAt:new Date('2026-09-16')},{trim:'different'}])test('concurrent state conflict returns409, preserves new state/history and appends no mileage log: '+JSON.stringify(change),async t=>{
 const f=fixture(t),history=structuredClone(f.history);f.beforeCas=()=>Object.assign(f.rows[0],change);
 const response=await f.send();assert.equal(response.status,409);assert.equal((await response.json()).error,'vehicle_changed');
 for(const [key,value]of Object.entries(change))assert.deepEqual(f.rows[0][key],value);assert.equal(f.logs.length,1);assert.deepEqual(f.history,history);
});
test('mileage log failure rolls back corrected mileage and never changes independent service records',async t=>{
 const f=fixture(t),before=structuredClone(f.rows);f.failLog=true;assert.equal((await f.send()).status,503);assert.deepEqual(f.rows,before);assert.equal(f.logs.length,1);assert.equal(f.history.length,2);
});
test('ownership/ambiguity/fitment guards remain intact and foreign matching vehicle is never reused',async t=>{
 const f=fixture(t);f.rows[0].userId='foreign';const foreign=structuredClone(f.rows[0]);assert.deepEqual(await (await f.send()).json(),{vehicleId:'created'});assert.deepEqual(f.rows[0],foreign);assert.equal(f.rows[1].userId,'owner');
 f.rows=[{...foreign,userId:'owner'},{...foreign,id:'second',userId:'owner'}];assert.equal((await f.send()).status,409);
 f.rows=[{...foreign,userId:'owner',transmission:'manual'}];assert.equal((await f.send()).status,409);
 f.rows=[{...foreign,userId:'owner',currentMileage:0}];assert.equal((await f.send()).status,409);
 assert.equal((await f.send(10000,{transmission:'manual'})).status,400);assert.equal((await f.send(10000,{catalogId:'unreviewed'})).status,400);assert.deepEqual(f.writes,[]);
});
test('authentication/verification, region, bounded mileage and default-closed enrollment still refuse without writes',async t=>{
 const f=fixture(t);assert.equal((await f.send(0)).status,400);assert.equal((await f.send(2000001)).status,400);assert.equal((await f.send(10000,{},'DE')).status,403);
 f.verified=false;assert.equal((await f.send()).status,409);f.session=null;assert.equal((await f.send()).status,401);delete process.env.ACCOUNT_ENROLLMENT_ENABLED;assert.equal((await f.send()).status,410);assert.deepEqual(f.writes,[]);assert.equal(f.logs.length,1);
});
