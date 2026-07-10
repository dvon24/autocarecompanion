#!/usr/bin/env tsx
/**
 * CLI runner for the part-resolution invariants (INV-1 no fabricated PN, INV-2
 * retail URLs stay descriptive / never a bare OEM PN, INV-3 eBay affiliate-
 * tagged when a campaign is set). No secrets, no network — safe in CI / locally.
 *
 * Run:  npx tsx scripts/eval-resolve-parts.ts
 * Exits non-zero on any failure so a CI/pre-deploy step can gate on it.
 */
import { runPartInvariants } from '../src/lib/part-eval-invariants';

(async () => {
  const results = await runPartInvariants();
  let failed = 0;
  for (const r of results) {
    if (r.ok) console.log(`✓ ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
    else { failed++; console.log(`✗ ${r.name}\n    - ${r.detail || 'failed'}`); }
  }
  console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${results.length - failed}/${results.length} invariants`);
  process.exit(failed === 0 ? 0 : 1);
})();
