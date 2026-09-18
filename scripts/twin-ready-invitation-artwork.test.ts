import './helpers/reservation-test-boundary';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { READY_EMAIL_ARTWORK, twinReadyEmail } from '../src/lib/twin-ready-email';
import { prepareTwinReadyInvitationArtwork, READY_INVITATION_CONTENT_ID } from '../src/lib/twin-ready-invitation-artwork';
import { createEmailSender } from '../src/lib/email';
import { createLockedReservationSender } from '../src/lib/reservation-invitation-dispatch';
import { stagingRecipientAllowed } from '../src/lib/staging-email-policy';

const baseUrl='https://protected-review.trycloudflare.com';
const artwork=Object.keys(READY_EMAIL_ARTWORK)[0];
const template=(art=artwork)=>twinReadyEmail({vehicle:'Reviewed vehicle <special>',transmission:'manual',artwork:art,trialDays:7,baseUrl,unsubscribeToken:'synthetic',reservationId:'selected-offer'});

test('both reviewed owner JPEGs retain exact bytes, full image attributes, selected offer and protected links',async()=>{
  for(const [artwork,mapped] of Object.entries(READY_EMAIL_ARTWORK)){
    const mail=template(artwork);
    const prepared=await prepareTwinReadyInvitationArtwork({mail,artwork,baseUrl});
    assert.equal(prepared.attachments.length,1);
    const attachment=prepared.attachments[0];
    assert.equal(attachment.contentType,'image/jpeg');assert.equal(attachment.contentId,READY_INVITATION_CONTENT_ID);
    assert.equal(attachment.filename,path.basename(mapped));
    assert.deepEqual(Buffer.from(attachment.content,'base64'),await readFile(path.join(process.cwd(),'public',mapped.slice(1))));
    assert.equal(prepared.html,mail.html.replace(`src="${baseUrl}${mapped}"`,`src="cid:${READY_INVITATION_CONTENT_ID}"`));
    assert.equal(prepared.text,mail.text);assert.equal(prepared.subject,mail.subject);
    assert(prepared.html.includes('alt="Reviewed vehicle &lt;special&gt; visual twin" width="100%"'));
    assert(prepared.html.includes('height:auto'));assert(prepared.html.includes('reservationId=selected-offer'));
    for(const href of prepared.html.matchAll(/href="([^"]+)"/g))assert(href[1].startsWith(baseUrl+'/'));
    assert(!prepared.html.includes('data:image'));assert(!mail.html.includes('cid:'));
  }
});

test('only exact registry artwork and exact one generated image source can reach byte loading',async()=>{
  let loads=0;const deps={loadBytes:async()=>{loads++;throw new Error('must not read');}};
  for(const unsafe of ['../../secret','/twin-stage/email/challenger-granite-crystal-600.jpg','/twin-stage/challenger/../secret','https://evil.invalid/art.jpg','__proto__',artwork+'?x=1']){
    await assert.rejects(prepareTwinReadyInvitationArtwork({mail:template(),artwork:unsafe,baseUrl},deps),/artwork could not be prepared/);
  }
  for(const html of [template().html.replace(/<img\b[^>]*>/,''),template().html.replace('/twin-stage/email/','/unexpected/'),template().html+'<img src="extra">',template().html.replace('<img src=','<img data-other="x" src=')]){
    await assert.rejects(prepareTwinReadyInvitationArtwork({mail:{...template(),html},artwork,baseUrl},deps),/artwork could not be prepared/);
  }
  await assert.rejects(prepareTwinReadyInvitationArtwork({mail:template(),artwork,baseUrl:'https://username:password@protected-review.trycloudflare.com'},deps),/artwork could not be prepared/);
  assert.equal(loads,0);
});

