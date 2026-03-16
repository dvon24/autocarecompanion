/**
 * Wrapper script — runs all 3 expansion scripts sequentially.
 * Can also run each individually:
 *   node scripts/expand-thin-toyota.js
 *   node scripts/expand-thin-nissan.js
 *   node scripts/expand-thin-mazda.js
 */
const { execSync } = require('child_process');

const scripts = [
  'scripts/expand-thin-toyota.js',
  'scripts/expand-thin-nissan.js',
  'scripts/expand-thin-mazda.js'
];

for (const script of scripts) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running ${script}...`);
  console.log('='.repeat(60));
  try {
    execSync(`node ${script}`, { stdio: 'inherit', cwd: __dirname + '/..' });
  } catch (err) {
    console.error(`Failed: ${script}`);
    process.exit(1);
  }
}

console.log('\n✓ All 3 scripts completed successfully.');
