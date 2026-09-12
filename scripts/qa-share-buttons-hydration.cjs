// Actual ShareButtons SSR + hydration; synthetic browser capabilities, no network.
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const esbuild=require('esbuild');
const React=require('react');
const {renderToString}=require('react-dom/server');
const {chromium}=require(process.env.AU7O_PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..');
const component=path.join(root,'src/components/shared/ShareButtons.tsx').replaceAll('\\','/');
async function build(contents,browser=false){
 return (await esbuild.build({stdin:{contents,resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:browser?'browser':'node',format:browser?'iife':'cjs',jsx:'automatic',external:browser?[]:['react','react/jsx-runtime'],define:{'process.env.NODE_ENV':'"development"'},logLevel:'silent'})).outputFiles[0].text;
}
async function main(){
 const compiled=await build(`export {ShareButtons} from ${JSON.stringify(component)};`);
 const module={exports:{}};vm.runInNewContext(compiled,{module,exports:module.exports,require});
 const props={url:'https://au7o.io/known-issues/dtc/00290',title:'00290 diagnostic guide',description:'Diagnostic steps',showInstagram:false};
 const markup=renderToString(React.createElement(module.exports.ShareButtons,props));
 assert(!markup.includes('aria-label="Share"'),'SSR must not assume browser sharing support');
 const script=await build(`import React from 'react';import {hydrateRoot} from 'react-dom/client';import {ShareButtons} from ${JSON.stringify(component)};hydrateRoot(document.getElementById('root'),React.createElement(ShareButtons,${JSON.stringify(props)}));`,true);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const capability of ['available','absent','nonfunction','cancelled'])for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:900}});const errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   await page.addInitScript(mode=>{
    window.__shared=[];
    Object.defineProperty(navigator,'share',{configurable:true,value:mode==='absent'?undefined:mode==='nonfunction'?true:async data=>{window.__shared.push(data);if(mode==='cancelled')throw new DOMException('Cancelled','AbortError')}});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}});
   },capability);
   await page.route('**/*',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root">${markup}</div><script>${script.replaceAll('</script','<\\/script')}</script>`}));
   await page.goto('https://share-test.invalid');
   const native=capability==='available'||capability==='cancelled';
   if(native){await page.getByRole('button',{name:'Share',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.__shared),[props].map(({url,title,description})=>({url,title,text:description})));}
   else {await page.getByRole('button',{name:'Copy link',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Share',exact:true}).count(),0);}
   await page.getByRole('button',{name:'Copy link',exact:true}).click();await page.getByRole('button',{name:'Link copied',exact:true}).waitFor();
   assert.equal(await page.getByRole('button',{name:'Share',exact:true}).count(),native?1:0,'capability remains correct after a hydrated state transition');
   assert.equal(await page.evaluate(()=>window.__copied),props.url);
   assert.equal(await page.getByRole('link',{name:'Share on X',exact:true}).getAttribute('href'),`https://x.com/intent/tweet?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title)}`);
   assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${capability} ${width}`);
  }
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
