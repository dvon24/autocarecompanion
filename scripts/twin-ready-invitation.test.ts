import test from 'node:test';
import assert from 'node:assert/strict';
import { createTwinReadyInvitationHandler, readyInvitationOffer, type ReadyInvitationReservation } from '../src/lib/twin-ready-invitation';
import { READY_EMAIL_ARTWORK, twinReadyEmail } from '../src/lib/twin-ready-email';
import { prepareTwinReadyInvitationArtwork } from '../src/lib/twin-ready-invitation-artwork';

const reservation: ReadyInvitationReservation = { id:'reservation',email:'owner@example.invalid',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',vehicleVerified:true,trimVerified:true,transmission:'manual',assignedTwin:'dodge-challenger',trialDays:30,twinStatus:'ready',readyAt:new Date('2026-09-01T00:00:00Z'),country:'US',updatedAt:new Date('2026-09-01T00:00:00Z'),invitedAt:null,unsubscribedAt:null,unsubscribeToken:'a'.repeat(32) };
function harness(overrides: Partial<Parameters<typeof createTwinReadyInvitationHandler>[0]> = {}) {
  let sends=0, reserves=0;let finished: unknown;
  const handler=createTwinReadyInvitationHandler({authorize:async()=>null,baseUrl:'https://au7o.io',enabled:()=>true,load:async()=>reservation,suppressed:async()=>false,deliveryExists:async()=>false,
    reserve:async()=>{reserves++;return 'delivery';},send:async mail=>{sends++;assert.equal(mail.to,reservation.email);assert.equal(mail.idempotencyKey,'twin-ready/delivery');return {ok:true,providerId:'provider'};},finish:async(_id,_row,result)=>{finished=result;},...overrides});
  const request=(action='preview',extra:Record<string,unknown>={},origin='https://au7o.io')=>handler(new Request('https://au7o.io/api/admin/reservations/invitation',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({id:reservation.id,expectedUpdatedAt:reservation.updatedAt.toISOString(),action,...extra})}));
  return {request,counts:()=>({sends,reserves,finished})};
}
test('email design contains actual offer, owned image and non-billing activation route',()=>{
  for(const trialDays of [7,30] as const){const mail=twinReadyEmail({vehicle:'2015 Dodge <img src=x> & Challenger',artwork:'/twin-stage/challenger/base-granite-crystal.webp',trialDays,baseUrl:'https://au7o.io',unsubscribeToken:'a'.repeat(32)});
    assert(mail.html.includes(`${trialDays} days, on us.`));assert(mail.html.includes('#FAF7F0'));assert(mail.html.includes('Dodge &lt;img src=x&gt; &amp; Challenger'));assert(mail.html.includes('https://au7o.io/twin-stage/email/challenger-granite-crystal-600.jpg'));assert(mail.text.includes('intent=reservation'));assert(mail.text.includes('No payment card is required'));assert(!mail.html.includes('65,000'));assert(!mail.html.includes('buy.stripe.com'));
  }
});
test('ready email keeps mobile dimensions fluid without relying on head styles',()=>{
  const {html}=twinReadyEmail({vehicle:'2015 Dodge Challenger SRT 392',artwork:'/twin-stage/challenger/base-granite-crystal.webp',trialDays:30,baseUrl:'https://au7o.io',unsubscribeToken:'a'.repeat(32)});
  assert(html.includes('<meta name="x-apple-disable-message-reformatting">'));
  assert(html.includes('-webkit-text-size-adjust:100%'));
  assert(html.includes('.headline{font-size:28px!important;line-height:34px!important}'));
  const withoutHeadOrOutlook=html.replace(/<head>[\s\S]*?<\/head>/,'').replace(/<!--\[if mso\]>[\s\S]*?<!\[endif\]-->/g,'');
  const tables=withoutHeadOrOutlook.match(/<table\b[^>]*>/g) ?? [];
  assert(tables.length>=4);
  for(const table of tables){assert(table.includes('width="100%"'));assert(table.includes('table-layout:fixed'));}
  assert(!withoutHeadOrOutlook.includes('<table role="presentation" width="600"'));
  assert.match(withoutHeadOrOutlook,/<img[^>]*width="100%"[^>]*width:100%;max-width:600px;height:auto/);
  assert.match(withoutHeadOrOutlook,/max-width:600px[\s\S]*?<!--au7o-email-preview-slot-->\s*<tr>/);
  assert(withoutHeadOrOutlook.includes('overflow-wrap:anywhere;word-wrap:break-word'));
  for(const [,size] of withoutHeadOrOutlook.matchAll(/font-size:(\d+)px/g))assert(Number(size)>=14,`Unreadable ${size}px text`);
  assert.match(withoutHeadOrOutlook,/font-size:16px;line-height:25px/);
});

