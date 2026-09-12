/* Hydrate actual public DTC components at mobile and desktop widths.
 * Synthetic public fixtures and intercepted provider/Next leaves; no live services. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {renderToString}=require('react-dom/server');
const {compile,runtime,row,triage,React,root}=require('./helpers/public-dtc-runtime.cjs');
const {chromium}=require(process.env.AU7O_PLAYWRIGHT_PATH||'playwright');
async function run() {
  const actual=runtime(await compile(),{rows:[row({diagnosticStepsStatus:'published',diagnosticSteps:[{step:1,action:'Inspect the timing reference marks',tool:'basic OBD-II scanner'}]})]});
  const issue=(await actual.api.getDTCWithIssuesForMake('P0016','Toyota')).issues[0];
  const props={make:'Toyota',model:'Camry',articleSlug:'toyota-camry',issues:[issue],dtcCode:'P0016',defaultExpanded:false,expandFirst:0};
  const triageProps={triage:triage(),codeUpper:'P0016',make:'Toyota'};
  const navProps={heading:'P0016 by Toyota model',entries:[{anchor:'model-camry',label:'Camry',count:1,highCount:0}]};
  const initial=renderToString(React.createElement(React.Fragment,null,React.createElement(actual.api.DtcTriageBlock,triageProps),React.createElement(actual.api.DtcSidebar,navProps),React.createElement(actual.api.DtcMobileToc,navProps),React.createElement(actual.api.DtcModelSection,props)));
  const js=await compile(`import React from 'react';import {hydrateRoot} from 'react-dom/client';
    import {DtcModelSection} from '@/components/known-issues/DtcModelSection';
    import {DtcTriageBlock} from '@/components/known-issues/DtcTriageBlock';
    import {DtcSidebar,DtcMobileToc} from '@/components/known-issues/DtcSidebar';
    hydrateRoot(document.getElementById('root'),React.createElement(React.Fragment,null,React.createElement(DtcTriageBlock,window.__triage),React.createElement(DtcSidebar,window.__nav),React.createElement(DtcMobileToc,window.__nav),React.createElement(DtcModelSection,window.__props)));
    window.__mounted=true;`,true);
  const postcss=require('postcss');
  const tailwind=require('@tailwindcss/postcss');
  const css=(await postcss([tailwind({base:root})]).process('@import "tailwindcss";',{from:path.join(root,'src/app/globals.css')})).css;
  const html='<!doctype html><html><head><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body><main style="max-width:900px;margin:auto;padding:16px"><div id="root">'+initial+'</div></main><script>window.__props='+JSON.stringify(props).replaceAll('<','\\u003c')+';window.__triage='+JSON.stringify(triageProps).replaceAll('<','\\u003c')+';</script><script>'+js.replaceAll('</script','<\\/script')+'</script></body></html>';
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    for(const width of [390,1280]) {
      const page=await browser.newPage({viewport:{width,height:900}});
      const errors=[]; page.on('pageerror',error=>errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
      const pageHtml=html.replace('window.__props=', 'window.__nav='+JSON.stringify(navProps)+';window.__props=');
      await page.route('**/*',route=>route.request().url()==='http://127.0.0.1:3037/public-dtc-test'
        ?route.fulfill({contentType:'text/html; charset=utf-8',body:pageHtml}):route.abort());
      await page.goto('http://127.0.0.1:3037/public-dtc-test');
      await page.waitForFunction(()=>window.__mounted===true);
      const section=page.locator('button[aria-controls="model-camry-issues"]');
      const branch=page.locator('#triage a[href="#published-issue"]');
      assert.equal(await section.getAttribute('aria-expanded'),'false');
      const toc=page.locator(width<1024?'nav[aria-label="Models on this page"] a[href="#model-camry"]':'aside a[href="#model-camry"]');
      await toc.click();
      assert.equal(await section.getAttribute('aria-expanded'),'true');
      await section.click();
      assert.equal(await section.getAttribute('aria-expanded'),'false');
      assert.equal(await page.evaluate(()=>location.hash),'#model-camry');
      await toc.click();
      assert.equal(await section.getAttribute('aria-expanded'),'true','same-hash mobile/desktop TOC reopens model');
      await section.click();
      await branch.click();
      await page.getByRole('heading',{name:'How to Diagnose',exact:true}).waitFor();
      assert.equal(await section.getAttribute('aria-expanded'),'true');
      await page.waitForFunction(()=>document.activeElement?.id==='published-issue');
      assert.equal(await page.locator('#published-issue').count(),1);
      await section.click();
      assert.equal(await section.getAttribute('aria-expanded'),'false');
      await branch.click();
      await page.getByRole('heading',{name:'How to Diagnose',exact:true}).waitFor();
      assert.equal(await section.getAttribute('aria-expanded'),'true','same-anchor link reopens section');
      const card=page.locator('#published-issue > button[aria-controls]');
      await card.click(); assert.equal(await card.getAttribute('aria-expanded'),'false');
      await branch.click();
      await page.getByRole('heading',{name:'How to Diagnose',exact:true}).waitFor();
      assert.equal(await card.getAttribute('aria-expanded'),'true','same-anchor link reopens card');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
      assert.deepEqual(errors,[],'no hydration/runtime errors');
      const out=path.join(root,'outputs/public-dtc-release'); fs.mkdirSync(out,{recursive:true});
      await page.screenshot({path:path.join(out,`hydrated-${width}.png`),fullPage:true});
      console.log(`PASS ${width}px: same-hash model TOC and triage clicks, section/card reopen, diagnosis, unique anchor, focus, no overflow or hydration errors; providers intercepted`);
      await page.close();
    }
  } finally {await browser.close()}
}
run().catch(error=>{console.error(error);process.exitCode=1});
