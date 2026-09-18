/* Refresh reproducible provenance through the real apply_patch editor; no source writes. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),source=path.resolve(root,'../known-issue-twin-pilot');
const relative='docs/launch-candidate-manifest-20260918.json',file=path.join(root,relative);
const previous=JSON.parse(fs.readFileSync(file,'utf8'));
const baseline=previous.baselineCommit;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalized=b=>sha(b.toString('utf8').replace(/\r\n/g,'\n').trimEnd()+'\n');
const git=(args)=>cp.execFileSync('git',['-c','core.safecrlf=false',...args],{cwd:root,windowsHide:true,maxBuffer:64e6,stdio:['ignore','pipe','pipe']});
const baselinePaths=new Set(git(['ls-tree','-r','--name-only',baseline]).toString().trim().split('\n'));
const changed=[...new Set([...git(['diff','--name-only','HEAD']).toString().trim().split('\n'),...git(['ls-files','--others','--exclude-standard']).toString().trim().split('\n')])].filter(Boolean);
const transport=['scripts/release/assemble-launch-candidate.ps1','scripts/release/assembly-plan.json','scripts/release/asset-plan.json','scripts/release/fixture-plan.json'];
const merged={
 'src/app/api/account/delete/route.ts':'Independent review: serialize account erasure with billing/enrollment/service locks, hold unsettled checkout/review/upgrade, verify provider identity and cancellation, then erase owned non-cascading enrollment/attempt journals.',
 'src/app/api/billing/vehicle/route.ts':'Independent review: apply explicitly resubmitted mileage using owner/vehicle locks and CAS with independent mileage log; preserve reviewed identity/equipment and completed service records.',
 'src/lib/twin-hub-data.ts':'Reviewed owner loader plus explicit claimed-only equipment recovery marker; no payload on unconfirmed, expired, foreign or unsupported state.',
 'src/lib/vehicle-capabilities.ts':'Reviewed exact-vehicle access plus narrow nonnull current-profile/revision equipment-only recovery; no account-wide beta rights.',
 'src/app/api/vehicles/[id]/route.ts':'Reviewed owner mutations plus guarded equipment-only recovery fallback; all other denied mutations remain denied.',
 'src/app/garage/layout.tsx':'Provider shared by routes; account index/settings/showcase retain paid guards, records has exact-vehicle server gate for claimed beta.',
 'src/app/garage/[id]/records/page.tsx':'Server-authenticated exact personal vehicle access, including valid beta; anonymous, expired and foreign access refused.',
 'src/app/garage/[id]/showcase/layout.tsx':'Preserves account-wide paid showcase guard after records authorization is scoped to exact vehicle.',
 'src/app/vehicle/[slug]/page.tsx':'Accepted owner Hub routing plus claimable equipment redirect; only already-claimed owners use confirmation repair.',
 'src/app/visual/page.tsx':'Member library derives cards from reviewed nonempty Visual mappings; no unsupported Aviator/publication expansion.',
 'src/lib/maintenance-receipt-storage.ts':'New receipt writes require existing cleanup environment readiness; private reads/deletes remain available while uploads held.',
 'src/app/api/maintenance/receipts/route.ts':'Reviewed uploads held unless private storage and cleanup environment are configured; no activation added.',
 'src/app/api/maintenance/receipts/extract/route.ts':'Extraction held with unavailable upload lifecycle; privacy/quota/ownership checks preserved.',
 'src/components/maintenance/ServiceRecords.tsx':'One canonical review fallback for authorized unsupported Twins; reviewed Twins retain tree/setup; stale history totals and print withheld.',
 'src/components/maintenance/GarageServiceRecordsClient.tsx':'Reload canonical surviving invoice records after deletion; preserve confirmed deletion and show retry on failed refresh.',
 'src/components/maintenance/ServiceReview.tsx':'Shared review retained; exact auto/manual transmission options explicitly represented in visible selector.',
 'src/lib/service-record-entry.ts':'Presentation-only choice of existing tree/setup or shared review; server remains authorization authority.',
 'src/components/known-issues/KnownIssueCard.tsx':'Main DTC sources, DtcAnchorLink, showSources and separateHeaderLinks retained; only cancellable anchor navigation/focus handling integrated.',
 'src/components/known-issues/catalog/ArticleRoute.tsx':'Pilot member/header/Visual integration plus main motorcycle absolute preview title/noindex, neutral no-critical wording and car-only DIY retained.',
 'src/components/known-issues/ArticleIssuesList.tsx':'Additive pilot filter/navigation integration with main vehicleType/basePath preserved.',
 'src/components/known-issues/CategorySection.tsx':'Additive navigation integration, main DTC/link/category contracts preserved.',
 'src/components/known-issues/IssueCategoryIcon.tsx':'Main normalization/category icon behavior retained; narrow IssueSeverityIcon export added.',
 'src/components/known-issues/FindDealerNearby.tsx':'Reviewed postcode/dealer request behavior added; motorcycle Maps-only early return preserved.',
 'src/components/twin/stage/TechTree.jsx':'Reviewed owner/equipment/service interactions and exact Visual trees integrated; main DTC data/parsers unchanged. Offline public and owner suites cover shared boundaries.',
 'next.config.ts':'Enrollment eligibility NetworkOnly caching added; candidate tracing root explicit to prevent accidental shared-workspace dependency tracing.',
 'tsconfig.json':'Strict checking retained; archived output/output(s) excluded; Next validates generated route types during build then runner restores the authored release config.',
 'scripts/paid-hub-account-navigation.test.cjs':'Current ownerSetup, confirmation, foreign/invalid denial and no unintended writes; obsolete equipmentSetup expectation removed.',
 'scripts/qa-maintenance-email.ts':'Typed renderer-QA callback parameters, exact offline email renderer retained.',
 'scripts/public-account-entrypoints.test.js':'Obsolete founder-only enrollment assumptions replaced by real gated handlers, attestation refusal, independent founder and explicitly reviewed legacy assertions.',
 'scripts/maintenance-reminder-parity.test.ts':'Archive dependency replaced by narrow accepted pre-extraction public TT_TREES fixture with original archive source digest; full value-parity assertion unchanged.',
 'scripts/exact-twin-maintenance-schedule.test.ts':'Align stale ownerReady and removed duplicate requirements grid assertions with accepted six ready twins and one bounded schedule board; substantive interval/history/equipment/service guards retained.',
 'scripts/maintenance-summary-parity.test.ts':'Accepted owner-ready metadata and honest unlogged expanded Nautilus branch; no service history fabricated.',
 'scripts/maintenance-records-writeback.test.ts':'Retain server writeback/history/escaping guards; schedule source assertion includes accepted non-mileage lane.',
 'scripts/six-known-issue-route.test.cjs':'Public-only relocated fixture and shipped-main runtime helper instead of unpublished DTC helper.',
 'scripts/six-known-issue-siblings.test.cjs':'Public-only fixtures and narrowed accepted artwork hash evidence; main DTC runtime helper.',
 'scripts/six-owner-paints.test.ts':'Reads narrowed public paint/hash evidence; no preview output dependency.',
 'scripts/known-issue-commerce.test.ts':'Baseline test fixture completed to strict current public fix-part shape, assertions unchanged.'
};
const original=new Map(previous.files.filter(row=>row.sourceSha256).map(row=>[row.path,row]));
for(const row of [{"path":"public/twin-stage/cadillac/known-issues/base-satin-steel-transparent.webp","sourceSha256":"3528DC0FA1F700C111DA87CA9EC41EDAED028B9EBDDFC64EE37A1B9D0C253836","decision":"Reviewed XT6 transparent artwork closure; preexisting pilot tracked asset missing from current-main baseline"},{"path":"public/twin-stage/cadillac/known-issues/glow-hood-satin-steel-transparent.webp","sourceSha256":"DB68278B6BD2BEEADE1739A79AE09AAE892648AA38C72D3FBD57F640ED16B390","decision":"Reviewed XT6 transparent artwork closure; preexisting pilot tracked asset missing from current-main baseline"},{"path":"public/twin-stage/cadillac/known-issues/glow-rearwheel-satin-steel-transparent.webp","sourceSha256":"F6A8978E64DA8383B3F9DCDC69CB2D64213F5550A829EA23BBEBCDAAE3BB31F5","decision":"Reviewed XT6 transparent artwork closure; preexisting pilot tracked asset missing from current-main baseline"},{"path":"public/twin-stage/cadillac/known-issues/glow-trans-satin-steel-transparent.webp","sourceSha256":"06A40A2629EC7B4B05314509C081F40905F5FB6B8A504AF1FE2D066880DF31B5","decision":"Reviewed XT6 transparent artwork closure; preexisting pilot tracked asset missing from current-main baseline"},{"path":"public/twin-stage/cadillac/known-issues/glow-wheel-satin-steel-transparent.webp","sourceSha256":"24954B8574C465C8D2ADE7EE905A5AA949CDBDA281AFAC6DD2A0690B6B5C0164","decision":"Reviewed XT6 transparent artwork closure; preexisting pilot tracked asset missing from current-main baseline"},{"path":"public/twin-stage/cadillac/known-issues/xray-radiator-satin-steel-transparent.webp","sourceSha256":"960FB636E05C4D274030FE7299CA1B2ABC76F02D9EDB3D5EA851A0CE6326450C","decision":"Reviewed XT6 transparent artwork closure; preexisting pilot tracked asset missing from current-main baseline"},{"path":"scripts/fixtures/accepted-template-before-extraction.json","sourcePath":"output/maintenance-email-corrections-20260913/before/src__components__twin__stage__TechTree.jsx.txt","sourceSha256":"ed667abdca8e7435eaedf24bb114718c42131aee2b95f5f12f9e4b9c9cb7bb8e","decision":"Narrow public TT_TREES literal projection from accepted pre-extraction source; no archive runtime or private rows copied"}])original.set(row.path,row);
let files=[];
for(const [p,row] of original){
 const sourcePath=row.sourcePath||p,origin=path.resolve(source,sourcePath);
 assert(origin.startsWith(source+path.sep),'Source path escapes pilot');
 assert.equal(sha(fs.readFileSync(origin)),row.sourceSha256.toLowerCase(),'Source drift: '+sourcePath);
 if(!fs.existsSync(path.join(root,p)))continue;
 const value=fs.readFileSync(path.join(root,p)),from=fs.readFileSync(origin),binary=/\.(webp|png|jpg|woff2?)$/i.test(p);
 const identical=binary?sha(value)===sha(from):normalized(value)===normalized(from);
 const base=baselinePaths.has(p)?git(['show',baseline+':'+p]):null;
 files.push({path:p,sourcePath,sourceSha256:sha(from),candidateSha256:sha(value),...(binary?{}:{sourceNormalizedSha256:normalized(from),candidateNormalizedSha256:normalized(value)}),baselineSha256:base?sha(base):null,decision:merged[p]||row.decision,integration:identical?'source-equivalent (text compared with normalized line endings and final whitespace)':'reviewed integration or verification fixture adaptation',changedFromBaseline:changed.includes(p)});
}
for(const p of changed.filter(p=>p!==relative&&!transport.includes(p)&&!files.some(row=>row.path===p))){
 assert(fs.existsSync(path.join(root,p)),'Unexpected deleted candidate file: '+p);
 const value=fs.readFileSync(path.join(root,p));
 files.push({path:p,candidateSha256:sha(value),candidateNormalizedSha256:normalized(value),baselineSha256:baselinePaths.has(p)?sha(git(['show',baseline+':'+p])):null,origin:'candidate-authored or baseline-derived',decision:merged[p]||(/scripts\/release\//.test(p)?'Local-only isolated schema/build/provenance verification tooling.':/scripts\/fixtures\/accepted-/.test(p)?'Narrow public artwork evidence projection; original evidence digest retained in fixture.':/docs\/|_bmad-output\//.test(p)?'Candidate specification/review/provenance evidence; not runtime.':'Baseline-derived local verification integration.'),changedFromBaseline:true});
}
const preserved=[];
for(const p of previous.preservedCandidates||previous.preservedMain?.map(row=>row.path)||[]){
 if(!fs.existsSync(path.join(root,p))||!baselinePaths.has(p))continue;
 const base=git(['show',baseline+':'+p]),current=fs.readFileSync(path.join(root,p));
 if(normalized(base)!==normalized(current)){
   assert(files.some(row=>row.path===p),'Undocumented main integration: '+p);continue;
 }
 preserved.push({path:p,baselineSha256:sha(base),candidateSha256:sha(current),normalizedSha256:normalized(current),decision:'Current-main content preserved; raw byte difference, if any, is CRLF/LF or final whitespace only.'});
}
files.sort((a,b)=>a.path.localeCompare(b.path));
const paintEvidence=JSON.parse(fs.readFileSync(path.join(root,'scripts/fixtures/accepted-paint-hashes.json'),'utf8'));
const artEvidence=JSON.parse(fs.readFileSync(path.join(root,'scripts/fixtures/accepted-visual-artwork.json'),'utf8'));
const evidenceSources=[{sourcePath:'output/six-owner-paints-20260913/prepared-evidence.json',sourceSha256:paintEvidence.sourceSha256,usedBy:'scripts/fixtures/accepted-paint-hashes.json'},...['nautilus','murano','kicks','mdx','aviator'].map(id=>({sourcePath:'output/six-owner-art-20260913/'+id+'/family-evidence.json',sourceSha256:artEvidence.find(row=>row.id===id).evidenceSha256,usedBy:'scripts/fixtures/accepted-visual-artwork.json'}))];
for(const row of evidenceSources)assert.equal(sha(fs.readFileSync(path.join(source,row.sourcePath))),row.sourceSha256.toLowerCase(),'Evidence source drift: '+row.sourcePath);
const next={schemaVersion:1,baselineCommit:baseline,sourceCommit:previous.sourceCommit,scope:previous.scope,
 hashPolicy:'SHA-256 raw bytes. Text normalized SHA-256 uses CRLF -> LF plus one final newline. Manifest self hash is intentionally external to avoid recursion; all other changed candidate paths are covered. Generated/ignored runtime dependencies, build outputs and synthetic databases are excluded.',
 files,preservedMain:preserved,evidenceSources,excludedPilotChanges:previous.excludedPilotChanges,
 exclusions:['Pilot output/runtime/configuration/private audience/owner records are never copied wholesale. Narrow public-only fixture projections have explicit source provenance.','Unpublished DTC application review, wave/binding/commerce data and retailer changes are excluded; shipped main DTC/motorcycle wrappers/parsers/data retained.','SubscriptionDowngrade model/code dependency remains disabled; downgrade schema journal and manual migration excluded.','Assembly transport plans/helpers are removed after provenance finalization.'],
 coverage:{changedPaths:changed.filter(p=>!transport.includes(p)).length,documentedChangedPaths:files.filter(r=>r.changedFromBaseline).length,manifestSelf:relative,sourceFilesVerified:original.size,evidenceSourcesVerified:evidenceSources.length,selectedFiles:files.length,reviewedArtworkFiles:files.filter(r=>r.path.startsWith('public/')).length,mainPreservedFiles:preserved.length,sourceDrift:false}};
assert.equal(next.coverage.changedPaths,next.coverage.documentedChangedPaths+1,'Incomplete changed-file coverage');
const lines=JSON.stringify(next,null,2).split('\n'),editor=process.env.AU7O_APPLY_PATCH_EXE||'C:/Users/devon/AppData/Local/OpenAI/Codex/bin/eab8377aebac6c07/codex.exe';
for(let at=0;at<lines.length;){
 const start=at;let size=0;while(at<lines.length&&(size<10000||at===start))size+=lines[at++].length+2;
 const patch='*** Begin Patch\n'+(start?'*** Update File: '+file+'\n@@\n '+lines[start-1]+'\n':'*** Add File: '+file+'\n')+lines.slice(start,at).map(line=>'+'+line).join('\n')+'\n'+(start?'*** End of File\n':'')+'*** End Patch';
 cp.execFileSync(editor,['--codex-run-as-apply-patch',patch],{cwd:root,windowsHide:true,stdio:'ignore'});
}
console.log(JSON.stringify(next.coverage,null,2));
