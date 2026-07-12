import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { checkLinkLive } from '@/lib/vendor-link-validator';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const RETAILER_HOST = /(^|\.)(amazon\.[a-z.]+|rockauto\.com|ebay\.[a-z.]+|autozone\.com|oreillyauto\.com|napaonline\.com|summitracing\.com|partsgeek\.com|1aauto\.com|carid\.com|walmart\.com|moparpartsgiant\.com|gmpartsgiant\.com|mopar\.com|advanceautoparts\.com|americanmuscle\.com|tirerack\.com)$/i;
function isRetailerProductUrl(u: string, pn?: string): boolean {
  if (!/^https?:\/\//i.test(u)) return false;
  let host = '', path = '';
  try { const url = new URL(u); host = url.hostname; path = url.pathname.toLowerCase(); } catch { return false; }
  if (!RETAILER_HOST.test(host)) return false;
  if (/[?&](k|q|_nkw|searchstring|search|keyword|text|searchterm)=/i.test(u)) return false;
  if (/\/search(\/|\?|$)|\/s\?|\/sch\//i.test(u)) return false;
  const p = (pn || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (p.length >= 5 && u.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p)) return true;
  if (/\/(dp|gp\/product|itm|ipd|moreinfo|product|products)\//i.test(path)) return true;
  if (/rockauto\.com/i.test(host) && /partnum=/i.test(u)) return true;
  return false;
}

const vehicle = '2015 Dodge Challenger SRT 392';
const partName = process.argv[2] || 'spark plugs';
const specHint = process.argv[3] || 'spark plugs: iridium; 16 total (2 per cylinder on the 6.4L HEMI); sold per-unit and per-set';
const prompt = `You are an OEM parts auditor for au7o. USE WEB SEARCH — never answer from memory.
Vehicle: ${vehicle}
Component: ${partName}
DOCUMENTED FACTORY SPEC: ${specHint}
- Find a verified, in-stock, correct-spec PRODUCT page on as many stores as you can. NEVER search/category/homepage.
- If you cannot find at least one, status "drop" and explain why in "caveat".
Return ONLY JSON: {"status":"verified"|"drop","partNumber":"","oemBrand":"","buyLinks":[{"vendor":"","url":""}],"caveat":""}`;

(async () => {
  const msg = await client.messages.create({ model: 'claude-haiku-4-5', max_tokens: 1200, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 } as never], messages: [{ role: 'user', content: prompt }] });
  let text = ''; const searchUrls: string[] = [];
  for (const b of msg.content as unknown as Array<Record<string, unknown>>) {
    if (b.type === 'text') text += b.text;
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) for (const r of b.content as unknown as Array<Record<string, unknown>>) if (r.type === 'web_search_result' && r.url) searchUrls.push(r.url as string);
  }
  const m = text.replace(/```json/g, '').replace(/```/g, '').match(/\{[\s\S]*\}/);
  const j = m ? JSON.parse(m[0]) : {};
  console.log(`── ${partName} ──`);
  console.log('MODEL status:', j.status, '| PN:', j.partNumber, '| caveat:', j.caveat);
  console.log('MODEL buyLinks:', JSON.stringify(j.buyLinks || []));
  console.log('\nSEARCH RESULT URLS (' + searchUrls.length + '), gate results:');
  const cands = [...(j.buyLinks || []).map((b: {url?: string}) => b?.url), ...searchUrls].filter((u): u is string => !!u);
  for (const u of cands.slice(0, 14)) {
    const shape = isRetailerProductUrl(u, j.partNumber || '');
    const live = shape ? await checkLinkLive(u) : 'n/a';
    console.log(` ${shape ? 'PASS-shape' : 'fail-shape'} | live=${live} | ${u.slice(0, 95)}`);
  }
  process.exit(0);
})();
