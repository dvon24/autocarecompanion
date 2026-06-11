#!/usr/bin/env node
/**
 * Rebuild src/data/vehicle-heroes.json from the files in /public/vehicles.
 *
 * The manifest is what lets VehicleHero pick the BEST available image
 * (exact trim → base model → same model nearest year) instead of
 * waterfalling 404s against exact-slug guesses. Run this after adding
 * or removing any image in public/vehicles — generate-hero-images.js
 * calls it automatically.
 */
const fs = require('fs');
const path = require('path');

function buildHeroManifest() {
  const dir = path.join(__dirname, '..', 'public', 'vehicles');
  const out = path.join(__dirname, '..', 'src', 'data', 'vehicle-heroes.json');
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => /\.(webp|png|jpg)$/i.test(f)).sort()
    : [];
  fs.writeFileSync(out, JSON.stringify(files, null, 2) + '\n');
  console.log(`vehicle-heroes manifest: ${files.length} files -> ${out}`);
  return files.length;
}

module.exports = { buildHeroManifest };

if (require.main === module) buildHeroManifest();