test('real invitation uses prepared JPEG artwork for both owner-ready vehicles and fails closed for missing derivatives',()=>{
  for(const [artwork,derivative] of Object.entries(READY_EMAIL_ARTWORK)){
    const {html}=twinReadyEmail({vehicle:'Reviewed vehicle',artwork,trialDays:7,baseUrl:'https://au7o.io',unsubscribeToken:'safe'});
    assert(html.includes(`src="https://au7o.io${derivative}"`));
    assert(!html.includes('.webp'));
  }
  assert.equal(Object.keys(READY_EMAIL_ARTWORK).length,8);
  assert.throws(()=>twinReadyEmail({vehicle:'Unprepared twin',artwork:'/twin-stage/new-vehicle/base.webp',trialDays:7,baseUrl:'https://au7o.io',unsubscribeToken:'safe'}),/No reviewed email artwork/);
});
test('mobile email preserves escaped long vehicle names, exact links and trial terms',()=>{
  const vehicle=`2026 ${'LongVehicleName'.repeat(20)} <script>alert("x")</script> & Special`;
  for(const trialDays of [7,30] as const){
    const {html,text}=twinReadyEmail({vehicle,artwork:'/twin-stage/challenger/base-granite-crystal.webp',trialDays,baseUrl:'https://au7o.io',unsubscribeToken:'token&more="quoted"'});
    assert(!html.includes('<script>'));
    assert(html.includes('&lt;script&gt;'));
    assert(html.includes('href="https://au7o.io/auth/signup?product=hub&amp;intent=reservation"'));
    assert(html.includes('href="https://au7o.io/auth/signin?callbackUrl=%2Ftwin%2Fclaim"'));
    assert(html.includes('href="https://au7o.io/api/reservation/unsubscribe?token=token%26more%3D%22quoted%22"'));
    assert(html.includes(`${trialDays} days, on us.`));
    assert(text.includes(`${trialDays}-day complimentary access begins when you activate it`));
    assert(html.includes('No card required. No automatic billing.'));
    assert(html.includes('$14.99/month USD'));
  }
});
test('ready offer fails closed on exact fitment, transmission, region, opt-out or demo-only builds',()=>{
  assert.equal(readyInvitationOffer(reservation)?.trialDays,30);
  for(const change of [{country:'DE'},{country:null},{vehicleVerified:false},{trimVerified:false},{year:2016},{trim:'R/T'},{transmission:null},{transmission:'cvtx'},{assignedTwin:'cadillac-xt6'},{trialDays:14},{twinStatus:'building'},{readyAt:null},{unsubscribeToken:null},{invitedAt:new Date()},{unsubscribedAt:new Date()}])assert.equal(readyInvitationOffer({...reservation,...change}),null,JSON.stringify(change));
});
test('preview performs no send or delivery writes and advertises the environment hold',async()=>{
  const h=harness({enabled:()=>false});const response=await h.request();const preview=await response.json();assert.equal(response.status,200);assert.equal(preview.canSend,false);assert.equal(preview.trialDays,30);assert.deepEqual(h.counts(),{sends:0,reserves:0,finished:undefined});
});
test('unauthorized and cross-origin requests never read reservations',async()=>{
  const h=harness({authorize:async()=>new Response(null,{status:403}),load:async()=>{throw new Error('must not read');}});assert.equal((await h.request()).status,403);
  assert.equal((await harness().request('send',{confirm:true},'https://evil.invalid')).status,403);
});
test('saved offer revision and explicit send confirmation are required',async()=>{
  assert.equal((await harness().request('send')).status,400);
  assert.equal((await harness().request('preview',{expectedUpdatedAt:'2026-09-02T00:00:00Z'})).status,409);
});
test('suppression errors, previous deliveries, hold flags and concurrent claims stop sending',async()=>{
  for(const overrides of [{suppressed:async()=>true},{suppressed:async()=>{throw new Error('db');}},{deliveryExists:async()=>true},{enabled:()=>false},{reserve:async()=>null}]){
    const h=harness(overrides);assert((await h.request('send',{confirm:true})).status>=400);assert.equal(h.counts().sends,0);
  }
});
test('confirmed provider acceptance is tracked once',async()=>{
  const h=harness();assert.equal((await h.request('send',{confirm:true})).status,200);assert.deepEqual(h.counts(),{sends:1,reserves:1,finished:{ok:true,providerId:'provider'}});
});
test('send-only preparation runs after all preflight checks and before durable claim', async()=>{
  const events:string[]=[];
  const h=harness({
    prepareSend:async(mail,offer)=>{events.push('prepare');assert.equal(offer.reservationId,reservation.id);return prepareTwinReadyInvitationArtwork({mail,artwork:offer.artwork,baseUrl:'https://au7o.io'});},
    reserve:async()=>{events.push('reserve');return 'delivery';},
    send:async mail=>{events.push('send');assert.equal(mail.attachments?.length,1);assert(mail.html.includes('src="cid:au7o-ready-twin"'));return{ok:true};},
    finish:async()=>{events.push('finish');},
  });
  assert.equal((await h.request('send',{confirm:true})).status,200);
  assert.deepEqual(events,['prepare','reserve','send','finish']);
});
test('preparation is absent from preview, disabled, unconfirmed and rejected invitations', async()=>{
  let preparations=0;
  const prepareSend=async()=>{preparations++;throw new Error('must not prepare');};
  const preview=await(await harness({prepareSend}).request()).json();
  assert(preview.html.includes('src="https://au7o.io/twin-stage/email/'));
  assert(!preview.html.includes('cid:'));assert.equal(preview.attachments,undefined);
  assert.equal((await harness({prepareSend}).request('send')).status,400);
  for(const overrides of [{enabled:()=>false},{suppressed:async()=>true},{deliveryExists:async()=>true},{load:async()=>({...reservation,vehicleVerified:false})}]){
    assert((await harness({prepareSend,...overrides}).request('send',{confirm:true})).status>=400);
  }
  assert.equal((await harness({prepareSend}).request('send',{confirm:true,expectedUpdatedAt:'2026-09-02T00:00:00Z'})).status,409);
  assert.equal(preparations,0);
});
test('missing, oversized or non-JPEG artwork fails before claim and sender with sanitized retry guidance', async()=>{
  for(const loadBytes of [async()=>{throw new Error('private-path-and-credentials');},async()=>Buffer.alloc(200001),async()=>Buffer.from('not a jpeg')]){
    const h=harness({prepareSend:(mail,offer)=>prepareTwinReadyInvitationArtwork({mail,artwork:offer.artwork,baseUrl:'https://au7o.io'},{loadBytes})});
    const response=await h.request('send',{confirm:true});
    assert.equal(response.status,503);
    const body=await response.text();assert(body.includes('Refresh the preview'));assert(!body.includes('private-path'));
    assert.deepEqual(h.counts(),{sends:0,reserves:0,finished:undefined});
  }
});
test('timeout or unknown provider response leaves uncertain delivery for reconciliation',async()=>{
  for(const send of [async()=>({ok:false}),async()=>{throw new Error('timeout');}]){const h=harness({send});assert.equal((await h.request('send',{confirm:true})).status,502);assert.deepEqual(h.counts().finished,{ok:false});assert.equal(h.counts().reserves,1);}
});

test('direct invitation exposes reviewed selected gearbox for otherwise identical offers',async()=>{
  for(const transmission of ['manual','automatic'] as const){
    const row={...reservation,transmission};
    const offer=readyInvitationOffer(row);assert(offer);assert.equal(offer.transmission,transmission);
    const mail=twinReadyEmail({...offer,baseUrl:'https://au7o.invalid'});
    const label=transmission==='manual'?'Manual':'Automatic';
    assert(mail.text.includes('Transmission: '+label));assert(mail.html.includes('Transmission: '+label));
    assert(mail.html.indexOf('Transmission: '+label)<mail.html.indexOf('Activate my Hub'));
    const h=harness({load:async()=>row});const preview=await (await h.request()).json();
    assert(preview.html.includes('Transmission: '+label));assert.equal(h.counts().sends,0);
  }
});
