import { reservationClaimHref } from './reservation-identity';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import type { AccountEnrollment } from '@prisma/client';
import { prisma } from './db';
import { appUrl, sendEmailDetailed } from './email';
import { getClientIp, signupLimiter, passwordResetLimiter } from './rate-limit';
import { enrollmentRegionMessage, subscriptionRegionStatus } from './pricing/region';
import { stagingRecipientAllowed } from './staging-email-policy';
import { publicEnrollmentEnabled } from './product-entitlements';
import { enrollmentContinuation, visualReturnDestination } from './visual-return-destination';
import { confirmedEnrollmentIntent, SELECTED_CHECKOUT_PATH } from './selected-enrollment';

export const enrollmentTokenHash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
export const enrollmentDestination = enrollmentContinuation;
class InvalidEnrollmentToken extends Error {}
class EnrollmentConfirmationRequired extends Error {}
export function enrollmentFailureResponse(error: unknown) {
  return error instanceof EnrollmentConfirmationRequired
    ? enrollmentResponse({ error: 'us_confirmation_required', message: 'Confirm that you live in the United States and will use a US billing address before continuing. Your verification link is still usable.' }, 400)
    : error instanceof InvalidEnrollmentToken
    ? NextResponse.json({ error: 'invalid_or_used_link', message: 'This verification link has expired or was already used. Sign in or request another link.' }, { status: 400 })
    : NextResponse.json({ error: 'verification_temporarily_unavailable', message: 'We could not confirm verification right now. Your link may still be valid. Retry this step, or try signing in if the earlier request completed.' }, { status: 503 });
}
const enrollmentBody = z.object({ email: z.string().trim().email().max(254), product: z.enum(['visual', 'hub']), vehicleId: z.string().max(100).optional(), returnTo: z.string().max(1000).optional(), intent: z.literal('reservation').optional(), reservationId: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/).optional() });
const verifyBody = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(12).max(128), usBillingConfirmed: z.boolean().optional() });
const accepted = (retryAfter: number) => enrollmentResponse({ ok: true, retryAfter, retryScope: 'email', message: 'Request received. Check your inbox and spam for your next step: verify a new account or sign in to an existing one. If nothing arrives after a few minutes, contact support@au7o.io for help.' });
const enrollmentResponse = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...(typeof body.retryAfter === 'number' ? { 'Retry-After': String(body.retryAfter) } : {}) } });
const unavailable = (retryAfter?: number) => enrollmentResponse({ error: 'enrollment_temporarily_unavailable', message: 'We could not confirm this email request. Check your inbox in case it arrived, then retry or contact support@au7o.io for help.', ...(retryAfter === undefined ? {} : { retryAfter, retryScope: 'email' }) }, 503);

export type EnrollmentReservation = { kind: 'limited'; retryAfter: number } | {
  kind: 'verification' | 'recovery' | 'suppressed'; row: AccountEnrollment; retryAfter: number;
};

