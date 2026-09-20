import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { createCancelSubscriptionHandler } from '@/lib/stripe-cancel-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = createCancelSubscriptionHandler({ auth, prisma, getStripe });
