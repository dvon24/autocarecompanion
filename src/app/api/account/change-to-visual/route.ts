import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripe, getPriceIdForTier } from '@/lib/stripe';
import { createDowngradeHandler } from '@/lib/stripe-downgrade-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = createDowngradeHandler({ auth, prisma, getStripe, getPriceIdForTier });
