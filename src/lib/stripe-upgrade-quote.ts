import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type Stripe from 'stripe';
import { objectId } from './billing-policy';

export const QUOTE_SECONDS = 300;
export const RETRY_SECONDS = 23 * 3600;
export type UpgradeQuote = {
  version: 1; operationId: string; userId: string; customerId: string; subscriptionId: string;
  itemId: string; originalPriceId: string; priceId: string; vehicleId: string; vehicleHash: string;
  periodStart: number; renewalAt: number; prorationDate: number; expiresAt: number;
  amountDue: number; invoiceTotal: number; monthlyAmount: number; currency: 'usd';
};
export class UpgradeQuoteError extends Error {
  constructor(public code: string, public status = 409) { super(code); }
}
function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value || value.length < 32) throw new UpgradeQuoteError('upgrade_quote_unavailable', 503);
  return value;
}
function signature(payload: string) { return createHmac('sha256', secret()).update(`au7o-hub-upgrade-v1:${payload}`).digest(); }
export function signUpgradeQuote(quote: UpgradeQuote) {
  const payload = Buffer.from(JSON.stringify(quote)).toString('base64url');
  return `${payload}.${signature(payload).toString('base64url')}`;
}
export function readUpgradeQuote(token: unknown, now: number, allowExpired = false): UpgradeQuote {
  if (typeof token !== 'string' || token.length > 8192) throw new UpgradeQuoteError('upgrade_quote_invalid');
  const parts = token.split('.');
  if (parts.length !== 2 || !parts.every(part => /^[A-Za-z0-9_-]+$/.test(part))) throw new UpgradeQuoteError('upgrade_quote_invalid');
  const expected = signature(parts[0]); const actual = Buffer.from(parts[1], 'base64url');
  if (Buffer.from(parts[0], 'base64url').toString('base64url') !== parts[0] || actual.toString('base64url') !== parts[1]) throw new UpgradeQuoteError('upgrade_quote_invalid');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new UpgradeQuoteError('upgrade_quote_invalid');
  let q: UpgradeQuote;
  try { q = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')); } catch { throw new UpgradeQuoteError('upgrade_quote_invalid'); }
  if (!q || q.version !== 1 || q.currency !== 'usd'
    || !['operationId', 'userId', 'customerId', 'subscriptionId', 'itemId', 'originalPriceId', 'priceId', 'vehicleId', 'vehicleHash'].every(key => typeof q[key as keyof UpgradeQuote] === 'string' && String(q[key as keyof UpgradeQuote]).length > 0)
    || ![q.periodStart, q.renewalAt, q.prorationDate, q.expiresAt, q.amountDue, q.invoiceTotal, q.monthlyAmount].every(Number.isSafeInteger)
    || q.amountDue < 0 || q.monthlyAmount !== 1499 || q.expiresAt <= q.prorationDate || q.expiresAt > q.prorationDate + QUOTE_SECONDS
    || q.prorationDate < q.periodStart || q.prorationDate >= q.renewalAt || q.prorationDate > now)
    throw new UpgradeQuoteError('upgrade_quote_invalid');
  if (!allowExpired && (now >= q.expiresAt || now >= q.renewalAt)) throw new UpgradeQuoteError('upgrade_quote_expired');
  return q;
}
export function vehicleQuoteHash(vehicle: { id: string; currentMileage: number | null; transmission: string | null; year: number; make: string; model: string; trim: string | null }) {
  return createHash('sha256').update(JSON.stringify([vehicle.id, vehicle.year, vehicle.make, vehicle.model, vehicle.trim, vehicle.currentMileage, vehicle.transmission])).digest('hex');
}
export function upgradeParameters(q: UpgradeQuote): Stripe.SubscriptionUpdateParams {
  return { items: [{ id: q.itemId, price: q.priceId, quantity: 1 }], payment_behavior: 'pending_if_incomplete', proration_behavior: 'always_invoice', proration_date: q.prorationDate };
}
export async function previewUpgrade(stripe: Stripe, q: Pick<UpgradeQuote, 'customerId' | 'subscriptionId' | 'itemId' | 'priceId' | 'prorationDate'>) {
  const invoice = await stripe.invoices.createPreview({ customer: q.customerId, subscription: q.subscriptionId,
    subscription_details: { items: [{ id: q.itemId, price: q.priceId, quantity: 1 }], proration_behavior: 'always_invoice', proration_date: q.prorationDate } });
  // Complete invoice totals include tax, discounts, credits and pending items;
  // never approximate an immediate invoice by summing a partial page of lines.
  if (invoice.currency !== 'usd' || objectId(invoice.customer) !== q.customerId
    || objectId(invoice.parent?.subscription_details?.subscription) !== q.subscriptionId
    || !Number.isSafeInteger(invoice.amount_due) || invoice.amount_due < 0 || !Number.isSafeInteger(invoice.total))
    throw new UpgradeQuoteError('upgrade_preview_invalid', 503);
  return { amountDue: invoice.amount_due, invoiceTotal: invoice.total };
}
export function newOperationId() { return randomUUID(); }
export function upgradeQuoteHash(token: string) { return createHash('sha256').update(token).digest('hex'); }
export function publicUpgradeQuote(q: UpgradeQuote, token: string, recovering = false) {
  return { token, amountDue: q.amountDue, invoiceTotal: q.invoiceTotal, currency: q.currency, monthlyAmount: q.monthlyAmount, renewalAt: q.renewalAt, expiresAt: q.expiresAt, recovering };
}
