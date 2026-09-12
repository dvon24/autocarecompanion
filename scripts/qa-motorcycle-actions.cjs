/* Real search -> article list -> category -> issue card -> tool/dealer controls.
 * Next/session/context and ad boundaries are fixtures. No live requests or writes. */
/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const esbuild = require('esbuild'), postcss = require('postcss'), tailwind = require('@tailwindcss/postcss');
const { chromium } = require(process.env.AU7O_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..'), origin = 'https://motorcycle-actions.invalid', out = path.join(root, 'output/motorcycle-catalog-release');
let phase = 'fixture';
async function main() {
  const bundle = await esbuild.build({ stdin:{resolveDir:root,loader:'tsx',contents:`
    import React from 'react';import {createRoot} from 'react-dom/client';
    import {ModelIssueSearch} from './src/components/known-issues/ModelIssueSearch';
    import {ArticleIssuesList} from './src/components/known-issues/ArticleIssuesList';
    const params=new URLSearchParams(location.search),car=params.has('car'),make=params.get('make')||'Honda';
    const issues=[{id:'charging-test',vehicleMatch:{make,model:'Test Model',years:[2020],trims:car?[]:['Motorcycle trim']},category:'electrical',
      title:'Charging fault',description:'Synthetic consumer boundary test.',solution:'Read fault codes with a scan tool. Visit your dealer for diagnosis.',
      symptoms:['Slow cranking'],dtcCodes:['P0562'],severity:'medium',confidence:'low',reportCount:0,reviewedOn:'2026-09-08',
      source:params.has('synthetic')?'synthetic-design-fixture':'manual',citations:[],communityRecommendations:[],fixParts:[{component:'Reviewed motorcycle test part',verified:true,
      buyLinks:[{vendor:'Amazon',url:'https://www.amazon.com/dp/B000TEST01',verified:true,linkType:'product'}]}]}];
    createRoot(document.getElementById('root')).render(<main className="max-w-5xl mx-auto p-4">
      <ModelIssueSearch issues={issues} make={make} model="Test Model" keywordOnly={!car} hubHref={car?'/vehicle/2020-honda-test-model':undefined}/>
      <ArticleIssuesList issues={issues} make={make} model="Test Model" initialYear={2020} allYears={[2020]}
        vehicleType={car?'car':'motorcycle'} basePath={car?'/known-issues':'/motorcycle-issues'} linkableDtcCodes={car?['p0562']:[]}/>
    </main>);
  `},bundle:true,write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"development"','process.env':'{}'},plugins:[{name:'external-boundaries',setup(build){
    const mocks={
      'next/link':'export default function Link({prefetch,replace,scroll,...p}){return <a {...p}/>}',
      'next/image':'export default function Image({fill,priority,unoptimized,...p}){return <img {...p}/>}',
      'next/navigation':'export function usePathname(){return location.pathname}export function useRouter(){return {push:()=>{},refresh:()=>{}}}export function useSearchParams(){return new URLSearchParams(location.search)}',
      'next-auth/react':'export function useSession(){return {data:new URLSearchParams(location.search).has("paid")?{user:{subscriptionStatus:"active"}}:null,status:"authenticated"}}',
      '@/contexts/AppContext':'export function useVehicleContext(){return {selectedVehicle:{year:2020,make:"Honda",model:"Test Model",trim:"Car only trim"}}}',
      '@/components/ads/AdSlot':'export function AdSlot(){return null}',
    };
    build.onResolve({filter:/.*/},args=>args.path in mocks?{path:args.path,namespace:'boundary'}:undefined);
    build.onLoad({filter:/.*/,namespace:'boundary'},args=>({loader:'jsx',resolveDir:root,contents:mocks[args.path]}));
  }}]});
  const css=(await postcss([tailwind({base:root})]).process(fs.readFileSync('src/app/globals.css','utf8'),{from:path.resolve('src/app/globals.css')})).css;
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true}), results=[];
  try {
    for(const width of [390,1280]) for(const make of ['Honda','BMW']) for(const paid of [false,true]) {
      phase='bike '+make+' '+width+' '+(paid?'paid':'free');
      const page=await browser.newPage({viewport:{width,height:844}}),requests=[],errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',route=>{
        const url=new URL(route.request().url());
        if(url.origin!==origin){requests.push(url.pathname);return route.abort();}
        if(url.pathname==='/bundle.js')return route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text});
        if(url.pathname==='/style.css')return route.fulfill({contentType:'text/css',body:css});
        if(url.pathname!=='/'){requests.push(url.pathname);return route.abort();}
        return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>'});
      });
      await page.goto(origin+'/?make='+make+(paid?'&paid=1':''));
      const input=page.getByPlaceholder('Search '+make+' Test Model issues, a symptom, or a code…');
      await input.fill('unmatched');
      await page.getByText('No keyword match. Try another symptom, issue name, or code.').waitFor();
      assert.equal(await page.getByRole('button',{name:/AI search|photo|video|microphone|upgrade/i}).count(),0);
      await input.fill('slow cranking');
      await page.getByRole('button',{name:'Charging fault',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('#charging-test > button')?.getAttribute('aria-expanded')==='true');
      assert.equal(new URL(page.url()).hash,'#charging-test');
      await page.getByRole('heading',{name:'How to Fix',exact:true}).waitFor();
      assert.equal(await page.getByRole('heading',{name:'What you need to diagnose it',exact:true}).count(),0,'no generic scanner product');
      assert.equal(await page.getByRole('link',{name:/P0562/}).count(),0,'bike code remains plain');
      const dealer=page.getByRole('link',{name:'Search '+make+' motorcycle dealers in Google Maps ↗'});
      assert.equal(new URL(await dealer.getAttribute('href')).searchParams.get('query'),make+' motorcycle dealer service near me');
      assert.equal(await page.getByRole('button',{name:/Use my location|Find a .* dealer near me/}).count(),0,'no automotive nearby search');
      assert.equal(await page.locator('a[href="https://www.amazon.com/dp/B000TEST01?tag=au7o-20"]').count(),1,'explicit reviewed repair product survives');
      assert.equal(await page.getByRole('combobox').inputValue(), '', 'bike ignores selected car trim');
      assert.deepEqual(await page.locator('a[href^="/vehicle/"],a[href^="/subscribe"],a[href^="/symptom-chat"],input[type="email"]').evaluateAll(items=>items.map(item=>item.outerHTML)),[]);
      await input.fill('P0562'); await page.getByRole('button',{name:'Charging fault',exact:true}).click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      await page.screenshot({path:path.join(out,'actions-'+make+'-'+width+'-'+(paid?'paid':'free')+'.png'),fullPage:true});
      results.push({make,width,paid,keywordJump:true,reviewedPart:true,bikeDealer:true,unexpectedRequests:requests});
      // Same real consumer with car defaults retains AI, camera and scanner controls.
      if(make==='Honda'&&!paid){
        phase='synthetic '+width;
        await page.goto(origin+'/?synthetic=1#charging-test');
        await page.getByText('Synthetic design example — not a verified defect or repair recommendation.').waitFor();
        assert.equal(await page.getByText('AI Researched',{exact:true}).count(),0);
        results.push({width,syntheticBadge:true});
        phase='car '+width;
        await page.goto(origin+'/?car=1');await page.getByRole('button',{name:/AI search/}).waitFor();
        assert.equal(await page.getByRole('button',{name:'Show it — snap a photo or video'}).count(),1);
        await page.getByPlaceholder('Search Honda Test Model issues, a symptom, or a code…').fill('charging');
        await page.getByRole('button',{name:'Charging fault',exact:true}).click();
        await page.getByRole('heading',{name:'What you need to diagnose it',exact:true}).waitFor();
        await page.getByRole('button',{name:'Find a Honda dealer near me',exact:true}).waitFor();
        assert.equal(await page.getByRole('link',{name:'P0562',exact:true}).count(),1);
        assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);
        results.push({width,carControlsPreserved:true});
      }
      await page.close();
    }
  } finally {await browser.close();}
  fs.writeFileSync(path.join(out,'consumer-results.json'),JSON.stringify({actualComponents:true,realWrites:0,results},null,2));
  console.log(JSON.stringify({actualComponents:true,scenarios:results.length,realWrites:0}));
}
main().catch(error=>{console.error(JSON.stringify({phase,error:error instanceof Error?error.stack:String(error)}));process.exitCode=1});
