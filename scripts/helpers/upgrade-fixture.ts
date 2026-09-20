import { createChangeTierHandler } from '../../src/lib/stripe-change-tier-handler';
import { VEHICLE_TWIN_CATALOG } from '../../src/lib/vehicle-twin-catalog';
import type Stripe from 'stripe';
import type { DowngradeOperation } from '../../src/lib/stripe-downgrade-journal';
import { signDowngradeQuote, type DowngradeQuote } from '../../src/lib/stripe-downgrade-policy';
export function upgradeFixture(options: { review?: { state: string; initialVerified: boolean } } = {}) {
  process.env.ACCOUNT_ENROLLMENT_ENABLED = 'true'; process.env.VERCEL = '1';
  process.env.NEXTAUTH_SECRET = 'synthetic-upgrade-quote-test-secret-32-characters';
  process.env.STRIPE_PRICE_ID_VISUAL = 'price_visual'; process.env.STRIPE_PRICE_ID_HUB = 'price_hub';
  const now = Math.floor(Date.now() / 1000);
  const price = (id: string, amount: number) => ({ id, active: true, currency: 'usd', type: 'recurring', unit_amount: amount, billing_scheme: 'per_unit', transform_quantity: null, recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' } });
  const vehicle = { ...VEHICLE_TWIN_CATALOG.find(entry => entry.ownerReady)!.identity, id: 'v1', userId: 'u1', currentMileage: 42000, transmission: 'automatic' };
  const account = { id: 'u1', emailVerified: new Date() as Date | null, subscriptionId: 'sub_1', stripeCustomerId: 'cus_1', subscriptionTier: 'visual' };
  const sub = { id: 'sub_1', customer: 'cus_1', status: 'active', currency: 'usd', collection_method: 'charge_automatically', cancel_at_period_end: false, schedule: null as string | null, pause_collection: null as unknown, pending_update: null as unknown, latest_invoice: 'in_1', default_payment_method: 'pm_1',
    items: { data: [{ id: 'si_1', quantity: 1, current_period_start: now - 1000, current_period_end: now + 100000, price: price('price_visual', 499) }] } };
  const state = { now, advanceOnPreview: 0, advanceTo: now, priceConfigured: true, changeOnPreview: 0, expireOnPreview: 0, markerCommitFails: false, resultCommitFails: false, invoiceStatus: 'paid', invoicePaid: 737, invoiceCustomer: 'cus_1', invoiceSubscription: 'sub_1', invoiceUnavailable: false, total: 737, due: 737, invoiceCurrency: 'usd', country: 'US', paymentCountry: 'US', pending: false, timeout: false, timeoutAfterApply: false, previewFails: false, duplicate: false, writes: 0, checkoutWrites: 0, commitFails: false };
  let attempt: { userId: string; subscriptionId: string; token: string; vehicleId: string; createdAt: Date; dispatchStartedAt: Date | null; invoiceId: string | null; completedAt: Date | null } | undefined;
  let tail = Promise.resolve(); let committed = false; let dispatchCommitted = false;
  let downgrade: DowngradeOperation | undefined;
  let ownedSchedule: Stripe.SubscriptionSchedule | undefined;
  const releaseState = { advanceTo: 0, calls: 0 };
  let retired = new Map<string, Date>();
  const previews: Record<string, unknown>[] = []; const updates: { id: string; params: Record<string, unknown>; key: string; committed: boolean; dispatchCommitted: boolean }[] = [];
  const providerCache = new Map<string, typeof sub>();
  const tx = {
    $queryRaw: async (parts: TemplateStringsArray, ...args: unknown[]) => parts.join('').includes('to_regclass') ? [{ available: !!downgrade }] : parts.join('').includes('SubscriptionDowngrade') ? downgrade ? [downgrade] : [] : parts.join('').includes('BillingEnrollmentReview') ? options.review ? [options.review] : [] : parts.join('').includes('HubUpgradeRetiredQuote') ? retired.has(String(args[1])) ? [{ quoteHash: args[1] }] : [] : parts.join('').includes('HubUpgradeAttempt') ? attempt ? [attempt] : [] : [],
    $executeRaw: async (parts: TemplateStringsArray, ...args: unknown[]) => {
      const sql = parts.join('');
      if (sql.includes('SubscriptionDowngrade')) { if (downgrade) downgrade.state = String(args[0]); return 1; }
      if (sql.includes('HubUpgradeRetiredQuote')) {
        if (sql.startsWith('INSERT')) retired.set(String(args[0]), args[2] as Date);
        else for (const [key, expiry] of retired) if (expiry.getTime() <= state.now * 1000) retired.delete(key);
        return 1;
      }
      if (sql.startsWith('INSERT')) attempt = { subscriptionId: String(args[0]), userId: String(args[1]), token: String(args[2]), vehicleId: String(args[3]), createdAt: new Date(state.now * 1000), dispatchStartedAt: null, invoiceId: null, completedAt: null };
      else if (sql.startsWith('DELETE')) attempt = undefined;
      else if (attempt && sql.includes('dispatchStartedAt')) attempt.dispatchStartedAt = new Date(state.now * 1000);
      else if (attempt) { attempt.invoiceId = String(args[0]); attempt.completedAt = new Date(state.now * 1000); }
      return 1;
    },
    user: { findUniqueOrThrow: async () => account, update: async () => { state.writes++; } },
    vehicle: { findFirst: async ({ where }: { where: { id: string; userId: string } }) => where.id === vehicle.id && where.userId === vehicle.userId ? vehicle : null },
    billingAttempt: { updateMany: async () => { state.checkoutWrites++; } },
  };
  const database = { ...tx, $transaction: async (fn: (value: typeof tx) => unknown) => {
    const previous = tail; let release!: () => void; tail = new Promise<void>(resolve => { release = resolve; }); await previous;
    const before = attempt ? structuredClone(attempt) : undefined;
    const retiredBefore = structuredClone(retired);
    const downgradeBefore = structuredClone(downgrade);
    try { const result = await fn(tx); if (state.commitFails && attempt && !before) throw Error('commit failure'); if (state.markerCommitFails && attempt?.dispatchStartedAt && !before?.dispatchStartedAt) throw Error('marker commit failure'); if (state.resultCommitFails && attempt?.completedAt && !before?.completedAt) throw Error('result commit failure'); committed = !!attempt; dispatchCommitted = !!attempt?.dispatchStartedAt; return result; }
    catch (error) { attempt = before; retired = retiredBefore; downgrade = downgradeBefore; throw error; } finally { release(); }
  } };
  const stripe = {
    subscriptionSchedules: {
      retrieve: async (id: string) => { if (!ownedSchedule || ownedSchedule.id !== id) throw Error('unknown schedule'); return structuredClone(ownedSchedule); },
      release: async (id: string) => {
        if (!dispatchCommitted || !ownedSchedule || id !== ownedSchedule.id) throw Error('release without durable upgrade intent');
        releaseState.calls++; ownedSchedule.status='released'; ownedSchedule.subscription=null; ownedSchedule.released_subscription=sub.id; sub.schedule=null;
        if (releaseState.advanceTo) state.now=releaseState.advanceTo;
        return structuredClone(ownedSchedule);
      },
    },
    customers: { retrieve: async () => ({ id: 'cus_1', address: { country: state.country }, invoice_settings: {} }) },
    paymentMethods: { retrieve: async () => ({ type: 'card', billing_details: { address: { country: state.paymentCountry } } }) },
    prices: { retrieve: async () => price('price_hub', 1499) },
    invoices: { retrieve: async (id: string) => { if (state.invoiceUnavailable) throw Error('invoice unavailable'); return { id, customer: state.invoiceCustomer, parent: { subscription_details: { subscription: state.invoiceSubscription } }, currency: 'usd', status: state.invoiceStatus, amount_paid: state.invoicePaid, amount_due: state.due, total: state.total, hosted_invoice_url: 'https://invoice.stripe.com/i/mock' }; }, createPreview: async (params: Record<string, unknown>) => {
      previews.push(params); if (state.changeOnPreview === previews.length) state.due++; if (state.expireOnPreview === previews.length) state.now += 301; if (state.advanceOnPreview === previews.length) state.now = state.advanceTo; if (state.previewFails) throw Error('preview offline'); return { customer: 'cus_1', parent: { subscription_details: { subscription: 'sub_1' } }, currency: state.invoiceCurrency, amount_due: state.due, total: state.total, lines: { has_more: true, data: [{ amount: 999999 }] } };
    } },
    subscriptions: {
      retrieve: async () => sub, list: async () => ({ data: state.duplicate ? [sub, { id: 'sub_2', status: 'active' }] : [sub], has_more: false }),
      update: async (id: string, params: Record<string, unknown>, options: { idempotencyKey: string }) => {
        updates.push({ id, params, key: options.idempotencyKey, committed, dispatchCommitted });
        if (state.timeout) { state.timeout = false; throw Error('network timeout'); }
        let result = providerCache.get(options.idempotencyKey);
        if (!result) { sub.latest_invoice = 'in_upgrade'; if (state.pending) { sub.pending_update = { subscription_items: [{ id: 'si_1', quantity: 1, price: price('price_hub', 1499) }] }; state.invoiceStatus = 'open'; state.invoicePaid = 0; } else { sub.items.data[0].price = price('price_hub', 1499); state.invoiceStatus = 'paid'; state.invoicePaid = state.due; } result = structuredClone(sub); providerCache.set(options.idempotencyKey, result); }
        if (state.timeoutAfterApply) { state.timeoutAfterApply = false; throw Error('lost response'); } return result;
      },
    },
  };
  const handler = createChangeTierHandler({ auth: async () => ({ user: { id: account.id } }), prisma: database, getStripe: () => stripe, getPriceIdForTier: () => state.priceConfigured ? 'price_hub' : null, now: () => state.now } as unknown as Parameters<typeof createChangeTierHandler>[0]);
  return { state, account, sub, vehicle, updates, previews, releaseState, attempt: () => attempt,
    attachVisualSchedule: () => {
      const item=sub.items.data[0];
      const q: DowngradeQuote={version:1,operationId:'earlier-downgrade',userId:'u1',customerId:'cus_1',subscriptionId:sub.id,itemId:item.id,hubPriceId:'price_hub',visualPriceId:'price_visual',periodStart:item.current_period_start-2592000,renewalAt:item.current_period_start,issuedAt:item.current_period_start-100,expiresAt:item.current_period_start,monthlyAmount:499,currency:'usd'};
      downgrade={id:q.operationId,userId:'u1',subscriptionId:sub.id,token:signDowngradeQuote(q),state:'scheduled',scheduleId:'sched_visual',dispatchedAt:new Date(q.issuedAt*1000),createdAt:new Date(q.issuedAt*1000)};
      ownedSchedule={id:'sched_visual',customer:'cus_1',subscription:sub.id,status:'active',end_behavior:'release',metadata:{au7oDowngradeOperation:q.operationId},phases:[{start_date:q.periodStart,end_date:q.renewalAt,items:[{price:'price_hub',quantity:1}],proration_behavior:'none'},{start_date:q.renewalAt,end_date:item.current_period_end,items:[{price:'price_visual',quantity:1}],proration_behavior:'none'}]} as unknown as Stripe.SubscriptionSchedule;
      sub.schedule=ownedSchedule.id;
    },
    send: (body: Record<string, unknown> = {}) => handler(new Request('https://au7o.io/api/stripe/change-tier', { method: 'POST', headers: { 'x-vercel-ip-country': 'US' }, body: JSON.stringify({ action: 'preview', product: 'hub', vehicleId: 'v1', billingCountry: 'US', ...body }) })),
    confirm: (quote: string, body: Record<string, unknown> = {}) => handler(new Request('https://au7o.io/api/stripe/change-tier', { method: 'POST', headers: { 'x-vercel-ip-country': 'US' }, body: JSON.stringify({ action: 'confirm', product: 'hub', vehicleId: 'v1', billingCountry: 'US', confirmProration: true, quote, ...body }) })),
  };
}