test('bounded JPEG signatures and missing bytes fail closed with no local path disclosure',async()=>{
  const jpeg=(length:number)=>{const bytes=Buffer.alloc(length);bytes.set([0xff,0xd8,0xff]);bytes.set([0xff,0xd9],length-2);return bytes;};
  for(const bytes of [Buffer.alloc(0),Buffer.from('not a jpeg'),jpeg(200001),Buffer.from([0xff,0xd8,0xff,0x00]),Buffer.from([0xff,0x00,0xff,0xff,0xd9])]){
    await assert.rejects(prepareTwinReadyInvitationArtwork({mail:template(),artwork,baseUrl},{loadBytes:async()=>bytes}),/artwork could not be prepared/);
  }
  const accepted=await prepareTwinReadyInvitationArtwork({mail:template(),artwork,baseUrl},{loadBytes:async mapped=>{
    assert.equal(mapped,path.join(process.cwd(),'public',READY_EMAIL_ARTWORK[artwork].slice(1)));return jpeg(200000);
  }});
  assert.equal(Buffer.from(accepted.attachments[0].content,'base64').length,200000);
  await assert.rejects(prepareTwinReadyInvitationArtwork({mail:template(),artwork,baseUrl},{loadBytes:async()=>{throw new Error('C:/private/path ENOENT');}}),error=>{
    assert(error instanceof Error);assert(!error.message.includes('private'));assert(!error.message.includes('ENOENT'));return true;
  });
});

test('prepared provider payload passes under the final synchronous consent lease without root suppression',async()=>{
  const prepared=await prepareTwinReadyInvitationArtwork({mail:template(),artwork,baseUrl});
  let held=false;const events:string[]=[];
  const tx={$queryRaw:async(strings:TemplateStringsArray)=>{
    assert(held);
    if(strings.join('').includes('invitation_transaction_live'))events.push('live-probe');
    return strings.join('').includes('SELECT "id"')?[{id:'selected-offer'}]:[{live:1}];
  },reservation:{findFirst:async()=>null},emailSuppression:{findUnique:async()=>null}};
  const prisma={$transaction:async<T>(callback:(tx:unknown)=>Promise<T>)=>{
    held=true;try{return await callback(tx);}finally{held=false;events.push('release');}
  }} as never;
  const sender=createEmailSender({recipientAllowed:()=>true,isSuppressed:async()=>{throw new Error('Root pool lookup forbidden');},client:()=>({emails:{send:(payload:unknown,options:unknown)=>{
    assert(held);events.push('provider');
    const captured=payload as {html:string;attachments:unknown};
    assert.equal(captured.html,prepared.html);assert.deepEqual(captured.attachments,prepared.attachments);
    assert.deepEqual(options,{idempotencyKey:'synthetic-inline-offer'});
    return Promise.resolve({data:{id:'mock-only'},error:null});
  }}} as never)});
  const locked=createLockedReservationSender({prisma,send:sender});
  assert.deepEqual(await locked({...prepared,to:'first@example.invalid',idempotencyKey:'synthetic-inline-offer'}),{ok:true,providerId:'mock-only'});
  assert.deepEqual(events,['live-probe','provider','release']);
});

test('inline payload cannot bypass two-recipient allowlist, suppression or expired consent',async()=>{
  const prepared=await prepareTwinReadyInvitationArtwork({mail:template(),artwork,baseUrl});
  let calls=0,guards=0;
  const sender=createEmailSender({recipientAllowed:to=>stagingRecipientAllowed(to,'first@example.invalid,second@example.invalid'),isSuppressed:async()=>true,client:()=>({emails:{send:async()=>{calls++;return{data:{id:'mock-only'},error:null};}}} as never)});
  assert.equal((await sender({...prepared,to:'third@example.invalid',invitationConsentGuard:async()=>{guards++;return()=>true;}})).ok,false);
  assert.equal(guards,0);
  assert.equal((await sender({...prepared,to:'first@example.invalid'})).ok,false);
  for(const to of ['first@example.invalid','second@example.invalid'])assert.equal((await sender({...prepared,to,invitationConsentGuard:async()=>()=>false})).ok,false);
  assert.equal(calls,0);
});
