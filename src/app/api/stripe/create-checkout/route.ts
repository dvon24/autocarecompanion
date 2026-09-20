import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripe, getPriceIdForTier } from '@/lib/stripe';
import { createCheckoutHandler } from '@/lib/stripe-create-checkout-handler';

export const POST = createCheckoutHandler({ auth, prisma, getStripe, getPriceIdForTier });
