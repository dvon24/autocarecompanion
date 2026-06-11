#!/usr/bin/env node
/**
 * Create the annual Stripe prices ($99/yr Plus, $199/yr Pro) on the SAME
 * products as the existing monthly prices, then append the new price IDs
 * to .env.local. Idempotent: looks for existing yearly prices with the
 * matching amount first.
 *
 * After running: add the two printed env vars in the Vercel dashboard too.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = [
  { tier: 'PLUS', monthlyEnv: process.env.STRIPE_PRICE_ID_PLUS || process.env.STRIPE_PRICE_ID, annualCents: 9900 },
  { tier: 'PRO', monthlyEnv: process.env.STRIPE_PRICE_ID_PRO, annualCents: 19900 },
];

async function main() {
  const lines = [];
  for (const plan of PLANS) {
    if (!plan.monthlyEnv) { console.error(`No monthly price env for ${plan.tier} — skip`); continue; }
    const monthly = await stripe.prices.retrieve(plan.monthlyEnv);
    const productId = typeof monthly.product === 'string' ? monthly.product : monthly.product.id;

    // Idempotency: reuse an existing yearly price at this amount.
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
    fs.appendFileSync('.env.local', `\n# Annual Stripe prices (created ${new Date().toISOString().slice(0, 10)})\n${lines.join('\n')}\n`);
    console.log('\nAppended to .env.local. ALSO add these in the Vercel dashboard:');
    lines.forEach((l) => console.log('  ' + l));
  }
}

main().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
