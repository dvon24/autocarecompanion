/* Synthetic-only local PostgreSQL rehearsal. Never accepts a production URL. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'output/launch-rehearsal');
const schema=fs.readFileSync(path.join(__dirname,'launch-schema.sql'),'utf8');
const results=[];
const {connect}=require('./local-postgres.cjs');
function command(args){
 const env={};for(const key of ['SystemRoot','SYSTEMROOT','WINDIR','PATH','PATHEXT','TEMP','TMP','COMSPEC','APPDATA','LOCALAPPDATA','USERPROFILE'])if(process.env[key])env[key]=process.env[key];
 Object.assign(env,{DATABASE_URL:'postgresql://launch_fixture@127.0.0.1:55438/postgres',DIRECT_URL:'postgresql://launch_fixture@127.0.0.1:55438/postgres',CHECKPOINT_DISABLE:'1',PRISMA_HIDE_UPDATE_MESSAGE:'1',NEXT_TELEMETRY_DISABLED:'1',NODE_OPTIONS:'--require '+path.join(__dirname,'local-network-only.cjs')});
 const r=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true,env,maxBuffer:8e6});if(r.status!==0)throw Error(r.stderr||r.stdout);return r.stdout;
}
async function snapshot(c){const r={};for(const name of ['User','Vehicle','Reservation','MaintenanceRecord','MileageLog'])r[name]=(await c.query('SELECT to_jsonb(t) - $1::text[] AS row FROM "'+name+'" t ORDER BY id',[name==='User'?['legacySubscriptionTier','enrollmentProduct','enrollmentVehicleId']:name==='Vehicle'?['reviewedEquipmentId']:[]])).rows;return r}
async function run(){
 for(const name of ['.env','.env.local','.env.production','.env.production.local'])assert(!fs.existsSync(path.join(root,name)),'Runtime env files are forbidden in local rehearsal');
 assert(!fs.lstatSync(path.join(root,'node_modules')).isSymbolicLink(),'Use private candidate dependencies');
 fs.mkdirSync(out,{recursive:true});
 const baseline=cp.execFileSync('git',['show','9a64b8248576a1b5393407e4f472cb1860249cc3:prisma/schema.prisma'],{cwd:root,encoding:'utf8',windowsHide:true});
 fs.writeFileSync(path.join(out,'baseline.prisma'),baseline);
 const baselineOutput=command(['node_modules/prisma/build/index.js','migrate','diff','--from-empty','--to-schema',path.join(out,'baseline.prisma'),'--script']);
 const baselineSql=baselineOutput.slice(baselineOutput.indexOf('-- CreateSchema'));
 assert(baselineSql.startsWith('-- CreateSchema'), 'Expected Prisma-generated baseline SQL');
 fs.writeFileSync(path.join(out,'baseline.sql'),baselineSql);
 const admin=await connect('postgres'),prefix='launch_'+Date.now();
 const databases={};
 async function setup(label){
   const name=prefix+'_'+label;assert.match(name,/^launch_\d+_[a-z]+$/);await admin.query('CREATE DATABASE "'+name+'"');databases[label]=name;
   const c=await connect(name);await c.query(baselineSql);
   await c.query('INSERT INTO "User" (id,email,"subscriptionId","subscriptionTier","subscriptionStatus","updatedAt") VALUES ($1,$2,$3,$4,$5,$6)',['synthetic-legacy','legacy@fixture.invalid','synthetic-sub','plus','active',new Date('2026-09-01')]);
   await c.query('INSERT INTO "Vehicle" (id,"userId",year,make,model,trim,"currentMileage",color,"updatedAt") VALUES ($1,$2,2020,$3,$4,$5,12345,$6,$7)',['synthetic-car','synthetic-legacy','Cadillac','XT6','Sport','Satin Steel',new Date('2026-09-01')]);
   await c.query('INSERT INTO "Reservation" (id,email,vehicle,year,make,model,trim,"vehicleVerified") VALUES ($1,$2,$3,2020,$4,$5,$6,true)',['synthetic-reservation','owner@fixture.invalid','2020 Cadillac XT6 Sport','Cadillac','XT6','Sport']);
   await c.query('INSERT INTO "MaintenanceRecord" (id,"vehicleId",type,mileage,date,description,"nextDueMileage",cost) VALUES ($1,$2,$3,10000,$4,$5,17500,82.5),($6,$2,$7,11000,$4,$8,41000,410)', ['synthetic-oil','synthetic-car','oil_change',new Date('2026-08-01'),'Owner logged oil service','synthetic-tires','tire_replacement','Independent tire replacement']);
   await c.query('INSERT INTO "MileageLog" (id,"vehicleId",mileage,source,date) VALUES ($1,$2,11000,$3,$4),($5,$2,12345,$3,$6)', ['synthetic-log-1','synthetic-car','manual',new Date('2026-08-01'),'synthetic-log-2',new Date('2026-09-01')]);
   return c;
 }
 async function apply(c){try{await c.query(schema)}catch(e){await c.query('ROLLBACK');throw e}}
 async function reject(c,sql,code){try{await c.query(sql);assert.fail('Expected database rejection')}catch(e){assert.equal(e.code,code)}}
 const fresh=await setup('fresh'),before=await snapshot(fresh);await apply(fresh);assert.deepEqual(await snapshot(fresh),before);results.push('fresh baseline: rows preserved and exact structures verified');
 await apply(fresh);assert.deepEqual(await snapshot(fresh),before);results.push('same-session repeat: exact structure verified, rows preserved');
 assert.equal((await fresh.query('SELECT to_regclass(\'public."SubscriptionDowngrade"\') IS NULL absent')).rows[0].absent,true);
 assert.equal((await fresh.query('SELECT "legacySubscriptionTier" FROM "User"')).rows[0].legacySubscriptionTier,null);
 await reject(fresh,'INSERT INTO "BillingEnrollmentReview" ("subscriptionId","userId","customerId","sessionId","attemptKey",state) VALUES (\'bad\',\'synthetic-legacy\',\'c\',\'s\',\'k\',\'invalid\')','23514');
 await reject(fresh,'INSERT INTO "HubUpgradeAttempt" ("subscriptionId","userId",token,"vehicleId","completedAt") VALUES (\'bad\',\'synthetic-legacy\',\'t\',\'v\',now())','23514');
 await reject(fresh,'INSERT INTO "HubUpgradeAttempt" ("subscriptionId","userId",token,"vehicleId","dispatchStartedAt","completedAt") VALUES (\'bad\',\'synthetic-legacy\',\'t\',\'v\',now(),now())','23514');
 await reject(fresh,'INSERT INTO "MaintenanceReceiptCleanup" (id,"userId","receiptPath",generation) VALUES (\'bad\',\'synthetic-legacy\',\'x\',\'g\')','23514');
 await reject(fresh,'INSERT INTO "MaintenanceSubmission" (id,"vehicleId",fingerprint,"recordIds") VALUES (\'bad\',\'foreign\',\'f\',\'[]\')','23503');
 await reject(fresh,'INSERT INTO "Reservation" (id,email,vehicle,year,make,model,trim,"vehicleVerified") VALUES (\'duplicate\',U&\'\\00A0OWNER@fixture.invalid\\FEFF\',\'other display\',2020,\'CADILLAC\',\'XT6\',\'Sport\',true)','23505');
 await fresh.query('INSERT INTO "Reservation" (id,email,vehicle) VALUES (\'distinct\',\'owner@fixture.invalid\',\'different requested vehicle\')');
 results.push('constraints: normalized uniqueness, separate requests, state/result/scope checks and foreign ownership enforced');
 await fresh.query('INSERT INTO "MaintenanceReceiptCleanup" (id,"userId","vehicleId",generation) VALUES (\'cleanup\',\'synthetic-legacy\',\'synthetic-car\',\'g\')');
 await fresh.query('INSERT INTO "MaintenanceSubmission" (id,"vehicleId",fingerprint,"recordIds") VALUES (\'ledger\',\'synthetic-car\',\'f\',\'[]\')');
 await fresh.query('DELETE FROM "User" WHERE id=\'synthetic-legacy\'');
 assert.equal((await fresh.query('SELECT count(*)::int n FROM "MaintenanceReceiptCleanup"')).rows[0].n,1);
 assert.equal((await fresh.query('SELECT count(*)::int n FROM "MaintenanceSubmission"')).rows[0].n,0);
 results.push('cleanup intent survives owner cascade; owned submission follows vehicle cascade');await fresh.end();
 const collision=await setup('collision'),collisionBefore=await snapshot(collision);
 await collision.query('INSERT INTO "Reservation" (id,email,vehicle,year,make,model,trim,"vehicleVerified") VALUES (\'collision\',U&\'\\00A0OWNER@fixture.invalid\\FEFF\',\'same request\',2020,\'CADILLAC\',\'XT6\',\'Sport\',true)');
 const collisionRows=await snapshot(collision);await assert.rejects(apply(collision),/collisions/);assert.deepEqual(await snapshot(collision),collisionRows);
 assert.equal((await collision.query('SELECT to_regclass(\'public."Reservation_email_key"\') IS NOT NULL old, to_regclass(\'public."AccountEnrollment"\') IS NULL absent,to_regprocedure(\'public.reservation_whitespace()\') IS NULL nofunction')).rows[0].old,true);
 assert.deepEqual((await collision.query('SELECT to_regclass(\'public."AccountEnrollment"\') IS NULL absent,to_regprocedure(\'public.reservation_whitespace()\') IS NULL nofunction')).rows[0],{absent:true,nofunction:true});results.push('Unicode collision: entire transaction refused, legacy uniqueness/rows preserved, additions rolled back');await collision.end();
 const partial=await setup('partial');await partial.query(fs.readFileSync(path.join(root,'scripts/sql/2026-09-05-visual-signups.sql'),'utf8'));const partialBefore=await snapshot(partial);await apply(partial);assert.deepEqual(await snapshot(partial),partialBefore);results.push('compatible partial table: accepted only after full structural comparison');await partial.end();
 for(const [label,mutation,pattern] of [
  ['columns','CREATE TABLE "VisualSignup" (id integer PRIMARY KEY,email text)',/column|does not exist|Incompatible/i],
  ['index','DROP INDEX "HubUpgradeAttempt_userId_idx"; CREATE INDEX "HubUpgradeAttempt_userId_idx" ON "HubUpgradeAttempt"(token)',/Incompatible indexes/],
  ['foreign','ALTER TABLE "BillingEnrollmentReview" DROP CONSTRAINT "BillingEnrollmentReview_userId_fkey"; ALTER TABLE "BillingEnrollmentReview" ADD FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE RESTRICT',/Incompatible foreign keys/],
  ['function',"CREATE OR REPLACE FUNCTION public.reservation_whitespace() RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT ' '::text $$",/Incompatible function/]
 ]){
  const c=await setup(label);if(label!=='columns')await apply(c);await c.query(mutation);const preserved=await snapshot(c);await assert.rejects(apply(c),pattern);assert.deepEqual(await snapshot(c),preserved);results.push('incompatible '+label+': refused without row changes');await c.end();
 }
 const build=await setup('build');await apply(build);
 await build.query('INSERT INTO "KnownIssue" (id,make,model,years,trims,category,title,description,solution,severity,status,"updatedAt") VALUES (\'synthetic-launch-xt6\',\'Cadillac\',\'XT6\',ARRAY[2020],ARRAY[\'Sport\'],\'electrical\',\'Synthetic build fixture\',\'Synthetic local layout fixture, not published evidence.\',\'Synthetic diagnostic text for build validation only.\',\'low\',\'published\',now())');
 require('tsx/cjs');
 const {BMW_AUDITED_MODELS}=require('../../src/lib/known-issues-audit-registry.ts');
 for(const model of BMW_AUDITED_MODELS)for(let index=0;index<model.expectedPublishedCount;index++)await build.query('INSERT INTO "KnownIssue" (id,make,model,years,trims,category,title,description,solution,severity,status,"updatedAt") VALUES ($1,$2,$3,ARRAY[2020],ARRAY[]::text[],\'engine\',$4,$5,$6,\'low\',\'published\',now())',['synthetic-'+model.slug+'-'+index,model.make,model.model,'Synthetic audited-route build fixture '+index,'Synthetic local build input; not defect evidence.','Synthetic diagnostic layout text; not repair advice.']);
 await build.end();await admin.end();
 const report={scope:'Synthetic loopback-only schema rehearsal. No production or existing owner database used.',baseline:'9a64b8248576a1b5393407e4f472cb1860249cc3',passed:results.length,results,databases,buildDatabaseUrl:'postgresql://launch_fixture@127.0.0.1:55438/'+databases.build};
 fs.writeFileSync(path.join(out,'schema-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
run().catch(e=>{console.error(e);process.exit(1)});
