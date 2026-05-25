/**
 * Publish a generated post to Instagram and/or Facebook.
 *
 * Prerequisites:
 *   1. Meta Developer App created at developers.facebook.com
 *   2. Instagram Graph API product added
 *   3. Page access token with instagram_content_publish permission
 *   4. Image hosted at a public URL (or use generate-image.js first)
 *
 * Usage:
 *   node scripts/social/publish-post.js <post-file.json> --image-url <url> [--platform ig|fb|both] [--dry-run]
 *
 * Environment:
 *   META_PAGE_ACCESS_TOKEN - Long-lived page access token
 *   META_IG_USER_ID        - Instagram Business Account ID
 *   META_FB_PAGE_ID        - Facebook Page ID
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const IG_USER_ID = process.env.META_IG_USER_ID;
const FB_PAGE_ID = process.env.META_FB_PAGE_ID;
const GRAPH_API = 'https://graph.facebook.com/v21.0';

const args = process.argv.slice(2);
const postFile = args.find(a => !a.startsWith('--'));
const getArg = (name) => { const idx = args.indexOf(`--${name}`); return idx >= 0 ? args[idx + 1] : null; };
const hasFlag = (name) => args.includes(`--${name}`);

const imageUrl = getArg('image-url');
const platform = getArg('platform') || 'both';
const dryRun = hasFlag('dry-run');

if (!postFile) {
  console.error('Usage: node publish-post.js <post-file.json> --image-url <url> [--platform ig|fb|both]');
  process.exit(1);
}

const post = JSON.parse(fs.readFileSync(postFile, 'utf8'));

// ─── Instagram Publishing ───────────────────────────────────────────────

async function publishToInstagram(caption, imageUrl) {
  if (!ACCESS_TOKEN || !IG_USER_ID) {
    console.error('Missing META_PAGE_ACCESS_TOKEN or META_IG_USER_ID');
    return null;
  }

  console.log('Publishing to Instagram...');

  // Step 1: Create media container
  const containerRes = await fetch(`${GRAPH_API}/${IG_USER_ID}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: caption,
      access_token: ACCESS_TOKEN,
    }),
  });

  if (!containerRes.ok) {
    const err = await containerRes.json();
    throw new Error(`IG container error: ${JSON.stringify(err.error)}`);
  }

  const container = await containerRes.json();
  console.log(`  Container created: ${container.id}`);

  // Step 2: Wait for processing (images are usually instant, videos take longer)
  await new Promise(r => setTimeout(r, 3000));

  // Step 3: Publish the container
  const publishRes = await fetch(`${GRAPH_API}/${IG_USER_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: container.id,
      access_token: ACCESS_TOKEN,
    }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.json();
    throw new Error(`IG publish error: ${JSON.stringify(err.error)}`);
  }

  const result = await publishRes.json();
  console.log(`  Published! Post ID: ${result.id}`);
  return result.id;
}

// ─── Instagram Reel Publishing ──────────────────────────────────────────

async function publishReelToInstagram(caption, videoUrl) {
  if (!ACCESS_TOKEN || !IG_USER_ID) {
    console.error('Missing META_PAGE_ACCESS_TOKEN or META_IG_USER_ID');
    return null;
  }

  console.log('Publishing Reel to Instagram...');

  // Step 1: Create reel container
  const containerRes = await fetch(`${GRAPH_API}/${IG_USER_ID}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption,
      access_token: ACCESS_TOKEN,
    }),
  });

  if (!containerRes.ok) {
    const err = await containerRes.json();
    throw new Error(`IG reel container error: ${JSON.stringify(err.error)}`);
  }

  const container = await containerRes.json();
  console.log(`  Reel container created: ${container.id}`);

  // Step 2: Poll for processing completion (videos take time)
  let status = 'IN_PROGRESS';
  let attempts = 0;
  while (status === 'IN_PROGRESS' && attempts < 30) {
    await new Promise(r => setTimeout(r, 5000));
    const checkRes = await fetch(
      `${GRAPH_API}/${container.id}?fields=status_code&access_token=${ACCESS_TOKEN}`
    );
    const check = await checkRes.json();
    status = check.status_code;
    attempts++;
    console.log(`  Processing... (${status})`);
  }

  if (status !== 'FINISHED') {
    throw new Error(`Reel processing failed with status: ${status}`);
  }

  // Step 3: Publish
  const publishRes = await fetch(`${GRAPH_API}/${IG_USER_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: container.id,
      access_token: ACCESS_TOKEN,
    }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.json();
    throw new Error(`IG reel publish error: ${JSON.stringify(err.error)}`);
  }

  const result = await publishRes.json();
  console.log(`  Reel published! Post ID: ${result.id}`);
  return result.id;
}

// ─── Facebook Publishing ────────────────────────────────────────────────

async function publishToFacebook(caption, imageUrl, articleUrl) {
  if (!ACCESS_TOKEN || !FB_PAGE_ID) {
    console.error('Missing META_PAGE_ACCESS_TOKEN or META_FB_PAGE_ID');
    return null;
  }

  console.log('Publishing to Facebook...');

  // For FB, we post with a link to the article + image
  const res = await fetch(`${GRAPH_API}/${FB_PAGE_ID}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: imageUrl,
      message: caption + (articleUrl ? `\n\nRead more: ${articleUrl}` : ''),
      access_token: ACCESS_TOKEN,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`FB publish error: ${JSON.stringify(err.error)}`);
  }

  const result = await res.json();
  console.log(`  Published! Post ID: ${result.id || result.post_id}`);
  return result.id || result.post_id;
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Au7o Social Publisher ===');
  console.log(`Post: ${post.make} ${post.model} — ${post.title}`);
  console.log(`Platform: ${platform} | Dry run: ${dryRun}\n`);

  if (!imageUrl) {
    console.error('--image-url is required. Generate an image first or host one publicly.');
    console.log('\nTo test, you can use any public image URL.');
    process.exit(1);
  }

  if (dryRun) {
    console.log('DRY RUN — would publish:');
    console.log(`  Caption: ${post.caption.substring(0, 100)}...`);
    console.log(`  Image: ${imageUrl}`);
    console.log(`  Platform: ${platform}`);
    return;
  }

  const results = {};

  if (platform === 'ig' || platform === 'both') {
    try {
      results.instagram = await publishToInstagram(post.caption, imageUrl);
    } catch (err) {
      console.error('Instagram error:', err.message);
    }
  }

  if (platform === 'fb' || platform === 'both') {
    try {
      results.facebook = await publishToFacebook(post.caption, imageUrl, post.articleUrl);
    } catch (err) {
      console.error('Facebook error:', err.message);
    }
  }

  // Update post file with publish results
  post.published = {
    ...results,
    publishedAt: new Date().toISOString(),
  };
  fs.writeFileSync(postFile, JSON.stringify(post, null, 2));
  console.log('\nPost file updated with publish results.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
