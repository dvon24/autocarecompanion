import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { parseVisualSignup, VISUAL_PRODUCT } from '../src/lib/visual-signup';
import { parseReservationInput } from '../src/lib/reservation';
import { reviewedKnownIssueTwinCopy } from '../src/lib/known-issue-twin-copy';
import { projectKnownIssueTwinIssues } from '../src/lib/known-issue-twin-pilot';
import snapshot from './fixtures/xt6-published-snapshot.json';
import summaries from '../src/data/xt6-visual-explanations.json';
import type { KnownIssue } from '../src/schemas/knownIssue.schema';
import { createVisualSignupHandler } from '../src/lib/visual-signup-handler';
import { NextRequest } from 'next/server';
import { createVisualUnsubscribeHandlers } from '../src/lib/visual-unsubscribe-handler';
import { createVisualSignupAdminHandler } from '../src/lib/visual-signup-admin-handler';

test('admin never loads signup addresses for unauthorized requests',async()=>{
  let reads=0;
  const load=async()=>{reads++;return {total:0,active:0,items:[]};};
  const denied=createVisualSignupAdminHandler(async()=>false,load);
  assert.equal((await denied()).status,403);
  assert.equal(reads,0);
  const allowed=createVisualSignupAdminHandler(async()=>true,load);
  assert.equal((await allowed()).status,200);
  assert.equal(reads,1);
  const failed=createVisualSignupAdminHandler(async()=>true,async()=>{throw new Error('missing migration');});
  assert.equal((await failed()).status,503);
});

test('unsubscribe previews do not write; explicit POST is idempotent and failure is honest',async()=>{
  let writes=0;
  const handlers=createVisualUnsubscribeHandlers(async()=>{writes++;});
  const url='http://localhost/api/visual-signup/unsubscribe?token='+'a'.repeat(32);
  const preview=handlers.GET(new NextRequest(url));
  assert.equal(preview.status,200);
  assert.match(await preview.text(),/method="post"/);
  assert.equal(writes,0);
  assert.equal((await handlers.POST(new NextRequest(url,{method:'POST'}))).status,200);
  assert.equal((await handlers.POST(new NextRequest(url,{method:'POST'}))).status,200);
  assert.equal(writes,2);
  assert.equal((await handlers.POST(new NextRequest('http://localhost/api/visual-signup/unsubscribe?token=bad',{method:'POST'}))).status,400);
  assert.equal(writes,2);
  const failed=createVisualUnsubscribeHandlers(async()=>{throw new Error('database unavailable');});
  assert.equal((await failed.POST(new NextRequest(url,{method:'POST'}))).status,503);
});

test('signup handler acknowledges only confirmed writes and keeps failures retryable',async(t)=>{
  const originalVercel = process.env.VERCEL;
  process.env.VERCEL = '1';
  t.after(() => { if (originalVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = originalVercel; });
  const saved: unknown[]=[];
  const good={email:'Person@example.com',country:'US',consent:true};
  const request=(body:unknown)=>new NextRequest('http://localhost/api/visual-signup',{method:'POST',headers:{'x-vercel-ip-country':'US'},body:JSON.stringify(body)});
  const deps={rateLimit:()=>null,validateEmail:async()=>({ok:true}),save:async(input:unknown)=>{saved.push(input);}};
  const post=createVisualSignupHandler(deps);
  assert.equal((await post(request({...good,consent:false}))).status,400);
  assert.equal((await post(request({...good,country:'DE'}))).status,400);
  assert.equal((await post(request({...good,company:'bot'}))).status,200);
  assert.equal(saved.length,0);
  const response=await post(request(good));
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{success:true});
  assert.equal(saved.length,1);
  assert.equal((saved[0] as {product:string}).product,VISUAL_PRODUCT);
  const failed=createVisualSignupHandler({...deps,save:async()=>{throw new Error('table missing');}});
  const failure=await failed(request(good));
  assert.equal(failure.status,503);
  assert.equal((await failure.json()).success,undefined);
  const invalidDomain=createVisualSignupHandler({...deps,validateEmail:async()=>({ok:false,reason:'Invalid domain'})});
  assert.equal((await invalidDomain(request(good))).status,400);
  const limited=createVisualSignupHandler({...deps,rateLimit:()=>new Response(null,{status:429})});
  assert.equal((await limited(request(good))).status,429);
  assert.equal(saved.length,1);
});

test('visual signup fixes product scope to all models and requires US consent',()=>{
  const input={email:' Person@example.com ',country:'US',consent:true,product:'hub'};
  assert.deepEqual(parseVisualSignup(input),{email:'person@example.com',country:'US',product:VISUAL_PRODUCT,source:'cadillac-xt6-pilot'});
  for (const body of [null, [], {...input,consent:false}, {...input,consent:'true'}, {...input,country:'DE'}, {...input,email:'a'.repeat(255)}, {...input,email:'invalid'}]) assert.equal(parseVisualSignup(body),null);
});
test('Hub reservation accepts visual-page attribution without becoming a visual signup',()=>{
  const row=parseReservationInput({email:'person@example.com',vehicle:'2020 Cadillac XT6',country:'United States',source:'visual-known-issues'});
  assert.equal(row?.source,'visual-known-issues');
  assert.equal(parseReservationInput({email:'person@example.com',country:'US',consent:true}),null);
});
test('visual capture and unsubscribe cannot write Hub reservations, users or article alerts',()=>{
  for(const file of ['src/app/api/visual-signup/route.ts','src/app/api/visual-signup/unsubscribe/route.ts']) {
    const source=readFileSync(file,'utf8');
    assert.match(source,/"VisualSignup"/);
    assert.doesNotMatch(source,/prisma\.(reservation|user|interestEmail)|(?:INSERT INTO|UPDATE) "(?:User|Reservation|InterestEmail)"/);
  }
  assert.match(readFileSync('src/app/api/admin/visual-signups/route.ts','utf8'),/isFounderEmail/);
  assert.match(readFileSync('src/app/api/visual-signup/route.ts','utf8'),/ON CONFLICT \("email"\) DO NOTHING/);
});
test('published XT6 preview uses source-bound problem and repair summaries with existing art',()=>{
  const rows=projectKnownIssueTwinIssues(snapshot.issues as unknown as KnownIssue[]);
  assert.equal(rows.length,11);
  for(const summary of summaries) {
    const row=rows.find(item=>item.id===summary.id)!;
    assert.ok(row);
    assert.equal(reviewedKnownIssueTwinCopy(row)?.problem,summary.problem);
    assert.equal(row.explanation.issueSentence,summary.problem);
    assert.equal(row.explanation.repairSentence,`Fix: ${summary.repair}`);
    assert.ok(existsSync(`public/twin-stage/parts/${summary.image}`));
    if(summary.repairImage) assert.ok(existsSync(`public/twin-stage/parts/${summary.repairImage}`));
    assert.equal(reviewedKnownIssueTwinCopy({...row,solution:'Changed source'}),null);
  }
  assert.match(rows.find(row=>row.id==='cadillac-xt6-9speed-transmission-2020')!.explanation.repairSentence,/DEXRON VI/);
  assert.match(rows.find(row=>row.id==='cadillac-xt6-transmission-shudder-2020')!.explanation.repairSentence,/conflicts/);
});
