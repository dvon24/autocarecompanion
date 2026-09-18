/** Offline HTML/email layout only. No email sent, no application or provider contacted. */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { buildMaintenanceReminders } from '../src/lib/maintenance-reminder-data';
import { renderMaintenanceAlertEmail } from '../src/lib/maintenance-alert-email';

async function main() {
  const require=createRequire(import.meta.url);
  const {chromium}=require(process.env.AU7O_PLAYWRIGHT_PATH || 'C:/Users/devon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  const now=new Date('2026-09-13T12:00:00Z');
  const vehicle={id:'synthetic-challenger',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',color:'Granite Crystal Metallic',transmission:'manual',currentMileage:65000};
  const record={id:'synthetic-oil',type:'oil_change',mileage:60000,date:new Date('2026-06-01'),nextDueMileage:64000,nextDueDate:new Date('2026-12-01')};
  const alerts=[...buildMaintenanceReminders(vehicle,[record],now),...buildMaintenanceReminders({...vehicle,id:'synthetic-camaro',year:2019,make:'Chevrolet',model:'Camaro',trim:'ZL1 1LE',color:'Summit White'},[{...record,id:'synthetic-second',nextDueMileage:65200,nextDueDate:new Date('2027-01-01')}],now)];
  const html=renderMaintenanceAlertEmail({userName:'Review owner',alerts:alerts.map(a=>({...a,destination:'hub' as const})),appUrl:'https://email-preview.invalid'});
  const output=path.resolve(process.env.AU7O_EMAIL_QA_OUTPUT || 'output/maintenance-email-apple-mail-20260917');mkdirSync(output,{recursive:true});
  writeFileSync(path.join(output,'qa-template.html'),html);
  const allowed=new Set(['/twin-stage/email/challenger-granite-crystal-600.jpg','/twin-stage/email/camaro-summit-600.jpg']);
  const results=[];
  const widths=[320,390,430,1280];
  // Synthetic client rewriting, not an Apple Mail emulator: append natural-size
  // declarations after the template's styles, including when head CSS is removed.
  const modes=['normal','stripped-css','blocked-images','client-size-stress','client-size-stress-stripped-css'];
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try {
    for(const width of widths) for(const mode of modes) {
      const page=await browser.newPage({viewport:{width,height:844}});
      const errors:string[]=[];page.on('pageerror',(error:Error)=>errors.push(error.message));
      await page.route('**/*',(route:any)=>{
        const url=new URL(route.request().url());
        if(mode!=='blocked-images'&&url.origin==='https://email-preview.invalid'&&allowed.has(url.pathname)) return route.fulfill({status:200,contentType:'image/jpeg',body:readFileSync(path.join(process.cwd(),'public',url.pathname.slice(1)))});
        return route.abort();
      });
      let fixture=mode.includes('stripped-css')?html.replace(/<style>[\s\S]*?<\/style>/g,''):html;
      if(mode.startsWith('client-size-stress')) fixture=fixture.replace(/(<img\b[^>]*\bstyle=")([^"]*)(")/g,'$1$2;width:600px;max-width:600px;height:338px$3');
      await page.setContent(fixture,{waitUntil:'load'});
      const bounds=await page.evaluate(async()=>{
        const images=await Promise.all([...document.images].map(async img=>{
          let decoded=false;
          try {await img.decode();decoded=true;} catch {/* Blocked artwork must keep the text and actions usable. */}
          const cell=img.closest('[data-maintenance-artwork]')!;
          return {...img.getBoundingClientRect().toJSON(),src:new URL(img.src).pathname,alt:img.alt,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,decoded,cell:cell.getBoundingClientRect().toJSON(),directCellChild:img.parentElement===cell,style:img.getAttribute('style')};
        }));
        return {width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,container:document.querySelector('[data-email-container]')!.getBoundingClientRect().toJSON(),images,font:getComputedStyle(document.querySelector('[data-email-container] td.pad')!).fontSize};
      });
      assert(bounds.scroll<=width+1&&bounds.body<=width+1,JSON.stringify({width,mode,bounds}));
      assert(bounds.container.width<=600+1&&bounds.container.left>=-1&&bounds.container.right<=width+1,JSON.stringify({width,mode,container:bounds.container}));
      assert(Math.abs(bounds.container.left-(width-bounds.container.right))<=1,'Centered email container');
      if(width===1280) assert(Math.abs(bounds.container.width-600)<=1,'Desktop card remains 600px');
      assert.equal(bounds.images.length,2,'Both vehicle images must be present');
      assert.deepEqual(new Set(bounds.images.map((img:{src:string})=>img.src)),allowed,'Both exact vehicle artworks must be checked');
      for(const img of bounds.images){
        const context=JSON.stringify({width,mode,img});
        assert(img.directCellChild,'Artwork should be a direct child of its table cell');
        assert(img.width>0&&img.left>=-1&&img.right<=width+1,`Image fits viewport: ${context}`);
        assert(img.left>=img.cell.left-1&&img.right<=img.cell.right+1&&img.top>=img.cell.top-1&&img.bottom<=img.cell.bottom+1,`Image fits its own cell: ${context}`);
        assert(img.alt.length>0,'Blocked images retain descriptive text');
        if(mode!=='blocked-images') {
          assert(img.decoded,`Image decodes: ${context}`);
          assert.equal(img.naturalWidth,600,context);
          assert.equal(img.naturalHeight,338,context);
          assert(Math.abs(img.height-img.width*img.naturalHeight/img.naturalWidth)<=1,`Full frame aspect ratio: ${context}`);
        } else assert.equal(img.decoded,false,'Blocked fixture must actually block artwork');
        if(mode.startsWith('client-size-stress')) assert(img.style?.endsWith('width:600px;max-width:600px;height:338px'),'Natural-size hints were appended');
      }
      assert.equal(await page.getByText('Open my schedule →',{exact:true}).count(),2);
      assert.equal(await page.getByText('Open the Tech Tree',{exact:true}).count(),2);
      const links=await page.locator('a').evaluateAll((anchors:HTMLAnchorElement[])=>anchors.map(anchor=>anchor.href));
      for(const id of ['synthetic-challenger','synthetic-camaro']) {
        for(const view of ['schedule','tree']) {
          assert(links.some((href:string)=>{const url=new URL(href);return url.searchParams.get('vehicleId')===id&&url.searchParams.get('view')===view;}),`Vehicle ${id} retains its ${view} destination`);
        }
      }
      assert.match(await page.locator('body').innerText(),/1,000 mi past due/);
      assert.match(await page.locator('body').innerText(),/saved odometer and logged service history/);
      assert.deepEqual(errors,[]);
      await page.screenshot({path:path.join(output,`email-${width}-${mode}.png`),fullPage:true});
      results.push({width,mode,bounds,pass:true});await page.close();
    }
  } finally {await browser.close();}
  writeFileSync(path.join(output,'layout-results.json'),JSON.stringify({scope:'Offline actual email template in Chromium. Client-size-stress appends 600px width/max-width and 338px height inline; synthetic regression only, not an Apple Mail emulator, native iOS/Yahoo verification or inbox delivery.',results},null,2));
  console.log(JSON.stringify({passed:results.length,total:widths.length*modes.length,output}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
