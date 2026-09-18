/* Exact candidate verification with private dependencies, local data and blocked providers. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'output/launch-validation');
fs.mkdirSync(out,{recursive:true});
const report=JSON.parse(fs.readFileSync(path.join(root,'output/launch-rehearsal/schema-results.json'),'utf8'));
const url=new URL(report.buildDatabaseUrl);
assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'55438');assert.match(url.pathname,/^\/launch_\d+_build$/);assert.equal(url.username,'launch_fixture');assert.equal(url.password,'');
for(const name of ['.env','.env.local','.env.production','.env.production.local'])assert(!fs.existsSync(path.join(root,name)),'Candidate must not contain runtime env files: '+name);
assert(!fs.lstatSync(path.join(root,'node_modules')).isSymbolicLink(),'Dependency directory must be private');
const env={};for(const key of ['SystemRoot','SYSTEMROOT','WINDIR','PATH','PATHEXT','TEMP','TMP','COMSPEC','APPDATA','LOCALAPPDATA','USERPROFILE','NUMBER_OF_PROCESSORS'])if(process.env[key])env[key]=process.env[key];
const buildDir='.next-launch-validation-'+Date.now();
Object.assign(env,{DATABASE_URL:report.buildDatabaseUrl,DIRECT_URL:report.buildDatabaseUrl,NEXT_TELEMETRY_DISABLED:'1',NODE_ENV:'production',AUTH_SECRET:'synthetic-local-build-secret-not-a-credential',NEXTAUTH_SECRET:'synthetic-local-build-secret-not-a-credential',APP_URL:'http://localhost:53439',NEXTAUTH_URL:'http://localhost:53439',OPENAI_API_KEY:'synthetic-no-provider',ANTHROPIC_API_KEY:'synthetic-no-provider',NEXT_FONT_GOOGLE_MOCKED_RESPONSES:path.join(__dirname,'offline-fonts.cjs'),NODE_OPTIONS:'--require '+path.join(__dirname,'local-network-only.cjs'),NEXT_DIST_DIR:buildDir});
let results=[];
function run(label,args,overrides={}){
 const restored=label==='next-build'?['tsconfig.json','next-env.d.ts'].filter(p=>fs.existsSync(path.join(root,p))).map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]):[];
 const started=Date.now(),r=cp.spawnSync(process.execPath,args,{cwd:root,env:{...env,...(args.includes('--test')?{NODE_ENV:'test'}:{}),...overrides},encoding:'utf8',windowsHide:true,maxBuffer:32e6});
 // Next checks its generated routes during the real build, then restore the authored
 // release config so timestamped validation paths never enter the candidate.
 for(const [p,content] of restored){
  const patch='*** Begin Patch\n*** Add File: '+path.join(root,p)+'\n'+content.replace(/\r\n/g,'\n').trimEnd().split('\n').map(line=>'+'+line).join('\n')+'\n*** End Patch';
  cp.execFileSync(process.env.AU7O_APPLY_PATCH_EXE||'C:/Users/devon/AppData/Local/OpenAI/Codex/bin/eab8377aebac6c07/codex.exe',['--codex-run-as-apply-patch',patch],{cwd:root,windowsHide:true,stdio:'ignore'});
 }
 fs.writeFileSync(path.join(out,label+'.log'),(r.stdout||'')+(r.stderr||''));
 const result={label,exitCode:r.status,durationMs:Date.now()-started};results.push(result);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({scope:'Exact candidate; local synthetic database; Node network guard (not OS-wide isolation); bundled offline Geist fonts',mode:process.argv.includes('--tests-only')?'diagnostic-tests-only':'full',buildDir,results},null,2));
 console.log(JSON.stringify(result));if(r.status!==0){console.error((r.stdout||'').slice(-5000),(r.stderr||'').slice(-5000));process.exit(r.status||1)}
}
run('owned-cluster',['scripts/release/local-postgres.cjs']);
run('node-network-guard',['--test','scripts/release/local-network-only.test.cjs']);
if(!process.argv.includes('--tests-only')){
 run('strict-types',['node_modules/typescript/bin/tsc','--noEmit','--pretty','false']);
 run('next-build',['node_modules/next/dist/bin/next','build','--webpack']);
 run('restored-config-strict-types',['node_modules/typescript/bin/tsc','--noEmit','--pretty','false']);
}
run('public-and-navigation',['--test','scripts/public-dtc-release.test.cjs','scripts/public-account-entrypoints.test.js','scripts/paid-hub-account-navigation.test.cjs']);
run('billing',['--import','tsx','--test',...['paid-signup','us-enrollment-checkout','us-billing-eligibility','stripe-upgrade-quote','billing-status','billing-return'].map(n=>'scripts/'+n+'.test.ts')]);
run('owner-reservation-maintenance',['--import','tsx','--test',...['owner-hub-setup','multiple-owner-reservations','twin-invitation-claim','twin-ready-invitation','reservation-invitation-dispatch','reservation-queue','maintenance-reminder-data','maintenance-reminder-parity','maintenance-summary-parity','maintenance-records-writeback','service-document-lifecycle','service-history-order','six-owner-twins','six-owner-paints','six-owner-issue-evidence','transmission-options','twin-transmission-tree','vehicle-twin-catalog','exact-twin-maintenance-schedule','component-first-twin-review','saved-color-review','signup-recovery','visual-signup'].map(n=>'scripts/'+n+'.test.ts')]);
run('six-public-visuals',['--test','scripts/six-known-issue-route.test.cjs','scripts/six-known-issue-siblings.test.cjs']);
run('account-twin-actions',['--test','scripts/account-twin-actions.test.cjs']);
run('launch-review-regressions',['--test','scripts/launch-review-boundaries.test.cjs','scripts/service-record-entry-regressions.test.cjs','scripts/owner-hub-route.test.cjs','scripts/account-deletion-billing.test.cjs','scripts/billing-vehicle-reuse.test.cjs']);
run('accepted-hub-visual-layout',['--import','tsx','--test',...['hub-add-twin-options','twin-ready-invitation-artwork','twin-review-layout','twin-fulfillment','known-issue-twin-pilot','diagnostic-tools','known-issue-commerce','dealer-finder'].map(n=>'scripts/'+n+'.test.ts')]);
run('motorcycle-catalog',['scripts/qa-motorcycle-catalog.cjs']);
run('motorcycle-actions',['scripts/qa-motorcycle-actions.cjs'],{AU7O_PLAYWRIGHT_PATH:'C:/Users/devon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'});
// Chromium child traffic is independently intercepted by the exact renderer QA.
// Node socket restrictions remain in force for this process and its Node children.
run('maintenance-email-containment',['--import','tsx','scripts/qa-maintenance-email.ts']);
console.log((process.argv.includes('--tests-only')?'Diagnostic tests-only run':'Exact candidate verification')+' passed; no release or activation performed.');
