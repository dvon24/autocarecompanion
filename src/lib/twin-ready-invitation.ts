import { isUSReservationCountry } from './reservation-identity';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getTwinDefinition, resolveTwinTransmissionBranch, transmissionSelectionFitsReviewedOptions, twinMatchesVehicle } from './twin-fulfillment';
import { getTwinByFulfillmentId } from './vehicle-twin-catalog';
import { canEnterTwinReadyState } from './twin-reservation-ready';
import { isTransmissionChoice } from './transmission-options';
import { twinReadyEmail } from './twin-ready-email';
import type { ReadyInvitationMail } from './twin-ready-invitation-artwork';
import { ownerEquipmentOption } from './twin-owner-equipment';

export interface ReadyInvitationReservation {
  id: string; email: string; year: number | null; make: string | null; model: string | null;
  trim: string | null; vehicleVerified: boolean; trimVerified: boolean; transmission: string | null;
  assignedTwin: string | null; trialDays: number | null; twinStatus: string; readyAt: Date | null;
  country: string | null; updatedAt: Date; invitedAt: Date | null; unsubscribedAt: Date | null;
  unsubscribeToken: string | null;
}

export function readyInvitationOffer(row: ReadyInvitationReservation) {
  const twin = getTwinDefinition(row.assignedTwin);
  const catalog = getTwinByFulfillmentId(row.assignedTwin);
  if (!isUSReservationCountry(row.country) || row.twinStatus !== 'ready' || !row.readyAt || row.invitedAt
    || row.unsubscribedAt || !row.unsubscribeToken || !twin || !catalog?.ownerReady || !catalog.art.available
    || !row.year || !row.make || !row.model || (row.transmission != null && !isTransmissionChoice(row.transmission))) return null;
  const identity = { year: row.year, make: row.make, model: row.model, trim: row.trim };
  const transmission = resolveTwinTransmissionBranch(twin, row.transmission, identity);
  if (!transmissionSelectionFitsReviewedOptions(transmission.options, isTransmissionChoice(row.transmission) ? row.transmission : null)
    || !canEnterTwinReadyState({ reservation: row, hasLiveMatchingTwin: twinMatchesVehicle(twin, identity), trialDays: row.trialDays,
      transmissionOptionCount: transmission.options.length, transmissionOptions: transmission.options, transmission: transmission.branch })) return null;
  return { reservationId: row.id, vehicle: `${row.year} ${row.make} ${row.model} ${row.trim}`,
    equipment:ownerEquipmentOption(identity)?.details,
    transmission: transmission.branch, artwork: catalog.art.base, trialDays: row.trialDays as 7 | 30, unsubscribeToken: row.unsubscribeToken };
}

const bodySchema = z.object({ id: z.string().min(1).max(100), expectedUpdatedAt: z.string().datetime({ offset: true }),
  action: z.enum(['preview', 'send']), confirm: z.literal(true).optional() }).strict();

export function createTwinReadyInvitationHandler(deps: {
  authorize: () => Promise<Response | null>;
  baseUrl: string;
  enabled: () => boolean;
  load: (id: string) => Promise<ReadyInvitationReservation | null>;
  suppressed: (email: string) => Promise<boolean>;
  deliveryExists: (id: string) => Promise<boolean>;
  reserve: (row: ReadyInvitationReservation) => Promise<string | null>;
  prepareSend?: (mail: ReturnType<typeof twinReadyEmail>, offer: NonNullable<ReturnType<typeof readyInvitationOffer>>) => Promise<ReadyInvitationMail>;
  send: (mail: ReadyInvitationMail & { to: string; idempotencyKey: string; reservationId: string }) => Promise<{ ok: boolean; providerId?: string }>;
  finish: (id: string, row: ReadyInvitationReservation, result: { ok: boolean; providerId?: string }) => Promise<void>;
}) {
  return async function POST(request: Request) {
    const denied = await deps.authorize(); if (denied) return denied;
    if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Same-origin request required' }, { status: 403 });
    const body = bodySchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: 'Invalid invitation request' }, { status: 400 });
    const respond = (error: string, status = 409) => NextResponse.json({ error }, { status });
    try {
      const row = await deps.load(body.data.id);
      if (!row) return respond('Reservation not found', 404);
      if (row.updatedAt.toISOString() !== new Date(body.data.expectedUpdatedAt).toISOString()) return respond('This reservation changed. Refresh and preview again.');
      const offer = readyInvitationOffer(row);
      if (!offer) return respond('A verified, owner-ready US vehicle, saved 7/30-day offer and opted-in recipient are required.');
      if (await deps.suppressed(row.email)) return respond('Recipient is suppressed. No invitation will be sent.');
      if (await deps.deliveryExists(row.id)) return respond('An invitation was already sent or its delivery needs reconciliation. Do not retry automatically.');
      const mail = twinReadyEmail({ ...offer, baseUrl: deps.baseUrl });
      if (body.data.action === 'preview') return NextResponse.json({ ...mail, to: row.email, trialDays: offer.trialDays,
        expectedUpdatedAt: row.updatedAt.toISOString(), canSend: deps.enabled() }, { headers: { 'Cache-Control': 'private, no-store' } });
      if (!deps.enabled()) return respond('Invitation sending is on hold in this environment.', 503);
      if (!body.data.confirm) return respond('Preview and explicitly confirm this invitation first.', 400);
      // Preparation can fail safely before a durable claim exists. Preview retains
      // remote artwork and never contains attachment bytes or an unresolved CID.
      let prepared: ReadyInvitationMail = mail;
      try { if (deps.prepareSend) prepared = await deps.prepareSend(mail, offer); }
      catch { return respond('Invitation artwork could not be prepared. Refresh the preview and try again. No invitation was sent.', 503); }
      const deliveryId = await deps.reserve(row);
      if (!deliveryId) return respond('This invitation changed or another send is in progress. Refresh before continuing.');
      // A timeout may mean the provider accepted the email. Retain the delivery
      // claim on every failure; retries require operator reconciliation.
      let result: { ok: boolean; providerId?: string };
      try { result = await deps.send({ ...prepared, to: row.email, idempotencyKey: `twin-ready/${deliveryId}`, reservationId: row.id }); }
      catch { result = { ok: false }; }
      await deps.finish(deliveryId, row, result);
      if (!result.ok) return respond('Delivery was not confirmed. The invitation is held for reconciliation; do not resend.', 502);
      return NextResponse.json({ sent: true }, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch {
      return respond('Invitation checks or delivery tracking are unavailable. No retry will be attempted automatically.', 503);
    }
  };
}
