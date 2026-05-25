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

async function isUrlLive(url) {
  if (!url || typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url)) return false;
  const attempt = async (method) => {
    try {
      const r = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
        headers: { 'User-Agent': 'Au7oBot/1.0 (issue verifier; +https://au7o.io)' },
      });
      return r.status >= 200 && r.status < 400;
    } catch {
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
