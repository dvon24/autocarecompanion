import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type Stripe from 'stripe';
import { authoritativeProduct, objectId } from './billing-policy';

export class DowngradeError extends Error {
  constructor(public code: string, public status = 409) { super(code); }
}
export const DOWNGRADE_RETRY_SECONDS = 23 * 3600;
export type DowngradeQuote = {
  version: 1; operationId: string; userId: string; customerId: string; subscriptionId: string;
  itemId: string; hubPriceId: string; visualPriceId: string; periodStart: number; renewalAt: number;
  issuedAt: number; expiresAt: number; monthlyAmount: 499; currency: 'usd';
};
export const downgradeEnabled = () => process.env.HUB_VISUAL_DOWNGRADE_ENABLED === 'true';
function signature(payload: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) throw new DowngradeError('downgrade_unavailable', 503);
  return createHmac('sha256', secret).update(`au7o-period-end-visual-v1:${payload}`).digest();
}
export function signDowngradeQuote(q: DowngradeQuote) {
  const payload = Buffer.from(JSON.stringify(q)).toString('base64url');
  return `${payload}.${signature(payload).toString('base64url')}`;
}
export function readDowngradeQuote(token: unknown, now: number, allowExpired = false): DowngradeQuote {
  if (typeof token !== 'string' || token.length > 8192) throw new DowngradeError('downgrade_quote_invalid');
  const [payload, signed, extra] = token.split('.');
  if (!payload || !signed || extra !== undefined || !/^[A-Za-z0-9_-]+$/.test(payload + signed)) throw new DowngradeError('downgrade_quote_invalid');
  const actual = Buffer.from(signed, 'base64url'); const expected = signature(payload);
  if (Buffer.from(payload, 'base64url').toString('base64url') !== payload || actual.toString('base64url') !== signed
    || actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new DowngradeError('downgrade_quote_invalid');
  let q: DowngradeQuote;
  try { q = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { throw new DowngradeError('downgrade_quote_invalid'); }
  if (!q || q.version !== 1 || q.currency !== 'usd' || q.monthlyAmount !== 499
    || !['operationId','userId','customerId','subscriptionId','itemId','hubPriceId','visualPriceId'].every(k => typeof q[k as keyof DowngradeQuote] === 'string' && String(q[k as keyof DowngradeQuote]).length > 0)
    || ![q.periodStart,q.renewalAt,q.issuedAt,q.expiresAt].every(Number.isSafeInteger)
    || q.periodStart > q.issuedAt || q.issuedAt > now || q.expiresAt <= q.issuedAt || q.expiresAt > q.issuedAt + 300 || q.expiresAt > q.renewalAt)
    throw new DowngradeError('downgrade_quote_invalid');
  if (!allowExpired && now >= q.expiresAt) throw new DowngradeError('downgrade_quote_expired');
  return q;
}
export function makeDowngradeQuote(sub: Stripe.Subscription, userId: string, visualPriceId: string, now: number): DowngradeQuote {
  const item = sub.items.data[0];
  return { version: 1, operationId: randomUUID(), userId, customerId: objectId(sub.customer)!, subscriptionId: sub.id,
    itemId: item.id, hubPriceId: item.price.id, visualPriceId, periodStart: item.current_period_start, renewalAt: item.current_period_end,
    issuedAt: now, expiresAt: Math.min(now + 300, item.current_period_end), monthlyAmount: 499, currency: 'usd' };
}
/** Only a flat, one-item plan is supported. Never silently discard financial settings. */
export function assertSimpleHub(sub: Stripe.Subscription, now: number) {
  const item = sub.items.data[0];
  if (sub.status !== 'active' || authoritativeProduct(sub) !== 'hub' || sub.currency !== 'usd'
    || sub.cancel_at_period_end || sub.cancel_at || sub.pending_update || sub.pause_collection
    || !item || item.current_period_end <= now || item.current_period_start > now)
    throw new DowngradeError('downgrade_subscription_changed');
  if (sub.collection_method !== 'charge_automatically' || sub.automatic_tax?.enabled || sub.discounts?.length
    || sub.default_tax_rates?.length || sub.application_fee_percent != null || sub.transfer_data || sub.on_behalf_of
    || sub.billing_thresholds || sub.pending_invoice_item_interval || sub.default_source || sub.invoice_settings?.account_tax_ids?.length
    || (sub.trial_end && sub.trial_end > now) || sub.items.has_more || item.discounts?.length || item.tax_rates?.length
    || item.billing_thresholds || sub.payment_settings?.payment_method_options
    || (sub.payment_settings?.payment_method_types && (sub.payment_settings.payment_method_types.length !== 1 || sub.payment_settings.payment_method_types[0] !== 'card')))
    throw new DowngradeError('downgrade_configuration_unsupported');
}
export function quoteMatches(q: DowngradeQuote, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return sub.id === q.subscriptionId && objectId(sub.customer) === q.customerId && item?.id === q.itemId
    && item.price.id === q.hubPriceId && item.current_period_start === q.periodStart && item.current_period_end === q.renewalAt;
}
export function downgradeScheduleParameters(q: DowngradeQuote): Stripe.SubscriptionScheduleUpdateParams {
  return { end_behavior: 'release', proration_behavior: 'none', metadata: { au7oDowngradeOperation: q.operationId }, phases: [
    { start_date: q.periodStart, end_date: q.renewalAt, items: [{ price: q.hubPriceId, quantity: 1 }], proration_behavior: 'none' },
    { start_date: q.renewalAt, duration: { interval: 'month', interval_count: 1 }, items: [{ price: q.visualPriceId, quantity: 1 }], proration_behavior: 'none' },
  ] };
}
export function scheduleMatches(schedule: Stripe.SubscriptionSchedule, q: DowngradeQuote) {
  const defaults = schedule.default_settings;
  return schedule.status === 'active' && schedule.end_behavior === 'release'
    && !defaults?.automatic_tax?.enabled && defaults?.application_fee_percent == null && !defaults?.billing_thresholds
    && !defaults?.on_behalf_of && !defaults?.transfer_data && !defaults?.invoice_settings?.account_tax_ids?.length
    && (!defaults?.collection_method || defaults.collection_method === 'charge_automatically')
    && objectId(schedule.subscription) === q.subscriptionId && objectId(schedule.customer) === q.customerId
    && schedule.metadata?.au7oDowngradeOperation === q.operationId && schedule.phases.length === 2
    && schedule.phases.every((phase, index) => phase.items.length === 1 && phase.items[0].quantity === 1
      && objectId(phase.items[0].price) === (index ? q.visualPriceId : q.hubPriceId) && phase.proration_behavior === 'none'
      && phase.start_date === (index ? q.renewalAt : q.periodStart) && (!index ? phase.end_date === q.renewalAt : phase.end_date > q.renewalAt)
      && !phase.discounts?.length && !phase.default_tax_rates?.length && !phase.add_invoice_items?.length && !phase.trial_end
      && !phase.automatic_tax?.enabled && phase.application_fee_percent == null && !phase.billing_thresholds && !phase.transfer_data && !phase.on_behalf_of
      && (!phase.currency || phase.currency === 'usd') && (!phase.collection_method || phase.collection_method === 'charge_automatically')
      && !phase.invoice_settings?.account_tax_ids?.length && !phase.items[0].discounts?.length && !phase.items[0].tax_rates?.length && !phase.items[0].billing_thresholds);
}
