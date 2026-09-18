import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripe, getPriceIdForTier } from '@/lib/stripe';
import { createChangeTierHandler } from '@/lib/stripe-change-tier-handler';

export const runtime = 'nodejs';
export const POST = createChangeTierHandler({ auth, prisma, getStripe, getPriceIdForTier });
