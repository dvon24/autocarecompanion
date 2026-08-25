/** Build the embedded TARGETS payload for the recall-propagation wave. Read-only. */
require('dotenv').config({ path: '.env.local' });
const fs=require('fs');
const { Pool } = require('pg');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:2}); pool.on('error',()=>{});
(async()=>{
 const {gaps}=JSON.parse(fs.readFileSync('data/_recall-propagation-gaps.json','utf8'));
 const picked=new Set(JSON.parse(fs.readFileSync('data/_recall-wave-batch1.json','utf8')));
 const by={};
 for(const g of gaps){ if(!picked.has(g.campaign)) continue; (by[g.campaign] ||= []).push(g); }
 const targets=[];
 for(const [camp,list] of Object.entries(by)){
   const h=list[0];
   const models=[];
   for(const g of list){
     const t=(await pool.query(`SELECT title FROM "KnownIssue" WHERE make=$1 AND model=$2 AND status IN ('published','pending_review') ORDER BY title`,[g.make,g.model])).rows.map(r=>r.title);
     models.push({ make:g.make, model:g.model, years:g.years, existingTitles:t });
   }
   targets.push({
     campaign:camp,
     component:h.component,
     summary:h.summary,
     consequence:h.consequence,
     remedy:h.remedy,
     unitsAffected:h.unitsAffected,
     models,
   });
 }
 fs.writeFileSync('data/_recall-wave-targets.json',JSON.stringify(targets,null,2));
 console.log('campaigns:',targets.length,'| model-gaps:',targets.reduce((s,t)=>s+t.models.length,0));
 targets.forEach(t=>console.log('  '+t.campaign+'  '+t.models.length+' models  ['+String(t.component).slice(0,50)+']'));
 await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
