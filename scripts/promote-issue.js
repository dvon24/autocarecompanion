#!/usr/bin/env node
/**
 * Dumb-pipe known-issue promoter. Flips a row from status='pending_review'
 * to 'published' (or 'archived' on reject). HEAD-checks all citation URLs
 * via Node fetch (free, no AI) and refuses to promote if more than half
 * the URLs are dead.
 *
 * EXPLICITLY ZERO AI CALLS — no ANTHROPIC_API_KEY, no OPENAI_API_KEY,
 * no requests to any AI provider. The CONTENT audit (does the citation
 * actually support the claim?) is your job to do in chat via WebFetch
 * under the Claude Code subscription. THIS script only does the
 * URL-liveness check, which costs nothing.
 *
 * Usage:
 *   node scripts/promote-issue.js <id>                    # promote to 'published'
 *   node scripts/promote-issue.js <id> --reject           # archive instead
 *   node scripts/promote-issue.js <id> --human-approved   # promote + mark humanApproved
 *   node scripts/promote-issue.js <id> --skip-url-check   # skip the HEAD-check gate
 *
 * Returns exit code 0 on success, 2 if URL gate failed, 3 if not found,
 * 4 if row isn't pending_review.
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const HEAD_TIMEOUT_MS = 10_000;

/**
 * URL liveness check that distinguishes "dead" from "bot-blocked."
 *
 *   2xx, 3xx  → live, accept
 *   401, 403  → bot-blocked / auth-required. URL exists for real
 *               users; we can't access it from Node. Accept.
 *               Pattern: Cloudflare/Tollbit/Imperva on enthusiast
 *               forums (Audizine, AudiWorld, NSXPrime, BimmerForums,
 *               ECS Tuning, audiusa.com, etc.) — they 403 any
 *               server-side fetch regardless of User-Agent because
 *               of TLS fingerprinting + JS challenges.
 *   404, 410  → genuinely gone. Reject.
 *   5xx       → server error, could be transient. Accept (don't
 *               false-reject on outage).
 *   Network   → DNS-fail or connection-refused. Reject.
 *
 * Real users hitting a 403 see content fine. Treating 403 as "dead"
 * was rejecting real, valuable forum citations. This change keeps
 * the gate strict against true 404s while accepting URLs that
 * Cloudflare hides from server-side fetchers.
 */
async function isUrlLive(url) {
  if (!url || typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url)) return false;
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
  const attempt = async (method) => {
    try {
      const r = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
      // Live: 2xx/3xx (success), 401/403 (auth/bot-block — exists for users), 5xx (transient).
      // Dead: 404 (not found), 410 (gone), or anything in the 4xx range we haven't explicitly allowed.
      if (r.status >= 200 && r.status < 400) return true;
      if (r.status === 401 || r.status === 403) return true;
      if (r.status >= 500) return true;
      return false; // 404, 410, 405, 406, etc.
    } catch {
      // Network error (DNS fail, connection refused, timeout) — treat as dead.
      return false;
    }
  };
  if (await attempt('HEAD')) return true;
  return attempt('GET');
}

async function main() {
  const args = process.argv.slice(2);
  const id = args[0];
  const reject = args.includes('--reject');
  const humanApproved = args.includes('--human-approved');
  const skipUrlCheck = args.includes('--skip-url-check');

  if (!id || id.startsWith('--')) {
    console.error('Usage: node scripts/promote-issue.js <id> [--reject] [--human-approved] [--skip-url-check]');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const issue = await prisma.knownIssue.findUnique({
    where: { id },
    select: { id: true, title: true, status: true, citations: true, make: true, model: true },
  });

  if (!issue) {
    console.error(`✗ No issue with id "${id}"`);
    await prisma.$disconnect();
    await pool.end();
    process.exit(3);
  }
  if (issue.status !== 'pending_review' && !reject) {
    console.error(`✗ Issue "${id}" is status='${issue.status}', not pending_review. Refusing to re-promote.`);
    await prisma.$disconnect();
    await pool.end();
    process.exit(4);
  }

  if (reject) {
    await prisma.knownIssue.update({
      where: { id },
      data: { status: 'archived', updatedAt: new Date() },
    });
    console.log(`✓ Archived: ${id}`);
    console.log(`  ${issue.make} ${issue.model} — ${issue.title}`);
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  // URL liveness gate. Citations is JSON; ensure it's a real array.
  const cites = Array.isArray(issue.citations) ? issue.citations : [];
  let liveCount = 0;
  let deadCount = 0;
  const dead = [];
  if (!skipUrlCheck && cites.length > 0) {
    const results = await Promise.all(cites.map(async (c) => {
      if (!c?.url) return { c, live: true, reason: 'no-url' };
      const live = await isUrlLive(c.url);
      return { c, live };
    }));
    for (const r of results) {
      if (r.live) liveCount++;
      else { deadCount++; dead.push(r.c.url); }
    }
    if (deadCount > liveCount) {
      console.error(`✗ ${id} — more dead URLs (${deadCount}) than live (${liveCount}). Refusing to promote.`);
      for (const u of dead) console.error(`    × ${u}`);
      console.error(`  Either fix the citations and retry, or pass --reject to archive,`);
      console.error(`  or pass --skip-url-check to override (not recommended).`);
      await prisma.$disconnect();
      await pool.end();
      process.exit(2);
    }
  }

  await prisma.knownIssue.update({
    where: { id },
    data: {
      status: 'published',
      humanApproved: !!humanApproved,
      reviewedOn: new Date().toISOString().slice(0, 10),
      updatedAt: new Date(),
    },
  });

  console.log(`✓ Published: ${id}`);
  console.log(`  ${issue.make} ${issue.model} — ${issue.title}`);
  if (!skipUrlCheck && cites.length > 0) {
    console.log(`  URL gate: ${liveCount} live / ${deadCount} dead (kept all citations; ArticleSidebar will show only live)`);
  }
  if (humanApproved) console.log(`  Flagged humanApproved=true`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
