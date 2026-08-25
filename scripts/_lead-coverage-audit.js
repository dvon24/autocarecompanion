#!/usr/bin/env node
/**
 * Read-only: do we actually cover what our interest-email leads asked about?
 * These are real people who gave us an address for a specific vehicle — the
 * highest-priority coverage signal we have. ZERO writes, ZERO AI.
 */
require('dotenv').config({ path: '.env.local' });
const fs=require('fs');
const { Pool } = require('pg');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:2}); pool.on('error',()=>{});
(async()=>{
 const leads=(await pool.query(`SELECT context, COUNT(*)::int n, MIN("createdAt") first_seen, COUNT(*) FILTER (WHERE "lastNotifiedAt" IS NULL)::int never_notified
   FROM "InterestEmail" WHERE "unsubscribedAt" IS NULL AND context LIKE 'known-issues:%' GROUP BY context`)).rows;
 const rows=[];
 for(const l of leads){
   const v=String(l.context).replace(/^known-issues:/,'').trim();
   // resolve make = longest matching make in our DB
   const mk=(await pool.query(`SELECT make FROM "KnownIssue" WHERE $1 ILIKE make || '%' GROUP BY make ORDER BY length(make) DESC LIMIT 1`,[v])).rows[0];
   let pub=0, model=null;
   if(mk){ model=v.slice(mk.make.length).trim();
     pub=(await pool.query(`SELECT COUNT(*)::int n FROM "KnownIssue" WHERE make=$1 AND model=$2 AND status='published'`,[mk.make,model])).rows[0].n;
   }
   rows.push({vehicle:v, make:mk?mk.make:'?', model, leads:l.n, neverNotified:l.never_notified, published:pub});
 }
 rows.sort((a,b)=> b.leads-a.leads || a.published-b.published);
 const zero=rows.filter(r=>r.published===0), thin=rows.filter(r=>r.published>0&&r.published<5);
 console.log('lead vehicles (active, known-issues context):', rows.length, '| leads:', rows.reduce((s,r)=>s+r.leads,0));
 console.log('  ZERO coverage :', zero.length, 'vehicles /', zero.reduce((s,r)=>s+r.leads,0), 'leads');
 console.log('  THIN (1-4)    :', thin.length, 'vehicles /', thin.reduce((s,r)=>s+r.leads,0), 'leads');
 console.log('\n=== ZERO COVERAGE — these people get nothing ===');
 zero.forEach(r=>console.log('   '+String(r.leads)+' lead(s)  '+r.vehicle+(r.make==='?'?'   << make not in DB at all':'')));
 console.log('\n=== THIN COVERAGE (1-4 issues) ===');
 thin.forEach(r=>console.log('   '+String(r.leads)+' lead(s)  '+r.vehicle.padEnd(30)+r.published+' issues'));
 console.log('\n=== BEST-COVERED lead vehicles (top 10) ===');
 rows.filter(r=>r.published>=5).slice(0,10).forEach(r=>console.log('   '+String(r.leads)+' lead(s)  '+r.vehicle.padEnd(30)+r.published+' issues'));
 fs.writeFileSync('data/_lead-coverage-audit.json',JSON.stringify(rows,null,2));
 console.log('\nwrote data/_lead-coverage-audit.json');
 await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
