import { prisma } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { createStripeWebhookHandler } from '@/lib/stripe-webhook-handler';
export const POST = createStripeWebhookHandler({ prisma, getStripe, secret: () => process.env.STRIPE_WEBHOOK_SECRET });
