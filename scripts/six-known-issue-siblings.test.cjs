const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const sharp=require('sharp');
require('tsx/cjs');
const {compile,runtime}=require('./helpers/public-dtc-runtime.cjs');
const {KNOWN_ISSUE_TWIN_VISUALS:definitions,KNOWN_ISSUE_TWIN_EFFECTS}=require('../src/lib/known-issue-twin-visuals.ts');
const {projectKnownIssueTwinIssues,isKnownIssueTwinPilotEnabled}=require('../src/lib/known-issue-twin-pilot.ts');
const {buildIssueTree}=require('../src/lib/known-issue-twin-tree.ts');
const {buildOwnerTwinIssueSummary}=require('../src/lib/twin-owner-issues.ts');
const {reviewedKnownIssueTwinCopy}=require('../src/lib/known-issue-twin-copy.ts');
const {REVIEWED_OWNER_EQUIPMENT}=require('../src/lib/twin-owner-equipment.ts');
const snapshot=require('./fixtures/published-six-content.json');
const rows=snapshot.rows.map(row=>({...row,vehicleType:'car',reportCount:0,communityRecommendations:[],confidence:'high'}));
let app;
test.before(async()=>{app=runtime(await compile(`export {getKnownIssuesForArticle} from '@/lib/known-issues';`),{rows}).api;});
const expected={nautilus:5,murano:5,xt6:10,kicks:3,mdx:5,aviator:0};
for(const definition of definitions){
  test(`${definition.twinId}: actual article loader to exact projection and compact tree`,async()=>{
    const source=await app.getKnownIssuesForArticle(definition.identity.make,definition.identity.model,'car');
    const projected=projectKnownIssueTwinIssues(source,definition),mapped=projected.filter(row=>row.hotspot);
    assert.equal(mapped.length,expected[definition.twinId]);
    for(const row of mapped){
      const tree=buildIssueTree(row);assert.equal(tree.nodes.vehicle.label,`${definition.year} ${definition.identity.make} ${definition.identity.model}`);assert.equal(tree.nodes.vehicle.img,definition.base);
      assert.deepEqual(tree.nodes.vehicle.kids,['system']);assert.deepEqual(tree.nodes.system.kids,['mechanism']);assert.deepEqual(tree.nodes.mechanism.kids,['action']);assert.deepEqual(tree.nodes.action.kids,[]);
      assert.equal(Object.keys(tree.nodes).length,4);
      if(row.dealerAction){assert.equal(tree.nodes.action.dealerMake,definition.identity.make);assert(tree.nodes.action.actionUrl.includes(definition.identity.make));}
      for(const node of Object.values(tree.nodes))assert(fs.existsSync(path.join('public',node.img)));
      assert.equal(row.hotspot.id,definition.mappings[row.id]);
      if(definition.twinId!=='xt6'){
        const raw=source.find(item=>item.id===row.id);
        for(const changed of [{...raw,description:raw.description+' Changed.'},{...raw,solution:raw.solution+' Changed.'},{...raw,vehicleMatch:{...raw.vehicleMatch,engines:['incompatible']}},{...raw,vehicleMatch:{...raw.vehicleMatch,trims:['incompatible']}},{...raw,citations:[]}]){
          if(JSON.stringify(changed)===JSON.stringify(raw))continue;
          const held=projectKnownIssueTwinIssues([changed],definition)[0];assert.equal(held.hotspot,null);assert.deepEqual(held.fixParts,[]);
        }
        assert.equal(projectKnownIssueTwinIssues([{...raw,status:'pending_review'}],definition).length,0);
        assert.equal(projectKnownIssueTwinIssues([{...raw,vehicleMatch:{...raw.vehicleMatch,years:[definition.year+1]}}],definition).length,0);
        assert.equal(projectKnownIssueTwinIssues([{...raw,vehicleMatch:{...raw.vehicleMatch,model:'Other'}}],definition).length,0);
        assert.equal(projectKnownIssueTwinIssues([{...raw,id:'unmapped'}],definition)[0].hotspot,null);
      }
    }
  });
  test(`${definition.twinId}: exact exposure keeps production US opt-in and no year borrowing`,()=>{
    const input={slug:definition.slug,requestedYear:definition.year,queryEnabled:true,isVercel:true,vercelEnvironment:'production',country:'US',productionFlag:'true',nodeEnvironment:'production'};
    assert.equal(isKnownIssueTwinPilotEnabled(input),true);
    for(const change of [{country:'DE'},{productionFlag:'false'},{requestedYear:definition.year+1},{slug:'unrelated'},{queryEnabled:false}])assert.equal(isKnownIssueTwinPilotEnabled({...input,...change}),false);
  });
}
test('qualified shared owner copy is source-bound and fluid purchases remain conditional',async()=>{
  const ids=['acura-mdx-auto-idle-stop-failure-to-restart','acura-mdx-torque-converter-shudder-2014','lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white','lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph','nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne'];
  for(const id of ids){const raw=rows.find(row=>row.id===id),original=structuredClone(raw),definition=definitions.find(row=>row.mappings[id]);
    const profile=REVIEWED_OWNER_EQUIPMENT.find(row=>row.catalogId===definition.twinId),vehicle={...profile,reviewedEquipmentId:profile.id};
    const owner=buildOwnerTwinIssueSummary(raw,vehicle);
    const issue=projectKnownIssueTwinIssues(await app.getKnownIssuesForArticle(raw.make,raw.model,'car'),definition).find(row=>row.id===id);
    assert.equal(owner.solution,issue.explanation.action);assert.deepEqual(raw,original);
    assert.doesNotMatch(owner.solution,/DW-1|replace.*long block|10.year.*warranty|install.*disable module/i);
    for(const change of [{description:raw.description+' Changed.'},{solution:raw.solution+' Changed.'},{years:[...raw.years,2030]},{trims:['Changed']},{engines:['Changed']},{citations:[{url:'https://example.invalid/revised'}]},{citations:raw.citations.map(citation=>({...citation,title:'Changed source title'}))},{years:undefined},{trims:undefined},{engines:undefined},{citations:undefined}]){const held=buildOwnerTwinIssueSummary({...raw,...change},vehicle);assert.match(held.solution,/current equipment-specific diagnostic review/);assert.deepEqual(held.fixParts,[]);}
    assert.equal(reviewedKnownIssueTwinCopy({id:raw.id,description:raw.description,solution:raw.solution}),null,'wording alone cannot authorize scoped copy');
    if(id.includes('torque-converter')){assert.match(owner.solution,/Type 3.1/);assert.equal(owner.fixParts[0].oemPartNumber,'08200-9017');assert.match(owner.fixParts[0].note,/Only if diagnosed/);assert.equal(issue.fixParts.length,1);assert.match(issue.fixParts[0].buyLinks[0].url,/acurapartswarehouse.*08200-9017/);}
    if(id.includes('8f35')){assert.match(owner.solution,/not a substitute/);assert.equal(owner.fixParts[0].oemPartNumber,'XT-12-QULV');assert.match(owner.fixParts[0].note,/Only if separate/);assert.match(issue.fixParts[0].buyLinks[0].url,/fordpartsgiant.*xt-12-qulv/);}
  }
});
for(const catalogId of ['mdx','nautilus'])test(`${catalogId}: actual article mapper retains raw recall-first and cannot insert diagnostic fluid`,async()=>{
  const definition=definitions.find(row=>row.twinId===catalogId);
  const id=catalogId==='mdx'?'acura-mdx-torque-converter-shudder-2014':'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph';
  const source=rows.find(row=>row.id===id),raw={...source,fixParts:[{component:'Manufacturer recall action',recallFirst:true,verified:true}]};
  const local=runtime(await compile(`export {getKnownIssuesForArticle} from '@/lib/known-issues';`),{rows:[raw]}).api;
  const loaded=await local.getKnownIssuesForArticle(raw.make,raw.model,'car');assert.equal(loaded[0].fixParts[0].recallFirst,true);
  const issue=projectKnownIssueTwinIssues(loaded,definition)[0];assert(issue.hotspot);assert.equal(issue.recallFirst,true);assert.equal(issue.dealerAction,true);assert.deepEqual(issue.fixParts,[]);
  const tree=buildIssueTree(issue);assert(!JSON.stringify(tree).includes(catalogId==='mdx'?'acurapartswarehouse.com':'fordpartsgiant.com'));
  assert.equal(raw.description,source.description);assert.equal(raw.solution,source.solution);
});
test('installed 25 derivatives retain accepted hashes, visible RGB and common real alpha',async()=>{
  const hashes=[];
  for(const id of ['nautilus','murano','kicks','mdx','aviator']){
    const evidence=require('./fixtures/accepted-visual-artwork.json').filter(row=>row.id===id);let alpha;
    assert.equal(evidence.length,5);
    for(const row of evidence){const target=row.target;const data=fs.readFileSync(target),original=fs.readFileSync(row.source);
      const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');assert.equal(hash(data).toLowerCase(),row.targetSha256.toLowerCase());assert.equal(hash(original),row.sourceSha256);
      const rendered=await sharp(data).ensureAlpha().raw().toBuffer({resolveWithObject:true}),rgb=await sharp(original).removeAlpha().raw().toBuffer();assert.equal(rendered.info.width,1672);assert.equal(rendered.info.height,941);
      const current=Buffer.alloc(1672*941);let transparent=0,opaque=0;
      for(let pixel=0;pixel<current.length;pixel++){const a=rendered.data[pixel*4+3];current[pixel]=a;if(!a)transparent++;if(a===255)opaque++;if(a)for(let c=0;c<3;c++)assert.equal(rendered.data[pixel*4+c],rgb[pixel*3+c]);}
      assert(transparent>100000&&opaque>100000);if(alpha)assert.deepEqual(current,alpha);else alpha=current;
      hashes.push({target:path.relative(process.cwd(),target),sha256:hash(data),sourceSha256:row.sourceSha256,width:1672,height:941,commonAlpha:true,visibleRgbPreserved:true});
    }
  }
  const evidenceOutput=process.env.AU7O_SIBLINGS_TEST_OUTPUT||'output/six-known-issue-siblings-20260913';
  fs.mkdirSync(evidenceOutput,{recursive:true});fs.writeFileSync(path.join(evidenceOutput,'asset-verification.json'),JSON.stringify(hashes,null,2));
  assert.equal(hashes.length,25);assert.equal(Object.keys(KNOWN_ISSUE_TWIN_EFFECTS).length,9);
  for(const name of ['part-egr-cooler','part-fuel-pump-module'])for(const [folder,size] of [['parts',512],['thumbs',200]]){
    const file=`public/twin-stage/${folder}/${name}.webp`,target=fs.readFileSync(file);
    const provenance=require('../docs/launch-candidate-manifest-20260918.json').files.find(row=>row.path===file);
    assert.equal(crypto.createHash('sha256').update(target).digest('hex'),provenance.sourceSha256.toLowerCase());
    const metadata=await sharp(target).metadata();assert.equal(metadata.width,size);assert.equal(metadata.height,size);
  }
});
