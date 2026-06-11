#!/usr/bin/env node
/**
 * Generate vehicle hero images via DALL-E 3 and cache to /public/vehicles/.
 *
 * Cost model: DALL-E 3 standard 1024x1024 = $0.040 / image.
 * A batch of 30 vehicles ≈ $1.20.
 *
 * Output: /public/vehicles/{vehicleSlug}.jpg
 * The slug helper from src/lib/vehicle-slug.ts is mirrored here to
 * stay node-native (no TS compile step needed).
 *
 * Skips any slug whose image already exists — re-running is safe and
 * idempotent. Pass --force to regenerate.
 *
 * Usage:
 *   node scripts/generate-hero-images.js              # default vehicle list
 *   node scripts/generate-hero-images.js --vehicles-file my-list.json
 *   node scripts/generate-hero-images.js --force      # regenerate all
 *   node scripts/generate-hero-images.js --quality hd # $0.080/image
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const QUALITY = args.includes('--quality') ? args[args.indexOf('--quality') + 1] : 'standard';
const VEHICLES_FILE = args.includes('--vehicles-file') ? args[args.indexOf('--vehicles-file') + 1] : null;

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error('OPENAI_API_KEY not set in .env.local');
  process.exit(1);
}

const OUT_DIR = path.join(__dirname, '..', 'public', 'vehicles');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Mirror of src/lib/vehicle-slug.ts:vehicleSlug
function vehicleSlug(year, make, model, trim) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const parts = [String(year), norm(make), norm(model)];
  if (trim) parts.push(norm(trim));
  return parts.join('-');
}

// Default seed set — owner's two vehicles first, then high-traffic
// US YMMTs that benefit most from a real image vs a silhouette.
const DEFAULT_VEHICLES = [
  // Owner's actual cars
  { year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1 1LE', color: 'red',
    descriptors: 'aggressive carbon-fiber rear wing, exposed splitter, track-focused trim' },
  { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392', color: 'Plum Crazy purple',
    descriptors: 'retro muscle car styling, dual side stripes, Brembo brake calipers visible' },

  // High-volume mainstream
  { year: 2022, make: 'Toyota', model: 'Camry', trim: 'XSE', color: 'pearl white' },
  { year: 2023, make: 'Honda', model: 'Civic', trim: 'Sport', color: 'sonic gray' },
  { year: 2022, make: 'Honda', model: 'CR-V', trim: 'EX', color: 'platinum white' },
  { year: 2021, make: 'Toyota', model: 'RAV4', trim: 'XLE', color: 'magnetic gray' },

  // Trucks
  { year: 2021, make: 'Ford', model: 'F-150', trim: 'XLT', color: 'oxford white' },
  { year: 2019, make: 'Ford', model: 'F-150', trim: 'Raptor', color: 'lead foot gray' },
  { year: 2022, make: 'RAM', model: '1500', trim: 'Laramie', color: 'maximum steel' },
  { year: 2022, make: 'Chevrolet', model: 'Silverado 1500', trim: 'LT', color: 'satin steel gray' },

  // Performance / iconic
  { year: 2022, make: 'Ford', model: 'Mustang', trim: 'GT', color: 'race red' },
  { year: 2023, make: 'BMW', model: 'M3', trim: 'Competition', color: 'isle of man green' },
  { year: 2021, make: 'Subaru', model: 'WRX', trim: 'STI', color: 'world rally blue' },

  // EVs
  { year: 2023, make: 'Tesla', model: 'Model 3', trim: 'Long Range', color: 'midnight silver' },
  { year: 2023, make: 'Tesla', model: 'Model Y', trim: 'Long Range', color: 'pearl white' },

  // Off-road / SUV
  { year: 2020, make: 'Toyota', model: '4Runner', trim: 'TRD Pro', color: 'army green' },
  { year: 2022, make: 'Jeep', model: 'Wrangler', trim: 'Rubicon', color: 'sting gray' },
];

function buildPrompt(v) {
  const trimSuffix = v.trim ? ` ${v.trim}` : '';
  const colorPart = v.color ? ` in ${v.color}` : '';
  const descPart = v.descriptors ? ` Features: ${v.descriptors}.` : '';
  return [
    `Professional studio product photograph of a ${v.year} ${v.make} ${v.model}${trimSuffix}${colorPart}.`,
    `Three-quarter front view, slightly elevated camera angle.`,
    `Clean seamless light gray gradient background (no environment, no road, no shadows on the ground).`,
    `Sharp focus across the entire vehicle, accurate factory-original styling and proportions for this exact model year.`,
    `Crisp wheel and tire detail, headlights visible but not glaring.`,
    `Commercial automotive marketing photography quality.${descPart}`,
    `NO TEXT, NO LOGOS OVERLAID, NO PEOPLE, NO BACKGROUND OBJECTS.`,
  ].join(' ');
}

async function generateOne(v) {
  const slug = vehicleSlug(v.year, v.make, v.model, v.trim);
  const outPath = path.join(OUT_DIR, `${slug}.jpg`);
  if (!FORCE && fs.existsSync(outPath)) {
    console.log(`  ~ ${slug} — already exists, skipping (--force to regenerate)`);
    return { slug, status: 'skipped' };
  }

  const prompt = buildPrompt(v);
  const t0 = Date.now();

  // gpt-image-1 — OpenAI's current image model (replaced dall-e-3 as
  // default in late 2025). Always returns base64; no response_format
  // param accepted. Quality mapping: 'standard' → 'medium', 'hd' → 'high'.
  const qualityMap = { standard: 'medium', hd: 'high', low: 'low' };
  const apiQuality = qualityMap[QUALITY] || 'medium';

  const genRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: apiQuality,
    }),
  });

  if (!genRes.ok) {
    const err = await genRes.text();
    console.error(`  ✗ ${slug} — generation failed: ${genRes.status} ${err.slice(0, 300)}`);
    return { slug, status: 'failed', error: err };
  }

  const genJson = await genRes.json();
  const b64 = genJson?.data?.[0]?.b64_json;
  if (!b64) {
    console.error(`  ✗ ${slug} — no b64_json in response`);
    return { slug, status: 'failed', error: 'no b64_json in response' };
  }

  // Decode + write. gpt-image-1 returns PNG; we save as .png for now
  // (no on-the-fly JPEG re-encode to avoid an extra dependency).
  const buf = Buffer.from(b64, 'base64');
  const finalPath = outPath.replace(/\.jpg$/, '.png');
  fs.writeFileSync(finalPath, buf);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const sizeKB = (buf.length / 1024).toFixed(0);
  console.log(`  ✓ ${slug} — ${sizeKB} KB in ${elapsed}s`);
  return { slug, status: 'generated' };
}

async function main() {
  const vehicles = VEHICLES_FILE
    ? JSON.parse(fs.readFileSync(VEHICLES_FILE, 'utf8'))
    : DEFAULT_VEHICLES;

  console.log(`\n  Generating ${vehicles.length} hero images via DALL-E 3 (${QUALITY})`);
  console.log(`  Output: ${OUT_DIR}\n`);

  const stats = { generated: 0, skipped: 0, failed: 0 };
  for (const v of vehicles) {
    try {
      const r = await generateOne(v);
      stats[r.status]++;
    } catch (err) {
      console.error(`  ✗ unhandled error:`, err.message);
      stats.failed++;
    }
  }

  const cost = stats.generated * (QUALITY === 'hd' ? 0.080 : 0.040);
  console.log(`\n  Done. Generated: ${stats.generated}, Skipped: ${stats.skipped}, Failed: ${stats.failed}`);
  console.log(`  Approx cost: $${cost.toFixed(2)}`);

  // Keep the VehicleHero manifest in sync with the files on disk.
  require('./build-hero-manifest').buildHeroManifest();
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
