import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkVehicleLimit } from '@/lib/pricing/limits';
import {
  renderDiagnosisAsMarkdown,
  synthesizeUserPromptFromCaption,
} from '@/lib/diagnosis/render';
import { vehicleSlug as toVehicleSlug } from '@/lib/vehicle-slug';
import type { VisionResult } from '@/components/vehicle/VisionResultCard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/diagnose/seed
 *
 * Claims an anonymous diagnose-flow result into the authenticated
 * user's garage:
 *   1. Validates YMMT + (loosely) the visionResult shape
 *   2. Find-or-create a Vehicle row matching the YMMT for this user
 *      (case-insensitive on make/model/trim — never duplicates)
 *   3. If quota is at limit AND no existing vehicle matches the YMMT,
 *      return 403 with structured details so the client can show a
 *      modal asking the user where to attach it (or upgrade). The
 *      client may then re-POST with attachToVehicleId set, which
 *      bypasses the create+quota check entirely.
 *   4. Create a ChatSession with two seeded messages — a synthesized
 *      user prompt and an assistant reply that carries the full
 *      visionResult as a `vision` attachment so VehicleHub renders
 *      it via VisionResultCard. Also stash the visionResult on the
 *      ChatSession.diagnosis field for posterity.
 *
 * Response: { vehicleSlug, sessionId, action } where action is one
 * of 'created_vehicle', 'matched_existing', 'attached_to_picked'.
 *
 * Auth: required. The caller MUST be signed in — there's no
 * anonymous path because the result needs a User to attach to.
 */

const VISION_PASSTHROUGH = z.object({}).passthrough();

const BODY_SCHEMA = z.object({
  visionResult: VISION_PASSTHROUGH,
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  trim: z.string().max(100).optional(),
  caption: z.string().max(2000).optional(),
  /** When set, skip the find-or-create logic entirely and attach the
   *  diagnosis to this existing vehicle. The client passes this after
   *  the user picks "Attach to <existing>" in the quota-hit modal. */
  attachToVehicleId: z.string().min(1).max(64).optional(),
});

export async function POST(request: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Sign in to save your diagnosis.' },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => null);
  const parsed = BODY_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', message: 'Diagnosis payload was malformed.', details: parsed.error.issues },
      { status: 400 }
    );
  }
  const { visionResult, year, make, model, trim, caption, attachToVehicleId } = parsed.data;
  const vision = visionResult as unknown as VisionResult;

  // ── 1. Resolve the target vehicle ────────────────────────────────
  let vehicleId: string;
  let action: 'created_vehicle' | 'matched_existing' | 'attached_to_picked' = 'matched_existing';

  if (attachToVehicleId) {
    // User picked an existing vehicle from the quota-hit modal. Verify
    // they own it before trusting the id.
    const owned = await prisma.vehicle.findFirst({
      where: { id: attachToVehicleId, userId },
      select: { id: true, year: true, make: true, model: true, trim: true },
    });
    if (!owned) {
      return NextResponse.json(
        { error: 'vehicle_not_found', message: 'Couldn\'t find that vehicle in your garage.' },
        { status: 404 }
      );
    }
    vehicleId = owned.id;
    action = 'attached_to_picked';
  } else {
    // Try find-by-YMMT first. Case-insensitive matching prevents
    // duplicate rows when the user picks differently-cased values.
    const existing = await prisma.vehicle.findFirst({
      where: {
        userId,
        year,
        make: { equals: make, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
        ...(trim
          ? { trim: { equals: trim, mode: 'insensitive' } }
          : { OR: [{ trim: null }, { trim: '' }] }),
      },
      select: { id: true },
    });

    if (existing) {
      vehicleId = existing.id;
      action = 'matched_existing';
    } else {
      // No match → check quota. If at limit, surface a structured
      // 403 so the client can show the picker modal.
      const quota = await checkVehicleLimit(userId);
      if (!quota.allowed) {
        const userVehicles = await prisma.vehicle.findMany({
          where: { userId },
          orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
          select: { id: true, year: true, make: true, model: true, trim: true, nickname: true },
        });
        return NextResponse.json(
          {
            error: 'vehicle_limit_reached',
            message: `You're at your ${quota.limit}-vehicle limit on the ${quota.tier} plan. Pick an existing garage vehicle to attach the diagnosis to, or upgrade to add this as a separate vehicle.`,
            tier: quota.tier,
            current: quota.current,
            limit: quota.limit,
            upgradeTo: quota.tier === 'free' ? 'plus' : 'pro',
            userVehicles,
          },
          { status: 403 }
        );
      }

      // Quota OK → create the new vehicle. If the user has zero
      // vehicles, flag this one as primary so it becomes their hub.
      const vehicleCount = quota.current;
      if (vehicleCount === 0) {
        // No need to demote others — they have none.
      } else {
        await prisma.vehicle.updateMany({
          where: { userId },
          data: { isPrimary: false },
        });
      }
      const created = await prisma.vehicle.create({
        data: {
          userId,
          year,
          make,
          model,
          trim: trim ?? null,
          isPrimary: vehicleCount === 0,
        },
        select: { id: true },
      });
      vehicleId = created.id;
      action = 'created_vehicle';
    }
  }

  // ── 2. Build the seeded conversation ─────────────────────────────
  const ymmt = { year, make, model, trim };
  const userText = synthesizeUserPromptFromCaption(vision, ymmt, caption);
  const assistantText = renderDiagnosisAsMarkdown(vision, ymmt);
  const now = Date.now();

  const messages = [
    {
      role: 'user' as const,
      content: userText,
      timestamp: now - 1, // ordered before the assistant reply
    },
    {
      role: 'assistant' as const,
      content: assistantText,
      timestamp: now,
      // Attach the full vision result so VehicleHub renders the
      // existing VisionResultCard inside the assistant bubble.
      vision,
    },
  ];

  const chatSession = await prisma.chatSession.create({
    data: {
      userId,
      vehicleId,
      messages: messages as unknown as object[],
      diagnosis: vision as unknown as object,
    },
    select: { id: true },
  });

  // ── 3. Return the URL the client should jump to ─────────────────
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { year: true, make: true, model: true, trim: true },
  });
  if (!vehicle) {
    return NextResponse.json(
      { error: 'vehicle_vanished', message: 'Vehicle could not be re-read after attach.' },
      { status: 500 }
    );
  }

  const vehicleSlug = toVehicleSlug(vehicle.year, vehicle.make, vehicle.model, vehicle.trim);

  return NextResponse.json({
    ok: true,
    vehicleSlug,
    sessionId: chatSession.id,
    action,
  });
}
