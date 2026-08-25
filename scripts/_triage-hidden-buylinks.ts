// Why is each verified buy link hidden? Splits the two independent causes so they can be fixed
// separately: URL SHAPE (isKnownIssueProductUrl) vs VENDOR/HOST MISMATCH (vendorMatchesProductUrl).
// Also flags non-product destinations (PDF, service/support pages) that SHOULD stay hidden.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { isKnownIssueProductUrl, vendorMatchesProductUrl } from '../src/lib/known-issue-commerce';

const MAKES = process.argv.slice(2);
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SEARCHY = /\/(?:search|search-results|partsearch|parts-search|category|categories|catalog|collections?|sch|s)(?:\/|$)/i;
const SEARCH_KEYS = new Set(['q','query','search','keyword','keywords','_nkw','k','s','term','filter','filters','searchterm','search_query']);

(async () => {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, make, "fixParts" FROM "KnownIssue"
     WHERE status='published' AND "fixParts" IS NOT NULL AND jsonb_array_length("fixParts"::jsonb)>0
     AND make = ANY($1)`, MAKES);

  const buckets: Record<string, any[]> = {};
  const push = (k: string, v: any) => (buckets[k] ||= []).push(v);

  for (const r of rows) {
    const all = r.fixParts || [];
    if (all.some((p: any) => p?.recallFirst)) continue;
    for (const p of all.filter((p: any) => p?.verified === true)) {
      for (const l of (p.buyLinks || [])) {
        if (l.verified !== true) continue;
        const shapeOk = isKnownIssueProductUrl(l.url);
        const vendorOk = shapeOk && vendorMatchesProductUrl(l.vendor || '', l.url);
        if (vendorOk) continue;
        let u: URL | null = null; try { u = new URL(l.url); } catch {}
        const host = u ? u.hostname.replace(/^www\./, '') : 'unparseable';
        const path = u ? u.pathname : '';
        const rec = { make: r.make, id: r.id, vendor: l.vendor, url: l.url };
        if (!u) push('UNPARSEABLE', rec);
        else if (/\.pdf$/i.test(path)) push('PDF — should stay hidden', rec);
        else if (!shapeOk && SEARCHY.test(path)) push('SEARCH/CATEGORY path — should stay hidden', rec);
        else if (!shapeOk && [...u.searchParams.keys()].some((k) => SEARCH_KEYS.has(k.toLowerCase()))) push('SEARCH QUERY KEY — should stay hidden', rec);
        else if (!shapeOk && (host === 'rockauto.com' || host.endsWith('.rockauto.com'))) push('ROCKAUTO wrong shape (needs moreinfo.php?pk&cc&pt)', rec);
        else if (!shapeOk && (host === 'amazon.com' || host === 'ebay.com')) push('AMAZON/EBAY wrong shape', rec);
        else if (!shapeOk) push('OTHER retailer rejected by URL shape — REVIEW', rec);
        else push('VENDOR LABEL != HOST — REVIEW (relabel fixes it)', rec);
      }
    }
  }
  const order = Object.entries(buckets).sort((a, b) => b[1].length - a[1].length);
  for (const [k, v] of order) {
    console.log(`\n=== ${k} : ${v.length} ===`);
    const byHost: Record<string, any[]> = {};
    v.forEach((x) => { let h='?'; try{h=new URL(x.url).hostname.replace(/^www\./,'');}catch{} (byHost[h] ||= []).push(x); });
    Object.entries(byHost).sort((a,b)=>b[1].length-a[1].length).forEach(([h, xs]) => {
      console.log(`  ${String(xs.length).padStart(3)}  ${h}   e.g. vendor="${xs[0].vendor}" ${xs[0].url.slice(0, 95)}`);
    });
  }
  console.log(`\nTOTAL HIDDEN: ${Object.values(buckets).reduce((a, b) => a + b.length, 0)}`);
  await prisma.$disconnect(); await pool.end();
})();
