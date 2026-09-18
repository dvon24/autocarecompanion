import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { createBillingRecheckHandler } from '@/lib/billing-recheck-handler';
export const POST = createBillingRecheckHandler({ auth, prisma, getStripe });
