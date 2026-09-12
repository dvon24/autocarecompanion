const test=require('node:test');
const assert=require('node:assert/strict');
const {renderToString}=require('react-dom/server');
const {compile,runtime,row,triage,React}=require('./helpers/public-dtc-runtime.cjs');
const bundle=compile();
const plain=value=>JSON.parse(JSON.stringify(value));
const step={step:1,action:'Check timing before replacing parts',tool:'basic OBD-II scanner',expect:'Compare with the service manual',ifFail:'Inspect the documented cause',sourceUrl:'https://www.toyota.com/owners/'};
const params=make=>({params:Promise.resolve({code:'p0016',...(make?{make:'toyota'}:{})})});
test('real loaders/pages expose only published cars and diagnostics; pending preview flag cannot enable data',async()=>{
  for(const node of ['production','development']) {
    const r=runtime(await bundle,{node,rows:[row({diagnosticSteps:[step],diagnosticStepsStatus:'published'}),row({id:'pending-procedure',diagnosticSteps:[{...step,action:'PENDING SECRET'}]}),row({id:'unpublished',status:'pending_review'}),row({id:'motorcycle',vehicleType:'motorcycle'})],triageRow:triage({status:'pending_review'})});
    const data=await r.api.getDTCWithIssuesForMake('P0016','Toyota');
    assert.deepEqual(plain(data.issues.map(item=>item.id)),['published-issue','pending-procedure']);
    assert.equal(data.issues[0].diagnosticSteps[0].action,step.action);
    assert.equal(data.issues[1].diagnosticSteps,undefined);
    const article=await r.api.getKnownIssuesForArticle('Toyota','Camry');
    assert.equal(article[0].diagnosticSteps[0].action,step.action);
    assert.equal(article[1].diagnosticSteps,undefined);
    assert.equal(await r.api.getDtcTriage('P0016','Toyota'),null);
    for(const Page of [r.api.CodePage,r.api.MakePage]) {
      const html=renderToString(await Page(params(Page===r.api.MakePage)));
      assert.match(html,/How to Diagnose/); assert.doesNotMatch(html,/PENDING SECRET|id="unpublished"|id="motorcycle"|Narrow it down/);
    }
    assert.equal(r.api.diagVisible('pending_review'),false);
  }
});
test('malformed procedures are withheld as whole; unsafe sources are omitted and valid text survives',async()=>{
  for(const malformed of [null,{},[null],[{...step,step:0}],[{...step,step:2}],[step,{...step,step:3}],[{...step,action:null}],[{...step,tool:{}}],[step,step],[{...step,step:2},step]]) {
    const r=runtime(await bundle,{rows:[row({diagnosticStepsStatus:'published',diagnosticSteps:malformed})]});
    assert.equal((await r.api.getDTCWithIssues('P0016')).issues[0].diagnosticSteps,undefined);
    assert.doesNotMatch(renderToString(await r.api.MakePage(params(true))),/How to Diagnose<\/h4>/);
  }
  const r=runtime(await bundle,{rows:[row({diagnosticStepsStatus:'published',diagnosticSteps:[{...step,sourceUrl:'javascript:alert(1)'}]})]});
  const steps=(await r.api.getDTCWithIssues('P0016')).issues[0].diagnosticSteps;
  assert.equal(steps[0].sourceUrl,undefined); assert.equal(steps[0].action,step.action);
  assert.equal(r.api.readDiagnosticSteps([step,{...step,step:2}]).length,2);
});
test('triage is valid only for current displayed published matching targets and rejects malformed timestamps',async()=>{
  const valid=runtime(await bundle); assert.equal((await valid.api.getDtcTriage('P0016','Toyota')).branches.length,1);
  for(const overrides of [{branches:null},{branches:[null]},{sourceIssueIds:null},{sourceIssueIds:[]},{sourceIssueIds:[null]},{sourceIssueIds:['deleted']},{updatedAt:null},{updatedAt:'invalid'},{branches:[{...triage().branches[0],issueId:'deleted'}]}]) {
    const r=runtime(await bundle,{triageRow:triage(overrides)}); assert.equal(await r.api.getDtcTriage('P0016','Toyota'),null);
    const html=renderToString(await r.api.MakePage(params(true))); assert.doesNotMatch(html,/Confirm oil level first|Narrow it down/);
  }
  for(const overrides of [{status:'archived'},{make:'Ford'},{dtcCodes:['P0300']},{vehicleType:'motorcycle'}]) {
    const r=runtime(await bundle,{rows:[row(overrides)]}); assert.equal(await r.api.getDtcTriage('P0016','Toyota'),null);
  }
  for(const overrides of [{status:'archived'},{make:'Ford'},{dtcCodes:['P0300']},{vehicleType:'motorcycle'}]) {
    const r=runtime(await bundle,{rows:[row(),row({id:'provenance-source',...overrides})],triageRow:triage({sourceIssueIds:['published-issue','provenance-source']})});
    assert.equal(await r.api.getDtcTriage('P0016','Toyota'),null,'stale non-branch source holds intro/firstCheck');
  }
  const additional=runtime(await bundle,{rows:[row(),row({id:'provenance-source'})],triageRow:triage({sourceIssueIds:['published-issue','provenance-source']})});
  assert.equal((await additional.api.getDtcTriage('P0016','Toyota')).branches.length,1);
});
test('scanner requirements respect negation, dealer/proprietary tools, freeze-frame and combined capabilities',async()=>{
  const {api}=runtime(await bundle);
  const ids=(tools,solution='',codes=['P0016'])=>plain(api.diagnosticToolsForIssue(solution,codes,tools).tools.map(item=>item.id));
  assert.deepEqual(ids([]),[],'a code alone is not a tool need');
  for(const tool of ['no scanner required','scanner not needed','do not use a scanner','without a DMM','dealer scan tool or workshop equipment','dealer bidirectional scan tool','Techstream','VCDS scanner','FORScan adapter'])assert.deepEqual(ids([tool]),[],tool);
  assert.deepEqual(ids(['dealer scan tool'],'Use a scanner to read codes.'),[]);
  assert.deepEqual(ids(['basic OBD-II scanner with freeze frame']),['ancel-ad310']);
  assert.deepEqual(ids(['basic OBD-II scanner','live data scanner']),['launch-crp123x']);
  assert.deepEqual(ids(['basic OBD-II scanner','live data scanner','bidirectional scan tool']),['autel-mk808s']);
  assert.deepEqual(ids(['bidirectional scan tool'],'',['P1610']),[],'unknown OEM module has no inferred replacement');
  assert.deepEqual(ids(['DMM']),['dc-clamp-meter-low-current']);
  assert.deepEqual(ids(['test light']),[],'a test light is not a multimeter');
  assert.deepEqual(ids(['battery load tester']),[],'physical load testing is not BA101 conductance testing');
  assert.deepEqual(ids(['battery conductance tester']),['battery-conductance-tester']);
  for(const tool of ['ECU programming scan tool','immobilizer-capable scanner','bidirectional scanner with coding','J2534 pass-through','key programming tool']) {
    assert.deepEqual(ids([tool]),[],tool);
    assert.deepEqual(ids(['basic OBD-II scanner',tool]),[],tool+' cannot be satisfied by an extra basic reader');
    assert.deepEqual(ids([],`Use a scanner for ${tool}.`),[],tool+' in solution');
  }
});
test('malformed published commerce JSON cannot crash actual cards or shared articles',async()=>{
  for(const overrides of [{fixParts:{}},{fixParts:[null]},{fixParts:[{component:'Broken',buyLinks:[null]}]},{communityRecommendations:[null]},{communityRecommendations:[{type:'tip',content:null}]}]) {
    const r=runtime(await bundle,{rows:[row(overrides)]});
    for(const Page of [r.api.CodePage,r.api.MakePage])assert.match(renderToString(await Page(params(Page===r.api.MakePage))),/Documented timing issue/);
    const issue=(await r.api.getKnownIssuesForArticle('Toyota','Camry'))[0];
    assert.doesNotThrow(()=>renderToString(React.createElement(r.api.KnownIssueCard,{issue,defaultExpanded:true})));
  }
  const r=runtime(await bundle,{rows:[row({communityRecommendations:[null,{type:'legacy-advice',text:'Unknown advice must stay hidden'},{type:'tip',content:'Keep this usable owner tip',affiliateUrl:'invalid legacy metadata'},{type:'warning',content:'Keep this warning'},{type:'part',content:'Suppressed community part'},{type:'tip',content:null}]})]});
  const article=(await r.api.getKnownIssuesForArticle('Toyota','Camry'))[0];
  assert.deepEqual(plain(article.communityRecommendations.map(item=>item.type)),['tip','warning','part']);
  const html=renderToString(await r.api.MakePage(params(true)));
  assert.match(html,/Keep this usable owner tip/); assert.match(html,/Keep this warning/);
  assert.doesNotMatch(html,/Unknown advice must stay hidden|Suppressed community part|invalid legacy metadata/);
});
test('triage requires usable source timestamps no newer than its review, including non-branch sources',async()=>{
  for(const updatedAt of [null,undefined,'invalid',new Date('2026-09-03')]) {
    for(const sourceOnly of [false,true]) {
      const rows=sourceOnly?[row(),row({id:'provenance-source',updatedAt})]:[row({updatedAt})];
      const r=runtime(await bundle,{rows,triageRow:triage({sourceIssueIds:sourceOnly?['published-issue','provenance-source']:['published-issue']})});
      assert.equal(await r.api.getDtcTriage('P0016','Toyota'),null);
      assert.doesNotMatch(renderToString(await r.api.MakePage(params(true))),/Confirm oil level first/);
    }
  }
});
test('parent cards retain explicit model identity and scoped commerce without fabricated vehicle selection',async()=>{
  const part={component:'Timing component',oemPartNumber:'FIXTURE-123',verified:true,aftermarketXref:[],fitment:{years:[2010]},buyLinks:[{vendor:'Amazon',url:'https://www.amazon.com/dp/B01G5EA74I',verified:true,linkType:'product'}]};
  const r=runtime(await bundle,{rows:[row({fixParts:[part]})]});
  const html=renderToString(await r.api.CodePage(params(false)));
  assert.match(html,/Toyota.*Camry/); assert.match(html,/2010.*2016/);
  assert.match(html,/B01G5EA74I/); assert.doesNotMatch(html,/Check Price on Amazon/,'generic code-only scanner grid removed');
  assert.doesNotMatch(renderToString(await r.api.MakePage(params(true))),/recall-backed|dealer repairs free|covered by a recall or campaign/);
});
test('thin metadata and sitemap remain aligned and preserve published car-only SQL',async()=>{
  const r=runtime(await bundle,{thin:true});
  assert.equal((await r.api.codeMetadata(params(false))).robots.index,false);
  assert.equal((await r.api.makeMetadata(params(true))).robots.index,false);
  assert.deepEqual(plain(await r.api.getAllDTCSlugsWithDates()),[]);
  assert.deepEqual(plain(await r.api.getAllDTCMakeSlugs()),[]);
  const normal=runtime(await bundle);
  assert.notEqual((await normal.api.makeMetadata(params(true))).robots?.index,false);
  assert.deepEqual(plain(await normal.api.getAllDTCMakeSlugs()),[{code:'p0016',make:'toyota'}]);
});
