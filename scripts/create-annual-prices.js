#!/usr/bin/env node
/**
 * Create the annual Stripe prices ($99/yr Plus, $199/yr Pro) on the SAME
 * products as the per-tier monthly prices, then append the new price IDs
 * to .env.local. Idempotent.
 *
 * v2 (2026-06-12): the first run fell back to the legacy STRIPE_PRICE_ID
 * and attached the $99/yr price to the old "Premium" product. This version
 * requires the per-tier env vars (no legacy fallback) and ARCHIVES any
 * stray $99/yr price found on a different product before recreating it in
 * the right place.
 *
 * After running: add the printed env vars in the Vercel dashboard too.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = [
  { tier: 'PLUS', monthlyEnv: process.env.STRIPE_PRICE_ID_PLUS, annualCents: 9900 },
  { tier: 'PRO', monthlyEnv: process.env.STRIPE_PRICE_ID_PRO, annualCents: 19900 },
];

async function main() {
  const lines = [];
  for (const plan of PLANS) {
    if (!plan.monthlyEnv) { console.error(`STRIPE_PRICE_ID_${plan.tier} missing from .env.local — skip`); continue; }
    const monthly = await stripe.prices.retrieve(plan.monthlyEnv);
    const productId = typeof monthly.product === 'string' ? monthly.product : monthly.product.id;

    // Cleanup: archive any active yearly price at this amount that sits on a
    // DIFFERENT product (the misplaced first-run artifact).
    const all = await stripe.prices.list({ active: true, limit: 100 });
    for (const p of all.data) {
      if (p.recurring?.interval === 'year' && p.unit_amount === plan.annualCents && p.product !== productId) {
        await stripe.prices.update(p.id, { active: false });
        console.log(`${plan.tier}: archived misplaced yearly price ${p.id} (was on product ${p.product})`);
      }
    }

    const existing = await stripe.prices.list({ product: productId, active: true, limit: 100 });
    let annual = existing.data.find(
      (p) => p.recurring?.interval === 'year' && p.unit_amount === plan.annualCents && p.currency === 'usd',
    );
    if (annual) {
      console.log(`${plan.tier}: yearly price already exists -> ${annual.id}`);
    } else {
      annual = await stripe.prices.create({
        product: productId,
        unit_amount: plan.annualCents,
        currency: 'usd',
        recurring: { interval: 'year' },
        nickname: `${plan.tier} annual`,
      });
      console.log(`${plan.tier}: created yearly price $${plan.annualCents / 100}/yr -> ${annual.id}`);
    }
    lines.push(`STRIPE_PRICE_ID_${plan.tier}_ANNUAL=${annual.id}`);
  }

  if (lines.length) {
    fs.appendFileSync('.env.local', `\n# Annual Stripe prices v2 (corrected products, ${new Date().toISOString().slice(0, 10)})\n${lines.join('\n')}\n`);
    console.log('\nAppended to .env.local. ALSO add these in the Vercel dashboard (replace any older _ANNUAL values):');
    lines.forEach((l) => console.log('  ' + l));
  }
}

main().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