export async function reserveEnrollmentRequest(database: Pick<typeof prisma, '$transaction'>, input: z.infer<typeof enrollmentBody>, tokenHash: string): Promise<EnrollmentReservation> {
  return database.$transaction(async tx => {
    const email = input.email.trim().toLowerCase();
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${`enrollment:${email}`}, 0))`;
    const now = Date.now();
    // Consumed rows count too: recovery, suppression and failed delivery must
    // have exactly the same limits as a new account, including concurrent sends.
    const recent = await tx.accountEnrollment.findMany({ where: { email, createdAt: { gt: new Date(now - 3600000) } }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } });
    const cooldownUntil = recent.length ? recent[recent.length - 1].createdAt.getTime() + 60000 : 0;
    const hourlyUntil = recent.length >= 3 ? recent[recent.length - 3].createdAt.getTime() + 3600000 : 0;
    const retryAfter = Math.max(0, Math.ceil((Math.max(cooldownUntil, hourlyUntil) - now) / 1000));
    if (retryAfter) return { kind: 'limited', retryAfter };
    const existing = await tx.user.findUnique({ where: { email }, select: { id: true } });
    const suppression = await tx.emailSuppression.findUnique({ where: { email }, select: { id: true } });
    const kind = suppression ? 'suppressed' : existing ? 'recovery' : 'verification';
    const row = await tx.accountEnrollment.create({ data: { email, tokenHash, product: input.product, intent: input.intent,
      vehicleId: input.intent === 'reservation' ? input.reservationId || null : input.vehicleId || null,
      returnTo: input.product === 'visual' ? visualReturnDestination(input.returnTo) : null,
      expiresAt: new Date(now + 30 * 60000), usedAt: kind === 'verification' ? null : new Date(now) } });
    const nextAvailableAt = Math.max(row.createdAt.getTime() + 60000, recent.length >= 2 ? recent[recent.length - 2].createdAt.getTime() + 3600000 : 0);
    const nextRetry = Math.max(0, Math.ceil((nextAvailableAt - Date.now()) / 1000));
    return { kind, row, retryAfter: nextRetry };
  });
}

// Compatibility for the rollback verification script and token-only callers.
export async function reserveEnrollment(database: Pick<typeof prisma, '$transaction'>, input: z.infer<typeof enrollmentBody>, tokenHash: string) {
  const result = await reserveEnrollmentRequest(database, input, tokenHash);
  return result.kind === 'verification' ? result.row : null;
}

const htmlAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function createStartEnrollmentHandler(deps: {
  database: Pick<typeof prisma, '$transaction' | 'accountEnrollment'>;
  send: typeof sendEmailDetailed;
  deliveryReady: (email: string) => boolean;
  rateLimit: (ip: string) => { success: boolean; reset: number };
  enabled: () => boolean;
  origin: () => string;
}) {
  return async function start(request: Request) {
    if (!deps.enabled()) return enrollmentResponse({ error: 'enrollment_closed', message: 'New account signup is currently closed. Existing members can sign in to manage their account.' }, 410);
    const country = request.headers.get('x-vercel-ip-country');
    const regionMessage = enrollmentRegionMessage(country);
    if (regionMessage) return enrollmentResponse({ error: subscriptionRegionStatus(country) === 'unknown' ? 'region_unknown' : 'region_unavailable', message: regionMessage }, 403);
    const limit = deps.rateLimit(getClientIp(request));
    if (!limit.success) return enrollmentResponse({ error: 'try_later', retryAfter: limit.reset, retryScope: 'ip', message: 'Too many email requests from this connection. Wait for the countdown, then retry or contact support@au7o.io.' }, 429);
    const parsed = enrollmentBody.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return enrollmentResponse({ error: 'invalid_request', message: 'Enter a valid email address and try again.' }, 400);
    const email = parsed.data.email.toLowerCase();
    let retryUntil: number | undefined;
    const remainingRetry = () => retryUntil === undefined ? undefined : Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
    try {
      // Configuration/preview-policy failures do not depend on account status.
      if (!deps.deliveryReady(email)) return unavailable();
      const token = crypto.randomBytes(32).toString('hex');
      const result = await reserveEnrollmentRequest(deps.database, parsed.data, enrollmentTokenHash(token));
      if (result.kind === 'limited') return enrollmentResponse({ error: 'try_later', retryAfter: result.retryAfter, retryScope: 'email', message: 'Please wait for the countdown before requesting another email. Requests are limited to three per hour for each address.' }, 429);
      retryUntil = Date.now() + result.retryAfter * 1000;
      if (result.kind === 'suppressed') return accepted(remainingRetry()!);
      const link = `${deps.origin()}/auth/verify?token=${token}`;
      const destination = result.row.intent === 'reservation' ? reservationClaimHref(result.row.vehicleId) : enrollmentDestination(result.row.product, result.row.vehicleId, result.row.returnTo);
      const signin = `${deps.origin()}/auth/signin?callbackUrl=${encodeURIComponent(destination)}`;
      const reset = `${deps.origin()}/auth/forgot-password?callbackUrl=${encodeURIComponent(destination)}`;
      const sent = await deps.send(result.kind === 'recovery' ? {
        to: email, subject: 'Continue with your Au7o account',
        html: `<p>You already have an Au7o account. Sign in with your existing password to continue.</p><p><a href="${htmlAttribute(signin)}">Sign in and continue</a></p><p>Forgot your password? <a href="${htmlAttribute(reset)}">Request a password reset</a>.</p><p>No password, subscription or trial has changed. If you did not request this email, you can ignore it.</p>`,
        text: `You already have an Au7o account. Sign in and continue: ${signin}\nForgot your password? Request a password reset: ${reset}\nNo password, subscription or trial has changed. If you did not request this email, you can ignore it.`,
      } : { to: email, subject: 'Verify your Au7o account',
        html: `<p>Verify your email to finish creating your Au7o account.</p><p><a href="${htmlAttribute(link)}">Verify email and choose a password</a></p><p>This link expires in 30 minutes. No payment or trial starts from this email.</p>`,
        text: `Verify your email and choose a password: ${link}\nExpires in 30 minutes. No payment or trial starts from this email.`,
      });
      if (!sent.ok) {
        // A transport timeout may have delivered the message. Keep that link
        // valid; only definite non-dispatch invalidates the token.
        if (sent.outcome === 'not_sent' || sent.outcome === 'suppressed') await deps.database.accountEnrollment.update({ where: { id: result.row.id }, data: { usedAt: new Date() } });
        return sent.outcome === 'suppressed' ? accepted(remainingRetry()!) : unavailable(remainingRetry());
      }
      return accepted(remainingRetry()!);
    } catch { return unavailable(remainingRetry()); }
  };
}

export const startEnrollment = createStartEnrollmentHandler({ database: prisma, send: sendEmailDetailed,
  deliveryReady: email => Boolean(process.env.RESEND_API_KEY) && stagingRecipientAllowed(email, process.env.AU7O_STAGING_EMAIL_ALLOWLIST),
  rateLimit: ip => signupLimiter.check(ip), enabled: publicEnrollmentEnabled, origin: appUrl,
});

export async function finishEnrollment(request: Request) {
  if (!publicEnrollmentEnabled()) return enrollmentResponse({ error: 'enrollment_closed', message: 'New account signup is currently closed. Existing members can sign in to manage their account.' }, 410);
  const country = request.headers.get('x-vercel-ip-country');
  const regionMessage = enrollmentRegionMessage(country);
  if (regionMessage) return enrollmentResponse({ error: subscriptionRegionStatus(country) === 'unknown' ? 'region_unknown' : 'region_unavailable', message: regionMessage }, 403);
  if (!passwordResetLimiter.check(getClientIp(request)).success) return NextResponse.json({ error: 'try_later' }, { status: 429 });
  const parsed = verifyBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_link_or_password', message: 'Use a valid verification link and a password of at least 12 characters.' }, { status: 400 });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    const result = await redeemEnrollment(prisma, enrollmentTokenHash(parsed.data.token), passwordHash, parsed.data.usBillingConfirmed === true);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) { return enrollmentFailureResponse(error); }
}

export async function redeemEnrollment(database: Pick<typeof prisma, '$transaction'>, tokenHash: string, passwordHash: string, usBillingConfirmed = false) {
    return database.$transaction(async (tx) => {
      const row = await tx.accountEnrollment.findUnique({ where: { tokenHash } });
      const now = new Date();
      if (!row || row.usedAt || row.expiresAt <= now) throw new InvalidEnrollmentToken('invalid');
      if (row.intent !== 'reservation' && !usBillingConfirmed) throw new EnrollmentConfirmationRequired();
      const redeemed = await tx.accountEnrollment.updateMany({ where: { id: row.id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
      if (redeemed.count !== 1) throw new InvalidEnrollmentToken('invalid');
      // A concurrent signup or old account is never overwritten or relinked.
      const existing = await tx.user.findUnique({ where: { email: row.email }, select: { id: true } });
      if (!existing) {
        const created = await tx.user.create({ data: { email: row.email, emailVerified: now, passwordHash,
          enrollmentProduct: row.product, enrollmentVehicleId: row.intent === 'reservation' ? null : row.vehicleId } });
        if (row.intent !== 'reservation') await tx.accountEnrollment.update({ where: { id: row.id }, data: { intent: confirmedEnrollmentIntent(created.id) } });
      }
      // Other outstanding links must not change credentials after an account is created.
      return { callbackUrl: row.intent === 'reservation' ? (row.vehicleId ? reservationClaimHref(row.vehicleId) : '/account') : !existing && row.product === 'visual' ? SELECTED_CHECKOUT_PATH : enrollmentDestination(row.product, row.vehicleId, row.returnTo), existing: !!existing, ...(!existing ? { email: row.email } : {}) };
    }, { isolationLevel: 'Serializable' });
}
