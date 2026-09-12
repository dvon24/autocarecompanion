const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {renderToString} = require('react-dom/server');
const {compile,runtime,React} = require('../../scripts/helpers/public-dtc-runtime.cjs');
async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname,'nissan-manifest.json')));
  const before = JSON.parse(fs.readFileSync(path.join(__dirname,'nissan-before.json')));
  const row = {...before.issue,...manifest.issue,updatedAt:new Date('2026-09-12T20:00:00Z')};
  const compiled = await compile();
  const results=[];
  for(const code of ['P1610','P1614']) {
    const triage = {...manifest.triage.find(t=>t.code===code),updatedAt:row.updatedAt};
    const dtc = {...before.library.find(t=>t.code===code),...manifest.library.find(t=>t.code===code), createdAt:new Date('2026-03-14'), updatedAt:row.updatedAt};
    const r = runtime(compiled,{rows:[row],triageRow:triage,dtcOverrides:dtc});
    const data = await r.api.getDTCWithIssuesForMake(code,'Nissan');
    assert.equal(data.issues.length,1);
    const issue=data.issues[0];
    assert.equal(issue.diagnosticSteps.length,8);
    assert.equal(issue.fixParts.length,1);
    assert.deepEqual(JSON.parse(JSON.stringify(issue.fixParts[0].fitment)),{years:[2005,2006,2007,2008],engines:['3.5L']});
    assert.equal(issue.fixParts[0].oemPartNumber,null);
    assert.deepEqual(JSON.parse(JSON.stringify(issue.fixParts[0].aftermarketXref)),['Interstate MTP-35']);
    for(const year of [2003,2004,2005,2006,2007,2008,2009]) {
      for(const engine of ['3.5L',undefined,'2.5L']) {
        const selected=renderToString(React.createElement(r.api.KnownIssueCard,{issue,defaultExpanded:true,vehicleInfo:{year,make:'Nissan',model:'350Z',engine}}));
        const linked=selected.includes('href="https://www.interstatebatteries.com/products/mtp-35"');
        assert.equal(linked,year>=2005&&year<=2008&&engine==='3.5L',`Scope leak ${year} ${engine}`);
      }
    }
    assert.ok(await r.api.getDtcTriage(code,'Nissan'));
    const diagnosticTools=r.api.diagnosticToolsForIssue(issue.solution,issue.dtcCodes,issue.diagnosticSteps.map(s=>s.tool));
    assert.equal(diagnosticTools.tools.length,0,'No substitute consumer equipment for proprietary Nissan tests');
    for(const Page of [r.api.CodePage,r.api.MakePage]) {
      const make=Page===r.api.MakePage;
      const html=renderToString(await Page({params:Promise.resolve({code:code.toLowerCase(),...(make?{make:'nissan'}:{})})}));
      assert.match(html,/How to Diagnose/);
      assert.match(html,/MTP-35/);
      assert.match(html,/href="https:\/\/www.interstatebatteries.com\/products\/mtp-35"/);
      assert.match(html,/224.95/);
      assert.match(html,/2005/); assert.match(html,/2008/);
      assert.doesNotMatch(html,/Weak (?:or dead )?key fob battery|Intelligent Key|Remanufactured Starter|Steering Lock Module and NATS Immobilizer Failure|TSB-NTB06-071|7Q2Jxv6x4qk|most common real-world/);
      assert.equal((html.match(/id="code-reference"/g)||[]).length,1);
      if(make) assert.match(html,/id="triage"/);
      fs.writeFileSync(path.join(__dirname,`nissan-${code.toLowerCase()}-${make?'make':'parent'}.html`),html);
      results.push({code,surface:make?'make':'parent',diagnosticSteps:8,verifiedProductLinks:1});
    }
    const partHtml=renderToString(React.createElement(r.api.KnownIssueCard,{issue,defaultExpanded:true}));
    assert.match(partHtml,/dealer/i);
    const stale = r.api.readDtcTriage({...triage,updatedAt:'2026-09-11'},code,'Nissan',[issue]);
    assert.equal(stale,null);
  }
  const manifestSha256=crypto.createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
  const report={result:'PASS',manifestSha256,results,dbWrites:0,networkRequests:0};
  fs.writeFileSync(path.join(__dirname,'nissan-test-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
}
main().catch(error=>{console.error(error);process.exitCode=1});
