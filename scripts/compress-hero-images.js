#!/usr/bin/env node
/**
 * Re-encode generated PNG hero images to WebP for ~5-10x file-size
 * reduction. gpt-image-1 emits 1024x1024 PNGs at ~1.3MB each; rendered
 * at 160-220px in the UI, that's wildly oversized for what users see.
 *
 * Strategy:
 *   - Read every .png in /public/vehicles/
 *   - Resize to max 800px wide (keeps room for 2x retina at 400px)
 *   - Encode as WebP quality 82 (visually lossless for these images)
 *   - Write next to the PNG as .webp
 *   - VehicleHero is updated to prefer .webp, fall back to .png
 *
 * Idempotent — skips images whose .webp is newer than the .png.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'public', 'vehicles');
const MAX_WIDTH = 800;
const QUALITY = 82;

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.png'));
  if (!files.length) {
    console.log('No PNGs found in', DIR);
    return;
  }

  let totalBefore = 0, totalAfter = 0;
  for (const file of files) {
    const inPath = path.join(DIR, file);
    const outPath = inPath.replace(/\.png$/, '.webp');

    // Skip if up-to-date
    if (fs.existsSync(outPath)) {
      const pngMtime = fs.statSync(inPath).mtime.getTime();
      const webpMtime = fs.statSync(outPath).mtime.getTime();
      if (webpMtime >= pngMtime) {
        console.log(`  ~ ${file} — webp is up-to-date, skipping`);
        continue;
      }
    }

    const inSize = fs.statSync(inPath).size;
    await sharp(inPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);
    const outSize = fs.statSync(outPath).size;

    totalBefore += inSize;
    totalAfter += outSize;
    const ratio = (outSize / inSize * 100).toFixed(0);
    console.log(`  ✓ ${file.replace('.png', '')}  ${(inSize / 1024).toFixed(0)} KB → ${(outSize / 1024).toFixed(0)} KB (${ratio}%)`);
  }

  if (totalBefore > 0) {
    console.log(`\n  Total: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Saved: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)} MB (${(100 - (totalAfter / totalBefore * 100)).toFixed(0)}% reduction)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
