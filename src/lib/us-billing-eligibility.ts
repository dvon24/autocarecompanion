import type Stripe from 'stripe';
import { objectId } from './billing-policy';

/** Operator attestation is scoped to deployment environment AND Stripe mode.
 * This flag does not install or prove Radar rules; provider evidence is required. */
export function usBillingCheckoutEnabled() {
  const environment = process.env.VERCEL_ENV;
  const key = process.env.STRIPE_SECRET_KEY || '';
  const mode = /^(sk|rk)_live_/.test(key) ? 'live' : /^(sk|rk)_test_/.test(key) ? 'test' : null;
  return process.env.VERCEL === '1' && !!environment && ['preview', 'production', 'development'].includes(environment)
    && !!mode && process.env.STRIPE_US_BILLING_ENFORCEMENT_VERIFIED_ENV === `${environment}:${mode}`;
}

/** API 2026-01-28.clover: Checkout customer_details is the collected address;
 * Customer.address and the effective PaymentMethod.billing_details.address must
 * agree. Card issuing country is deliberately never consulted. No addresses
 * leave this helper. Provider errors throw, so webhook retries have no receipt. */
export async function verifyUsBilling(stripe: Stripe, subscription: Stripe.Subscription, checkout: Stripe.Checkout.Session, initialVerified = false): Promise<boolean> {
  try { return await verifyEvidence(stripe, subscription, checkout, initialVerified); }
  catch (error) {
    // A definitive deleted/missing provider resource is absent evidence. Network,
    // authentication and rate-limit failures remain retryable reconciliation errors.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'resource_missing') return false;
    throw error;
  }
}

async function verifyEvidence(stripe: Stripe, subscription: Stripe.Subscription, checkout: Stripe.Checkout.Session, initialVerified: boolean): Promise<boolean> {
  const customerId = objectId(subscription.customer);
  if (!customerId || checkout.status !== 'complete' || objectId(checkout.customer) !== customerId
    || objectId(checkout.subscription) !== subscription.id || checkout.customer_details?.address?.country !== 'US') return false;
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || customer.id !== customerId || customer.address?.country !== 'US') return false;
  // A subscription legacy source takes precedence over the customer's default.
  // Checkout uses PaymentMethods; unsupported sources are absent usable evidence.
  if (!subscription.default_payment_method && subscription.default_source) return false;
  const effectiveId = objectId(subscription.default_payment_method) || objectId(customer.invoice_settings.default_payment_method);
  if (!effectiveId) return false;
  const effective = await stripe.paymentMethods.retrieve(effectiveId);
  if (effective.id !== effectiveId || objectId(effective.customer) !== customerId || effective.billing_details.address?.country !== 'US') return false;
  // The original payment was verified once. Renewal/recovery must not depend on
  // the customer retaining their old card after selecting a new US method.
  if (initialVerified) return true;

  // Checkout's original subscription invoice remains stable across renewals.
  // Clover removed Invoice.payment_intent: use InvoicePayment's mapping.
  const invoiceId = objectId(checkout.invoice);
  if (!invoiceId) return false;
  const invoice = await stripe.invoices.retrieve(invoiceId);
  if (invoice.id !== invoiceId || objectId(invoice.customer) !== customerId
    || objectId(invoice.parent?.subscription_details?.subscription) !== subscription.id) return false;
  if (invoice.customer_address?.country !== 'US') return false;
  const methodIds = new Set<string>();
  if (invoice.amount_due > 0) {
    const payments = await stripe.invoicePayments.list({ invoice: invoiceId, status: 'paid', limit: 10 });
    if (payments.has_more || !payments.data.length) return false;
    for (const payment of payments.data) {
      const intentId = objectId(payment.payment.payment_intent);
      if (objectId(payment.invoice) !== invoiceId || !intentId || payment.payment.type !== 'payment_intent') return false;
      const intent = await stripe.paymentIntents.retrieve(intentId);
      const methodId = objectId(intent.payment_method);
      if (intent.id !== intentId || objectId(intent.customer) !== customerId || intent.status !== 'succeeded' || !methodId) return false;
      methodIds.add(methodId);
    }
  } else {
    // Stripe clears pending_setup_intent after setup succeeds, and an existing
    // saved method may need no new setup. Require the subscription's own selected
    // default plus completed no-payment Checkout, not an arbitrary customer card.
    if (checkout.payment_status !== 'no_payment_required' || objectId(subscription.default_payment_method) !== effectiveId) return false;
    const setupId = objectId(subscription.pending_setup_intent) || objectId(checkout.setup_intent);
    if (setupId) {
      const setup = await stripe.setupIntents.retrieve(setupId);
      if (setup.id !== setupId || objectId(setup.customer) !== customerId || setup.status !== 'succeeded'
        || objectId(setup.payment_method) !== effectiveId) return false;
    }
  }
  for (const id of methodIds) {
    const method = await stripe.paymentMethods.retrieve(id);
    if (method.id !== id || objectId(method.customer) !== customerId || method.billing_details.address?.country !== 'US') return false;
  }
  return true;
}
