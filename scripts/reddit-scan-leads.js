#!/usr/bin/env node
/* eslint-disable */
/**
 * Reddit lead scanner for the visual-diagnosis flywheel.
 *
 * READ-ONLY: scans target subreddits' newest posts via Reddit's public
 * JSON endpoints (no login, no API key, well under public rate limits),
 * finds posts where someone shared a PHOTO or VIDEO of a car problem,
 * extracts year/make/model when present, cross-references our published
 * known-issues DB, and drafts a personalized, affiliation-disclosed
 * reply inviting them to run the photo through au7o's free diagnosis
 * (which carries the existing Phase 0.1 consent checkbox — that's where
 * training permission is properly captured, NOT in a Reddit comment).
 *
 * This script NEVER posts to Reddit. Posting is a human action by
 * design: automated promotional commenting violates subreddit rules and
 * Reddit's spam policy, and gets accounts banned fast. The output is a
 * digest (data/reddit-leads.json + console) Devon can act on in seconds
 * per lead.
 *
 * AUTH: Reddit returns 403 to unauthenticated scripts since the 2023 API
 * change, so this uses the free OAuth client_credentials flow. One-time
 * setup (2 min): https://www.reddit.com/prefs/apps → "create app" →
 * type "script" → copy the id under the app name + the secret into
 * .env.local as REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET. Read-only at
 * our volume is well inside the free 100 queries/min tier.
 *
 * Usage:
 *   node scripts/reddit-scan-leads.js              # scan + digest
 *   node scripts/reddit-scan-leads.js --limit 25   # posts per subreddit
 *   node scripts/reddit-scan-leads.js --no-db      # skip known-issue matching
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const SUBREDDITS = [
  'MechanicAdvice', 'AskMechanics', 'Cartalk', 'autorepair',
  'CarHelp', 'whatisthiscarpart',
];
const UA = 'au7o-known-issues-research/1.0 (lead digest; contact: devonsroberson24@yahoo.com)';
const LEADS_PATH = path.join(process.cwd(), 'data', 'reddit-leads.json');

const args = process.argv.slice(2);
const limit = (() => { const i = args.indexOf('--limit'); return i >= 0 ? parseInt(args[i + 1], 10) : 40; })();
const skipDb = args.includes('--no-db');

const MAKES = ['acura','alfa romeo','audi','bmw','buick','cadillac','chevrolet','chevy','chrysler','citroen','citroën','cupra','dacia','dodge','fiat','ford','genesis','gmc','honda','hyundai','infiniti','jaguar','jeep','kia','land rover','lexus','lincoln','lucid','mazda','mercedes','mercedes-benz','mercury','mini','mitsubishi','nissan','opel','peugeot','polestar','pontiac','porsche','ram','renault','rivian','saab','saturn','seat','skoda','subaru','suzuki','tesla','toyota','volkswagen','vw','volvo'];
const MAKE_CANON = { chevy: 'chevrolet', vw: 'volkswagen', mercedes: 'mercedes-benz', 'citroën': 'citroen' };

const PROBLEM_WORDS = /noise|sound|leak|leaking|broke|broken|fail|grind|squeal|squeak|knock|rattle|clunk|vibrat|shudder|smoke|smell|burning|stall|misfire|rough idle|won'?t start|no start|check engine|cel\b|warning light|code p[0-9]|p[0-9]{4}|what is this|what'?s this|help|diagnos|wrong with|overheat|shak(?:e|ing)|whin(?:e|ing)|hum(?:ming)?|drip|puddle|stuck|seized|worn|wear|crack/i;

function hasMedia(post) {
  if (post.is_gallery) return 'photo';
  if (post.post_hint === 'image') return 'photo';
  if (post.post_hint === 'hosted:video' || post.post_hint === 'rich:video' || post.is_video) return 'video';
  if (/\.(jpe?g|png|webp|heic)(\?|$)/i.test(post.url || '')) return 'photo';
  if (/\.(mp4|mov)(\?|$)/i.test(post.url || '')) return 'video';
  return null;
}

function extractVehicle(text) {
  const t = text.toLowerCase();
  const yearMatch = t.match(/\b(19[89][0-9]|20[0-2][0-9])\b/);
  let make = null;
  for (const m of MAKES) {
    if (t.includes(m)) { make = MAKE_CANON[m] || m; break; }
  }
  // model: word(s) right after the make mention, crude but adequate for a digest
  let model = null;
  if (make) {
    const after = t.split(make.replace('mercedes-benz', 'mercedes'))[1] || '';
    const mm = after.match(/^[\s,-]*((?:[a-z0-9]+[\s-]?){1,2})/);
    if (mm) model = mm[1].trim().replace(/\s+(is|has|with|and|that|the|my|i)$/,'').trim() || null;
  }
  return { year: yearMatch ? parseInt(yearMatch[1], 10) : null, make, model };
}

let _token = null;
async function getToken() {
  if (_token) return _token;
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error('Missing REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET in .env.local — create a free "script" app at https://www.reddit.com/prefs/apps (see header comment).');
  }
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Reddit OAuth HTTP ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error('Reddit OAuth: no access_token in response');
  _token = data.access_token;
  return _token;
}

async function fetchSub(sub) {
  const token = await getToken();
  const res = await fetch(`https://oauth.reddit.com/r/${sub}/new?limit=${limit}&raw_json=1`, {
    headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': UA },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`r/${sub} HTTP ${res.status}`);
  const data = await res.json();
  return (data?.data?.children || []).map((c) => c.data);
}

function draftReply(lead, modelPage, issueCount) {
  const lines = [];
  if (modelPage && issueCount > 0) {
    lines.push(`If it helps: we keep a documented list of ${issueCount} known issues for the ${lead.vehicle.year ? lead.vehicle.year + ' ' : ''}${cap(lead.vehicle.make)} ${cap(lead.vehicle.model || '')} (with symptoms, fixes, and real sources) here: ${modelPage}`.replace(/\s+/g, ' '));
  }
  lines.push(`You can also run your ${lead.media} through our free AI diagnosis at https://au7o.io/diagnose — it cross-checks against 4,000+ documented issues and tells you the likely cause for your exact vehicle.`);
  lines.push(`(Full disclosure: I built au7o.io. If you use it and tick the optional "help improve" box, your photo helps the diagnosis model get better for everyone — totally optional and the diagnosis is free either way.)`);
  return lines.join('\n\n');
}
const cap = (s) => (s || '').split(/[\s-]/).map((w) => w ? w[0].toUpperCase() + w.slice(1) : '').join(' ').trim();

(async () => {
  // Known-issue lookup (read-only) for model-page links + counts.
  let issuesByModel = new Map();
  if (!skipDb) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    pool.on('error', () => {});
    const rows = (await pool.query(`SELECT make, model, count(*)::int AS n FROM "KnownIssue" WHERE status='published' GROUP BY make, model`)).rows;
    for (const r of rows) issuesByModel.set(`${r.make.toLowerCase()}|${r.model.toLowerCase()}`, r.n);
    await pool.end();
  }

  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(LEADS_PATH, 'utf8')); } catch {}
  const seen = new Set(existing.map((l) => l.id));

  const leads = [];
  for (const sub of SUBREDDITS) {
    let posts = [];
    try { posts = await fetchSub(sub); } catch (e) { console.error(`! ${e.message}`); continue; }
    for (const p of posts) {
      const media = hasMedia(p);
      if (!media) continue;
      const text = `${p.title || ''} ${p.selftext || ''}`;
      if (!PROBLEM_WORDS.test(text)) continue;
      if (seen.has(p.id)) continue;
      const vehicle = extractVehicle(text);
      const lead = {
        id: p.id,
        subreddit: sub,
        title: p.title,
        url: `https://www.reddit.com${p.permalink}`,
        media,
        author: p.author,
        createdUtc: p.created_utc,
        score: p.score,
        numComments: p.num_comments,
        vehicle,
      };
      // Cross-reference our coverage.
      let modelPage = null, issueCount = 0;
      if (vehicle.make && vehicle.model) {
        for (const [key, n] of issuesByModel) {
          const [mk, md] = key.split('|');
          if (mk === vehicle.make && (vehicle.model.startsWith(md) || md.startsWith(vehicle.model.split(' ')[0]))) {
            issueCount = n;
            modelPage = `https://au7o.io/known-issues/${mk.replace(/\s+/g, '-')}-${md.replace(/\s+/g, '-')}`;
            break;
          }
        }
      }
      lead.modelPage = modelPage;
      lead.issueCount = issueCount;
      lead.draftReply = draftReply(lead, modelPage, issueCount);
      leads.push(lead);
    }
    // Be a polite client: small gap between subreddit fetches.
    await new Promise((r) => setTimeout(r, 1500));
  }

  fs.mkdirSync(path.dirname(LEADS_PATH), { recursive: true });
  fs.writeFileSync(LEADS_PATH, JSON.stringify([...existing, ...leads], null, 2));

  leads.sort((a, b) => (b.issueCount - a.issueCount) || (b.score - a.score));
  console.log(`\n━━━ ${leads.length} new photo/video leads (${existing.length} previously seen) ━━━\n`);
  for (const l of leads.slice(0, 20)) {
    const v = [l.vehicle.year, cap(l.vehicle.make || ''), cap(l.vehicle.model || '')].filter(Boolean).join(' ') || 'vehicle unknown';
    console.log(`[${l.media}] r/${l.subreddit} · ${v} · ${l.issueCount ? l.issueCount + ' known issues on file' : 'no model match'}`);
    console.log(`  ${l.title.slice(0, 100)}`);
    console.log(`  ${l.url}\n`);
  }
  console.log(`Full digest with drafted replies -> ${LEADS_PATH}`);
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
